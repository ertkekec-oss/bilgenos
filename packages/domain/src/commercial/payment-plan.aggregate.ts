import { UUID, PaymentInstallmentStatus } from '@bilgenos/contracts';
import { InvariantViolationError, DomainError } from '../shared/domain-error.js';

export interface PaymentInstallmentProps {
  id: UUID;
  tenantId: UUID;
  paymentPlanId: UUID;
  sequence: number;
  dueDate: Date;
  amountMinor: bigint;
  currency: string;
  status: PaymentInstallmentStatus;
}

export class PaymentInstallment {
  private status: PaymentInstallmentStatus;

  constructor(private readonly props: PaymentInstallmentProps) {
    this.status = props.status;
  }

  get id(): UUID { return this.props.id; }
  get sequence(): number { return this.props.sequence; }
  get dueDate(): Date { return this.props.dueDate; }
  get amountMinor(): bigint { return this.props.amountMinor; }
  get currentStatus(): PaymentInstallmentStatus { return this.status; }

  /**
   * Binding Constraint #5:
   * PaymentInstallment cannot be directly transitioned to PAID via arbitrary status patch.
   * It requires an explicit collection and payment allocation workflow.
   */
  public markPaidArbitrary(): never {
    throw new DomainError(
      'Direct PATCH status=PAID is strictly forbidden. PaymentInstallment status can only be allocated via the Collection and PaymentAllocation workflow.'
    );
  }

  public allocatePayment(allocatedMinor: bigint): void {
    if (allocatedMinor <= 0n) {
      throw new InvariantViolationError('Allocated payment must be greater than zero.');
    }
    if (allocatedMinor < this.props.amountMinor) {
      this.status = 'PARTIALLY_PAID';
    } else {
      this.status = 'PAID';
    }
  }
}

export interface PaymentPlanProps {
  id: UUID;
  tenantId: UUID;
  institutionId: UUID;
  registrationId: UUID;
  grossAmountMinor: bigint;
  scholarshipAmountMinor: bigint;
  discountAmountMinor: bigint;
  currency: string;
  installments: PaymentInstallment[];
}

export class PaymentPlan {
  constructor(private readonly props: PaymentPlanProps) {
    this.validateReconciliation();
  }

  get id(): UUID { return this.props.id; }
  get tenantId(): UUID { return this.props.tenantId; }
  get institutionId(): UUID { return this.props.institutionId; }
  get registrationId(): UUID { return this.props.registrationId; }
  get grossAmountMinor(): bigint { return this.props.grossAmountMinor; }
  get scholarshipAmountMinor(): bigint { return this.props.scholarshipAmountMinor; }
  get discountAmountMinor(): bigint { return this.props.discountAmountMinor; }
  get netContractualAmountMinor(): bigint {
    return this.props.grossAmountMinor - this.props.scholarshipAmountMinor - this.props.discountAmountMinor;
  }
  get installments(): readonly PaymentInstallment[] { return this.props.installments; }

  /**
   * Money Reconciliation Invariant:
   * gross - scholarship - discounts = netContractualAmount = sum(installments)
   */
  private validateReconciliation(): void {
    const net = this.netContractualAmountMinor;
    if (net < 0n) {
      throw new InvariantViolationError('Net contractual amount cannot be negative.');
    }

    const installmentSum = this.props.installments.reduce(
      (sum, inst) => sum + inst.amountMinor,
      0n
    );

    if (installmentSum !== net) {
      throw new InvariantViolationError(
        'Payment plan reconciliation failure: sum of installments (' +
        installmentSum.toString() +
        ') does not match net contractual amount (' +
        net.toString() +
        ').'
      );
    }
  }
}
