import type {
  UUID,
  CollectionStatus,
  CollectionPaymentMethod,
  CollectionAllocationState,
} from '@bilgenos/contracts';
import { InvariantViolationError, DomainError } from '../shared/domain-error.js';
import type { PaymentAllocation } from './payment-allocation.aggregate.js';

export interface CollectionProps {
  id: UUID;
  tenantId: UUID;
  institutionId: UUID;
  financialResponsiblePersonId: UUID;
  financialAccountId: UUID;
  paymentMethod: CollectionPaymentMethod;
  amountMinor: bigint;
  currency: string;
  collectedAt: Date;
  referenceNumber?: string | undefined;
  status: CollectionStatus;
  notes?: string | undefined;
}

export class Collection {
  private status: CollectionStatus;

  constructor(private readonly props: CollectionProps) {
    if (props.amountMinor <= 0n) {
      throw new InvariantViolationError('Collection amount must be strictly greater than zero.');
    }
    this.status = props.status;
  }

  get id(): UUID { return this.props.id; }
  get tenantId(): UUID { return this.props.tenantId; }
  get institutionId(): UUID { return this.props.institutionId; }
  get financialResponsiblePersonId(): UUID { return this.props.financialResponsiblePersonId; }
  get financialAccountId(): UUID { return this.props.financialAccountId; }
  get paymentMethod(): CollectionPaymentMethod { return this.props.paymentMethod; }
  get amountMinor(): bigint { return this.props.amountMinor; }
  get currency(): string { return this.props.currency; }
  get collectedAt(): Date { return this.props.collectedAt; }
  get referenceNumber(): string | undefined { return this.props.referenceNumber; }
  get currentStatus(): CollectionStatus { return this.status; }
  get notes(): string | undefined { return this.props.notes; }

  /**
   * Binding Decision #6:
   * Collection creation is not confirmed money.
   * PENDING -> CONFIRMED is an explicit domain operation.
   */
  public confirm(): void {
    if (this.status !== 'PENDING') {
      throw new DomainError('Only PENDING collections can be CONFIRMED. Current status: ' + this.status);
    }
    this.status = 'CONFIRMED';
  }

  public markPartiallyRefunded(): void {
    if (this.status !== 'CONFIRMED' && this.status !== 'PARTIALLY_REFUNDED') {
      throw new DomainError('Cannot partially refund collection with status: ' + this.status);
    }
    this.status = 'PARTIALLY_REFUNDED';
  }

  public markFullyRefunded(): void {
    if (this.status !== 'CONFIRMED' && this.status !== 'PARTIALLY_REFUNDED') {
      throw new DomainError('Cannot fully refund collection with status: ' + this.status);
    }
    this.status = 'REFUNDED';
  }

  public reverse(): void {
    if (this.status === 'REVERSED') {
      throw new DomainError('Collection is already reversed.');
    }
    this.status = 'REVERSED';
  }

  public markFailed(): void {
    this.status = 'FAILED';
  }

  /**
   * Binding Decision #3:
   * Allocation totals and states are derived from active PaymentAllocations.
   * Collection Amount = SUM(effective allocations) + unallocatedAmountMinor.
   */
  public getAllocationSummary(allocations: readonly PaymentAllocation[]): {
    allocatedAmountMinor: bigint;
    unallocatedAmountMinor: bigint;
    allocationState: CollectionAllocationState;
  } {
    const activeAllocations = allocations.filter(
      (a) => a.collectionId === this.id && a.status === 'ACTIVE'
    );
    const sumAllocated = activeAllocations.reduce(
      (sum, a) => sum + a.amountMinor,
      0n
    );

    if (sumAllocated > this.props.amountMinor) {
      throw new InvariantViolationError(
        'Over-allocation detected: Sum of allocations (' +
          sumAllocated.toString() +
          ') exceeds collection amount (' +
          this.props.amountMinor.toString() +
          ').'
      );
    }

    const unallocated = this.props.amountMinor - sumAllocated;
    let allocationState: CollectionAllocationState = 'UNALLOCATED';
    if (sumAllocated === this.props.amountMinor) {
      allocationState = 'FULLY_ALLOCATED';
    } else if (sumAllocated > 0n) {
      allocationState = 'PARTIALLY_ALLOCATED';
    }

    return {
      allocatedAmountMinor: sumAllocated,
      unallocatedAmountMinor: unallocated,
      allocationState,
    };
  }
}
