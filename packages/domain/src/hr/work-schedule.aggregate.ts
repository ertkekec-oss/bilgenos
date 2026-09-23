import type { UUID } from '@bilgenos/contracts';
import { InvariantViolationError } from '../shared/domain-error.js';

export interface WorkScheduleRuleProps {
  id: UUID;
  workScheduleId: UUID;
  dayOfWeek: number; // 1-7
  startTime: string; // "08:30"
  endTime: string;   // "17:00"
  breakMinutes: number;
}

export class WorkScheduleRule {
  constructor(private readonly props: WorkScheduleRuleProps) {
    if (props.dayOfWeek < 1 || props.dayOfWeek > 7) {
      throw new InvariantViolationError('dayOfWeek must be between 1 and 7.');
    }
  }

  get id(): UUID { return this.props.id; }
  get workScheduleId(): UUID { return this.props.workScheduleId; }
  get dayOfWeek(): number { return this.props.dayOfWeek; }
  get startTime(): string { return this.props.startTime; }
  get endTime(): string { return this.props.endTime; }
  get breakMinutes(): number { return this.props.breakMinutes; }
}

export interface EmployeeScheduleAssignmentProps {
  id: UUID;
  tenantId: UUID;
  employeeId: UUID;
  workScheduleId: UUID;
  effectiveFrom: Date;
  effectiveUntil?: Date | undefined;
}

export class EmployeeScheduleAssignment {
  constructor(private readonly props: EmployeeScheduleAssignmentProps) {
    if (props.effectiveUntil && props.effectiveFrom > props.effectiveUntil) {
      throw new InvariantViolationError('effectiveFrom cannot be after effectiveUntil.');
    }
  }

  get id(): UUID { return this.props.id; }
  get tenantId(): UUID { return this.props.tenantId; }
  get employeeId(): UUID { return this.props.employeeId; }
  get workScheduleId(): UUID { return this.props.workScheduleId; }
  get effectiveFrom(): Date { return this.props.effectiveFrom; }
  get effectiveUntil(): Date | undefined { return this.props.effectiveUntil; }

  /**
   * Invariant HR-011:
   * Validates no overlapping effective date ranges for an employee.
   */
  public static validateNoOverlap(
    newAssignment: EmployeeScheduleAssignment,
    existingAssignments: readonly EmployeeScheduleAssignment[]
  ): void {
    const newStart = newAssignment.effectiveFrom.getTime();
    const newEnd = newAssignment.effectiveUntil?.getTime() ?? Infinity;

    for (const ex of existingAssignments) {
      if (ex.id === newAssignment.id) continue;
      const exStart = ex.effectiveFrom.getTime();
      const exEnd = ex.effectiveUntil?.getTime() ?? Infinity;

      const overlap = newStart <= exEnd && newEnd >= exStart;
      if (overlap) {
        throw new InvariantViolationError(
          'Overlapping schedule assignment detected for employee ' + newAssignment.employeeId
        );
      }
    }
  }
}
