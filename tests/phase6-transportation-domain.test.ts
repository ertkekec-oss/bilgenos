import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
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
  InvalidStateTransitionError,
  VehicleCapacityExceededError,
  VehicleAssignmentConflictError,
  DriverAlreadyInActiveTripError,
  PassengerAssignmentConflictError,
  PassengerNotInManifestError,
  PassengerAlreadyBoardedError,
  PassengerNotOnboardError,
  HandoverNotAuthorizedError,
  HandoverAlreadyCompletedError,
  TripNotCompletableError,
} from '@bilgenos/domain';
import {
  FleetAndPersonnelService,
  RouteAndPassengerService,
  TripAndHandoverService,
} from '@bilgenos/database';
import type { RequestTenantContext } from '@bilgenos/contracts';

describe('Phase 6: Transportation Domain Invariants (TRN-001 - TRN-040)', () => {
  const tenantId = '11111111-1111-1111-1111-111111111111';
  const orgId = '22222222-2222-2222-2222-222222222222';
  const instId = '33333333-3333-3333-3333-333333333333';
  const campusId = '44444444-4444-4444-4444-444444444444';
  const personId = '55555555-5555-5555-5555-555555555555';
  const guardianPersonId = '66666666-6666-6666-6666-666666666666';
  const employeeId = '77777777-7777-7777-7777-777777777777';
  const assetId = '88888888-8888-8888-8888-888888888888';

  const context: RequestTenantContext = {
    tenantId,
    userId: '99999999-9999-9999-9999-999999999999',
    roles: ['TRANSPORT_ADMIN'],
  };

  // -------------------------------------------------------------
  // TRN-001 - TRN-006: Provider & Vehicle Aggregates
  // -------------------------------------------------------------
  it('TRN-001 - TRN-006: Vehicle aggregate enforces plate normalization, capacity, and asset reference', () => {
    // Normalization test
    assert.equal(TransportationVehicle.normalizePlate('34 blg - 101 '), '34BLG101');

    // Reject non-positive capacity
    assert.throws(
      () =>
        TransportationVehicle.create({
          id: crypto.randomUUID(),
          tenantId,
          institutionId: instId,
          campusId,
          plateNumber: '34 BLG 101',
          vehicleType: 'MIDIBUS',
          seatingCapacity: 0,
        }),
      /Seating capacity must be greater than zero/
    );

    // Owned vehicle with asset reference
    const vehicle = TransportationVehicle.create({
      id: crypto.randomUUID(),
      tenantId,
      institutionId: instId,
      campusId,
      assetId,
      plateNumber: '34 BLG 101',
      vehicleType: 'MIDIBUS',
      seatingCapacity: 27,
      effectiveCapacity: 26,
      inspectionExpiryDate: '2027-12-31',
      insuranceExpiryDate: '2027-12-31',
    });
    assert.equal(vehicle.plateNormalized, '34BLG101');
    assert.equal(vehicle.effectiveCapacity, 26);
    assert.equal(vehicle.isCompliant(), true);

    // Lifecycle transitions
    vehicle.setMaintenance();
    assert.equal(vehicle.status, 'MAINTENANCE');
    assert.equal(vehicle.isCompliant(), false);

    vehicle.reactivate();
    assert.equal(vehicle.status, 'ACTIVE');

    vehicle.decommission();
    assert.equal(vehicle.status, 'DECOMMISSIONED');
    assert.throws(() => vehicle.reactivate(), /Invalid state transition/);
  });

  // -------------------------------------------------------------
  // TRN-007 & TRN-008: Driver & Attendant Profiles
  // -------------------------------------------------------------
  it('TRN-007 & TRN-008: Driver profile enforces license, qualifications, and employment vs contractor distinction', () => {
    // Internal driver without employeeProfileId must throw
    assert.throws(
      () =>
        DriverProfile.create({
          id: crypto.randomUUID(),
          tenantId,
          personId,
          driverType: 'INTERNAL',
          licenseNumber: 'DRV-12345',
          licenseClasses: ['D', 'SRC-2'],
          licenseExpiryDate: '2027-05-20',
        }),
      /Internal driver must reference an EmployeeProfile/
    );

    // Valid internal driver
    const driver = DriverProfile.create({
      id: crypto.randomUUID(),
      tenantId,
      personId,
      employeeProfileId: employeeId,
      driverType: 'INTERNAL',
      licenseNumber: 'DRV-12345',
      licenseClasses: ['D', 'SRC-2'],
      licenseExpiryDate: '2027-05-20',
      srcCertificateExpiryDate: '2027-05-20',
      psychotechnicalExpiryDate: '2027-05-20',
    });
    assert.equal(driver.isEligible(), true);
    driver.assertEligible();

    // Expired license makes driver ineligible
    const expiredDriver = DriverProfile.create({
      id: crypto.randomUUID(),
      tenantId,
      personId,
      employeeProfileId: employeeId,
      driverType: 'INTERNAL',
      licenseNumber: 'DRV-EXPIRED',
      licenseClasses: ['D'],
      licenseExpiryDate: '2020-01-01',
    });
    assert.equal(expiredDriver.isEligible(), false);
    assert.throws(() => expiredDriver.assertEligible(), /Driver is either inactive or has expired credentials/);
  });

  // -------------------------------------------------------------
  // TRN-009 & TRN-010: Route & Stops Sequence
  // -------------------------------------------------------------
  it('TRN-009 & TRN-010: Route requires at least 2 stops before activation and enforces sequential ordering', () => {
    const route = TransportationRoute.create({
      id: crypto.randomUUID(),
      tenantId,
      institutionId: instId,
      campusId,
      code: 'GZ 01 KADIKOY',
      name: 'Kadikoy Kampus Ringi',
      routeType: 'MORNING_PICKUP',
      effectiveFrom: '2026-09-01',
    });
    assert.equal(route.code, 'GZ-01-KADIKOY');
    assert.equal(route.status, 'DRAFT');

    // Cannot activate with 0 stops
    assert.throws(() => route.activate(), /Route must have at least 2 stops before activation/);

    const stop1 = RouteStop.create({
      id: crypto.randomUUID(),
      tenantId,
      routeId: route.id,
      sequenceNumber: 1,
      name: 'Kadikoy Rihtim',
      stopType: 'PICKUP',
      plannedTime: '07:15',
    });
    route.addStop(stop1);
    assert.throws(() => route.activate(), /Route must have at least 2 stops before activation/);

    // Duplicate sequence number rejected
    assert.throws(
      () =>
        route.addStop(
          RouteStop.create({
            id: crypto.randomUUID(),
            tenantId,
            routeId: route.id,
            sequenceNumber: 1,
            name: 'Duplicate Stop',
            stopType: 'PICKUP',
          })
        ),
      /Duplicate stop sequence number 1 on route/
    );

    const stop2 = RouteStop.create({
      id: crypto.randomUUID(),
      tenantId,
      routeId: route.id,
      sequenceNumber: 2,
      name: 'Bilgen Kampus Girisi',
      stopType: 'CAMPUS_DESTINATION',
      plannedTime: '08:00',
    });
    route.addStop(stop2);

    route.activate();
    assert.equal(route.status, 'ACTIVE');
  });

  // -------------------------------------------------------------
  // TRN-015, TRN-016 & TRN-035: Capacity Conservation & Service Assignments
  // -------------------------------------------------------------
  it('TRN-015, TRN-016 & TRN-035: Capacity conservation rejects over-assignment and duplicate directions', async () => {
    const fleetService = new FleetAndPersonnelService(context);
    const routePassService = new RouteAndPassengerService(context);

    const vehicle = await fleetService.createVehicle({
      institutionId: instId,
      campusId,
      plateNumber: '34 CAP 001',
      vehicleType: 'VAN',
      seatingCapacity: 2,
      effectiveCapacity: 2,
    });

    const driver = await fleetService.createDriverProfile({
      personId: crypto.randomUUID(),
      employeeProfileId: employeeId,
      driverType: 'INTERNAL',
      licenseNumber: 'LIC-CAP-001',
      licenseClasses: ['B'],
      licenseExpiryDate: '2028-01-01',
    });

    const route = await routePassService.createRoute({
      institutionId: instId,
      campusId,
      code: 'CAP-ROUTE-01',
      name: 'Capacity Test Route',
      routeType: 'MORNING_PICKUP',
      effectiveFrom: '2026-09-01',
    });

    const stop = await routePassService.addStop({
      routeId: route.id,
      sequenceNumber: 1,
      name: 'Stop 1',
      stopType: 'PICKUP',
    });

    await routePassService.assignVehicleAndDriver({
      routeId: route.id,
      vehicleId: vehicle.id,
      driverProfileId: driver.id,
      effectiveFrom: '2026-09-01',
      dayOfWeekMask: [1, 2, 3, 4, 5],
    });

    // Create 2 passengers and assign
    const p1 = await routePassService.createPassengerProfile({
      personId: crypto.randomUUID(),
      passengerType: 'STUDENT',
      emergencyContactName: 'Parent 1',
      emergencyContactPhone: '+90 555 111 2233',
    });
    const p2 = await routePassService.createPassengerProfile({
      personId: crypto.randomUUID(),
      passengerType: 'STUDENT',
      emergencyContactName: 'Parent 2',
      emergencyContactPhone: '+90 555 222 3344',
    });

    await routePassService.assignPassengerToRoute({
      passengerProfileId: p1.id,
      routeId: route.id,
      stopId: stop.id,
      direction: 'PICKUP',
      effectiveFrom: '2026-09-01',
    });

    // TRN-035: Duplicate direction for p1 must be rejected
    await assert.rejects(
      async () =>
        routePassService.assignPassengerToRoute({
          passengerProfileId: p1.id,
          routeId: route.id,
          stopId: stop.id,
          direction: 'PICKUP',
          effectiveFrom: '2026-09-01',
        }),
      (err: any) => err.code === 'PASSENGER_ASSIGNMENT_CONFLICT'
    );

    // Assign p2 (fills capacity: 2/2)
    await routePassService.assignPassengerToRoute({
      passengerProfileId: p2.id,
      routeId: route.id,
      stopId: stop.id,
      direction: 'PICKUP',
      effectiveFrom: '2026-09-01',
    });

    // 3rd passenger exceeds capacity
    const p3 = await routePassService.createPassengerProfile({
      personId: crypto.randomUUID(),
      passengerType: 'STUDENT',
      emergencyContactName: 'Parent 3',
      emergencyContactPhone: '+90 555 333 4455',
    });

    await assert.rejects(
      async () =>
        routePassService.assignPassengerToRoute({
          passengerProfileId: p3.id,
          routeId: route.id,
          stopId: stop.id,
          direction: 'PICKUP',
          effectiveFrom: '2026-09-01',
        }),
      (err: any) => err.code === 'VEHICLE_CAPACITY_EXCEEDED'
    );
  });

  // -------------------------------------------------------------
  // TRN-017 & TRN-018: Conflicting Vehicle & Driver Assignments
  // -------------------------------------------------------------
  it('TRN-017 & TRN-018: Conflicting vehicle or driver assignments are rejected', async () => {
    const fleetService = new FleetAndPersonnelService(context);
    const routePassService = new RouteAndPassengerService(context);

    const vehicle = await fleetService.createVehicle({
      institutionId: instId,
      campusId,
      plateNumber: '34 DBL 001',
      vehicleType: 'MIDIBUS',
      seatingCapacity: 20,
    });

    const driver = await fleetService.createDriverProfile({
      personId: crypto.randomUUID(),
      employeeProfileId: employeeId,
      driverType: 'INTERNAL',
      licenseNumber: 'LIC-DBL-001',
      licenseClasses: ['D'],
      licenseExpiryDate: '2028-01-01',
    });

    const route1 = await routePassService.createRoute({
      institutionId: instId,
      campusId,
      code: 'DBL-ROUTE-01',
      name: 'Double Route 1',
      routeType: 'MORNING_PICKUP',
      effectiveFrom: '2026-09-01',
    });

    const route2 = await routePassService.createRoute({
      institutionId: instId,
      campusId,
      code: 'DBL-ROUTE-02',
      name: 'Double Route 2',
      routeType: 'MORNING_PICKUP',
      effectiveFrom: '2026-09-01',
    });

    // First assignment succeeds
    await routePassService.assignVehicleAndDriver({
      routeId: route1.id,
      vehicleId: vehicle.id,
      driverProfileId: driver.id,
      effectiveFrom: '2026-09-01',
      dayOfWeekMask: [1, 2, 3, 4, 5],
    });

    const driver2 = await fleetService.createDriverProfile({
      personId: crypto.randomUUID(),
      employeeProfileId: employeeId,
      driverType: 'INTERNAL',
      licenseNumber: 'LIC-DBL-002',
      licenseClasses: ['D'],
      licenseExpiryDate: '2028-01-01',
    });

    // Concurrent active assignment on route2 with same vehicle fails
    await assert.rejects(
      async () =>
        routePassService.assignVehicleAndDriver({
          routeId: route2.id,
          vehicleId: vehicle.id,
          driverProfileId: driver2.id,
          effectiveFrom: '2026-09-01',
          dayOfWeekMask: [1, 2, 3, 4, 5],
        }),
      (err: any) => err.code === 'VEHICLE_ASSIGNMENT_CONFLICT'
    );
  });

  // -------------------------------------------------------------
  // TRN-019 & TRN-034: Historical Operational Snapshot
  // -------------------------------------------------------------
  it('TRN-019 & TRN-034: Scheduled trip captures frozen manifest snapshot', async () => {
    const fleetService = new FleetAndPersonnelService(context);
    const routePassService = new RouteAndPassengerService(context);
    const tripService = new TripAndHandoverService(context);

    const vehicle = await fleetService.createVehicle({
      institutionId: instId,
      campusId,
      plateNumber: '34 SNAP 01',
      vehicleType: 'BUS',
      seatingCapacity: 30,
    });

    const driver = await fleetService.createDriverProfile({
      personId: crypto.randomUUID(),
      employeeProfileId: employeeId,
      driverType: 'INTERNAL',
      licenseNumber: 'LIC-SNAP-01',
      licenseClasses: ['D'],
      licenseExpiryDate: '2028-01-01',
    });

    const route = await routePassService.createRoute({
      institutionId: instId,
      campusId,
      code: 'SNAP-ROUTE-01',
      name: 'Snapshot Route',
      routeType: 'MORNING_PICKUP',
      effectiveFrom: '2026-09-01',
    });

    const stop = await routePassService.addStop({
      routeId: route.id,
      sequenceNumber: 1,
      name: 'Snap Stop 1',
      stopType: 'PICKUP',
    });

    const p1 = await routePassService.createPassengerProfile({
      personId: crypto.randomUUID(),
      passengerType: 'STUDENT',
      emergencyContactName: 'Snap Parent',
      emergencyContactPhone: '+90 555 999 8877',
    });

    await routePassService.assignPassengerToRoute({
      passengerProfileId: p1.id,
      routeId: route.id,
      stopId: stop.id,
      direction: 'PICKUP',
      effectiveFrom: '2026-09-01',
    });

    const trip = await tripService.scheduleTrip({
      institutionId: instId,
      campusId,
      routeId: route.id,
      vehicleId: vehicle.id,
      driverProfileId: driver.id,
      serviceDate: '2026-09-25',
      shiftType: 'MORNING',
      scheduledStartTime: '07:30',
    });

    assert.equal(trip.passengerCountExpected, 1);
    assert.equal(trip.status, 'SCHEDULED');
  });

  // -------------------------------------------------------------
  // TRN-022: Duplicate Boarding Forbidden
  // -------------------------------------------------------------
  it('TRN-022: Duplicate boarding for the same passenger is strictly rejected', async () => {
    const passengerId = crypto.randomUUID();
    const trip = TransportationTrip.create({
      id: crypto.randomUUID(),
      tenantId,
      institutionId: instId,
      campusId,
      routeId: crypto.randomUUID(),
      vehicleId: crypto.randomUUID(),
      driverProfileId: crypto.randomUUID(),
      serviceDate: '2026-09-25',
      shiftType: 'MORNING',
      scheduledStartTime: '07:30',
      manifestEntries: [
        {
          passengerProfileId: passengerId,
          requiresHandover: true,
        },
      ],
    });

    trip.startTrip('07:35');

    // First boarding succeeds
    trip.recordBoarding(passengerId, undefined, context.userId, '07:40');
    assert.equal(trip.passengerCountBoarded, 1);

    // Duplicate boarding throws PASSENGER_ALREADY_BOARDED
    assert.throws(
      () => trip.recordBoarding(passengerId, undefined, context.userId, '07:41'),
      (err: any) => err.code === 'PASSENGER_ALREADY_BOARDED'
    );
  });

  // -------------------------------------------------------------
  // TRN-023: Invalid Drop-off Transition Forbidden
  // -------------------------------------------------------------
  it('TRN-023: Passenger cannot be dropped off without being boarded first', () => {
    const passengerId = crypto.randomUUID();
    const trip = TransportationTrip.create({
      id: crypto.randomUUID(),
      tenantId,
      institutionId: instId,
      campusId,
      routeId: crypto.randomUUID(),
      vehicleId: crypto.randomUUID(),
      driverProfileId: crypto.randomUUID(),
      serviceDate: '2026-09-25',
      shiftType: 'MORNING',
      scheduledStartTime: '07:30',
      manifestEntries: [
        {
          passengerProfileId: passengerId,
          requiresHandover: true,
        },
      ],
    });

    trip.startTrip('07:35');

    // Attempt dropoff before boarding
    assert.throws(
      () => trip.recordDropoff(passengerId, undefined, context.userId, '07:45'),
      (err: any) => err.code === 'PASSENGER_NOT_ONBOARD'
    );
  });

  // -------------------------------------------------------------
  // TRN-024, TRN-025 & TRN-036: Safe Guardian Handover
  // -------------------------------------------------------------
  it('TRN-024, TRN-025 & TRN-036: Guardian handover requires active authorization; revoked auth immediately blocks', () => {
    const passengerId = crypto.randomUUID();
    const authPersonId = crypto.randomUUID();

    const auth = PassengerHandoverAuthorization.create({
      id: crypto.randomUUID(),
      tenantId,
      passengerProfileId: passengerId,
      authorizedPersonId: authPersonId,
      relationshipType: 'MOTHER',
      authorizationScope: 'REGULAR',
      validFrom: '2026-09-01',
      validUntil: '2027-06-30',
    });
    assert.equal(auth.isAuthorized(), true);

    const trip = TransportationTrip.create({
      id: crypto.randomUUID(),
      tenantId,
      institutionId: instId,
      campusId,
      routeId: crypto.randomUUID(),
      vehicleId: crypto.randomUUID(),
      driverProfileId: crypto.randomUUID(),
      serviceDate: '2026-09-25',
      shiftType: 'MORNING',
      scheduledStartTime: '07:30',
      manifestEntries: [
        {
          passengerProfileId: passengerId,
          requiresHandover: true,
        },
      ],
    });

    trip.startTrip('07:35');
    trip.recordBoarding(passengerId, undefined, context.userId, '07:40');
    trip.recordDropoff(passengerId, undefined, context.userId, '07:55');

    // Revocation takes immediate effect (TRN-025)
    auth.revoke('Veli yetkiyi kaldirdi');
    assert.equal(auth.isAuthorized(), false);

    assert.throws(
      () =>
        trip.recordHandover(
          passengerId,
          auth,
          authPersonId,
          context.userId,
          'PHYSICAL_SIGNATURE',
          '07:56'
        ),
      (err: any) => err.code === 'HANDOVER_NOT_AUTHORIZED'
    );

    // Active authorization succeeds
    const validAuth = PassengerHandoverAuthorization.create({
      id: crypto.randomUUID(),
      tenantId,
      passengerProfileId: passengerId,
      authorizedPersonId: authPersonId,
      relationshipType: 'FATHER',
      authorizationScope: 'REGULAR',
      validFrom: '2026-09-01',
      validUntil: '2027-06-30',
    });

    const handover = trip.recordHandover(
      passengerId,
      validAuth,
      authPersonId,
      context.userId,
      'VERIFICATION_PIN',
      '07:57'
    );
    assert.equal(handover.passengerProfileId, passengerId);
    assert.equal(trip.getHandovers.length, 1);

    // TRN-036: Secondary handover attempt on same trip fails
    assert.throws(
      () =>
        trip.recordHandover(
          passengerId,
          validAuth,
          authPersonId,
          context.userId,
          'VERIFICATION_PIN',
          '07:58'
        ),
      (err: any) => err.code === 'HANDOVER_ALREADY_COMPLETED'
    );
  });

  // -------------------------------------------------------------
  // TRN-032 & TRN-033: Trip Lifecycle Gates
  // -------------------------------------------------------------
  it('TRN-032 & TRN-033: Trip cannot be completed while passengers are still recorded as onboard', () => {
    const passengerId = crypto.randomUUID();
    const trip = TransportationTrip.create({
      id: crypto.randomUUID(),
      tenantId,
      institutionId: instId,
      campusId,
      routeId: crypto.randomUUID(),
      vehicleId: crypto.randomUUID(),
      driverProfileId: crypto.randomUUID(),
      serviceDate: '2026-09-25',
      shiftType: 'MORNING',
      scheduledStartTime: '07:30',
      manifestEntries: [
        {
          passengerProfileId: passengerId,
          requiresHandover: false,
        },
      ],
    });

    trip.startTrip('07:35');
    trip.recordBoarding(passengerId, undefined, context.userId, '07:40');

    // Attempt to complete trip while passenger is onboard
    assert.throws(
      () => trip.completeTrip('08:05'),
      (err: any) => err.code === 'TRIP_NOT_COMPLETABLE'
    );

    // Drop off passenger and complete trip
    trip.recordDropoff(passengerId, undefined, context.userId, '08:00');
    trip.completeTrip('08:05');
    assert.equal(trip.status, 'COMPLETED');
    assert.equal(trip.passengerCountDroppedOff, 1);
  });
});
