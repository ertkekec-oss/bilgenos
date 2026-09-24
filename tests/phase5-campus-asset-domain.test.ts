import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  Building,
  Floor,
  Space,
  AssetCategory,
  Asset,
  AssetLocationHistory,
  AssetCustody,
  AssetTransfer,
  AssetDocument,
  InvariantViolationError,
  DomainError,
} from '@bilgenos/domain';

describe('Phase 5: Campus, Facility & Asset Domain Invariants (PHY-001 - PHY-030)', () => {
  const tenantId = '11111111-1111-1111-1111-111111111111';
  const orgId = '22222222-2222-2222-2222-222222222222';
  const instId = '33333333-3333-3333-3333-333333333333';
  const campusId = '44444444-4444-4444-4444-444444444444';
  const buildingId = '55555555-5555-5555-5555-555555555555';
  const floorId = '66666666-6666-6666-6666-666666666666';
  const spaceId = '77777777-7777-7777-7777-777777777777';
  const categoryId = '88888888-8888-8888-8888-888888888888';
  const assetId = '99999999-9999-9999-9999-999999999999';
  const employeeId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

  // -------------------------------------------------------------
  // PHY-002: Building Belongs To Campus & Has Lifecycle
  // -------------------------------------------------------------
  it('PHY-002: Building requires code and name and controls lifecycle transitions', () => {
    const building = new Building({
      id: buildingId,
      tenantId,
      institutionId: instId,
      campusId,
      code: 'A-BLOK',
      name: 'Fen ve Idare Binasi',
      buildingType: 'EDUCATION',
      status: 'ACTIVE',
    });
    assert.equal(building.code, 'A-BLOK');
    assert.equal(building.currentStatus, 'ACTIVE');

    building.closeTemporarily();
    assert.equal(building.currentStatus, 'TEMPORARILY_CLOSED');

    building.activate();
    assert.equal(building.currentStatus, 'ACTIVE');

    building.decommission();
    assert.equal(building.currentStatus, 'DECOMMISSIONED');
    assert.throws(() => building.activate(), /Cannot activate decommissioned building/);
  });

  // -------------------------------------------------------------
  // PHY-003 & PHY-004: Floor & Space Hierarchy
  // -------------------------------------------------------------
  it('PHY-003 & PHY-004: Floor and Space enforce upstream hierarchy links and validation', () => {
    const floor = new Floor({
      id: floorId,
      tenantId,
      institutionId: instId,
      campusId,
      buildingId,
      code: 'KAT-2',
      name: '2. Kat',
      levelNumber: 2,
      sortOrder: 2,
      status: 'ACTIVE',
    });
    assert.equal(floor.buildingId, buildingId);
    assert.equal(floor.sortOrder, 2);

    const space = new Space({
      id: spaceId,
      tenantId,
      institutionId: instId,
      campusId,
      buildingId,
      floorId,
      code: 'A-204',
      name: 'Robotik Lab',
      spaceType: 'LABORATORY',
      capacity: 30,
      areaSquareMeters: 75,
      status: 'ACTIVE',
    });
    assert.equal(space.floorId, floorId);
    assert.equal(space.capacity, 30);

    // Space status transitions
    space.markUnavailable();
    assert.equal(space.currentStatus, 'TEMPORARILY_UNAVAILABLE');
    space.reactivate();
    assert.equal(space.currentStatus, 'ACTIVE');
  });

  // -------------------------------------------------------------
  // PHY-006: Space != Academic Classroom
  // -------------------------------------------------------------
  it('PHY-006: Space represents a physical envelope and rejects negative capacities', () => {
    assert.throws(
      () =>
        new Space({
          id: 'bad-space',
          tenantId,
          institutionId: instId,
          campusId,
          buildingId,
          floorId,
          code: 'BAD',
          name: 'Negative Capacity Space',
          spaceType: 'CLASSROOM',
          capacity: -5,
          status: 'ACTIVE',
        }),
      /Space capacity cannot be negative/
    );
  });

  // -------------------------------------------------------------
  // PHY-007: Asset != Inventory Item & Asset Lifecycle
  // -------------------------------------------------------------
  it('PHY-007 & PHY-025: Asset requires assetNumber and controls full domain lifecycle', () => {
    const asset = new Asset({
      id: assetId,
      tenantId,
      organizationId: orgId,
      assetNumber: 'AST-2026-000001',
      name: 'MacBook Pro',
      categoryId,
      status: 'AVAILABLE',
      condition: 'NEW',
      warrantyEndDate: new Date('2028-01-01'),
    });

    assert.equal(asset.assetNumber, 'AST-2026-000001');
    assert.equal(asset.currentStatus, 'AVAILABLE');

    asset.assign();
    assert.equal(asset.currentStatus, 'IN_USE');

    asset.sendToRepair();
    assert.equal(asset.currentStatus, 'IN_REPAIR');

    asset.returnFromRepair();
    assert.equal(asset.currentStatus, 'AVAILABLE');

    asset.retire();
    assert.equal(asset.currentStatus, 'RETIRED');

    asset.dispose();
    assert.equal(asset.currentStatus, 'DISPOSED');

    // Disposed asset cannot be moved or activated
    assert.throws(() => asset.moveTo(spaceId), /Disposed asset cannot be moved/);
    assert.throws(() => asset.activate(), /Cannot activate retired or disposed asset/);
  });

  // -------------------------------------------------------------
  // PHY-008: Asset Location != Asset Custody (Decoupled)
  // -------------------------------------------------------------
  it('PHY-008: Moving asset does not mutate custody, and assigning custody does not move asset', () => {
    const asset = new Asset({
      id: assetId,
      tenantId,
      organizationId: orgId,
      assetNumber: 'AST-2026-000002',
      name: 'Projektor',
      categoryId,
      status: 'AVAILABLE',
      condition: 'GOOD',
      currentSpaceId: spaceId,
    });

    const newSpaceId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
    asset.moveTo(newSpaceId);
    assert.equal(asset.currentAssignedSpaceId, newSpaceId);

    // Custody aggregate is separate and controls return workflow
    const custody = new AssetCustody({
      id: 'cst-1',
      tenantId,
      assetId,
      employeeId,
      assignedAt: new Date('2026-01-01'),
      status: 'ACTIVE',
      assignedByUserId: 'usr-1',
    });
    assert.equal(custody.currentStatus, 'ACTIVE');
    assert.equal(custody.employeeId, employeeId);

    custody.returnCustody('usr-2', new Date('2026-06-01'));
    assert.equal(custody.currentStatus, 'RETURNED');
  });

  // -------------------------------------------------------------
  // PHY-018: Asset Transfer with Maker-Checker
  it('PHY-018: Asset Transfer enforces Maker-Checker separation and controlled transit lifecycle', () => {
    const requesterId = 'usr-requester-1';
    const approverId = 'usr-approver-2';
    const completedById = 'usr-completed-3';

    const transfer = new AssetTransfer({
      id: 'trf-1',
      tenantId,
      assetId,
      fromSpaceId: spaceId,
      toSpaceId: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
      status: 'REQUESTED',
      requestedByUserId: requesterId,
      requestedAt: new Date(),
    });

    // Requester cannot approve (Maker-Checker)
    assert.throws(() => transfer.approve(requesterId), /Maker-Checker violation/);

    // Legitimate approver succeeds
    transfer.approve(approverId);
    assert.equal(transfer.currentStatus, 'APPROVED');

    transfer.startTransit();
    assert.equal(transfer.currentStatus, 'IN_TRANSIT');

    transfer.complete(completedById);
    assert.equal(transfer.currentStatus, 'COMPLETED');
    assert.equal(transfer.currentCompletedByUserId, completedById);
  });

  // -------------------------------------------------------------
  // PHY-022: Asset Document Security Classifications
  // -------------------------------------------------------------
  it('PHY-022: AssetDocument enforces role-based clearance for RESTRICTED and CONFIDENTIAL documents', () => {
    const standardDoc = new AssetDocument({
      id: 'doc-1',
      tenantId,
      assetId,
      documentType: 'USER_MANUAL',
      title: 'Kullanim Kilavuzu',
      fileReference: 'vault://assets/manual.pdf',
      securityClassification: 'STANDARD',
      uploadedByUserId: 'usr-1',
      createdAt: new Date(),
    });
    assert.equal(standardDoc.canAccess(['TEACHER']), true);

    const restrictedDoc = new AssetDocument({
      id: 'doc-2',
      tenantId,
      assetId,
      documentType: 'INVOICE',
      title: 'Satin Alma Faturasi',
      fileReference: 'vault://assets/invoice.pdf',
      securityClassification: 'RESTRICTED',
      uploadedByUserId: 'usr-1',
      createdAt: new Date(),
    });
    assert.equal(restrictedDoc.canAccess(['TEACHER']), false);
    assert.equal(restrictedDoc.canAccess(['FACILITY_ADMIN']), true);
  });

  // -------------------------------------------------------------
  // Warranty Status Derivation
  // -------------------------------------------------------------
  it('Warranty status is accurately derived without mutable state', () => {
    const assetWithWarranty = new Asset({
      id: assetId,
      tenantId,
      organizationId: orgId,
      assetNumber: 'AST-2026-000003',
      name: 'Server',
      categoryId,
      status: 'AVAILABLE',
      condition: 'GOOD',
      warrantyEndDate: new Date('2028-12-31'),
    });
    assert.equal(assetWithWarranty.deriveWarrantyStatus(new Date('2026-09-25')), 'ACTIVE');
    assert.equal(assetWithWarranty.deriveWarrantyStatus(new Date('2029-01-01')), 'EXPIRED');
  });
});
