import { TransportationRouteDto, RouteStatus, RouteType, UUID } from '@bilgenos/contracts';
import { InvariantViolationError, InvalidStateTransitionError } from '../shared/domain-error.js';
import { RouteStop } from './route-stop.entity.js';

export interface CreateRouteProps {
  id: UUID;
  tenantId: UUID;
  institutionId: UUID;
  campusId: UUID;
  code: string;
  name: string;
  routeType: RouteType;
  effectiveFrom: string;
  effectiveUntil?: string | null;
  estimatedDurationMinutes?: number;
  estimatedDistanceKm?: number;
}

export class TransportationRoute {
  private props: TransportationRouteDto;
  private stops: RouteStop[] = [];

  constructor(props: TransportationRouteDto, stops: RouteStop[] = []) {
    this.props = { ...props };
    this.stops = [...stops].sort((a, b) => a.sequenceNumber - b.sequenceNumber);
  }

  public static normalizeCode(code: string): string {
    return code.replace(/\s+/g, '-').toUpperCase();
  }

  public static create(props: CreateRouteProps): TransportationRoute {
    if (!props.code || props.code.trim().length === 0) {
      throw new InvariantViolationError('Route code is required.');
    }
    if (!props.name || props.name.trim().length === 0) {
      throw new InvariantViolationError('Route name is required.');
    }
    const now = new Date().toISOString();
    return new TransportationRoute({
      ...props,
      code: TransportationRoute.normalizeCode(props.code),
      status: 'DRAFT',
      createdAt: now,
      updatedAt: now,
    });
  }

  public get id(): UUID { return this.props.id; }
  public get tenantId(): UUID { return this.props.tenantId; }
  public get institutionId(): UUID { return this.props.institutionId; }
  public get campusId(): UUID { return this.props.campusId; }
  public get code(): string { return this.props.code; }
  public get name(): string { return this.props.name; }
  public get routeType(): RouteType { return this.props.routeType; }
  public get status(): RouteStatus { return this.props.status; }
  public get getStops(): RouteStop[] { return [...this.stops]; }

  public addStop(stop: RouteStop): void {
    if (stop.routeId !== this.id) {
      throw new InvariantViolationError('Stop does not belong to this route.');
    }
    if (stop.tenantId !== this.tenantId) {
      throw new InvariantViolationError('Stop tenant mismatch.');
    }
    if (this.stops.some(s => s.sequenceNumber === stop.sequenceNumber)) {
      throw new InvariantViolationError(`Duplicate stop sequence number ${stop.sequenceNumber} on route.`);
    }
    this.stops.push(stop);
    this.stops.sort((a, b) => a.sequenceNumber - b.sequenceNumber);
    this.props.updatedAt = new Date().toISOString();
  }

  public activate(): void {
    if (this.props.status === 'ARCHIVED') {
      throw new InvalidStateTransitionError(this.props.status, 'ACTIVE');
    }
    if (this.stops.length < 2) {
      throw new InvariantViolationError('Route must have at least 2 stops before activation.');
    }
    this.props.status = 'ACTIVE';
    this.props.updatedAt = new Date().toISOString();
  }

  public archive(): void {
    this.props.status = 'ARCHIVED';
    this.props.updatedAt = new Date().toISOString();
  }

  public toDto(): TransportationRouteDto {
    return { ...this.props };
  }
}
