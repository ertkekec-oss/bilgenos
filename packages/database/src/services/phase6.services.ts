import {
  RequestTenantContext,
  UUID,
  TransportationProviderDto,
  TransportationVehicleDto,
  DriverProfileDto,
  AttendantProfileDto,
  TransportationRouteDto,
  RouteStopDto,
  RouteOperationalAssignmentDto,
  TransportationPassengerProfileDto,
  PassengerRouteAssignmentDto,
  PassengerHandoverAuthorizationDto,
  TransportationTripDto,
  PassengerTripEventDto,
  PassengerHandoverDto,
  TransportationExceptionDto,
  HandoverMethod,
} from '@bilgenos/contracts';
import {
  TransportationProvider,
  TransportationVehicle,
  DriverProfile,
  AttendantProfile,
  TransportationRoute,
  RouteStop,
  RouteOperationalAssignment,
  TransportationPassengerProfile,
  PassengerRouteAssignment,
  PassengerHandoverAuthorization,
  TransportationTrip,
  TripStopVisit,
  PassengerTripEvent,
  PassengerHandover,
  TransportationException,
  InvariantViolationError,
  VehicleCapacityExceededError,
  VehicleAssignmentConflictError,
  DriverAlreadyInActiveTripError,
  PassengerAssignmentConflictError,
  HandoverNotAuthorizedError,
  IdempotencyPayloadConflictError,
} from '@bilgenos/domain';
import {
  InMemoryScopedTransportationProviderRepository,
  InMemoryScopedTransportationVehicleRepository,
  InMemoryScopedDriverProfileRepository,
  InMemoryScopedAttendantProfileRepository,
  InMemoryScopedTransportationRouteRepository,
  InMemoryScopedRouteStopRepository,
  InMemoryScopedRouteOperationalAssignmentRepository,
  InMemoryScopedTransportationPassengerProfileRepository,
  InMemoryScopedPassengerRouteAssignmentRepository,
  InMemoryScopedPassengerHandoverAuthorizationRepository,
  InMemoryScopedTransportationTripRepository,
  InMemoryScopedTripManifestEntryRepository,
  InMemoryScopedTripStopVisitRepository,
  InMemoryScopedPassengerTripEventRepository,
  InMemoryScopedPassengerHandoverRepository,
  InMemoryScopedTransportationExceptionRepository,
} from '../in-memory/in-memory-scoped-repository.js';

// Idempotency cache for transportation actions
const processedIdempotencyKeys = new Map<string, { payloadHash: string; result: any }>();

export class FleetAndPersonnelService {
  private providerRepo: InMemoryScopedTransportationProviderRepository;
  private vehicleRepo: InMemoryScopedTransportationVehicleRepository;
  private driverRepo: InMemoryScopedDriverProfileRepository;
  private attendantRepo: InMemoryScopedAttendantProfileRepository;

  constructor(private context: RequestTenantContext) {
    this.providerRepo = new InMemoryScopedTransportationProviderRepository(context);
    this.vehicleRepo = new InMemoryScopedTransportationVehicleRepository(context);
    this.driverRepo = new InMemoryScopedDriverProfileRepository(context);
    this.attendantRepo = new InMemoryScopedAttendantProfileRepository(context);
  }

  public async createProvider(dto: Omit<TransportationProviderDto, 'id' | 'tenantId' | 'status' | 'createdAt' | 'updatedAt'>): Promise<TransportationProviderDto> {
    const existing = (await this.providerRepo.findAll()).find(p => p.code === dto.code.trim().toUpperCase());
    if (existing) {
      throw new InvariantViolationError(`Provider code '${dto.code}' already exists in tenant.`);
    }
    const provider = TransportationProvider.create({
      id: crypto.randomUUID(),
      tenantId: this.context.tenantId,
      ...dto,
    });
    return this.providerRepo.create(provider.toDto());
  }

