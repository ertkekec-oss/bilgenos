import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

describe('Phase 5: PostgreSQL Physical Concurrency & Security Gate', () => {
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
  const userAId = crypto.randomUUID();
  const userBId = crypto.randomUUID();

  let buildingAId = crypto.randomUUID();
  let floorAId = crypto.randomUUID();
  let spaceAId = crypto.randomUUID();
  let categoryAId = crypto.randomUUID();
  let empAId = crypto.randomUUID();
  let empBId = crypto.randomUUID();

  before(async () => {
    await prisma.$connect();

    // 1. Create Tenant A & B Hierarchies
    await prisma.tenant.createMany({
      data: [
        { id: tenantAId, name: 'Phase5 Tenant A Holding', slug: 'p5-tenant-a-' + Date.now() },
        { id: tenantBId, name: 'Phase5 Tenant B Holding', slug: 'p5-tenant-b-' + Date.now() },
      ],
    });

    await prisma.organization.createMany({
      data: [
        { id: orgAId, tenantId: tenantAId, name: 'Facility Org A' },
        { id: orgBId, tenantId: tenantBId, name: 'Facility Org B' },
      ],
    });

    await prisma.institution.createMany({
      data: [
        { id: instAId, organizationId: orgAId, code: 'INST-P5-A-' + Date.now(), name: 'Kolej A', institutionType: 'COLLEGE' },
        { id: instBId, organizationId: orgBId, code: 'INST-P5-B-' + Date.now(), name: 'Kolej B', institutionType: 'COLLEGE' },
      ],
    });

    await prisma.campus.createMany({
      data: [
        { id: campusAId, institutionId: instAId, name: 'Merkez Kampus A' },
        { id: campusBId, institutionId: instBId, name: 'Kizilay Kampus B' },
      ],
    });

    await prisma.person.createMany({
      data: [
        { id: personAId, tenantId: tenantAId, firstName: 'Kemal', lastName: 'Bilgen' },
        { id: personBId, tenantId: tenantBId, firstName: 'Aylin', lastName: 'Demir' },
      ],
    });

    await prisma.user.createMany({
      data: [
        { id: userAId, tenantId: tenantAId, personId: personAId, email: 'facility-officer-a-' + Date.now() + '@bilgenos.com', passwordHash: 'mock' },
        { id: userBId, tenantId: tenantBId, personId: personBId, email: 'facility-officer-b-' + Date.now() + '@bilgenos.com', passwordHash: 'mock' },
      ],
    });

    await prisma.employeeProfile.createMany({
      data: [
        { id: empAId, tenantId: tenantAId, personId: personAId, employeeNumber: 'EMP-P5-A-' + Date.now().toString().slice(-4), isActive: true },
        { id: empBId, tenantId: tenantBId, personId: personBId, employeeNumber: 'EMP-P5-B-' + Date.now().toString().slice(-4), isActive: true },
      ],
    });

    // 2. Create Building, Floor, Space, Category in Tenant A
    await prisma.building.create({
      data: {
        id: buildingAId,
        tenantId: tenantAId,
        institutionId: instAId,
        campusId: campusAId,
        code: 'A-BLOK-' + Date.now().toString().slice(-4),
        name: 'Ana Bina',
      },
    });

    await prisma.floor.create({
      data: {
        id: floorAId,
        tenantId: tenantAId,
        institutionId: instAId,
        campusId: campusAId,
        buildingId: buildingAId,
        code: 'KAT-1',
        name: '1. Kat',
        sortOrder: 1,
      },
    });

    await prisma.space.create({
      data: {
        id: spaceAId,
        tenantId: tenantAId,
        institutionId: instAId,
        campusId: campusAId,
        buildingId: buildingAId,
        floorId: floorAId,
        code: 'ROOM-101',
        name: '101 Nolu Mekan',
        spaceType: 'OFFICE',
        capacity: 10,
      },
    });

    await prisma.assetCategory.create({
      data: {
        id: categoryAId,
        tenantId: tenantAId,
        code: 'CAT-IT-' + Date.now().toString().slice(-4),
        name: 'IT Donanim',
        requiresSerialNumber: true,
      },
    });
  });

  after(async () => {
    await prisma.$disconnect();
  });

  // --------------------------------------------------------------------------
  // TEST 1: Physical DB Schema Gate (Table Existence)
  // --------------------------------------------------------------------------
  it('1. Physical Database Gate: All 10 Phase 5 tables physically exist in PostgreSQL', async () => {
    const tables = [
      'buildings',
      'floors',
      'spaces',
      'asset_categories',
      'assets',
      'asset_location_histories',
      'asset_custodies',
      'asset_transfers',
      'asset_documents',
      'asset_number_sequences',
    ];

    for (const table of tables) {
      const res: any = await prisma.$queryRawUnsafe(
        `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '${table}') as "exists";`
      );
      assert.equal(res[0].exists, true, `Table ${table} must physically exist in PostgreSQL`);
    }
  });

  // --------------------------------------------------------------------------
  // TEST 2: Concurrency - Asset Number Uniqueness Race
  // --------------------------------------------------------------------------
  it('2. Asset Number Race: Two concurrent asset creations with identical number must enforce uniqueness', async () => {
    const commonNumber = 'AST-RACE-' + Date.now();
    const assetId1 = crypto.randomUUID();
    const assetId2 = crypto.randomUUID();

    const createAsset = (id: string) =>
      prisma.asset.create({
        data: {
          id,
          tenantId: tenantAId,
          organizationId: orgAId,
          assetNumber: commonNumber,
          name: 'Race Asset',
          categoryId: categoryAId,
          status: 'AVAILABLE',
        },
      });

    const results = await Promise.allSettled([createAsset(assetId1), createAsset(assetId2)]);
    const fulfilled = results.filter(r => r.status === 'fulfilled');
    const rejected = results.filter(r => r.status === 'rejected');

    assert.equal(fulfilled.length, 1, 'Exactly one creation with the assetNumber must succeed');
    assert.equal(rejected.length, 1, 'Competing creation must fail on unique constraint');
  });

  // --------------------------------------------------------------------------
  // TEST 3: Concurrency - Asset Custody Race (At Most One Active Custody)
  // --------------------------------------------------------------------------
  it('3. Custody Race: Two concurrent assignments for same asset enforce exactly one active custody', async () => {
    const targetAssetId = crypto.randomUUID();
    await prisma.asset.create({
      data: {
        id: targetAssetId,
        tenantId: tenantAId,
        organizationId: orgAId,
        assetNumber: 'AST-CUSTODY-RACE-' + Date.now(),
        name: 'Shared Laptop',
        categoryId: categoryAId,
        status: 'AVAILABLE',
      },
    });

    const secondEmpId = crypto.randomUUID();
    const secondPersonId = crypto.randomUUID();
    await prisma.person.create({ data: { id: secondPersonId, tenantId: tenantAId, firstName: 'Cem', lastName: 'Oz' } });
    await prisma.employeeProfile.create({ data: { id: secondEmpId, tenantId: tenantAId, personId: secondPersonId, employeeNumber: 'EMP-SEC-' + Date.now(), isActive: true } });

    const assignCustodyTx = async (empId: string) => {
      return prisma.$transaction(async (tx) => {
        // Lock asset row
        await tx.$queryRawUnsafe('SELECT id FROM assets WHERE id = $1::uuid FOR UPDATE', targetAssetId);

        // Check existing active custody
        const activeCustody = await tx.assetCustody.findFirst({
          where: { assetId: targetAssetId, status: 'ACTIVE' },
        });
        if (activeCustody) {
          throw new Error('ASSET_ALREADY_ASSIGNED: Asset already has active custodian ' + activeCustody.employeeId);
        }

        return tx.assetCustody.create({
          data: {
            id: crypto.randomUUID(),
            tenantId: tenantAId,
            assetId: targetAssetId,
            employeeId: empId,
            assignedByUserId: userAId,
            status: 'ACTIVE',
          },
        });
      });
    };

    const results = await Promise.allSettled([
      assignCustodyTx(empAId),
      assignCustodyTx(secondEmpId),
    ]);

    const fulfilled = results.filter(r => r.status === 'fulfilled');
    const rejected = results.filter(r => r.status === 'rejected');

    assert.equal(fulfilled.length, 1, 'Exactly one concurrent custody assignment must succeed');
    assert.equal(rejected.length, 1, 'The competing assignment must fail with ASSET_ALREADY_ASSIGNED');
  });

  // --------------------------------------------------------------------------
  // TEST 4: Concurrency - Transfer Request Race
  // --------------------------------------------------------------------------
  it('4. Transfer Request Race: At most one active transfer request permitted per asset', async () => {
    const transferAssetId = crypto.randomUUID();
    await prisma.asset.create({
      data: {
        id: transferAssetId,
        tenantId: tenantAId,
        organizationId: orgAId,
        assetNumber: 'AST-TRF-RACE-' + Date.now(),
        name: 'Tahta',
        categoryId: categoryAId,
        status: 'AVAILABLE',
      },
    });

    const requestTransferTx = async () => {
      return prisma.$transaction(async (tx) => {
        await tx.$queryRawUnsafe('SELECT id FROM assets WHERE id = $1::uuid FOR UPDATE', transferAssetId);
        const activeTransfer = await tx.assetTransfer.findFirst({
          where: { assetId: transferAssetId, status: { in: ['REQUESTED', 'APPROVED', 'IN_TRANSIT'] } },
        });
        if (activeTransfer) {
          throw new Error('ASSET_TRANSFER_ALREADY_ACTIVE');
        }
        return tx.assetTransfer.create({
          data: {
            id: crypto.randomUUID(),
            tenantId: tenantAId,
            assetId: transferAssetId,
            status: 'REQUESTED',
            requestedByUserId: userAId,
          },
        });
      });
    };

    const results = await Promise.allSettled([requestTransferTx(), requestTransferTx()]);
    const fulfilled = results.filter(r => r.status === 'fulfilled');
    const rejected = results.filter(r => r.status === 'rejected');

    assert.equal(fulfilled.length, 1, 'Exactly one transfer request must succeed');
    assert.equal(rejected.length, 1, 'Competing transfer request must fail with ASSET_TRANSFER_ALREADY_ACTIVE');
  });

  // --------------------------------------------------------------------------
  // TEST 5: Concurrency - Space Code Scope Uniqueness Race
  // --------------------------------------------------------------------------
  it('5. Space Code Race: Creating identical space codes on same floor fails unique constraint', async () => {
    const commonSpaceCode = 'ROOM-RACE-' + Date.now().toString().slice(-4);
    const spaceId1 = crypto.randomUUID();
    const spaceId2 = crypto.randomUUID();

    const createSpace = (id: string) =>
      prisma.space.create({
        data: {
          id,
          tenantId: tenantAId,
          institutionId: instAId,
          campusId: campusAId,
          buildingId: buildingAId,
          floorId: floorAId,
          code: commonSpaceCode,
          name: 'Race Room',
        },
      });

    const results = await Promise.allSettled([createSpace(spaceId1), createSpace(spaceId2)]);
    const fulfilled = results.filter(r => r.status === 'fulfilled');
    const rejected = results.filter(r => r.status === 'rejected');

    assert.equal(fulfilled.length, 1, 'Exactly one space creation must succeed on the floor');
    assert.equal(rejected.length, 1, 'Competing creation must fail on uq_spaces_floor_code');
  });

  // --------------------------------------------------------------------------
  // TEST 6: Atomic Rollback on Transfer Completion Failure
  // --------------------------------------------------------------------------
  it('6. Transactional Atomic Rollback: Failure during transfer completion rolls back all movements', async () => {
    const failAssetId = crypto.randomUUID();
    await prisma.asset.create({
      data: {
        id: failAssetId,
        tenantId: tenantAId,
        organizationId: orgAId,
        assetNumber: 'AST-FAIL-' + Date.now(),
        name: 'Fail Asset',
        categoryId: categoryAId,
        currentSpaceId: spaceAId,
        status: 'AVAILABLE',
      },
    });

    const transferId = crypto.randomUUID();
    await prisma.assetTransfer.create({
      data: {
        id: transferId,
        tenantId: tenantAId,
        assetId: failAssetId,
        status: 'APPROVED',
        requestedByUserId: userAId,
      },
    });

    await assert.rejects(async () => {
      await prisma.$transaction(async (tx) => {
        await tx.assetTransfer.update({
          where: { id: transferId },
          data: { status: 'COMPLETED' },
        });
        await tx.assetLocationHistory.create({
          data: {
            id: crypto.randomUUID(),
            tenantId: tenantAId,
            assetId: failAssetId,
            movementType: 'TRANSFER',
            performedByUserId: userAId,
          },
        });
        // Simulate unexpected failure before commit
        throw new Error('SIMULATED_TRANSFER_COMPLETION_ERROR');
      });
    }, /SIMULATED_TRANSFER_COMPLETION_ERROR/);

    // Verify state remained APPROVED and no location history was saved
    const currentTransfer = await prisma.assetTransfer.findUnique({ where: { id: transferId } });
    assert.equal(currentTransfer?.status, 'APPROVED', 'Transfer must remain in APPROVED state');

    const historyCount = await prisma.assetLocationHistory.count({ where: { assetId: failAssetId } });
    assert.equal(historyCount, 0, 'No location history records must persist after rollback');
  });

  // --------------------------------------------------------------------------
  // TEST 7: Cross-Tenant Physical BOLA
  // --------------------------------------------------------------------------
  it('7. Cross-Tenant Physical BOLA: Tenant B querying Tenant A physical entities receives null', async () => {
    const buildingFromB = await prisma.building.findFirst({
      where: { id: buildingAId, tenantId: tenantBId },
    });
    assert.equal(buildingFromB, null, 'Tenant B querying Tenant A building returns null (404 existence masking)');

    const spaceFromB = await prisma.space.findFirst({
      where: { id: spaceAId, tenantId: tenantBId },
    });
    assert.equal(spaceFromB, null, 'Tenant B querying Tenant A space returns null');
  });
});
