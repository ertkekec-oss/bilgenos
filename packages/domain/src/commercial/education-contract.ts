import { UUID, EducationContractStatus } from '@bilgenos/contracts';
import { InvariantViolationError } from '../shared/domain-error.js';

export interface EducationContractProps {
  id: UUID;
  tenantId: UUID;
  institutionId: UUID;
  registrationId: UUID;
  contractNumber: string;
  version: number;
  financialResponsiblePersonId: UUID;
  effectiveDate: Date;
  expiryDate?: Date | undefined;
  status: EducationContractStatus;
  documentReference?: string | undefined;
  createdAt: Date;
  updatedAt: Date;
}

export class EducationContract {
  private status: EducationContractStatus;
  private version: number;
  private updatedAt: Date;

  constructor(private readonly props: EducationContractProps) {
    if (!props.contractNumber) {
      throw new InvariantViolationError('EducationContract must have a contractNumber.');
    }
    if (!props.financialResponsiblePersonId) {
      throw new InvariantViolationError('EducationContract must specify the financialResponsiblePersonId.');
    }
    this.status = props.status;
    this.version = props.version;
    this.updatedAt = props.updatedAt;
  }

  get id(): UUID { return this.props.id; }
  get tenantId(): UUID { return this.props.tenantId; }
  get institutionId(): UUID { return this.props.institutionId; }
  get registrationId(): UUID { return this.props.registrationId; }
  get contractNumber(): string { return this.props.contractNumber; }
  get currentVersion(): number { return this.version; }
  get currentStatus(): EducationContractStatus { return this.status; }
  get financialResponsiblePersonId(): UUID { return this.props.financialResponsiblePersonId; }
  get lastUpdatedAt(): Date { return this.updatedAt; }

  public issue(): void {
    if (this.status !== 'DRAFT') {
      throw new InvariantViolationError('Contract can only be issued from DRAFT state.');
    }
    this.status = 'ISSUED';
    this.updatedAt = new Date();
  }

  public sign(documentReference?: string): void {
    if (this.status !== 'ISSUED' && this.status !== 'ACCEPTED') {
      throw new InvariantViolationError('Only ISSUED or ACCEPTED contracts can be SIGNED.');
    }
    this.status = 'SIGNED';
    this.props.documentReference = documentReference;
    this.updatedAt = new Date();
  }

  /**
   * Immutable Contract Versioning:
   * Signed or issued contract history is never overwritten.
   * Amending creates a new contract version.
   */
  public createAmendment(newContractId: UUID, amendmentDate: Date = new Date()): EducationContract {
    return new EducationContract({
      ...this.props,
      id: newContractId,
      version: this.version + 1,
      status: 'DRAFT',
      effectiveDate: amendmentDate,
      createdAt: amendmentDate,
      updatedAt: amendmentDate,
    });
  }
}