  public async createVehicle(dto: {
    institutionId: UUID;
    campusId: UUID;
    providerId?: UUID | null;
    assetId?: UUID | null;
    plateNumber: string;
    vehicleType: any;
    make?: string;
    model?: string;
    modelYear?: number;
    seatingCapacity: number;
    effectiveCapacity?: number;
    inspectionExpiryDate?: string | null;
    insuranceExpiryDate?: string | null;
  }): Promise<TransportationVehicleDto> {
    const norm = TransportationVehicle.normalizePlate(dto.plateNumber);
    const existing = (await this.vehicleRepo.findAll()).find(v => v.plateNormalized === norm);
    if (existing) {
      throw new InvariantViolationError(`Vehicle with plate '${norm}' already exists in tenant.`);
    }

    const vehicle = TransportationVehicle.create({
      id: crypto.randomUUID(),
      tenantId: this.context.tenantId,
      ...dto,
    });
    return this.vehicleRepo.create(vehicle.toDto());
  }

  public async createDriverProfile(dto: {
    personId: UUID;
    providerId?: UUID | null;
    employeeProfileId?: UUID | null;
    driverType: any;
    licenseNumber: string;
    licenseClasses: string[];
    licenseExpiryDate: string;
    srcCertificateExpiryDate?: string | null;
    psychotechnicalExpiryDate?: string | null;
    criminalRecordCheckedAt?: string | null;
  }): Promise<DriverProfileDto> {
    const existing = (await this.driverRepo.findAll()).find(d => d.licenseNumber === dto.licenseNumber.trim());
    if (existing) {
      throw new InvariantViolationError(`Driver license '${dto.licenseNumber}' already registered in tenant.`);
    }
    const driver = DriverProfile.create({
      id: crypto.randomUUID(),
      tenantId: this.context.tenantId,
      ...dto,
    });
    return this.driverRepo.create(driver.toDto());
  }

  public async createAttendantProfile(dto: {
    personId: UUID;
    providerId?: UUID | null;
    employeeProfileId?: UUID | null;
    attendantType: any;
    firstAidCertified: boolean;
    firstAidExpiryDate?: string | null;
    criminalRecordCheckedAt?: string | null;
  }): Promise<AttendantProfileDto> {
    const attendant = AttendantProfile.create({
      id: crypto.randomUUID(),
      tenantId: this.context.tenantId,
      ...dto,
    });
    return this.attendantRepo.create(attendant.toDto());
  }
}

export class RouteAndPassengerService {
  private routeRepo: InMemoryScopedTransportationRouteRepository;
  private stopRepo: InMemoryScopedRouteStopRepository;
  private assignRepo: InMemoryScopedRouteOperationalAssignmentRepository;
  private passProfileRepo: InMemoryScopedTransportationPassengerProfileRepository;
  private passAssignRepo: InMemoryScopedPassengerRouteAssignmentRepository;
  private authRepo: InMemoryScopedPassengerHandoverAuthorizationRepository;
  private vehicleRepo: InMemoryScopedTransportationVehicleRepository;
  private driverRepo: InMemoryScopedDriverProfileRepository;

  constructor(private context: RequestTenantContext) {
    this.routeRepo = new InMemoryScopedTransportationRouteRepository(context);
    this.stopRepo = new InMemoryScopedRouteStopRepository(context);
    this.assignRepo = new InMemoryScopedRouteOperationalAssignmentRepository(context);
    this.passProfileRepo = new InMemoryScopedTransportationPassengerProfileRepository(context);
    this.passAssignRepo = new InMemoryScopedPassengerRouteAssignmentRepository(context);
    this.authRepo = new InMemoryScopedPassengerHandoverAuthorizationRepository(context);
    this.vehicleRepo = new InMemoryScopedTransportationVehicleRepository(context);
    this.driverRepo = new InMemoryScopedDriverProfileRepository(context);
  }

  public async createRoute(dto: {
    institutionId: UUID;
    campusId: UUID;
    code: string;
    name: string;
    routeType: any;
    effectiveFrom: string;
    effectiveUntil?: string | null;
    estimatedDurationMinutes?: number;
    estimatedDistanceKm?: number;
  }): Promise<TransportationRouteDto> {
    const norm = TransportationRoute.normalizeCode(dto.code);
    const existing = (await this.routeRepo.findAll()).find(
      r => r.campusId === dto.campusId && r.code === norm
    );
    if (existing) {
      throw new InvariantViolationError(`Route code '${norm}' already exists for this campus.`);
    }
    const route = TransportationRoute.create({
      id: crypto.randomUUID(),
      tenantId: this.context.tenantId,
      ...dto,
    });
    return this.routeRepo.create(route.toDto());
  }

