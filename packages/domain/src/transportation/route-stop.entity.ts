import { RouteStopDto, StopType, UUID } from '@bilgenos/contracts';
import { InvariantViolationError } from '../shared/domain-error.js';

export interface CreateRouteStopProps {
  id: UUID;
  tenantId: UUID;
  routeId: UUID;
  sequenceNumber: number;
  name: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  plannedTime?: string | null;
  stopType: StopType;
}

export class RouteStop {
  private props: RouteStopDto;

  constructor(props: RouteStopDto) {
    this.props = { ...props };
  }

  public static create(props: CreateRouteStopProps): RouteStop {
    if (props.sequenceNumber < 1) {
      throw new InvariantViolationError('Stop sequence number must be 1 or greater.');
    }
    if (!props.name || props.name.trim().length === 0) {
      throw new InvariantViolationError('Stop name is required.');
    }
    const now = new Date().toISOString();
    return new RouteStop({
      ...props,
      createdAt: now,
      updatedAt: now,
    });
  }

  public get id(): UUID { return this.props.id; }
  public get tenantId(): UUID { return this.props.tenantId; }
  public get routeId(): UUID { return this.props.routeId; }
  public get sequenceNumber(): number { return this.props.sequenceNumber; }
  public get name(): string { return this.props.name; }
  public get plannedTime(): string | null | undefined { return this.props.plannedTime; }
  public get stopType(): StopType { return this.props.stopType; }

  public toDto(): RouteStopDto {
    return { ...this.props };
  }
}
