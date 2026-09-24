import {
  TransportationTripDto,
  TripManifestEntryDto,
  TripStatus,
  TripShiftType,
  HandoverMethod,
  UUID,
} from '@bilgenos/contracts';
import { InvariantViolationError, InvalidStateTransitionError } from '../shared/domain-error.js';
import {
  TripNotStartableError,
  TripAlreadyStartedError,
  TripNotCompletableError,
  PassengerNotInManifestError,
  PassengerAlreadyBoardedError,
  PassengerNotOnboardError,
  HandoverNotAuthorizedError,
  HandoverAlreadyCompletedError,
} from './transportation-errors.js';
import { TripStopVisit } from './trip-stop-visit.entity.js';
import { PassengerTripEvent } from './passenger-trip-event.entity.js';
import { PassengerHandover } from './passenger-handover.aggregate.js';
import { TransportationException } from './transportation-exception.entity.js';
import { PassengerHandoverAuthorization } from './handover-authorization.entity.js';

export interface CreateTripProps {
  id: UUID;
  tenantId: UUID;
  institutionId: UUID;
  campusId: UUID;
  routeId: UUID;
  vehicleId: UUID;
  driverProfileId: UUID;
  attendantProfileId?: UUID | null;
  serviceDate: string;
  shiftType: TripShiftType;
  scheduledStartTime: string;
  manifestEntries: Array<{
    passengerProfileId: UUID;
    pickupStopId?: UUID | null;
    dropoffStopId?: UUID | null;
    requiresHandover: boolean;
  }>;
  stopVisits?: TripStopVisit[];
}

export class TransportationTrip {
  private props: TransportationTripDto;
  private manifest: Map<UUID, TripManifestEntryDto> = new Map();
  private stopVisits: TripStopVisit[] = [];
  private events: PassengerTripEvent[] = [];
  private handovers: PassengerHandover[] = [];
  private exceptions: TransportationException[] = [];

  constructor(
    props: TransportationTripDto,
    manifest: TripManifestEntryDto[] = [],
    stopVisits: TripStopVisit[] = [],
    events: PassengerTripEvent[] = [],
    handovers: PassengerHandover[] = [],
    exceptions: TransportationException[] = []
  ) {
    this.props = { ...props };
    for (const m of manifest) {
      this.manifest.set(m.passengerProfileId, { ...m });
    }
    this.stopVisits = [...stopVisits];
    this.events = [...events];
    this.handovers = [...handovers];
    this.exceptions = [...exceptions];
    this.recomputeCounters();
  }

  public static create(props: CreateTripProps): TransportationTrip {
    const now = new Date().toISOString();
    const manifestDtos: TripManifestEntryDto[] = props.manifestEntries.map(m => ({
      id: crypto.randomUUID(),
      tenantId: props.tenantId,
      tripId: props.id,
      passengerProfileId: m.passengerProfileId,
      pickupStopId: m.pickupStopId ?? null,
      dropoffStopId: m.dropoffStopId ?? null,
      requiresHandover: m.requiresHandover,
      boardingStatus: 'PENDING',
      createdAt: now,
      updatedAt: now,
    }));

    const tripDto: TransportationTripDto = {
      id: props.id,
      tenantId: props.tenantId,
      institutionId: props.institutionId,
      campusId: props.campusId,
      routeId: props.routeId,
      vehicleId: props.vehicleId,
      driverProfileId: props.driverProfileId,
      attendantProfileId: props.attendantProfileId ?? null,
      serviceDate: props.serviceDate,
      shiftType: props.shiftType,
      status: 'SCHEDULED',
      scheduledStartTime: props.scheduledStartTime,
      passengerCountExpected: manifestDtos.length,
      passengerCountBoarded: 0,
      passengerCountDroppedOff: 0,
      passengerCountNoShow: 0,
      createdAt: now,
      updatedAt: now,
    };

    return new TransportationTrip(tripDto, manifestDtos, props.stopVisits ?? []);
  }

  public get id(): UUID { return this.props.id; }
  public get tenantId(): UUID { return this.props.tenantId; }
  public get institutionId(): UUID { return this.props.institutionId; }
  public get campusId(): UUID { return this.props.campusId; }
  public get routeId(): UUID { return this.props.routeId; }
  public get vehicleId(): UUID { return this.props.vehicleId; }
  public get driverProfileId(): UUID { return this.props.driverProfileId; }
  public get attendantProfileId(): UUID | null | undefined { return this.props.attendantProfileId; }
  public get status(): TripStatus { return this.props.status; }
  public get passengerCountExpected(): number { return this.props.passengerCountExpected; }
  public get passengerCountBoarded(): number { return this.props.passengerCountBoarded; }
  public get passengerCountDroppedOff(): number { return this.props.passengerCountDroppedOff; }
  public get passengerCountNoShow(): number { return this.props.passengerCountNoShow; }
  public get getManifest(): TripManifestEntryDto[] { return Array.from(this.manifest.values()); }
  public get getEvents(): PassengerTripEvent[] { return [...this.events]; }
  public get getHandovers(): PassengerHandover[] { return [...this.handovers]; }
  public get getExceptions(): TransportationException[] { return [...this.exceptions]; }
  public get getStopVisits(): TripStopVisit[] { return [...this.stopVisits]; }

