import { TripStopVisitDto, StopVisitStatus, UUID } from '@bilgenos/contracts';

export class TripStopVisit {
  private props: TripStopVisitDto;

  constructor(props: TripStopVisitDto) {
    this.props = { ...props };
  }

  public static create(props: Omit<TripStopVisitDto, 'createdAt' | 'updatedAt' | 'status'> & { status?: StopVisitStatus }): TripStopVisit {
    const now = new Date().toISOString();
    return new TripStopVisit({
      ...props,
      status: props.status ?? 'SCHEDULED',
      createdAt: now,
      updatedAt: now,
    });
  }

  public get id(): UUID { return this.props.id; }
  public get tripId(): UUID { return this.props.tripId; }
  public get routeStopId(): UUID { return this.props.routeStopId; }
  public get sequenceNumber(): number { return this.props.sequenceNumber; }
  public get status(): StopVisitStatus { return this.props.status; }

  public recordArrival(arrivalTime: string = new Date().toISOString()): void {
    this.props.actualArrivalTime = arrivalTime;
    this.props.status = 'VISITED';
    this.props.updatedAt = new Date().toISOString();
  }

  public recordDeparture(departureTime: string = new Date().toISOString()): void {
    this.props.actualDepartureTime = departureTime;
    if (this.props.actualArrivalTime) {
      const diff = Math.floor((new Date(departureTime).getTime() - new Date(this.props.actualArrivalTime).getTime()) / 1000);
      this.props.dwellTimeSeconds = diff > 0 ? diff : 0;
    }
    this.props.status = 'VISITED';
    this.props.updatedAt = new Date().toISOString();
  }

  public toDto(): TripStopVisitDto {
    return { ...this.props };
  }
}
