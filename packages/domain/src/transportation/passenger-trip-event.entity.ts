import { PassengerTripEventDto, PassengerTripEventType, UUID } from '@bilgenos/contracts';

export class PassengerTripEvent {
  private props: PassengerTripEventDto;

  constructor(props: PassengerTripEventDto) {
    this.props = { ...props };
  }

  public static create(props: Omit<PassengerTripEventDto, 'createdAt'>): PassengerTripEvent {
    return new PassengerTripEvent({
      ...props,
      createdAt: new Date().toISOString(),
    });
  }

  public get id(): UUID { return this.props.id; }
  public get tripId(): UUID { return this.props.tripId; }
  public get passengerProfileId(): UUID { return this.props.passengerProfileId; }
  public get eventType(): PassengerTripEventType { return this.props.eventType; }
  public get recordedAt(): string { return this.props.recordedAt; }

  public toDto(): PassengerTripEventDto {
    return { ...this.props };
  }
}
