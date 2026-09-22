import { LearnerStatus, UUID } from '@bilgenos/contracts';
import { InvariantViolationError } from '../shared/domain-error.js';

export interface LearnerProps {
  id: UUID;
  tenantId: UUID;
  personId: UUID;
  institutionId: UUID;
  learnerNumber: string;
  status: LearnerStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class Learner {
  constructor(private readonly props: LearnerProps) {
    this.validate();
  }

  private validate(): void {
    if (!this.props.tenantId) {
      throw new InvariantViolationError('Learner must belong to a tenant.');
    }
    if (!this.props.personId) {
      throw new InvariantViolationError('Learner must be linked to a Person.');
    }
    if (!this.props.institutionId) {
      throw new InvariantViolationError('Learner must belong to an Institution.');
    }
    if (!this.props.learnerNumber.trim()) {
      throw new InvariantViolationError('Learner number cannot be empty.');
    }
  }

  get id(): UUID { return this.props.id; }
  get tenantId(): UUID { return this.props.tenantId; }
  get personId(): UUID { return this.props.personId; }
  get institutionId(): UUID { return this.props.institutionId; }
  get learnerNumber(): string { return this.props.learnerNumber; }
  get status(): LearnerStatus { return this.props.status; }
  get createdAt(): Date { return this.props.createdAt; }
}
