import { EnrollmentStatus, UUID } from '@bilgenos/contracts';
import { InvariantViolationError } from '../shared/domain-error.js';
import { EnrollmentStateMachine } from './enrollment-state-machine.js';

export interface EnrollmentProps {
  id: UUID;
  tenantId: UUID;
  institutionId: UUID;
  campusId?: UUID | undefined;
  periodId?: UUID | undefined;
  programId: UUID;
  levelId?: UUID | undefined;
  cohortId?: UUID | undefined; // Optional: individual tutoring sessions
  learnerId: UUID;
  enrollmentNumber: string;
  status: EnrollmentStatus;
  startDate: Date;
  expectedEndDate?: Date | undefined;
  actualEndDate?: Date | undefined;
  cancellationReason?: string | undefined;
  metadata?: Record<string, unknown> | undefined;
  createdAt: Date;
  updatedAt: Date;
}

export class Enrollment {
  private status: EnrollmentStatus;
  private actualEndDate?: Date | undefined;
  private cancellationReason?: string | undefined;
  private updatedAt: Date;

  constructor(private readonly props: EnrollmentProps) {
    this.validate();
    this.status = props.status;
    this.actualEndDate = props.actualEndDate;
    this.cancellationReason = props.cancellationReason;
    this.updatedAt = props.updatedAt;
  }

  private validate(): void {
    if (!this.props.tenantId) {
      throw new InvariantViolationError('Enrollment must belong to a tenant.');
    }
    if (!this.props.institutionId) {
      throw new InvariantViolationError('Enrollment must belong to an institution.');
    }
    if (!this.props.programId) {
      throw new InvariantViolationError('Enrollment must be associated with an education program.');
    }
    if (!this.props.learnerId) {
      throw new InvariantViolationError('Enrollment must be associated with a learner.');
    }
  }

  get id(): UUID { return this.props.id; }
  get tenantId(): UUID { return this.props.tenantId; }
  get institutionId(): UUID { return this.props.institutionId; }
  get campusId(): UUID | undefined { return this.props.campusId; }
  get periodId(): UUID | undefined { return this.props.periodId; }
  get programId(): UUID { return this.props.programId; }
  get levelId(): UUID | undefined { return this.props.levelId; }
  get cohortId(): UUID | undefined { return this.props.cohortId; }
  get learnerId(): UUID { return this.props.learnerId; }
  get enrollmentNumber(): string { return this.props.enrollmentNumber; }
  get currentStatus(): EnrollmentStatus { return this.status; }
  get startDate(): Date { return this.props.startDate; }
  get expectedEndDate(): Date | undefined { return this.props.expectedEndDate; }
  get endDate(): Date | undefined { return this.actualEndDate; }
  get reasonForCancellation(): string | undefined { return this.cancellationReason; }
  get lastUpdatedAt(): Date { return this.updatedAt; }

  public activate(): void {
    EnrollmentStateMachine.validateTransition(this.status, 'ACTIVE');
    this.status = 'ACTIVE';
    this.updatedAt = new Date();
  }

  public suspend(reason?: string): void {
    EnrollmentStateMachine.validateTransition(this.status, 'SUSPENDED');
    this.status = 'SUSPENDED';
    this.cancellationReason = reason;
    this.updatedAt = new Date();
  }

  public complete(completionDate: Date = new Date()): void {
    EnrollmentStateMachine.validateTransition(this.status, 'COMPLETED');
    this.status = 'COMPLETED';
    this.actualEndDate = completionDate;
    this.updatedAt = new Date();
  }

  public cancel(reason: string): void {
    EnrollmentStateMachine.validateTransition(this.status, 'CANCELLED');
    this.status = 'CANCELLED';
    this.cancellationReason = reason;
    this.actualEndDate = new Date();
    this.updatedAt = new Date();
  }

  public transfer(options: { targetCohortId?: UUID; targetInstitutionId?: UUID; reason?: string }): void {
    EnrollmentStateMachine.validateTransition(this.status, 'TRANSFERRED', {
      transferDetailsProvided: Boolean(options.targetCohortId || options.targetInstitutionId),
    });
    this.status = 'TRANSFERRED';
    this.cancellationReason = options.reason;
    this.actualEndDate = new Date();
    this.updatedAt = new Date();
  }
}
