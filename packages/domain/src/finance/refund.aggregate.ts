import type { UUID, RefundStatus } from '@bilgenos/contracts';
import { InvariantViolationError, DomainError } from '../shared/domain-error.js';

export interface RefundAllocationProps {
  id: UUID;
  tenantId: UUID;
  refundId: UUID;
  paymentAllocationId: UUID;
  amountMinor: bigint;
  status: 'ACTIVE' | 'REVERSED';
}

export class RefundAllocation {
  constructor(private readonly props: RefundAllocationProps) {
    if (props.amountMinor <= 0n) {
      throw new InvariantViolationError('RefundAllocation amount must be greater than zero.');
    }
  }

  get id(): UUID { return this.props.id; }
  get tenantId(): UUID { return this.props.tenantId; }
  get refundId(): UUID { return this.props.refundId; }
  get paymentAllocationId(): UUID { return this.props.paymentAllocationId; }
  get amountMinor(): bigint { return this.props.amountMinor; }
  get status(): 'ACTIVE' | 'REVERSED' { return this.props.status; }
}

export interface RefundProps {
  id: UUID;
  tenantId: UUID;
  institutionId: UUID;
  collectionId: UUID;
  amountMinor: bigint;
  currency: string;
  reason: string;
  status: RefundStatus;
  requestedByUserId: UUID;
  approvedByUserId?: UUID | undefined;
  completedByUserId?: UUID | undefined;
  refundedAt?: Date | undefined;
  allocations: RefundAllocation[];
}

export class Refund {
  private status: RefundStatus;
  private approvedByUserId?: UUID | undefined;
  private completedByUserId?: UUID | undefined;
  private refundedAt?: Date | undefined;

  constructor(private readonly props: RefundProps) {
    if (props.amountMinor <= 0n) {
      throw new InvariantViolationError('Refund amount must be strictly greater than zero.');
    }
    if (!props.reason || props.reason.trim().length === 0) {
      throw new InvariantViolationError('Refund reason is mandatory.');
    }
    this.status = props.status;
    this.approvedByUserId = props.approvedByUserId;
    this.completedByUserId = props.completedByUserId;
    this.refundedAt = props.refundedAt;
  }

  get id(): UUID { return this.props.id; }
  get tenantId(): UUID { return this.props.tenantId; }
  get institutionId(): UUID { return this.props.institutionId; }
  get collectionId(): UUID { return this.props.collectionId; }
  get amountMinor(): bigint { return this.props.amountMinor; }
  get currency(): string { return this.props.currency; }
  get reason(): string { return this.props.reason; }
  get currentStatus(): RefundStatus { return this.status; }
  get requestedByUserId(): UUID { return this.props.requestedByUserId; }
  get currentApprovedByUserId(): UUID | undefined { return this.approvedByUserId; }
  get currentCompletedByUserId(): UUID | undefined { return this.completedByUserId; }
  get currentRefundedAt(): Date | undefined { return this.refundedAt; }
  get allocations(): readonly RefundAllocation[] { return this.props.allocations; }

  /**
   * Binding Decision #5:
   * Maker/checker separation support.
   */
  public approve(approverUserId: UUID): void {
    if (this.status !== 'REQUESTED') {
      throw new DomainError('Only REQUESTED refunds can be approved. Current: ' + this.status);
    }
    if (approverUserId === this.props.requestedByUserId) {
      throw new DomainError('Maker-Checker violation: Approver cannot be the same user who requested the refund.');
    }
    this.status = 'APPROVED';
    this.approvedByUserId = approverUserId;
  }

  public complete(completerUserId: UUID): void {
    if (this.status !== 'APPROVED' && this.status !== 'PROCESSING') {
      throw new DomainError('Only APPROVED or PROCESSING refunds can be completed. Current: ' + this.status);
    }
    this.status = 'COMPLETED';
    this.completedByUserId = completerUserId;
    this.refundedAt = new Date();
  }

  public cancel(): void {
    if (this.status === 'COMPLETED') {
      throw new DomainError('COMPLETED refunds cannot be cancelled.');
    }
    this.status = 'CANCELLED';
  }
}
