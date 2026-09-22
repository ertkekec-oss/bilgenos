import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import type { BaseDomainEvent, CapabilityKey, CapabilityState, RequestTenantContext } from '@bilgenos/contracts';
import {
  CapabilityCycleError,
  CapabilityDagEngine,
  CapabilityDependencyError,
  InvariantViolationError,
} from '@bilgenos/domain';
import {
  MockTransactionalStorage,
  TransactionalMutationRunner,
} from '@bilgenos/database';

describe('Milestone 3: Capability DAG, Outbox Atomicity & Idempotency Verification', () => {
  const tenantId = '11111111-1111-1111-1111-111111111111';

  const context: RequestTenantContext = {
    tenantId,
    userId: 'admin-1',
    roles: ['INSTITUTION_ADMIN'],
    permissions: ['institution.update'],
  };

  beforeEach(() => {
    MockTransactionalStorage.clear();
  });

  describe('Capability DAG Engine', () => {
    it('1. Cycle Detection: Cycle A -> B -> A must throw CapabilityCycleError', () => {
      const engine = new CapabilityDagEngine();

      // Introduce artificial cycle
      assert.throws(
        () => {
          engine.addRule('ACADEMIC', ['AI']); // AI already depends on ACADEMIC!
          engine.validateGraphForCycles();
        },
        (err: Error) => {
          assert(err instanceof CapabilityCycleError);
          assert(err.message.includes('cycle detected'));
          return true;
        }
      );
    });

    it('2. Dependency Enforcement: Enabling ASSESSMENT without CURRICULUM throws CapabilityDependencyError', () => {
      const engine = new CapabilityDagEngine();
      const currentStates = new Map<CapabilityKey, CapabilityState>([
        ['ACADEMIC', 'ENABLED'],
        ['CURRICULUM', 'DISABLED'], // Missing!
      ]);

      assert.throws(
        () => {
          engine.validateTransition(currentStates, 'ASSESSMENT', 'ENABLED');
        },
        (err: Error) => {
          assert(err instanceof CapabilityDependencyError);
          assert(err.message.includes("Prerequisite capability 'CURRICULUM' is not enabled"));
          return true;
        }
      );
    });

    it('3. Capability State Mutability: DISABLED and READ_ONLY block mutations', () => {
      assert.strictEqual(CapabilityDagEngine.canMutate('DISABLED'), false);
      assert.strictEqual(CapabilityDagEngine.canMutate('READ_ONLY'), false);
      assert.strictEqual(CapabilityDagEngine.canMutate('SUSPENDED'), false);
      assert.strictEqual(CapabilityDagEngine.canMutate('ENABLED'), true);

      // Read capabilities
      assert.strictEqual(CapabilityDagEngine.canRead('READ_ONLY'), true);
      assert.strictEqual(CapabilityDagEngine.canRead('ENABLED'), true);
      assert.strictEqual(CapabilityDagEngine.canRead('DISABLED'), false);
    });
  });

  describe('Transactional Outbox & Atomicity', () => {
    it('4. Atomic Mutation: Domain mutation writes both Audit Log and Outbox Record', async () => {
      const entityId = 'item-100';

      const result = await TransactionalMutationRunner.execute(context, {
        actionName: 'institution.create',
        aggregateType: 'Institution',
        aggregateId: entityId,
        validateInvariants: () => {},
        mutateDomain: async () => {
          return { id: entityId, name: 'Anadolu Lisesi' };
        },
        createEvent: (res): BaseDomainEvent => ({
          eventId: 'evt-1',
          eventType: 'InstitutionCreated',
          tenantId,
          aggregateId: res.id,
          aggregateType: 'Institution',
          timestamp: new Date().toISOString(),
          payload: res,
        }),
      });

      assert.strictEqual(result.name, 'Anadolu Lisesi');

      // Verify Audit Record
      assert.strictEqual(MockTransactionalStorage.audits.length, 1);
      assert.strictEqual(MockTransactionalStorage.audits[0]?.action, 'institution.create');
      assert.strictEqual(MockTransactionalStorage.audits[0]?.tenantId, tenantId);

      // Verify Outbox Record
      assert.strictEqual(MockTransactionalStorage.outbox.length, 1);
      assert.strictEqual(MockTransactionalStorage.outbox[0]?.eventType, 'InstitutionCreated');
      assert.strictEqual(MockTransactionalStorage.outbox[0]?.tenantId, tenantId);
      assert.strictEqual(MockTransactionalStorage.outbox[0]?.status, 'PENDING');
    });

    it('5. Invariant Failure Rollback: Invariant failure aborts before mutation or outbox', async () => {
      await assert.rejects(
        async () => {
          await TransactionalMutationRunner.execute(context, {
            actionName: 'institution.create',
            aggregateType: 'Institution',
            aggregateId: 'invalid-id',
            validateInvariants: () => {
              throw new InvariantViolationError('Invalid institution name');
            },
            mutateDomain: async () => ({ id: 'invalid-id' }),
            createEvent: () => ({} as BaseDomainEvent),
          });
        },
        (err: Error) => {
          assert(err instanceof InvariantViolationError);
          return true;
        }
      );

      // Storage must remain completely empty!
      assert.strictEqual(MockTransactionalStorage.audits.length, 0);
      assert.strictEqual(MockTransactionalStorage.outbox.length, 0);
    });

    it('6. Idempotency: Duplicate calls with same idempotency key return cached response without duplicate outbox events', async () => {
      const idempotencyKey = 'idemp-req-unique-99';
      let executionCount = 0;

      const runOperation = () =>
        TransactionalMutationRunner.execute(context, {
          actionName: 'person.create',
          aggregateType: 'Person',
          aggregateId: 'person-99',
          idempotencyKey,
          validateInvariants: () => {},
          mutateDomain: async () => {
            executionCount++;
            return { id: 'person-99', name: 'Original Execution' };
          },
          createEvent: (res): BaseDomainEvent => ({
            eventId: `evt-${executionCount}`,
            eventType: 'PersonCreated',
            tenantId,
            aggregateId: res.id,
            aggregateType: 'Person',
            timestamp: new Date().toISOString(),
            payload: res,
          }),
        });

      // Call 1
      const res1 = await runOperation();
      assert.strictEqual(res1.name, 'Original Execution');
      assert.strictEqual(executionCount, 1);
      assert.strictEqual(MockTransactionalStorage.outbox.length, 1);

      // Call 2 with identical idempotencyKey
      const res2 = await runOperation();
      assert.strictEqual(res2.name, 'Original Execution');
      // Must NOT execute mutateDomain again!
      assert.strictEqual(executionCount, 1);
      // Outbox must NOT have a duplicate record!
      assert.strictEqual(MockTransactionalStorage.outbox.length, 1);
    });
  });
});
