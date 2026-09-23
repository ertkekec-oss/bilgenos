import type { UUID, PaymentAllocationStatus } from '@bilgenos/contracts';
import { InvariantViolationError, DomainError } from '../shared/domain-error.js';

export interface PaymentAllocationProps {
  id: UUID;
  tenantId: UUID;
  collectionId: UUID;
  paymentInstallmentId: UUID;
  amountMinor: bigint;
  allocatedAt: Date;
  status: PaymentAllocationStatus;
}

export class PaymentAllocation {
  private currentStatus: PaymentAllocationStatus;

  constructor(private readonly props: PaymentAllocationProps) {
    if (props.amountMinor <= 0n) {
      throw new InvariantViolationError('PaymentAllocation amount must be greater than zero.');
    }
    this.currentStatus = props.status;
  }

  get id(): UUID { return this.props.id; }
  get tenantId(): UUID { return this.props.tenantId; }
  get collectionId(): UUID { return this.props.collectionId; }
  get paymentInstallmentId(): UUID { return this.props.paymentInstallmentId; }
  get amountMinor(): bigint { return this.props.amountMinor; }
  get allocatedAt(): Date { return this.props.allocatedAt; }
  get status(): PaymentAllocationStatus { return this.currentStatus; }

  public reverse(): void {
    if (this.currentStatus === 'REVERSED') {
      throw new DomainError('PaymentAllocation is already reversed.');
    }
    this.currentStatus = 'REVERSED';
  }
}