  public async addStop(dto: {
    routeId: UUID;
    sequenceNumber: number;
    name: string;
    address?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    plannedTime?: string | null;
    stopType: any;
  }): Promise<RouteStopDto> {
    const existing = (await this.stopRepo.findAll()).find(
      s => s.routeId === dto.routeId && s.sequenceNumber === dto.sequenceNumber
    );
    if (existing) {
      throw new InvariantViolationError(`Stop sequence ${dto.sequenceNumber} already exists on route.`);
    }
    const stop = RouteStop.create({
      id: crypto.randomUUID(),
      tenantId: this.context.tenantId,
      ...dto,
    });
    return this.stopRepo.create(stop.toDto());
  }

  // TRN-017 & TRN-018: Operational vehicle & driver assignment conflict checking
  public async assignVehicleAndDriver(dto: {
    routeId: UUID;
    vehicleId: UUID;
    driverProfileId: UUID;
    attendantProfileId?: UUID | null;
    effectiveFrom: string;
    effectiveUntil?: string | null;
    dayOfWeekMask: number[];
  }): Promise<RouteOperationalAssignmentDto> {
    const vehicle = await this.vehicleRepo.findById(dto.vehicleId);
    if (!vehicle || vehicle.status !== 'ACTIVE') {
      throw new InvariantViolationError('Vehicle is not active or not found.');
    }
    const driver = await this.driverRepo.findById(dto.driverProfileId);
    if (!driver || driver.status !== 'ACTIVE') {
      throw new InvariantViolationError('Driver is not active or not found.');
    }

    // Check conflicting active assignment for same vehicle
    const allAssignments = await this.assignRepo.findAll();
    const vehicleConflict = allAssignments.find(
      a => a.status === 'ACTIVE' && a.vehicleId === dto.vehicleId && a.routeId !== dto.routeId
    );
    if (vehicleConflict) {
      throw new VehicleAssignmentConflictError(`Vehicle ${dto.vehicleId} already assigned to another active route.`);
    }

    const driverConflict = allAssignments.find(
      a => a.status === 'ACTIVE' && a.driverProfileId === dto.driverProfileId && a.routeId !== dto.routeId
    );
    if (driverConflict) {
      throw new DriverAlreadyInActiveTripError(`Driver ${dto.driverProfileId} already assigned to another active route.`);
    }

    const assignment = RouteOperationalAssignment.create({
      id: crypto.randomUUID(),
      tenantId: this.context.tenantId,
      ...dto,
    });
    return this.assignRepo.create(assignment.toDto());
  }

  public async createPassengerProfile(dto: {
    personId: UUID;
    learnerId?: UUID | null;
    employeeProfileId?: UUID | null;
    passengerType: any;
    requiresHandover?: boolean;
    mobilityNotes?: string | null;
    emergencyContactName: string;
    emergencyContactPhone: string;
  }): Promise<TransportationPassengerProfileDto> {
    const profile = TransportationPassengerProfile.create({
      id: crypto.randomUUID(),
      tenantId: this.context.tenantId,
      ...dto,
    });
    return this.passProfileRepo.create(profile.toDto());
  }

  // TRN-016 & TRN-035: Capacity check and conflict check
  public async assignPassengerToRoute(dto: {
    passengerProfileId: UUID;
    routeId: UUID;
    stopId: UUID;
    direction: any;
    effectiveFrom: string;
    effectiveUntil?: string | null;
  }): Promise<PassengerRouteAssignmentDto> {
    // TRN-035: Check conflicting assignment for same passenger in same direction
    const existing = (await this.passAssignRepo.findAll()).filter(
      pa => pa.passengerProfileId === dto.passengerProfileId && pa.status === 'ACTIVE'
    );
    for (const e of existing) {
      if (e.direction === dto.direction || e.direction === 'BOTH' || dto.direction === 'BOTH') {
        throw new PassengerAssignmentConflictError('Passenger already has an active route assignment for this direction.');
      }
    }

    // TRN-016: Check vehicle capacity for route
    const operationalAssign = (await this.assignRepo.findAll()).find(
      a => a.routeId === dto.routeId && a.status === 'ACTIVE'
    );
    if (operationalAssign) {
      const vehicle = await this.vehicleRepo.findById(operationalAssign.vehicleId);
      if (vehicle) {
        const assignedCount = (await this.passAssignRepo.findAll()).filter(
          pa => pa.routeId === dto.routeId && pa.status === 'ACTIVE'
        ).length;
        if (assignedCount >= vehicle.effectiveCapacity) {
          throw new VehicleCapacityExceededError(`Route assignment exceeds vehicle capacity (${vehicle.effectiveCapacity}).`);
        }
      }
    }

    const passAssign = PassengerRouteAssignment.create({
      id: crypto.randomUUID(),
      tenantId: this.context.tenantId,
      ...dto,
    });
    return this.passAssignRepo.create(passAssign.toDto());
  }

