import {
  RequestTenantContext,
  UUID,
  CreateBuildingDto,
  BuildingDto,
  CreateFloorDto,
  FloorDto,
  CreateSpaceDto,
  SpaceDto,
  SpaceStatus,
  CreateAssetCategoryDto,
  AssetCategoryDto,
  CreateAssetDto,
  AssetDto,
  MovementType,
  AssetCustodyDto,
  AssetTransferDto,
} from '@bilgenos/contracts';
import {
  Building,
  Floor,
  Space,
  AssetCategory,
  Asset,
  AssetCustody,
  AssetTransfer,
  DomainError,
  InvariantViolationError,
} from '@bilgenos/domain';
import {
  globalDbStorage,
  InMemoryScopedBuildingRepository,
  InMemoryScopedFloorRepository,
  InMemoryScopedSpaceRepository,
  InMemoryScopedAssetCategoryRepository,
  InMemoryScopedAssetRepository,
  InMemoryScopedAssetLocationHistoryRepository,
  InMemoryScopedAssetCustodyRepository,
  InMemoryScopedAssetTransferRepository,
} from '../in-memory/in-memory-scoped-repository.js';

export class PhysicalStructureService {
  private buildingRepo: InMemoryScopedBuildingRepository;
  private floorRepo: InMemoryScopedFloorRepository;
  private spaceRepo: InMemoryScopedSpaceRepository;

  constructor(private context: RequestTenantContext) {
    this.buildingRepo = new InMemoryScopedBuildingRepository(context);
    this.floorRepo = new InMemoryScopedFloorRepository(context);
    this.spaceRepo = new InMemoryScopedSpaceRepository(context);
  }

  public async createBuilding(dto: CreateBuildingDto): Promise<BuildingDto> {
    const building = new Building({
      id: crypto.randomUUID(),
      tenantId: this.context.tenantId,
      institutionId: dto.institutionId,
      campusId: dto.campusId,
      code: dto.code,
      name: dto.name,
      buildingType: dto.buildingType || 'EDUCATION',
      status: 'ACTIVE',
      openedAt: dto.openedAt ? new Date(dto.openedAt) : undefined,
    });

    return this.buildingRepo.create({
      id: building.id,
      institutionId: building.institutionId,
      campusId: building.campusId,
      code: building.code,
      name: building.name,
      buildingType: building.buildingType,
      status: building.currentStatus,
      openedAt: building.openedAt?.toISOString().split('T')[0],
    });
  }

  public async createFloor(dto: CreateFloorDto): Promise<FloorDto> {
    const floor = new Floor({
      id: crypto.randomUUID(),
      tenantId: this.context.tenantId,
      institutionId: dto.institutionId,
      campusId: dto.campusId,
      buildingId: dto.buildingId,
      code: dto.code,
      name: dto.name,
      levelNumber: dto.levelNumber,
      sortOrder: dto.sortOrder || 0,
      status: 'ACTIVE',
    });

    return this.floorRepo.create({
      id: floor.id,
      institutionId: floor.institutionId,
      campusId: floor.campusId,
      buildingId: floor.buildingId,
      code: floor.code,
      name: floor.name,
      levelNumber: floor.levelNumber,
      sortOrder: floor.sortOrder,
      status: floor.currentStatus,
    });
  }

  public async createSpace(dto: CreateSpaceDto): Promise<SpaceDto> {
    const space = new Space({
      id: crypto.randomUUID(),
      tenantId: this.context.tenantId,
      institutionId: dto.institutionId,
      campusId: dto.campusId,
      buildingId: dto.buildingId,
      floorId: dto.floorId,
      code: dto.code,
      name: dto.name,
      spaceType: dto.spaceType,
      capacity: dto.capacity,
      areaSquareMeters: dto.areaSquareMeters,
      status: 'ACTIVE',
    });

    return this.spaceRepo.create({
      id: space.id,
      institutionId: space.institutionId,
      campusId: space.campusId,
      buildingId: space.buildingId,
      floorId: space.floorId,
      code: space.code,
      name: space.name,
      spaceType: space.spaceType,
      capacity: space.capacity,
      areaSquareMeters: space.areaSquareMeters,
      status: space.currentStatus,
    });
  }

