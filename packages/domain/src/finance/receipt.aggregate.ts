import type { UUID, ReceiptStatus } from '@bilgenos/contracts';
import { InvariantViolationError, DomainError } from '../shared/domain-error.js';

export interface ReceiptProps {
  id: UUID;
  tenantId: UUID;
  institutionId: UUID;
  collectionId: UUID;
  receiptNumber: string;
  recipientPersonId: UUID;
  amountMinor: bigint;
  currency: string;
  documentReference?: string | undefined;
  status: ReceiptStatus;
  issuedAt: Date;
}

export class Receipt {
  private status: ReceiptStatus;

  constructor(private readonly props: ReceiptProps) {
    if (!props.receiptNumber || props.receiptNumber.trim().length === 0) {
      throw new InvariantViolationError('Receipt number cannot be empty.');
    }
    if (props.amountMinor <= 0n) {
      throw new InvariantViolationError('Receipt amount must be strictly greater than zero.');
    }
    this.status = props.status;
  }

  get id(): UUID { return this.props.id; }
  get tenantId(): UUID { return this.props.tenantId; }
  get institutionId(): UUID { return this.props.institutionId; }
  get collectionId(): UUID { return this.props.collectionId; }
  get receiptNumber(): string { return this.props.receiptNumber; }
  get recipientPersonId(): UUID { return this.props.recipientPersonId; }
  get amountMinor(): bigint { return this.props.amountMinor; }
  get currency(): string { return this.props.currency; }
  get documentReference(): string | undefined { return this.props.documentReference; }
  get currentStatus(): ReceiptStatus { return this.status; }
  get issuedAt(): Date { return this.props.issuedAt; }

  public cancel(): void {
    if (this.status === 'CANCELLED') {
      throw new DomainError('Receipt is already cancelled.');
    }
    this.status = 'CANCELLED';
  }
}
