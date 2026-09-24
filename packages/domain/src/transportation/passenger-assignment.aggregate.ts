import {
  PassengerRouteAssignmentDto,
  PassengerAssignmentStatus,
  RouteDirection,
  UUID,
} from '@bilgenos/contracts';

export interface CreatePassengerRouteAssignmentProps {
  id: UUID;
  tenantId: UUID;
  passengerProfileId: UUID;
  routeId: UUID;
  stopId: UUID;
  direction: RouteDirection;
  effectiveFrom: string;
  effectiveUntil?: string | null;
}

export class PassengerRouteAssignment {
  private props: PassengerRouteAssignmentDto;

  constructor(props: PassengerRouteAssignmentDto) {
    this.props = { ...props };
  }

  public static create(props: CreatePassengerRouteAssignmentProps): PassengerRouteAssignment {
    const now = new Date().toISOString();
    return new PassengerRouteAssignment({
      ...props,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    });
  }

  public get id(): UUID { return this.props.id; }
  public get tenantId(): UUID { return this.props.tenantId; }
  public get passengerProfileId(): UUID { return this.props.passengerProfileId; }
  public get routeId(): UUID { return this.props.routeId; }
  public get stopId(): UUID { return this.props.stopId; }
  public get direction(): RouteDirection { return this.props.direction; }
  public get status(): PassengerAssignmentStatus { return this.props.status; }
  public get effectiveFrom(): string { return this.props.effectiveFrom; }
  public get effectiveUntil(): string | null | undefined { return this.props.effectiveUntil; }

  public cancel(): void {
    this.props.status = 'CANCELLED';
    this.props.updatedAt = new Date().toISOString();
  }

  public toDto(): PassengerRouteAssignmentDto {
    return { ...this.props };
  }
}
