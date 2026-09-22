import { UUID } from '@bilgenos/contracts';
import { InvariantViolationError } from '../shared/domain-error.js';

export interface PersonProps {
  id: UUID;
  tenantId: UUID;
  nationalIdEncrypted?: string;
  firstName: string;
  lastName: string;
  birthDate?: Date;
  gender?: string;
  bloodType?: string;
  emergencyPhone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Person {
  constructor(private readonly props: PersonProps) {
    this.validate();
  }

  private validate(): void {
    if (!this.props.tenantId) {
      throw new InvariantViolationError('Person must belong to a valid tenant.');
    }
    if (!this.props.firstName.trim()) {
      throw new InvariantViolationError('Person first name cannot be empty.');
    }
    if (!this.props.lastName.trim()) {
      throw new InvariantViolationError('Person last name cannot be empty.');
    }
  }

  get id(): UUID { return this.props.id; }
  get tenantId(): UUID { return this.props.tenantId; }
  get firstName(): string { return this.props.firstName; }
  get lastName(): string { return this.props.lastName; }
  get fullName(): string { return `${this.props.firstName} ${this.props.lastName}`; }
  get birthDate(): Date | undefined { return this.props.birthDate; }
  get nationalIdEncrypted(): string | undefined { return this.props.nationalIdEncrypted; }
  get emergencyPhone(): string | undefined { return this.props.emergencyPhone; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  public isAdult(referenceDate: Date = new Date()): boolean {
    if (!this.props.birthDate) {
      return false; // Conservatively assume minor if unknown in K12
    }
    const ageDiffMs = referenceDate.getTime() - this.props.birthDate.getTime();
    const ageDate = new Date(ageDiffMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970) >= 18;
  }
}