  public async createHandoverAuthorization(dto: {
    passengerProfileId: UUID;
    authorizedPersonId: UUID;
    relationshipType: any;
    authorizationScope: any;
    validFrom: string;
    validUntil?: string | null;
    notes?: string | null;
  }): Promise<PassengerHandoverAuthorizationDto> {
    const auth = PassengerHandoverAuthorization.create({
      id: crypto.randomUUID(),
      tenantId: this.context.tenantId,
      ...dto,
    });
    return this.authRepo.create(auth.toDto());
  }

  public async revokeHandoverAuthorization(authorizationId: UUID, reason?: string): Promise<void> {
    const authDto = await this.authRepo.findById(authorizationId);
    if (!authDto) return;
    const auth = new PassengerHandoverAuthorization(authDto);
    auth.revoke(reason);
    await this.authRepo.update(authorizationId, auth.toDto());
  }
}

export class TripAndHandoverService {
  private tripRepo: InMemoryScopedTransportationTripRepository;
  private manifestRepo: InMemoryScopedTripManifestEntryRepository;
  private stopVisitRepo: InMemoryScopedTripStopVisitRepository;
  private eventRepo: InMemoryScopedPassengerTripEventRepository;
  private handoverRepo: InMemoryScopedPassengerHandoverRepository;
  private exceptionRepo: InMemoryScopedTransportationExceptionRepository;
  private authRepo: InMemoryScopedPassengerHandoverAuthorizationRepository;
  private passProfileRepo: InMemoryScopedTransportationPassengerProfileRepository;
  private passAssignRepo: InMemoryScopedPassengerRouteAssignmentRepository;
  private stopRepo: InMemoryScopedRouteStopRepository;

  constructor(private context: RequestTenantContext) {
    this.tripRepo = new InMemoryScopedTransportationTripRepository(context);
    this.manifestRepo = new InMemoryScopedTripManifestEntryRepository(context);
    this.stopVisitRepo = new InMemoryScopedTripStopVisitRepository(context);
    this.eventRepo = new InMemoryScopedPassengerTripEventRepository(context);
    this.handoverRepo = new InMemoryScopedPassengerHandoverRepository(context);
    this.exceptionRepo = new InMemoryScopedTransportationExceptionRepository(context);
    this.authRepo = new InMemoryScopedPassengerHandoverAuthorizationRepository(context);
    this.passProfileRepo = new InMemoryScopedTransportationPassengerProfileRepository(context);
    this.passAssignRepo = new InMemoryScopedPassengerRouteAssignmentRepository(context);
    this.stopRepo = new InMemoryScopedRouteStopRepository(context);
  }

  // TRN-019 & TRN-034: Historical frozen manifest snapshot
  public async scheduleTrip(dto: {
    institutionId: UUID;
    campusId: UUID;
    routeId: UUID;
    vehicleId: UUID;
    driverProfileId: UUID;
    attendantProfileId?: UUID | null;
    serviceDate: string;
    shiftType: any;
    scheduledStartTime: string;
  }): Promise<TransportationTripDto> {
    // Snapshot active passenger assignments on this route
    const assignments = (await this.passAssignRepo.findAll()).filter(
      pa => pa.routeId === dto.routeId && pa.status === 'ACTIVE'
    );
    const manifestEntries = [];
    for (const a of assignments) {
      const profile = await this.passProfileRepo.findById(a.passengerProfileId);
      if (profile && profile.status === 'ACTIVE') {
        manifestEntries.push({
          passengerProfileId: a.passengerProfileId,
          pickupStopId: a.stopId,
          requiresHandover: profile.requiresHandover,
        });
      }
    }

    // Snapshot route stops as scheduled stop visits
    const stops = (await this.stopRepo.findAll())
      .filter(s => s.routeId === dto.routeId)
      .sort((a, b) => a.sequenceNumber - b.sequenceNumber);

    const tripId = crypto.randomUUID();
    const stopVisits = stops.map(s =>
      TripStopVisit.create({
        id: crypto.randomUUID(),
        tenantId: this.context.tenantId,
        tripId,
        routeStopId: s.id,
        sequenceNumber: s.sequenceNumber,
        scheduledTime: s.plannedTime ?? null,
        actualArrivalTime: null,
        actualDepartureTime: null,
        dwellTimeSeconds: null,
      })
    );

    const trip = TransportationTrip.create({
      id: tripId,
      tenantId: this.context.tenantId,
      ...dto,
      manifestEntries,
      stopVisits,
    });

    const savedTrip = await this.tripRepo.create(trip.toDto());
    for (const m of trip.getManifest) {
      await this.manifestRepo.create(m);
    }
    for (const sv of stopVisits) {
      await this.stopVisitRepo.create(sv.toDto());
    }

    return savedTrip;
  }

