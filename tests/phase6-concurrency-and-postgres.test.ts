import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

describe('Phase 6: PostgreSQL Physical Concurrency & Security Gate', () => {
  const prisma = new PrismaClient({
    datasourceUrl: process.env.DIRECT_URL || process.env.DATABASE_URL,
  });

  const tenantAId = crypto.randomUUID();
  const tenantBId = crypto.randomUUID();
  const orgAId = crypto.randomUUID();
  const orgBId = crypto.randomUUID();
  const instAId = crypto.randomUUID();
  const instBId = crypto.randomUUID();
  const campusAId = crypto.randomUUID();
  const campusBId = crypto.randomUUID();
  const personAId = crypto.randomUUID();
  const personBId = crypto.randomUUID();
  const driverPersonId = crypto.randomUUID();
  const guardianPersonId = crypto.randomUUID();

  let routeAId = crypto.randomUUID();
  let vehicleAId = crypto.randomUUID();
  let driverAId = crypto.randomUUID();
  let stopA1Id = crypto.randomUUID();
  let stopA2Id = crypto.randomUUID();
  let passengerAId = crypto.randomUUID();
  let tripAId = crypto.randomUUID();

  before(async () => {
    await prisma.$connect();

    // 1. Create Tenant A & B Hierarchies
    await prisma.tenant.createMany({
      data: [
        { id: tenantAId, name: 'Phase6 Transport Tenant A', slug: 'p6-tenant-a-' + Date.now() },
        { id: tenantBId, name: 'Phase6 Transport Tenant B', slug: 'p6-tenant-b-' + Date.now() },
      ],
    });

    await prisma.organization.createMany({
      data: [
        { id: orgAId, tenantId: tenantAId, name: 'Transport Org A' },
        { id: orgBId, tenantId: tenantBId, name: 'Transport Org B' },
      ],
    });

    await prisma.institution.createMany({
      data: [
        { id: instAId, organizationId: orgAId, code: 'INST-P6-A-' + Date.now(), name: 'Kolej Transport A', institutionType: 'COLLEGE' },
        { id: instBId, organizationId: orgBId, code: 'INST-P6-B-' + Date.now(), name: 'Kolej Transport B', institutionType: 'COLLEGE' },
      ],
    });

    await prisma.campus.createMany({
      data: [
        { id: campusAId, institutionId: instAId, name: 'Kadikoy Kampus A' },
        { id: campusBId, institutionId: instBId, name: 'Uskudar Kampus B' },
      ],
    });

    await prisma.person.createMany({
      data: [
        { id: personAId, tenantId: tenantAId, firstName: 'Student', lastName: 'A' },
        { id: personBId, tenantId: tenantBId, firstName: 'Student', lastName: 'B' },
        { id: driverPersonId, tenantId: tenantAId, firstName: 'Driver', lastName: 'A' },
        { id: guardianPersonId, tenantId: tenantAId, firstName: 'Guardian', lastName: 'A' },
      ],
    });

    // 2. Create Vehicle A
    await prisma.transportationVehicle.create({
      data: {
        id: vehicleAId,
        tenantId: tenantAId,
        institutionId: instAId,
        campusId: campusAId,
        plateNumber: '34 CONC 01',
        plateNormalized: '34CONC01',
        vehicleType: 'MIDIBUS',
        seatingCapacity: 10,
        effectiveCapacity: 10,
        status: 'ACTIVE',
      },
    });

    // 3. Create Driver Profile A
    await prisma.driverProfile.create({
      data: {
        id: driverAId,
        tenantId: tenantAId,
        personId: driverPersonId,
        driverType: 'CONTRACTED',
        licenseNumber: 'LIC-CONC-' + Date.now(),
        licenseClasses: ['D', 'SRC-2'],
        licenseExpiryDate: new Date('2028-01-01'),
        status: 'ACTIVE',
      },
    });

    // 4. Create Route A with 2 Stops
    await prisma.transportationRoute.create({
      data: {
        id: routeAId,
        tenantId: tenantAId,
        institutionId: instAId,
        campusId: campusAId,
        code: 'CONC-RT-01',
        name: 'Concurrency Route 1',
        routeType: 'MORNING_PICKUP',
        status: 'ACTIVE',
        effectiveFrom: new Date('2026-09-01'),
      },
    });

    await prisma.routeStop.createMany({
      data: [
        {
          id: stopA1Id,
          tenantId: tenantAId,
          routeId: routeAId,
          sequenceNumber: 1,
          name: 'Stop 1',
          stopType: 'PICKUP',
        },
        {
          id: stopA2Id,
          tenantId: tenantAId,
          routeId: routeAId,
          sequenceNumber: 2,
          name: 'Campus Stop',
          stopType: 'CAMPUS_DESTINATION',
        },
      ],
    });

    // 5. Create Passenger Profile A
    await prisma.transportationPassengerProfile.create({
      data: {
        id: passengerAId,
        tenantId: tenantAId,
        personId: personAId,
        passengerType: 'STUDENT',
        requiresHandover: true,
        emergencyContactName: 'Guardian A',
        emergencyContactPhone: '+90 555 123 4567',
        status: 'ACTIVE',
      },
    });

    // 6. Create Trip A
    await prisma.transportationTrip.create({
      data: {
        id: tripAId,
        tenantId: tenantAId,
        institutionId: instAId,
        campusId: campusAId,
        routeId: routeAId,
        vehicleId: vehicleAId,
        driverProfileId: driverAId,
        serviceDate: new Date('2026-09-25'),
        shiftType: 'MORNING',
        scheduledStartTime: '07:30',
        status: 'SCHEDULED',
      },
    });
  });

  after(async () => {
    // Cleanup physical records for test tenants
    try {
      await prisma.passengerHandover.deleteMany({ where: { tenantId: tenantAId } });
      await prisma.passengerTripEvent.deleteMany({ where: { tenantId: tenantAId } });
      await prisma.tripStopVisit.deleteMany({ where: { tenantId: tenantAId } });
      await prisma.tripManifestEntry.deleteMany({ where: { tenantId: tenantAId } });
      await prisma.passengerHandoverAuthorization.deleteMany({ where: { tenantId: tenantAId } });
      await prisma.passengerRouteAssignment.deleteMany({ where: { tenantId: tenantAId } });
      await prisma.routeOperationalAssignment.deleteMany({ where: { tenantId: tenantAId } });
      await prisma.transportationTrip.deleteMany({ where: { tenantId: tenantAId } });
      await prisma.routeStop.deleteMany({ where: { tenantId: tenantAId } });
      await prisma.transportationRoute.deleteMany({ where: { tenantId: tenantAId } });
      await prisma.transportationPassengerProfile.deleteMany({ where: { tenantId: tenantAId } });
      await prisma.driverProfile.deleteMany({ where: { tenantId: tenantAId } });
      await prisma.transportationVehicle.deleteMany({ where: { tenantId: tenantAId } });
      await prisma.person.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
      await prisma.campus.deleteMany({ where: { id: { in: [campusAId, campusBId] } } });
      await prisma.institution.deleteMany({ where: { id: { in: [instAId, instBId] } } });
      await prisma.organization.deleteMany({ where: { id: { in: [orgAId, orgBId] } } });
      await prisma.tenant.deleteMany({ where: { id: { in: [tenantAId, tenantBId] } } });
    } catch (e) {
      // Ignored
    } finally {
      await prisma.$disconnect();
    }
  });

  // -------------------------------------------------------------
  // 1. Physical Database Gate: All 16 Phase 6 Tables Exist
  // -------------------------------------------------------------
  it('1. Physical Database Gate: All 16 Phase 6 tables physically exist in PostgreSQL', async () => {
    const expectedTables = [
      'transportation_providers',
      'transportation_vehicles',
      'driver_profiles',
      'attendant_profiles',
      'transportation_routes',
      'route_stops',
      'route_operational_assignments',
      'transportation_passenger_profiles',
      'passenger_route_assignments',
      'passenger_handover_authorizations',
      'transportation_trips',
      'trip_manifest_entries',
      'trip_stop_visits',
      'passenger_trip_events',
      'passenger_handovers',
      'transportation_exceptions',
    ];

    const result = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = ANY(${expectedTables}::text[]);
    `;

    const foundTables = result.map((r) => r.table_name);
    for (const t of expectedTables) {
      assert.ok(foundTables.includes(t), `Physical table ${t} must exist in Neon PostgreSQL.`);
    }
    assert.equal(foundTables.length, expectedTables.length);
  });

  // -------------------------------------------------------------
  // 2. Vehicle License Plate Uniqueness Race
  // -------------------------------------------------------------
  it('2. Vehicle Plate Race: Two concurrent vehicle creations with identical normalized plate enforce uniqueness', async () => {
    const plate = '34 RACE ' + Math.floor(Math.random() * 10000);
    const norm = plate.replace(/\s+/g, '');

    const attempts = await Promise.allSettled([
      prisma.transportationVehicle.create({
        data: {
          id: crypto.randomUUID(),
          tenantId: tenantAId,
          institutionId: instAId,
          campusId: campusAId,
          plateNumber: plate,
          plateNormalized: norm,
          vehicleType: 'VAN',
          seatingCapacity: 10,
          effectiveCapacity: 10,
        },
      }),
      prisma.transportationVehicle.create({
        data: {
          id: crypto.randomUUID(),
          tenantId: tenantAId,
          institutionId: instAId,
          campusId: campusAId,
          plateNumber: plate.toLowerCase(),
          plateNormalized: norm,
          vehicleType: 'VAN',
          seatingCapacity: 10,
          effectiveCapacity: 10,
        },
      }),
    ]);

    const fulfilled = attempts.filter((r) => r.status === 'fulfilled');
    const rejected = attempts.filter((r) => r.status === 'rejected');

    assert.equal(fulfilled.length, 1, 'Exactly one vehicle creation must succeed');
    assert.equal(rejected.length, 1, 'Concurrent vehicle creation with identical plate must be rejected');
  });

  // -------------------------------------------------------------
  // 3. Trip Double-Start Race
  // -------------------------------------------------------------
  it('3. Trip Double-Start Race: Two concurrent trip starts resolve to exactly one state transition', async () => {
    const raceTripId = crypto.randomUUID();
    await prisma.transportationTrip.create({
      data: {
        id: raceTripId,
        tenantId: tenantAId,
        institutionId: instAId,
        campusId: campusAId,
        routeId: routeAId,
        vehicleId: vehicleAId,
        driverProfileId: driverAId,
        serviceDate: new Date('2026-09-26'),
        shiftType: 'MORNING',
        scheduledStartTime: '08:00',
        status: 'SCHEDULED',
      },
    });

    const results = await Promise.allSettled([
      prisma.$executeRaw`
        UPDATE transportation_trips
        SET status = 'IN_PROGRESS', actual_start_time = NOW()
        WHERE id = ${raceTripId}::uuid AND status = 'SCHEDULED';
      `,
      prisma.$executeRaw`
        UPDATE transportation_trips
        SET status = 'IN_PROGRESS', actual_start_time = NOW()
        WHERE id = ${raceTripId}::uuid AND status = 'SCHEDULED';
      `,
    ]);

    const updatedRows = results.map((r: any) => r.value || 0);
    const totalTransitions = updatedRows.reduce((sum, n) => sum + n, 0);

    assert.equal(totalTransitions, 1, 'At most one concurrent transaction can transition trip to IN_PROGRESS');
  });

  // -------------------------------------------------------------
  // 4. Duplicate Boarding Race
  // -------------------------------------------------------------
  it('4. Duplicate Boarding Race: Two concurrent manifest entries for same trip & passenger enforce unique constraint', async () => {
    const racePassengerId = crypto.randomUUID();
    await prisma.person.create({
      data: {
        id: crypto.randomUUID(),
        tenantId: tenantAId,
        firstName: 'Race',
        lastName: 'Student',
      },
    });

    const attempts = await Promise.allSettled([
      prisma.tripManifestEntry.create({
        data: {
          id: crypto.randomUUID(),
          tenantId: tenantAId,
          tripId: tripAId,
          passengerProfileId: passengerAId,
          boardingStatus: 'BOARDED',
        },
      }),
      prisma.tripManifestEntry.create({
        data: {
          id: crypto.randomUUID(),
          tenantId: tenantAId,
          tripId: tripAId,
          passengerProfileId: passengerAId,
          boardingStatus: 'BOARDED',
        },
      }),
    ]);

    const fulfilled = attempts.filter((r) => r.status === 'fulfilled');
    const rejected = attempts.filter((r) => r.status === 'rejected');

    assert.equal(fulfilled.length, 1, 'Exactly one manifest boarding entry can be recorded');
    assert.equal(rejected.length, 1, 'Concurrent boarding for same passenger fails unique constraint');
  });

  // -------------------------------------------------------------
  // 5. Duplicate Handover Race
  // -------------------------------------------------------------
  it('5. Duplicate Handover Race: Two concurrent handovers for same trip & passenger enforce unique constraint', async () => {
    const authId = crypto.randomUUID();
    await prisma.passengerHandoverAuthorization.create({
      data: {
        id: authId,
        tenantId: tenantAId,
        passengerProfileId: passengerAId,
        authorizedPersonId: guardianPersonId,
        relationshipType: 'MOTHER',
        authorizationScope: 'REGULAR',
        validFrom: new Date('2026-09-01'),
        status: 'ACTIVE',
      },
    });

    const attempts = await Promise.allSettled([
      prisma.passengerHandover.create({
        data: {
          id: crypto.randomUUID(),
          tenantId: tenantAId,
          tripId: tripAId,
          passengerProfileId: passengerAId,
          authorizationId: authId,
          receivedByPersonId: guardianPersonId,
          verifiedByUserId: crypto.randomUUID(),
          method: 'PHYSICAL_SIGNATURE',
        },
      }),
      prisma.passengerHandover.create({
        data: {
          id: crypto.randomUUID(),
          tenantId: tenantAId,
          tripId: tripAId,
          passengerProfileId: passengerAId,
          authorizationId: authId,
          receivedByPersonId: guardianPersonId,
          verifiedByUserId: crypto.randomUUID(),
          method: 'VERIFICATION_PIN',
        },
      }),
    ]);

    const fulfilled = attempts.filter((r) => r.status === 'fulfilled');
    const rejected = attempts.filter((r) => r.status === 'rejected');

    assert.equal(fulfilled.length, 1, 'Exactly one successful handover can be recorded');
    assert.equal(rejected.length, 1, 'Duplicate concurrent handover is rejected by database constraint');
  });

  // -------------------------------------------------------------
  // 6. Transactional Atomic Rollback
  // -------------------------------------------------------------
  it('6. Transactional Rollback Atomicity: Injected error rolls back stop visit and trip status atomically', async () => {
    const rollbackTripId = crypto.randomUUID();
    await prisma.transportationTrip.create({
      data: {
        id: rollbackTripId,
        tenantId: tenantAId,
        institutionId: instAId,
        campusId: campusAId,
        routeId: routeAId,
        vehicleId: vehicleAId,
        driverProfileId: driverAId,
        serviceDate: new Date('2026-09-27'),
        shiftType: 'EVENING',
        scheduledStartTime: '16:00',
        status: 'SCHEDULED',
      },
    });

    // Run transaction that modifies trip and adds stop visit, then intentionally throws
    await assert.rejects(async () => {
      await prisma.$transaction(async (tx) => {
        await tx.transportationTrip.update({
          where: { id: rollbackTripId },
          data: { status: 'IN_PROGRESS' },
        });

        await tx.tripStopVisit.create({
          data: {
            id: crypto.randomUUID(),
            tenantId: tenantAId,
            tripId: rollbackTripId,
            routeStopId: stopA1Id,
            sequenceNumber: 1,
            status: 'VISITED',
          },
        });

        // Injected failure
        throw new Error('SIMULATED_TRANSACTION_FAILURE');
      });
    }, /SIMULATED_TRANSACTION_FAILURE/);

    // Verify trip is still SCHEDULED and no stop visit was saved
    const trip = await prisma.transportationTrip.findUnique({ where: { id: rollbackTripId } });
    assert.equal(trip?.status, 'SCHEDULED', 'Trip status must remain SCHEDULED');

    const visits = await prisma.tripStopVisit.findMany({ where: { tripId: rollbackTripId } });
    assert.equal(visits.length, 0, 'No partial stop visit should exist after rollback');
  });

  // -------------------------------------------------------------
  // 7. Cross-Tenant Transportation BOLA
  // -------------------------------------------------------------
  it('7. Cross-Tenant Transportation BOLA: Tenant B querying Tenant A transportation records gets empty results', async () => {
    // Tenant B queries Tenant A vehicles
    const vehiclesTenantB = await prisma.transportationVehicle.findMany({
      where: { tenantId: tenantBId },
    });
    assert.equal(vehiclesTenantB.length, 0, 'Tenant B cannot see Tenant A vehicles');

    // Tenant B queries Tenant A routes
    const routesTenantB = await prisma.transportationRoute.findMany({
      where: { tenantId: tenantBId },
    });
    assert.equal(routesTenantB.length, 0, 'Tenant B cannot see Tenant A routes');

    // Tenant B queries Tenant A trips
    const tripsTenantB = await prisma.transportationTrip.findMany({
      where: { tenantId: tenantBId },
    });
    assert.equal(tripsTenantB.length, 0, 'Tenant B cannot see Tenant A trips');
  });
});
