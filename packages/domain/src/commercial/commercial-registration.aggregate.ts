import {
  CommercialRegistrationStatus,
  CommercialIntegrationStatus,
  UUID,
} from '@bilgenos/contracts';
import { InvariantViolationError, DomainError } from '../shared/domain-error.js';

export interface CommercialRegistrationProps {
  id: UUID;
  tenantId: UUID;
  institutionId: UUID;
  candidatePersonId: UUID;
  guardianPersonId?: UUID | undefined;
  financialResponsiblePersonId: UUID;
  applicationId?: UUID | undefined;
  offerId?: UUID | undefined;
  educationPeriodId?: UUID | undefined;
  programId?: UUID | undefined;
  campusId?: UUID | undefined;
  status: CommercialRegistrationStatus;
  integrationStatus: CommercialIntegrationStatus;
  contractId?: UUID | undefined;
  paymentPlanId?: UUID | undefined;
  createdAt: Date;
  updatedAt: Date;
}

export class CommercialRegistration {
  private status: CommercialRegistrationStatus;
  private integrationStatus: CommercialIntegrationStatus;
  private contractId?: UUID | undefined;
  private paymentPlanId?: UUID | undefined;
  private updatedAt: Date;

  constructor(private readonly props: CommercialRegistrationProps) {
    this.validate();
    this.status = props.status;
    this.integrationStatus = props.integrationStatus;
    this.contractId = props.contractId;
    this.paymentPlanId = props.paymentPlanId;
    this.updatedAt = props.updatedAt;
  }

  private validate(): void {
    if (!this.props.tenantId) {
      throw new InvariantViolationError('CommercialRegistration must belong to a tenant.');
    }
    if (!this.props.institutionId) {
      throw new InvariantViolationError('CommercialRegistration must belong to an institution.');
    }
    if (!this.props.candidatePersonId) {
      throw new InvariantViolationError('CommercialRegistration must have a candidate Person.');
    }
    if (!this.props.financialResponsiblePersonId) {
      throw new InvariantViolationError('CommercialRegistration must have a financial responsible person.');
    }
  }

  get id(): UUID { return this.props.id; }
  get tenantId(): UUID { return this.props.tenantId; }
  get institutionId(): UUID { return this.props.institutionId; }
  get candidatePersonId(): UUID { return this.props.candidatePersonId; }
  get guardianPersonId(): UUID | undefined { return this.props.guardianPersonId; }
  get financialResponsiblePersonId(): UUID { return this.props.financialResponsiblePersonId; }
  get currentStatus(): CommercialRegistrationStatus { return this.status; }
  get currentIntegrationStatus(): CommercialIntegrationStatus { return this.integrationStatus; }
  get currentContractId(): UUID | undefined { return this.contractId; }
  get currentPaymentPlanId(): UUID | undefined { return this.paymentPlanId; }
  get programId(): UUID | undefined { return this.props.programId; }
  get lastUpdatedAt(): Date { return this.updatedAt; }

  public attachContract(contractId: UUID): void {
    this.contractId = contractId;
    if (this.status === 'DRAFT' || this.status === 'PENDING_CONTRACT') {
      this.status = this.paymentPlanId ? 'READY' : 'PENDING_PAYMENT_PLAN';
    }
    this.updatedAt = new Date();
  }

  public attachPaymentPlan(paymentPlanId: UUID): void {
    this.paymentPlanId = paymentPlanId;
    if (this.status === 'DRAFT' || this.status === 'PENDING_PAYMENT_PLAN') {
      this.status = this.contractId ? 'READY' : 'PENDING_CONTRACT';
    }
    this.updatedAt = new Date();
  }

  public markReady(): void {
    if (!this.contractId) {
      throw new InvariantViolationError('Cannot mark registration READY without a signed/attached contract.');
    }
    if (!this.paymentPlanId) {
      throw new InvariantViolationError('Cannot mark registration READY without an attached payment plan.');
    }
    this.status = 'READY';
    this.updatedAt = new Date();
  }

  public activate(): void {
    if (this.status !== 'READY') {
      throw new DomainError('Registration must be in READY state before activation.');
    }
    this.status = 'ACTIVE';
    this.updatedAt = new Date();
  }

  /**
   * Integration failure does NOT rollback commercial registration.
   * "BilgenOkul unavailable ≠ BilgenOS CommercialRegistration rollback"
   */
  public updateIntegrationStatus(newStatus: CommercialIntegrationStatus): void {
    this.integrationStatus = newStatus;
    this.updatedAt = new Date();
  }

  public cancel(_reason?: string): void {
    this.status = 'CANCELLED';
    this.updatedAt = new Date();
  }
}
