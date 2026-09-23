import type { UUID, AssignmentRoleType } from '@bilgenos/contracts';
import { InvariantViolationError } from '../shared/domain-error.js';

export interface InstitutionAssignmentProps {
  id: UUID;
  tenantId: UUID;
  institutionId: UUID;
  campusId?: UUID | undefined;
  employeeId: UUID;
  departmentId?: UUID | undefined;
  positionId?: UUID | undefined;
  roleType: AssignmentRoleType;
  isPrimary: boolean;
  workPercentage: number;
  startDate: Date;
  endDate?: Date | undefined;
  isActive: boolean;
}

export class InstitutionAssignment {
  constructor(private readonly props: InstitutionAssignmentProps) {
    if (props.workPercentage <= 0 || props.workPercentage > 100) {
      throw new InvariantViolationError('Work percentage must be between 1 and 100.');
    }
    if (props.endDate && props.startDate > props.endDate) {
      throw new InvariantViolationError('Assignment startDate cannot be after endDate.');
    }
  }

  get id(): UUID { return this.props.id; }
  get tenantId(): UUID { return this.props.tenantId; }
  get institutionId(): UUID { return this.props.institutionId; }
  get campusId(): UUID | undefined { return this.props.campusId; }
  get employeeId(): UUID { return this.props.employeeId; }
  get departmentId(): UUID | undefined { return this.props.departmentId; }
  get positionId(): UUID | undefined { return this.props.positionId; }
  get roleType(): AssignmentRoleType { return this.props.roleType; }
  get isPrimary(): boolean { return this.props.isPrimary; }
  get workPercentage(): number { return this.props.workPercentage; }
  get startDate(): Date { return this.props.startDate; }
  get endDate(): Date | undefined { return this.props.endDate; }
  get isActive(): boolean { return this.props.isActive; }

  /**
   * Invariant HR-009:
   * Validates cumulative active work percentage across concurrent assignments.
   */
  public static validateTotalPercentage(assignments: readonly InstitutionAssignment[]): void {
    const activeAssignments = assignments.filter((a) => a.isActive);
    const sum = activeAssignments.reduce((acc, a) => acc + a.workPercentage, 0);
    if (sum > 100) {
      throw new InvariantViolationError(
        'Cumulative assignment percentage (' + sum + '%) exceeds maximum allowed limit (100%).'
      );
    }
  }
}
