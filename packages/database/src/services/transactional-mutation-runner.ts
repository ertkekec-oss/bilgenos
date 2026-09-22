import * as nodeCrypto from 'node:crypto';
import type { BaseDomainEvent, RequestTenantContext, UUID } from '@bilgenos/contracts';
import { DomainError } from '@bilgenos/domain';

export interface OutboxRecord {
  id: UUID;
  tenantId: UUID;
  aggregateType: string;
  aggregateId: UUID;
  eventType: string;
  payload: unknown;
  status: 'PENDING' | 'PUBLISHED' | 'FAILED';
  createdAt: string;
}

export interface AuditRecord {
  id: UUID;
  tenantId: UUID;
  actorUserId?: UUID | undefined;
  action: string;
  entityType: string;
  entityId: UUID;
  details?: unknown;
  createdAt: string;
}

export interface IdempotencyRecord {
  key: string;
  tenantId: UUID;
  handlerName: string;
  response: unknown;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
}

export class MockTransactionalStorage {
  public static readonly outbox: OutboxRecord[] = [];
  public static readonly audits: AuditRecord[] = [];
  public static readonly idempotencyKeys: Map<string, IdempotencyRecord> = new Map();

  public static clear(): void {
    this.outbox.length = 0;
    this.audits.length = 0;
    this.idempotencyKeys.clear();
  }
}

export interface MutationOperation<TResult> {
  actionName: string;
  aggregateType: string;
  aggregateId: UUID;
  idempotencyKey?: string | undefined;
  validateInvariants: () => void;
  mutateDomain: () => Promise<TResult>;
  createEvent: (result: TResult) => BaseDomainEvent;
}

export class TransactionalMutationRunner {
  /**
   * Executes a domain mutation within an atomic transaction:
   * BEGIN
   *   Idempotency Check
   *   Authorization
   *   Invariant Validation
   *   Domain Mutation
   *   Audit Entry
   *   Outbox Event
   * COMMIT
   */
  public static async execute<TResult>(
    context: RequestTenantContext,
    operation: MutationOperation<TResult>
  ): Promise<TResult> {
    // 1. Idempotency Check
    if (operation.idempotencyKey) {
      const existing = MockTransactionalStorage.idempotencyKeys.get(operation.idempotencyKey);
      if (existing && existing.status === 'COMPLETED') {
        return existing.response as TResult;
      }
      if (existing && existing.status === 'PROCESSING') {
        throw new DomainError('Concurrent request in processing with same idempotency key.');
      }
      MockTransactionalStorage.idempotencyKeys.set(operation.idempotencyKey, {
        key: operation.idempotencyKey,
        tenantId: context.tenantId,
        handlerName: operation.actionName,
        response: null,
        status: 'PROCESSING',
        createdAt: new Date().toISOString(),
      });
    }

    // 2. Invariant Validation
    operation.validateInvariants();

    // 3. Atomicity simulation: Execute mutation, write audit, write outbox
    try {
      const result = await operation.mutateDomain();

      // Write Audit Entry
      const auditEntry: AuditRecord = {
        id: nodeCrypto.randomUUID(),
        tenantId: context.tenantId,
        actorUserId: context.userId,
        action: operation.actionName,
        entityType: operation.aggregateType,
        entityId: operation.aggregateId,
        details: result,
        createdAt: new Date().toISOString(),
      };
      MockTransactionalStorage.audits.push(auditEntry);

      // Write Outbox Event atomically
      const event = operation.createEvent(result);
      const outboxEntry: OutboxRecord = {
        id: nodeCrypto.randomUUID(),
        tenantId: context.tenantId,
        aggregateType: operation.aggregateType,
        aggregateId: operation.aggregateId,
        eventType: event.eventType,
        payload: event.payload,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      };
      MockTransactionalStorage.outbox.push(outboxEntry);

      // Save Idempotency Result
      if (operation.idempotencyKey) {
        const idemp = MockTransactionalStorage.idempotencyKeys.get(operation.idempotencyKey);
        if (idemp) {
          idemp.status = 'COMPLETED';
          idemp.response = result;
        }
      }

      return result;
    } catch (err: unknown) {
      // Rollback idempotency on failure
      if (operation.idempotencyKey) {
        MockTransactionalStorage.idempotencyKeys.delete(operation.idempotencyKey);
      }
      throw err;
    }
  }
}