  public async updateSpaceStatus(spaceId: UUID, status: SpaceStatus): Promise<SpaceDto> {
    const spaceData = await this.spaceRepo.findById(spaceId);
    if (!spaceData) throw new DomainError(`Space ${spaceId} not found`);
    return this.spaceRepo.update(spaceId, { status });
  }

  public async resolveLocationPath(spaceId: UUID): Promise<string> {
    const space = await this.spaceRepo.findById(spaceId);
    if (!space) return 'Bilinmeyen Konum';
    const floor = await this.floorRepo.findById(space.floorId);
    const building = floor ? await this.buildingRepo.findById(floor.buildingId) : null;
    return `${building ? building.name : 'Bina'} / ${floor ? floor.name : 'Kat'} / ${space.name}`;
  }
}

export class AssetOperationsService {
  private categoryRepo: InMemoryScopedAssetCategoryRepository;
  private assetRepo: InMemoryScopedAssetRepository;
  private locationRepo: InMemoryScopedAssetLocationHistoryRepository;
  private custodyRepo: InMemoryScopedAssetCustodyRepository;
  private transferRepo: InMemoryScopedAssetTransferRepository;

  constructor(private context: RequestTenantContext) {
    this.categoryRepo = new InMemoryScopedAssetCategoryRepository(context);
    this.assetRepo = new InMemoryScopedAssetRepository(context);
    this.locationRepo = new InMemoryScopedAssetLocationHistoryRepository(context);
    this.custodyRepo = new InMemoryScopedAssetCustodyRepository(context);
    this.transferRepo = new InMemoryScopedAssetTransferRepository(context);
  }

  public async createAssetCategory(dto: CreateAssetCategoryDto): Promise<AssetCategoryDto> {
    const cat = new AssetCategory({
      id: crypto.randomUUID(),
      tenantId: this.context.tenantId,
      code: dto.code,
      name: dto.name,
      description: dto.description,
      requiresSerialNumber: dto.requiresSerialNumber ?? false,
      warrantyTracked: dto.warrantyTracked ?? true,
      maintenanceRelevant: dto.maintenanceRelevant ?? true,
      isActive: true,
    });

    return this.categoryRepo.create({
      id: cat.id,
      code: cat.code,
      name: cat.name,
      description: cat.description,
      requiresSerialNumber: cat.requiresSerialNumber,
      warrantyTracked: cat.warrantyTracked,
      maintenanceRelevant: cat.maintenanceRelevant,
      isActive: cat.isActive,
    });
  }

  public async createAsset(dto: CreateAssetDto, performedByUserId: UUID): Promise<AssetDto> {
    // Generate sequential assetNumber
    const seqKey = `${this.context.tenantId}:AST`;
    const curSeq = (globalDbStorage.assetNumberSequences.get(seqKey) || 0) + 1;
    globalDbStorage.assetNumberSequences.set(seqKey, curSeq);
    const assetNumber = dto.assetNumber || `AST-2026-${String(curSeq).padStart(6, '0')}`;

    const asset = new Asset({
      id: crypto.randomUUID(),
      tenantId: this.context.tenantId,
      organizationId: dto.organizationId,
      institutionId: dto.institutionId,
      assetNumber,
      assetTag: dto.assetTag,
      name: dto.name,
      description: dto.description,
      categoryId: dto.categoryId,
      manufacturer: dto.manufacturer,
      model: dto.model,
      serialNumber: dto.serialNumber,
      acquisitionDate: dto.acquisitionDate ? new Date(dto.acquisitionDate) : undefined,
      purchaseCostMinor: dto.purchaseCostMinor ? BigInt(dto.purchaseCostMinor) : undefined,
      purchaseCurrency: dto.purchaseCurrency || 'TRY',
      warrantyStartDate: dto.warrantyStartDate ? new Date(dto.warrantyStartDate) : undefined,
      warrantyEndDate: dto.warrantyEndDate ? new Date(dto.warrantyEndDate) : undefined,
      status: 'AVAILABLE',
      condition: 'GOOD',
      currentSpaceId: dto.initialSpaceId,
    });

    const savedAsset = await this.assetRepo.create({
      id: asset.id,
      organizationId: asset.organizationId,
      institutionId: asset.institutionId,
      assetNumber: asset.assetNumber,
      assetTag: asset.assetTag,
      name: asset.name,
      description: asset.description,
      categoryId: asset.categoryId,
      manufacturer: asset.manufacturer,
      model: asset.model,
      serialNumber: asset.serialNumber,
      acquisitionDate: asset.acquisitionDate?.toISOString().split('T')[0],
      purchaseCostMinor: asset.purchaseCostMinor?.toString(),
      purchaseCurrency: asset.purchaseCurrency,
      warrantyStartDate: asset.warrantyStartDate?.toISOString().split('T')[0],
      warrantyEndDate: asset.warrantyEndDate?.toISOString().split('T')[0],
      status: asset.currentStatus,
      condition: asset.currentCondition,
      currentSpaceId: asset.currentAssignedSpaceId,
    });

    if (dto.initialSpaceId) {
      await this.locationRepo.create({
        id: crypto.randomUUID(),
        assetId: asset.id,
        toSpaceId: dto.initialSpaceId,
        effectiveAt: new Date().toISOString(),
        movementType: 'INITIAL_PLACEMENT',
        reason: 'İlk yerleşim',
        performedByUserId,
      });
    }

    return savedAsset;
  }

