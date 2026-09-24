import { RouteOperationalAssignmentDto, RouteAssignmentStatus, UUID } from '@bilgenos/contracts';
import { InvariantViolationError } from '../shared/domain-error.js';

export interface CreateRouteOperationalAssignmentProps {
  id: UUID;
  tenantId: UUID;
  routeId: UUID;
  vehicleId: UUID;
  driverProfileId: UUID;
  attendantProfileId?: UUID | null;
  effectiveFrom: string;
  effectiveUntil?: string | null;
  dayOfWeekMask: number[];
}

export class RouteOperationalAssignment {
  private props: RouteOperationalAssignmentDto;

  constructor(props: RouteOperationalAssignmentDto) {
    this.props = { ...props };
  }

  public static create(props: CreateRouteOperationalAssignmentProps): RouteOperationalAssignment {
    if (!props.dayOfWeekMask || props.dayOfWeekMask.length === 0) {
      throw new InvariantViolationError('Operational assignment must specify operating days of week.');
    }
    const now = new Date().toISOString();
    return new RouteOperationalAssignment({
      ...props,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    });
  }

  public get id(): UUID { return this.props.id; }
  public get tenantId(): UUID { return this.props.tenantId; }
  public get routeId(): UUID { return this.props.routeId; }
  public get vehicleId(): UUID { return this.props.vehicleId; }
  public get driverProfileId(): UUID { return this.props.driverProfileId; }
  public get attendantProfileId(): UUID | null | undefined { return this.props.attendantProfileId; }
  public get status(): RouteAssignmentStatus { return this.props.status; }
  public get effectiveFrom(): string { return this.props.effectiveFrom; }
  public get effectiveUntil(): string | null | undefined { return this.props.effectiveUntil; }

  public cancel(): void {
    this.props.status = 'CANCELLED';
    this.props.updatedAt = new Date().toISOString();
  }

  public toDto(): RouteOperationalAssignmentDto {
    return { ...this.props };
  }
}