  // TRN-032: Trip start validation
  public async startTrip(tripId: UUID, actualStartTime: string = new Date().toISOString()): Promise<TransportationTripDto> {
    const tripDto = await this.tripRepo.findById(tripId);
    if (!tripDto) throw new InvariantViolationError('Trip not found.');

    // Check if vehicle or driver already in another IN_PROGRESS trip
    const activeTrips = (await this.tripRepo.findAll()).filter(
      t => t.id !== tripId && t.status === 'IN_PROGRESS'
    );
    if (activeTrips.some(t => t.vehicleId === tripDto.vehicleId)) {
      throw new InvariantViolationError('Vehicle is already operating an active trip.');
    }
    if (activeTrips.some(t => t.driverProfileId === tripDto.driverProfileId)) {
      throw new InvariantViolationError('Driver is already operating an active trip.');
    }

    const trip = new TransportationTrip(tripDto);
    trip.startTrip(actualStartTime);
    await this.tripRepo.update(tripId, trip.toDto());
    return trip.toDto();
  }

  // TRN-022, TRN-039: Boarding with Idempotency
  public async recordBoarding(
    tripId: UUID,
    passengerProfileId: UUID,
    stopVisitId: UUID | undefined,
    recordedByUserId: UUID,
    idempotencyKey?: string,
    timestamp: string = new Date().toISOString()
  ): Promise<PassengerTripEventDto> {
    if (idempotencyKey) {
      const payloadHash = `${tripId}:${passengerProfileId}`;
      const cached = processedIdempotencyKeys.get(idempotencyKey);
      if (cached) {
        if (cached.payloadHash !== payloadHash) {
          throw new IdempotencyPayloadConflictError('Idempotency key mismatch for boarding action.');
        }
        return cached.result;
      }
    }

    const tripDto = await this.tripRepo.findById(tripId);
    if (!tripDto) throw new InvariantViolationError('Trip not found.');
    const manifest = (await this.manifestRepo.findAll()).filter(m => m.tripId === tripId);
    const events = (await this.eventRepo.findAll()).filter(e => e.tripId === tripId);

    const trip = new TransportationTrip(
      tripDto,
      manifest,
      [],
      events.map(e => new PassengerTripEvent(e))
    );

    const event = trip.recordBoarding(passengerProfileId, stopVisitId, recordedByUserId, timestamp);

    await this.tripRepo.update(tripId, trip.toDto());
    const updatedManifestEntry = trip.getManifest.find(m => m.passengerProfileId === passengerProfileId);
    if (updatedManifestEntry) {
      await this.manifestRepo.update(updatedManifestEntry.id, updatedManifestEntry);
    }
    const savedEvent = await this.eventRepo.create(event.toDto());

    if (idempotencyKey) {
      processedIdempotencyKeys.set(idempotencyKey, {
        payloadHash: `${tripId}:${passengerProfileId}`,
        result: savedEvent,
      });
    }

    return savedEvent;
  }