  public async moveLocation(
    assetId: UUID,
    toSpaceId: UUID,
    movementType: MovementType,
    reason: string,
    performedByUserId: UUID
  ): Promise<void> {
    const asset = await this.assetRepo.findById(assetId);
    if (!asset) throw new DomainError(`Asset ${assetId} not found`);
    if (asset.status === 'DISPOSED') throw new DomainError('Disposed asset cannot be moved.');

    const fromSpaceId = asset.currentSpaceId;

    await this.assetRepo.update(assetId, { currentSpaceId: toSpaceId });
    await this.locationRepo.create({
      id: crypto.randomUUID(),
      assetId,
      fromSpaceId,
      toSpaceId,
      effectiveAt: new Date().toISOString(),
      movementType,
      reason,
      performedByUserId,
    });
  }

  public async assignCustody(
    assetId: UUID,
    employeeId: UUID,
    assignedByUserId: UUID,
    notes?: string
  ): Promise<AssetCustodyDto> {
    const active = await this.custodyRepo.findActiveByAsset(assetId);
    if (active) {
      throw new InvariantViolationError(`Asset ${assetId} already has active custodian: ${active.employeeId}`);
    }

    const asset = await this.assetRepo.findById(assetId);
    if (!asset) throw new DomainError(`Asset ${assetId} not found`);
    if (asset.status === 'DISPOSED' || asset.status === 'RETIRED' || asset.status === 'IN_REPAIR') {
      throw new DomainError(`Cannot assign custody for asset in status ${asset.status}`);
    }

    const custody = new AssetCustody({
      id: crypto.randomUUID(),
      tenantId: this.context.tenantId,
      assetId,
      employeeId,
      assignedAt: new Date(),
      status: 'ACTIVE',
      assignedByUserId,
      notes,
    });

    await this.assetRepo.update(assetId, { status: 'IN_USE' });

    return this.custodyRepo.create({
      id: custody.id,
      assetId: custody.assetId,
      employeeId: custody.employeeId,
      assignedAt: custody.assignedAt.toISOString(),
      status: custody.currentStatus,
      assignedByUserId: custody.assignedByUserId,
      notes: custody.notes,
    });
  }

  public async returnCustody(assetId: UUID, returnedByUserId: UUID): Promise<void> {
    const active = await this.custodyRepo.findActiveByAsset(assetId);
    if (!active) {
      throw new DomainError(`No active custody found for asset ${assetId}`);
    }

    await this.custodyRepo.update(active.id, {
      status: 'RETURNED',
      returnedAt: new Date().toISOString(),
      returnedByUserId,
    });

    await this.assetRepo.update(assetId, { status: 'AVAILABLE' });
  }

