import type {
  UUID,
  ReconciliationSourceType,
  ReconciliationSessionStatus,
  ReconciliationMatchStatus,
} from '@bilgenos/contracts';

export interface ReconciliationItemProps {
  id: UUID;
  tenantId: UUID;
  sessionId: UUID;
  externalReference: string;
  amountMinor: bigint;
  transactionDate: Date;
  matchedLedgerEntryId?: UUID | undefined;
  matchStatus: ReconciliationMatchStatus;
  confidenceScore?: number | undefined;
  notes?: string | undefined;
}

export class ReconciliationItem {
  private matchStatus: ReconciliationMatchStatus;
  private matchedLedgerEntryId?: UUID | undefined;

  constructor(private readonly props: ReconciliationItemProps) {
    this.matchStatus = props.matchStatus;
    this.matchedLedgerEntryId = props.matchedLedgerEntryId;
  }

  get id(): UUID { return this.props.id; }
  get tenantId(): UUID { return this.props.tenantId; }
  get sessionId(): UUID { return this.props.sessionId; }
  get externalReference(): string { return this.props.externalReference; }
  get amountMinor(): bigint { return this.props.amountMinor; }
  get transactionDate(): Date { return this.props.transactionDate; }
  get currentMatchStatus(): ReconciliationMatchStatus { return this.matchStatus; }
  get currentMatchedLedgerEntryId(): UUID | undefined { return this.matchedLedgerEntryId; }

  public match(ledgerEntryId: UUID): void {
    this.matchStatus = 'MATCHED';
    this.matchedLedgerEntryId = ledgerEntryId;
  }

  /**
   * Binding Decision #7:
   * Ambiguous matching must not automatically resolve.
   */
  public flagAmbiguous(reason: string): void {
    this.matchStatus = 'AMBIGUOUS';
    this.props.notes = reason;
  }
}

export interface ReconciliationSessionProps {
  id: UUID;
  tenantId: UUID;
  institutionId: UUID;
  financialAccountId: UUID;
  sourceType: ReconciliationSourceType;
  sessionDate: Date;
  status: ReconciliationSessionStatus;
  externalClosingBalanceMinor: bigint;
  ledgerClosingBalanceMinor: bigint;
}

export class ReconciliationSession {
  private status: ReconciliationSessionStatus;

  constructor(private readonly props: ReconciliationSessionProps) {
    this.status = props.status;
  }

  get id(): UUID { return this.props.id; }
  get tenantId(): UUID { return this.props.tenantId; }
  get institutionId(): UUID { return this.props.institutionId; }
  get financialAccountId(): UUID { return this.props.financialAccountId; }
  get sourceType(): ReconciliationSourceType { return this.props.sourceType; }
  get sessionDate(): Date { return this.props.sessionDate; }
  get currentStatus(): ReconciliationSessionStatus { return this.status; }
  get externalClosingBalanceMinor(): bigint { return this.props.externalClosingBalanceMinor; }
  get ledgerClosingBalanceMinor(): bigint { return this.props.ledgerClosingBalanceMinor; }

  get discrepancyMinor(): bigint {
    return this.props.externalClosingBalanceMinor - this.props.ledgerClosingBalanceMinor;
  }

  public evaluateSession(): void {
    if (this.discrepancyMinor === 0n) {
      this.status = 'MATCHED';
    } else {
      this.status = 'DISCREPANCY';
    }
  }

  public close(): void {
    this.status = 'CLOSED';
  }
}
