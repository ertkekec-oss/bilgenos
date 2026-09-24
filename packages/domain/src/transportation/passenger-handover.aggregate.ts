import { PassengerHandoverDto, UUID } from '@bilgenos/contracts';

export class PassengerHandover {
  private props: PassengerHandoverDto;

  constructor(props: PassengerHandoverDto) {
    this.props = { ...props };
  }

  public static create(props: Omit<PassengerHandoverDto, 'createdAt'>): PassengerHandover {
    return new PassengerHandover({
      ...props,
      createdAt: new Date().toISOString(),
    });
  }

  public get id(): UUID { return this.props.id; }
  public get tripId(): UUID { return this.props.tripId; }
  public get passengerProfileId(): UUID { return this.props.passengerProfileId; }
  public get authorizationId(): UUID { return this.props.authorizationId; }
  public get receivedByPersonId(): UUID { return this.props.receivedByPersonId; }
  public get verifiedByUserId(): UUID { return this.props.verifiedByUserId; }

  public toDto(): PassengerHandoverDto {
    return { ...this.props };
  }
}