  private recomputeCounters(): void {
    let boarded = 0;
    let dropped = 0;
    let noshow = 0;
    for (const m of this.manifest.values()) {
      if (m.boardingStatus === 'BOARDED') boarded++;
      else if (m.boardingStatus === 'DROPPED_OFF') {
        boarded++;
        dropped++;
      } else if (m.boardingStatus === 'NO_SHOW') noshow++;
    }
    this.props.passengerCountBoarded = boarded;
    this.props.passengerCountDroppedOff = dropped;
    this.props.passengerCountNoShow = noshow;
    this.props.passengerCountExpected = this.manifest.size;
  }

  // TRN-032: Trip start validation
  public startTrip(actualStartTime: string = new Date().toISOString()): void {
    if (this.props.status !== 'SCHEDULED') {
      throw new TripAlreadyStartedError(`Trip is already in status ${this.props.status}`);
    }
    this.props.status = 'IN_PROGRESS';
    this.props.actualStartTime = actualStartTime;
    this.props.updatedAt = new Date().toISOString();
  }

  // TRN-022: Duplicate Boarding Forbidden
  public recordBoarding(
    passengerProfileId: UUID,
    stopVisitId: UUID | undefined,
    recordedByUserId: UUID,
    timestamp: string = new Date().toISOString()
  ): PassengerTripEvent {
    if (this.props.status !== 'IN_PROGRESS') {
      throw new TripNotStartableError('Cannot board passenger when trip is not in progress.');
    }
    const entry = this.manifest.get(passengerProfileId);
    if (!entry) {
      throw new PassengerNotInManifestError(`Passenger ${passengerProfileId} is not in trip manifest.`);
    }
    if (entry.boardingStatus === 'BOARDED' || entry.boardingStatus === 'DROPPED_OFF') {
      throw new PassengerAlreadyBoardedError(`Passenger ${passengerProfileId} has already boarded.`);
    }

    entry.boardingStatus = 'BOARDED';
    entry.boardedAt = timestamp;
    entry.updatedAt = new Date().toISOString();

    const event = PassengerTripEvent.create({
      id: crypto.randomUUID(),
      tenantId: this.tenantId,
      tripId: this.id,
      passengerProfileId,
      stopVisitId: stopVisitId ?? null,
      eventType: 'BOARDED',
      recordedAt: timestamp,
      recordedByUserId,
      latitude: null,
      longitude: null,
      notes: null,
    });
    this.events.push(event);
    this.recomputeCounters();
    this.props.updatedAt = new Date().toISOString();
    return event;
  }

  // TRN-023: Invalid drop-off transition forbidden
  public recordDropoff(
    passengerProfileId: UUID,
    stopVisitId: UUID | undefined,
    recordedByUserId: UUID,
    timestamp: string = new Date().toISOString()
  ): PassengerTripEvent {
    if (this.props.status !== 'IN_PROGRESS') {
      throw new TripNotStartableError('Cannot drop off passenger when trip is not in progress.');
    }
    const entry = this.manifest.get(passengerProfileId);
    if (!entry) {
      throw new PassengerNotInManifestError(`Passenger ${passengerProfileId} is not in trip manifest.`);
    }
    if (entry.boardingStatus !== 'BOARDED') {
      throw new PassengerNotOnboardError(`Passenger ${passengerProfileId} is not currently onboard (status: ${entry.boardingStatus}).`);
    }

    entry.boardingStatus = 'DROPPED_OFF';
    entry.droppedOffAt = timestamp;
    entry.updatedAt = new Date().toISOString();

    const event = PassengerTripEvent.create({
      id: crypto.randomUUID(),
      tenantId: this.tenantId,
      tripId: this.id,
      passengerProfileId,
      stopVisitId: stopVisitId ?? null,
      eventType: 'DROPPED_OFF',
      recordedAt: timestamp,
      recordedByUserId,
      latitude: null,
      longitude: null,
      notes: null,
    });
    this.events.push(event);
    this.recomputeCounters();
    this.props.updatedAt = new Date().toISOString();
    return event;
  }

