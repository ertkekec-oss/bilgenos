import type {
  UUID,
  LedgerEntryType,
  LedgerSourceReferenceType,
} from '@bilgenos/contracts';
import { InvariantViolationError, DomainError } from '../shared/domain-error.js';

export interface FinancialLedgerEntryProps {
  id: UUID;
  tenantId: UUID;
  institutionId: UUID;
  entryNumber: bigint;
  financialAccountId: UUID;
  entryType: LedgerEntryType;
  amountMinor: bigint;
  currency: string;
  sourceReferenceType: LedgerSourceReferenceType;
  sourceReferenceId: UUID;
  description: string;
  isReversed?: boolean | undefined;
  reversalEntryId?: UUID | undefined;
  postedAt: Date;
}

/**
 * Binding Decision #1:
 * Operational Ledger != General Ledger.
 * FinancialLedgerEntry is an immutable operational money journal.
 * Once created, it cannot be modified or deleted.
 * Corrections must be posted as compensating/reversal entries.
 */
export class FinancialLedgerEntry {
  private reversed: boolean;
  private linkedReversalEntryId?: UUID | undefined;

  constructor(private readonly props: FinancialLedgerEntryProps) {
    if (props.amountMinor <= 0n) {
      throw new InvariantViolationError('Ledger entry amount must be strictly greater than zero.');
    }
    if (!props.description || props.description.trim().length === 0) {
      throw new InvariantViolationError('Ledger entry description is required.');
    }
    this.reversed = props.isReversed ?? false;
    this.linkedReversalEntryId = props.reversalEntryId;
  }

  get id(): UUID { return this.props.id; }
  get tenantId(): UUID { return this.props.tenantId; }
  get institutionId(): UUID { return this.props.institutionId; }
  get entryNumber(): bigint { return this.props.entryNumber; }
  get financialAccountId(): UUID { return this.props.financialAccountId; }
  get entryType(): LedgerEntryType { return this.props.entryType; }
  get amountMinor(): bigint { return this.props.amountMinor; }
  get currency(): string { return this.props.currency; }
  get sourceReferenceType(): LedgerSourceReferenceType { return this.props.sourceReferenceType; }
  get sourceReferenceId(): UUID { return this.props.sourceReferenceId; }
  get description(): string { return this.props.description; }
  get isReversed(): boolean { return this.reversed; }
  get reversalEntryId(): UUID | undefined { return this.linkedReversalEntryId; }
  get postedAt(): Date { return this.props.postedAt; }

  public markReversed(reversalEntryId: UUID): void {
    if (this.reversed) {
      throw new DomainError('Ledger entry is already marked as reversed.');
    }
    this.reversed = true;
    this.linkedReversalEntryId = reversalEntryId;
  }
}
