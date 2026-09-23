import type {
  UUID,
  AttendanceEventType,
  AttendanceSourceType,
} from '@bilgenos/contracts';
import { InvariantViolationError } from '../shared/domain-error.js';

export interface AttendanceEventProps {
  id: UUID;
  tenantId: UUID;
  institutionId: UUID;
  employeeId: UUID;
  occurredAt: Date;
  eventType: AttendanceEventType;
  sourceType: AttendanceSourceType;
  deviceReference?: string | undefined;
}

export class AttendanceEvent {
  constructor(private readonly props: AttendanceEventProps) {}

  get id(): UUID { return this.props.id; }
  get tenantId(): UUID { return this.props.tenantId; }
  get institutionId(): UUID { return this.props.institutionId; }
  get employeeId(): UUID { return this.props.employeeId; }
  get occurredAt(): Date { return this.props.occurredAt; }
  get eventType(): AttendanceEventType { return this.props.eventType; }
  get sourceType(): AttendanceSourceType { return this.props.sourceType; }
  get deviceReference(): string | undefined { return this.props.deviceReference; }
}

export class AttendanceSessionCalculator {
  /**
   * Invariant HR-013:
   * Worked minutes is derived from check-in, check-out, and break deductions.
   */
  public static calculateMinutesWorked(
    checkInAt: Date,
    checkOutAt: Date,
    breakMinutes: number = 0
  ): number {
    const diffMs = checkOutAt.getTime() - checkInAt.getTime();
    if (diffMs <= 0) {
      throw new InvariantViolationError('checkOutAt must be strictly after checkInAt.');
    }
    const rawMinutes = Math.floor(diffMs / 60000);
    return Math.max(0, rawMinutes - breakMinutes);
  }
}