  // TRN-024, TRN-025, TRN-036: Safe guardian handover
  public recordHandover(
    passengerProfileId: UUID,
    authorization: PassengerHandoverAuthorization,
    receivedByPersonId: UUID,
    verifiedByUserId: UUID,
    method: HandoverMethod,
    timestamp: string = new Date().toISOString()
  ): PassengerHandover {
    const entry = this.manifest.get(passengerProfileId);
    if (!entry) {
      throw new PassengerNotInManifestError(`Passenger ${passengerProfileId} is not in trip manifest.`);
    }
    if (entry.boardingStatus !== 'DROPPED_OFF') {
      throw new InvariantViolationError('Passenger must be at drop-off point before guardian handover.');
    }

    // TRN-036: At most one successful handover per passenger per trip
    if (this.handovers.some(h => h.passengerProfileId === passengerProfileId)) {
      throw new HandoverAlreadyCompletedError(`Handover already recorded for passenger ${passengerProfileId}.`);
    }

    // TRN-024 & TRN-025: Verify authorization is active and not revoked/expired
    if (!authorization.isAuthorized(new Date(timestamp))) {
      throw new HandoverNotAuthorizedError('Handover authorization is expired, revoked, or inactive.');
    }
    if (authorization.authorizedPersonId !== receivedByPersonId) {
      throw new HandoverNotAuthorizedError('Receiving person does not match authorized person in authorization record.');
    }

    const handover = PassengerHandover.create({
      id: crypto.randomUUID(),
      tenantId: this.tenantId,
      tripId: this.id,
      passengerProfileId,
      authorizationId: authorization.id,
      receivedByPersonId,
      verifiedByUserId,
      handoverTimestamp: timestamp,
      method,
      notes: null,
    });
    this.handovers.push(handover);
    this.props.updatedAt = new Date().toISOString();
    return handover;
  }

  public recordNoShow(
    passengerProfileId: UUID,
    recordedByUserId: UUID,
    timestamp: string = new Date().toISOString()
  ): PassengerTripEvent {
    const entry = this.manifest.get(passengerProfileId);
    if (!entry) {
      throw new PassengerNotInManifestError(`Passenger ${passengerProfileId} is not in trip manifest.`);
    }
    if (entry.boardingStatus !== 'PENDING') {
      throw new InvariantViolationError(`Cannot mark no-show for passenger in status ${entry.boardingStatus}.`);
    }

    entry.boardingStatus = 'NO_SHOW';
    entry.updatedAt = new Date().toISOString();

    const event = PassengerTripEvent.create({
      id: crypto.randomUUID(),
      tenantId: this.tenantId,
      tripId: this.id,
      passengerProfileId,
      stopVisitId: null,
      eventType: 'NO_SHOW',
      recordedAt: timestamp,
      recordedByUserId,
      latitude: null,
      longitude: null,
      notes: null,
    });
    this.events.push(event);
    this.recomputeCounters();
    this.props.updatedAt = new Date().toISOString();
    return event;
  }

  // TRN-033: Trip completion validation
  public completeTrip(actualEndTime: string = new Date().toISOString()): void {
    if (this.props.status !== 'IN_PROGRESS') {
      throw new InvalidStateTransitionError(this.props.status, 'COMPLETED', 'Trip must be in progress to complete.');
    }
    // Check if any passenger is still onboard (BOARDED without DROPPED_OFF)
    const onboard = Array.from(this.manifest.values()).filter(m => m.boardingStatus === 'BOARDED');
    if (onboard.length > 0) {
      throw new TripNotCompletableError(`Cannot complete trip: ${onboard.length} passengers are still recorded as onboard.`);
    }

    this.props.status = 'COMPLETED';
    this.props.actualEndTime = actualEndTime;
    this.props.updatedAt = new Date().toISOString();
  }

  public cancelTrip(reason: string): void {
    if (this.props.status === 'COMPLETED') {
      throw new InvalidStateTransitionError(this.props.status, 'CANCELLED', 'Cannot cancel a completed trip.');
    }
    this.props.status = 'CANCELLED';
    this.props.updatedAt = new Date().toISOString();
    this.raiseException(TransportationException.create({
      id: crypto.randomUUID(),
      tenantId: this.tenantId,
      tripId: this.id,
      category: 'ROUTE_DEVIATION',
      severity: 'MEDIUM',
      description: `Trip cancelled: ${reason}`,
    }));
  }

  public raiseException(exception: TransportationException): void {
    this.exceptions.push(exception);
    this.props.updatedAt = new Date().toISOString();
  }

  public toDto(): TransportationTripDto {
    return { ...this.props };
  }
}