  // TRN-023: Drop-off transition
  public async recordDropoff(
    tripId: UUID,
    passengerProfileId: UUID,
    stopVisitId: UUID | undefined,
    recordedByUserId: UUID,
    timestamp: string = new Date().toISOString()
  ): Promise<PassengerTripEventDto> {
    const tripDto = await this.tripRepo.findById(tripId);
    if (!tripDto) throw new InvariantViolationError('Trip not found.');
    const manifest = (await this.manifestRepo.findAll()).filter(m => m.tripId === tripId);
    const events = (await this.eventRepo.findAll()).filter(e => e.tripId === tripId);

    const trip = new TransportationTrip(
      tripDto,
      manifest,
      [],
      events.map(e => new PassengerTripEvent(e))
    );

    const event = trip.recordDropoff(passengerProfileId, stopVisitId, recordedByUserId, timestamp);

    await this.tripRepo.update(tripId, trip.toDto());
    const updatedManifestEntry = trip.getManifest.find(m => m.passengerProfileId === passengerProfileId);
    if (updatedManifestEntry) {
      await this.manifestRepo.update(updatedManifestEntry.id, updatedManifestEntry);
    }
    return this.eventRepo.create(event.toDto());
  }

  // TRN-024, TRN-025, TRN-036: Complete handover
  public async completeHandover(
    tripId: UUID,
    passengerProfileId: UUID,
    authorizationId: UUID,
    receivedByPersonId: UUID,
    verifiedByUserId: UUID,
    method: HandoverMethod,
    timestamp: string = new Date().toISOString()
  ): Promise<PassengerHandoverDto> {
    const tripDto = await this.tripRepo.findById(tripId);
    if (!tripDto) throw new InvariantViolationError('Trip not found.');
    const manifest = (await this.manifestRepo.findAll()).filter(m => m.tripId === tripId);
    const handovers = (await this.handoverRepo.findAll()).filter(h => h.tripId === tripId);

    const authDto = await this.authRepo.findById(authorizationId);
    if (!authDto) {
      throw new HandoverNotAuthorizedError('Handover authorization not found.');
    }
    const auth = new PassengerHandoverAuthorization(authDto);

    const trip = new TransportationTrip(
      tripDto,
      manifest,
      [],
      [],
      handovers.map(h => new PassengerHandover(h))
    );

    const handover = trip.recordHandover(
      passengerProfileId,
      auth,
      receivedByPersonId,
      verifiedByUserId,
      method,
      timestamp
    );

    await this.tripRepo.update(tripId, trip.toDto());
    return this.handoverRepo.create(handover.toDto());
  }

  public async recordNoShow(
    tripId: UUID,
    passengerProfileId: UUID,
    recordedByUserId: UUID,
    timestamp: string = new Date().toISOString()
  ): Promise<PassengerTripEventDto> {
    const tripDto = await this.tripRepo.findById(tripId);
    if (!tripDto) throw new InvariantViolationError('Trip not found.');
    const manifest = (await this.manifestRepo.findAll()).filter(m => m.tripId === tripId);
    const events = (await this.eventRepo.findAll()).filter(e => e.tripId === tripId);

    const trip = new TransportationTrip(
      tripDto,
      manifest,
      [],
      events.map(e => new PassengerTripEvent(e))
    );

    const event = trip.recordNoShow(passengerProfileId, recordedByUserId, timestamp);

    await this.tripRepo.update(tripId, trip.toDto());
    const updatedManifestEntry = trip.getManifest.find(m => m.passengerProfileId === passengerProfileId);
    if (updatedManifestEntry) {
      await this.manifestRepo.update(updatedManifestEntry.id, updatedManifestEntry);
    }
    return this.eventRepo.create(event.toDto());
  }

  // TRN-033: Trip completion validation
  public async completeTrip(tripId: UUID, actualEndTime: string = new Date().toISOString()): Promise<TransportationTripDto> {
    const tripDto = await this.tripRepo.findById(tripId);
    if (!tripDto) throw new InvariantViolationError('Trip not found.');
    const manifest = (await this.manifestRepo.findAll()).filter(m => m.tripId === tripId);

    const trip = new TransportationTrip(tripDto, manifest);
    trip.completeTrip(actualEndTime);
    await this.tripRepo.update(tripId, trip.toDto());
    return trip.toDto();
  }

  public async raiseException(dto: {
    tripId?: UUID | null;
    passengerProfileId?: UUID | null;
    vehicleId?: UUID | null;
    driverProfileId?: UUID | null;
    category: any;
    severity: any;
    description: string;
  }): Promise<TransportationExceptionDto> {
    const exception = TransportationException.create({
      id: crypto.randomUUID(),
      tenantId: this.context.tenantId,
      ...dto,
    });
    return this.exceptionRepo.create(exception.toDto());
  }
}
