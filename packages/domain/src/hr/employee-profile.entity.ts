import type { UUID } from '@bilgenos/contracts';
import { InvariantViolationError } from '../shared/domain-error.js';

export interface EmployeeProfileProps {
  id: UUID;
  tenantId: UUID;
  personId: UUID;
  employeeNumber: string;
  userId?: UUID | undefined;
  isActive: boolean;
}

export class EmployeeProfile {
  constructor(private readonly props: EmployeeProfileProps) {
    if (!props.employeeNumber || props.employeeNumber.trim().length === 0) {
      throw new InvariantViolationError('Employee number is required.');
    }
  }

  get id(): UUID { return this.props.id; }
  get tenantId(): UUID { return this.props.tenantId; }
  get personId(): UUID { return this.props.personId; }
  get employeeNumber(): string { return this.props.employeeNumber; }
  get userId(): UUID | undefined { return this.props.userId; }
  get isActive(): boolean { return this.props.isActive; }
}