  public async requestTransfer(dto: {
    assetId: UUID;
    fromInstitutionId?: UUID;
    fromCampusId?: UUID;
    fromSpaceId?: UUID;
    toInstitutionId?: UUID;
    toCampusId?: UUID;
    toSpaceId?: UUID;
    reason?: string;
    requestedByUserId: UUID;
  }): Promise<AssetTransferDto> {
    const activeTransfer = await this.transferRepo.findActiveByAsset(dto.assetId);
    if (activeTransfer) {
      throw new InvariantViolationError(`Asset ${dto.assetId} already has an active transfer in progress.`);
    }

    const transfer = new AssetTransfer({
      id: crypto.randomUUID(),
      tenantId: this.context.tenantId,
      assetId: dto.assetId,
      fromInstitutionId: dto.fromInstitutionId,
      fromCampusId: dto.fromCampusId,
      fromSpaceId: dto.fromSpaceId,
      toInstitutionId: dto.toInstitutionId,
      toCampusId: dto.toCampusId,
      toSpaceId: dto.toSpaceId,
      status: 'REQUESTED',
      requestedByUserId: dto.requestedByUserId,
      requestedAt: new Date(),
      reason: dto.reason,
    });

    return this.transferRepo.create({
      id: transfer.id,
      assetId: transfer.assetId,
      fromInstitutionId: transfer.fromInstitutionId,
      fromCampusId: transfer.fromCampusId,
      fromSpaceId: transfer.fromSpaceId,
      toInstitutionId: transfer.toInstitutionId,
      toCampusId: transfer.toCampusId,
      toSpaceId: transfer.toSpaceId,
      status: transfer.currentStatus,
      requestedByUserId: transfer.requestedByUserId,
      requestedAt: transfer.requestedAt.toISOString(),
      reason: transfer.reason,
    });
  }

  public async approveTransfer(transferId: UUID, approverUserId: UUID): Promise<void> {
    const transferData = await this.transferRepo.findById(transferId);
    if (!transferData) throw new DomainError(`Transfer ${transferId} not found`);

    const transfer = new AssetTransfer({
      ...transferData,
      requestedAt: new Date(transferData.requestedAt),
    });
    transfer.approve(approverUserId);

    await this.transferRepo.update(transferId, {
      status: transfer.currentStatus,
      approvedByUserId: transfer.currentApprovedByUserId,
      approvedAt: transfer.currentApprovedAt?.toISOString(),
    });
  }

  public async completeTransfer(transferId: UUID, completedByUserId: UUID): Promise<void> {
    const transferData = await this.transferRepo.findById(transferId);
    if (!transferData) throw new DomainError(`Transfer ${transferId} not found`);

    const transfer = new AssetTransfer({
      ...transferData,
      requestedAt: new Date(transferData.requestedAt),
      approvedAt: transferData.approvedAt ? new Date(transferData.approvedAt) : undefined,
    });
    transfer.complete(completedByUserId);

    await this.transferRepo.update(transferId, {
      status: transfer.currentStatus,
      completedByUserId: transfer.currentCompletedByUserId,
      completedAt: transfer.currentCompletedAt?.toISOString(),
    });

    // Update asset location and institution projection
    if (transferData.toSpaceId) {
      await this.assetRepo.update(transferData.assetId, {
        currentSpaceId: transferData.toSpaceId,
        institutionId: transferData.toInstitutionId,
      });

      await this.locationRepo.create({
        id: crypto.randomUUID(),
        assetId: transferData.assetId,
        fromSpaceId: transferData.fromSpaceId,
        toSpaceId: transferData.toSpaceId,
        effectiveAt: new Date().toISOString(),
        movementType: 'TRANSFER',
        reason: 'Transfer tamamlandı',
        performedByUserId: completedByUserId,
      });
    }
  }

  public async disposeAsset(assetId: UUID, performedByUserId: UUID, reason: string): Promise<void> {
    const asset = await this.assetRepo.findById(assetId);
    if (!asset) throw new DomainError(`Asset ${assetId} not found`);
    if (asset.status === 'DISPOSED') throw new DomainError('Asset is already disposed.');

    // Check if active custody exists and return it
    const activeCustody = await this.custodyRepo.findActiveByAsset(assetId);
    if (activeCustody) {
      await this.returnCustody(assetId, performedByUserId);
    }

    await this.assetRepo.update(assetId, {
      status: 'DISPOSED',
      currentSpaceId: null,
      description: (asset.description ? asset.description + ' | ' : '') + `Hurdaya ayrıldı: ${reason}`,
    });
  }
}
