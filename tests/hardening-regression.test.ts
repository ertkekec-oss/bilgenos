import { test, describe } from 'node:test';
import * as assert from 'node:assert/strict';
import * as nodeCrypto from 'node:crypto';
import type { RequestTenantContext, UUID, EnrollmentDto } from '@bilgenos/contracts';
import {
  AuthorizationKernel,
  MaskedNotFoundSecurityException,
} from '@bilgenos/authorization';
import {
  InMemoryScopedPersonRepository,
  PersonService,
  TransactionalMutationRunner,
  MockTransactionalStorage,
  globalDbStorage,
} from '@bilgenos/database';
import { DomainError } from '@bilgenos/domain';

describe('Production Hardening & Regression Suite', () => {

  describe('1. API E2E Tenant Isolation & 404 Existence Masking', () => {
    test('Cross-tenant probe via API controller returns 404 without leaking resource existence', async () => {
      globalDbStorage.clear();
      AuthorizationKernel.clearAuditLogs();

      const tenantA: UUID = '10000000-0000-0000-0000-000000000001';
      const tenantB: UUID = '20000000-0000-0000-0000-000000000002';

      const contextB: RequestTenantContext = {
        tenantId: tenantB,
        userId: '22222222-2222-2222-2222-222222222222',
        roles: ['ADMINISTRATOR'],
        permissions: ['person.read', 'person.create'],
      };

      const contextA: RequestTenantContext = {
        tenantId: tenantA,
        userId: '11111111-1111-1111-1111-111111111111',
        roles: ['ADMINISTRATOR'],
        permissions: ['person.read', 'person.create'],
      };

      const personRepoB = new InMemoryScopedPersonRepository(contextB);
      const personBId = nodeCrypto.randomUUID();
      await personRepoB.create({
        id: personBId,
        tenantId: tenantB,
        firstName: 'Zeynep',
        lastName: 'Demir',
      });

      const personRepoA = new InMemoryScopedPersonRepository(contextA);
      const personServiceA = new PersonService(contextA, personRepoA);

      // Simulated E2E HTTP Controller dispatch: GET /api/v1/persons/:id
      const handleGetPersonRequest = async (requestedId: UUID) => {
        try {
          const person = await personServiceA.getPersonById(requestedId);
          return { statusCode: 200, body: person };
        } catch (err: unknown) {
          if (err instanceof MaskedNotFoundSecurityException) {
            return {
              statusCode: 404,
              body: { error: 'Resource not found', code: 'NOT_FOUND' },
            };
          }
          return { statusCode: 500, body: { error: 'Internal server error' } };
        }
      };

      const response = await handleGetPersonRequest(personBId);

      assert.equal(response.statusCode, 404, 'Response must be 404 Not Found');
      assert.equal(
        (response.body as { error: string }).error,
        'Resource not found',
        'Response must not leak that Person exists in another tenant'
      );
      assert.equal(
        Boolean((response.body as Record<string, unknown>).firstName),
        false,
        'No data from Tenant B must ever leak in response body'
      );

      const audits = AuthorizationKernel.getSecurityAuditLogs();
      const crossTenantAudit = audits.find(
        (a) => a.resourceId === personBId && a.maskedAsNotFound === true
      );
      assert.ok(crossTenantAudit, 'A security audit entry with maskedAsNotFound must be recorded');
      assert.equal(crossTenantAudit?.decision, 'DENY');
    });
  });

  describe('2. Enrollment Optimistic Concurrency Control (OCC) / Lost-Update Prevention', () => {
    test('Concurrent updates on same Enrollment must detect version mismatch and prevent lost-update', async () => {
      interface VersionedEnrollment extends EnrollmentDto {
        version: number;
      }

      class OccEnrollmentStore {
        private records = new Map<string, VersionedEnrollment>();

        public save(enrollment: VersionedEnrollment): void {
          this.records.set(enrollment.id, { ...enrollment });
        }

        public get(id: string): VersionedEnrollment | undefined {
          const item = this.records.get(id);
          return item ? { ...item } : undefined;
        }

        public updateWithOcc(id: string, expectedVersion: number, newStatus: any): VersionedEnrollment {
          const current = this.records.get(id);
          if (!current) {
            throw new Error('Not found');
          }
          if (current.version !== expectedVersion) {
            throw new DomainError(
              'Optimistic lock failure: expected version ' + expectedVersion + ', but current is ' + current.version
            );
          }
          const updated: VersionedEnrollment = {
            ...current,
            status: newStatus,
            version: current.version + 1,
            updatedAt: new Date().toISOString(),
          };
          this.records.set(id, updated);
          return updated;
        }
      }

      const store = new OccEnrollmentStore();
      const enrollmentId = nodeCrypto.randomUUID();
      const initial: VersionedEnrollment = {
        id: enrollmentId,
        tenantId: '10000000-0000-0000-0000-000000000001',
        institutionId: '10000000-0000-0000-0000-000000000010',
        programId: '10000000-0000-0000-0000-000000000020',
        learnerId: '10000000-0000-0000-0000-000000000030',
        enrollmentNumber: 'ENR-OCC-001',
        status: 'DRAFT',
        startDate: '2026-09-01',
        version: 1,
        createdAt: new Date().toISOString(),
      };
      store.save(initial);

      const thread1Snapshot = store.get(enrollmentId)!;
      const thread2Snapshot = store.get(enrollmentId)!;
      assert.equal(thread1Snapshot.version, 1);
      assert.equal(thread2Snapshot.version, 1);

      const afterThread1 = store.updateWithOcc(enrollmentId, thread1Snapshot.version, 'PENDING');
      assert.equal(afterThread1.status, 'PENDING');
      assert.equal(afterThread1.version, 2);

      assert.throws(
        () => {
          store.updateWithOcc(enrollmentId, thread2Snapshot.version, 'CANCELLED');
        },
        /Optimistic lock failure/,
        'Thread 2 must be rejected due to version mismatch, preventing lost-update'
      );

      const finalState = store.get(enrollmentId)!;
      assert.equal(finalState.version, 2);
      assert.equal(finalState.status, 'PENDING');
    });
  });

  describe('3. Idempotency Race Condition (Concurrent Duplicate Requests)', () => {
    test('Simultaneous concurrent requests with identical idempotencyKey process only once without duplicate outbox events', async () => {
      MockTransactionalStorage.clear();

      const context: RequestTenantContext = {
        tenantId: '10000000-0000-0000-0000-000000000001',
        userId: '11111111-1111-1111-1111-111111111111',
        roles: ['ADMINISTRATOR'],
      };

      const idempotencyKey = 'PAY-PLAN-' + Date.now();
      let executionCount = 0;

      const triggerOperation = async () => {
        return TransactionalMutationRunner.execute(context, {
          actionName: 'payment_plan.create',
          aggregateType: 'PaymentPlan',
          aggregateId: '55555555-5555-5555-5555-555555555555',
          idempotencyKey,
          validateInvariants: () => {},
          mutateDomain: async () => {
            await new Promise((resolve) => setTimeout(resolve, 30));
            executionCount++;
            return { planId: '55555555-5555-5555-5555-555555555555', totalMinor: '12000000' };
          },
          createEvent: (result) => ({
            eventId: nodeCrypto.randomUUID(),
            eventType: 'PaymentPlanCreated',
            aggregateId: '55555555-5555-5555-5555-555555555555',
            occurredAt: new Date().toISOString(),
            payload: result,
          }),
        });
      };

      const firstResult = await triggerOperation();
      assert.equal(executionCount, 1);

      const [reqA, reqB] = await Promise.all([
        triggerOperation(),
        triggerOperation(),
      ]);

      assert.deepEqual(reqA, firstResult);
      assert.deepEqual(reqB, firstResult);
      assert.equal(executionCount, 1, 'Domain mutation must have executed exactly once');
      assert.equal(MockTransactionalStorage.outbox.length, 1, 'Exactly one outbox event must exist');
    });
  });

  describe('4. Transactional Outbox Worker Retry & Idempotent Consumer', () => {
    test('Failed worker retries with exponential backoff and consumer processes idempotently without duplicate effects', async () => {
      interface WorkerTask {
        id: string;
        eventId: string;
        payload: { registrationId: string; amount: number };
        status: 'PENDING' | 'RETRYING' | 'PUBLISHED' | 'FAILED' | 'DEAD_LETTER';
        attempts: number;
        maxAttempts: number;
        nextRetryAt?: Date | undefined;
      }

      const task: WorkerTask = {
        id: nodeCrypto.randomUUID(),
        eventId: 'evt-outbox-999',
        payload: { registrationId: 'reg-123', amount: 50000 },
        status: 'PENDING',
        attempts: 0,
        maxAttempts: 3,
      };

      const processedEventIds = new Set<string>();
      let consumerSideEffects = 0;

      const consumerHandler = (eventId: string, _payload: any) => {
        if (processedEventIds.has(eventId)) {
          return { skipped: true };
        }
        processedEventIds.add(eventId);
        consumerSideEffects++;
        return { success: true };
      };

      const processWorkerTask = (shouldSimulateError: boolean) => {
        task.attempts++;
        if (shouldSimulateError) {
          if (task.attempts >= task.maxAttempts) {
            task.status = 'DEAD_LETTER';
          } else {
            task.status = 'RETRYING';
            const delayMs = Math.pow(2, task.attempts) * 100;
            task.nextRetryAt = new Date(Date.now() + delayMs);
          }
          return { success: false, error: 'Transient connection timeout' };
        }

        const result = consumerHandler(task.eventId, task.payload);
        task.status = 'PUBLISHED';
        return { success: true, consumerResult: result };
      };

      const attempt1 = processWorkerTask(true);
      assert.equal(attempt1.success, false);
      assert.equal(task.status, 'RETRYING');
      assert.equal(task.attempts, 1);
      assert.ok(task.nextRetryAt && task.nextRetryAt > new Date());

      const attempt2 = processWorkerTask(false);
      assert.equal(attempt2.success, true);
      assert.equal(task.status, 'PUBLISHED');
      assert.equal(consumerSideEffects, 1);

      const duplicateDelivery = consumerHandler(task.eventId, task.payload);
      assert.equal(duplicateDelivery.skipped, true);
      assert.equal(
        consumerSideEffects,
        1,
        'Consumer must not duplicate side effects upon re-delivery'
      );
    });
  });

});
