import {
  UUID,
  LeadSource,
  LeadStatus,
  AdmissionApplicationStatus,
} from '@bilgenos/contracts';
import { DomainError } from '../shared/domain-error.js';

export interface LeadProps {
  id: UUID;
  tenantId: UUID;
  institutionId: UUID;
  candidatePersonId?: UUID | undefined;
  guardianPersonId?: UUID | undefined;
  source: LeadSource;
  status: LeadStatus;
  assignedToUserId?: UUID | undefined;
  interestedProgramId?: UUID | undefined;
  notesSummary?: string | undefined;
  createdAt: Date;
  updatedAt: Date;
}

export class Lead {
  private status: LeadStatus;
  private updatedAt: Date;

  constructor(private readonly props: LeadProps) {
    this.status = props.status;
    this.updatedAt = props.updatedAt;
  }

  get id(): UUID { return this.props.id; }
  get tenantId(): UUID { return this.props.tenantId; }
  get institutionId(): UUID { return this.props.institutionId; }
  get currentStatus(): LeadStatus { return this.status; }
  get source(): LeadSource { return this.props.source; }
  get candidatePersonId(): UUID | undefined { return this.props.candidatePersonId; }
  get lastUpdatedAt(): Date { return this.updatedAt; }

  public contact(): void {
    if (this.status === 'NEW') {
      this.status = 'CONTACTED';
      this.updatedAt = new Date();
    }
  }

  public qualify(): void {
    this.status = 'QUALIFIED';
    this.updatedAt = new Date();
  }

  public markApplicationCreated(): void {
    this.status = 'APPLICATION';
    this.updatedAt = new Date();
  }

  public markOfferPresented(): void {
    this.status = 'OFFERED';
    this.updatedAt = new Date();
  }

  public win(): void {
    this.status = 'WON';
    this.updatedAt = new Date();
  }

  public lose(_reason?: string): void {
    this.status = 'LOST';
    this.updatedAt = new Date();
  }
}

export interface AdmissionApplicationProps {
  id: UUID;
  tenantId: UUID;
  institutionId: UUID;
  leadId: UUID;
  candidatePersonId: UUID;
  requestedProgramId?: UUID | undefined;
  status: AdmissionApplicationStatus;
}

export class AdmissionApplication {
  private status: AdmissionApplicationStatus;

  constructor(private readonly props: AdmissionApplicationProps) {
    this.status = props.status;
  }

  get id(): UUID { return this.props.id; }
  get leadId(): UUID { return this.props.leadId; }
  get candidatePersonId(): UUID { return this.props.candidatePersonId; }
  get currentStatus(): AdmissionApplicationStatus { return this.status; }

  public submit(): void {
    if (this.status !== 'DRAFT') {
      throw new DomainError('Application must be DRAFT to submit.');
    }
    this.status = 'SUBMITTED';
  }

  public approve(): void {
    this.status = 'APPROVED';
  }

  public convertToRegistration(): void {
    if (this.status !== 'APPROVED') {
      throw new DomainError('Only APPROVED applications can be CONVERTED to registration.');
    }
    this.status = 'CONVERTED';
  }
}
