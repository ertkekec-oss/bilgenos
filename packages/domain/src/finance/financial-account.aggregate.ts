import type { UUID, FinancialAccountType } from '@bilgenos/contracts';
import { InvariantViolationError } from '../shared/domain-error.js';
import type { FinancialLedgerEntry } from './financial-ledger.aggregate.js';

export interface FinancialAccountProps {
  id: UUID;
  tenantId: UUID;
  institutionId: UUID;
  name: string;
  accountType: FinancialAccountType;
  currency: string;
  accountNumber?: string | undefined;
  iban?: string | undefined;
  bankName?: string | undefined;
  branchName?: string | undefined;
  isActive: boolean;
}

export class FinancialAccount {
  constructor(private readonly props: FinancialAccountProps) {
    this.validate();
  }

  get id(): UUID { return this.props.id; }
  get tenantId(): UUID { return this.props.tenantId; }
  get institutionId(): UUID { return this.props.institutionId; }
  get name(): string { return this.props.name; }
  get accountType(): FinancialAccountType { return this.props.accountType; }
  get currency(): string { return this.props.currency; }
  get accountNumber(): string | undefined { return this.props.accountNumber; }
  get iban(): string | undefined { return this.props.iban; }
  get bankName(): string | undefined { return this.props.bankName; }
  get branchName(): string | undefined { return this.props.branchName; }
  get isActive(): boolean { return this.props.isActive; }

  private validate(): void {
    if (!this.props.name || this.props.name.trim().length === 0) {
      throw new InvariantViolationError('FinancialAccount name cannot be empty.');
    }
    const allowedTypes: FinancialAccountType[] = [
      'CASH',
      'BANK',
      'CARD_CLEARING',
      'PAYMENT_PROVIDER_CLEARING',
      'OTHER',
    ];
    if (!allowedTypes.includes(this.props.accountType)) {
      throw new InvariantViolationError(
        'Invalid operational account type: ' + this.props.accountType + '. Accounting classes (RECEIVABLE, INCOME, LIABILITY) are prohibited in Phase 3.'
      );
    }
  }

  /**
   * Binding Decision #2:
   * Mutable balance is not the authoritative source of truth.
   * Authoritative balance is derived from the Financial Ledger entry projection.
   */
  public calculateProjectedBalance(entries: readonly FinancialLedgerEntry[]): bigint {
    let balance = 0n;
    for (const entry of entries) {
      if (entry.financialAccountId !== this.id || entry.isReversed) {
        continue;
      }
      if (entry.entryType === 'MONEY_IN' || entry.entryType === 'TRANSFER_IN') {
        balance += entry.amountMinor;
      } else if (entry.entryType === 'MONEY_OUT' || entry.entryType === 'TRANSFER_OUT') {
        balance -= entry.amountMinor;
      }
    }
    return balance;
  }

  /**
   * Binding Decision #8:
   * Default masking for IBAN and Account identifiers in UI / Logs.
   */
  public getMaskedIban(): string | undefined {
    if (!this.props.iban) return undefined;
    const clean = this.props.iban.replace(/\s+/g, '');
    if (clean.length < 8) return '****';
    const start = clean.substring(0, 2);
    const end = clean.substring(clean.length - 4);
    return start + '******************' + end;
  }

  public getMaskedAccountNumber(): string | undefined {
    if (!this.props.accountNumber) return undefined;
    const str = this.props.accountNumber.trim();
    if (str.length <= 4) return '****';
    return '***' + str.substring(str.length - 4);
  }
}
