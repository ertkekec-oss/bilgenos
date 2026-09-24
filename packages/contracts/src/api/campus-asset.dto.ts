import { BaseEntityDto, UUID } from '../shared/types.js';
import type { DocumentSecurityClassification } from './hr.dto.js';

// Physical Structure
export type BuildingType =
  | 'EDUCATION'
  | 'ADMINISTRATION'
  | 'SPORTS'
  | 'DORMITORY'
  | 'DINING'
  | 'WAREHOUSE'
  | 'TECHNICAL'
  | 'MIXED'
  | 'OTHER';

export type BuildingStatus =
  | 'PLANNED'
  | 'ACTIVE'
  | 'TEMPORARILY_CLOSED'
  | 'INACTIVE'
  | 'DECOMMISSIONED';

export interface BuildingDto extends BaseEntityDto {
  institutionId: UUID;
  campusId: UUID;
  code: string;
  name: string;
  buildingType: BuildingType;
  status: BuildingStatus;
  openedAt?: string;
  closedAt?: string;
}

export interface CreateBuildingDto {
  institutionId: UUID;
  campusId: UUID;
  code: string;
  name: string;
  buildingType?: BuildingType;
  openedAt?: string;
}

export type FloorStatus = 'ACTIVE' | 'INACTIVE' | 'DECOMMISSIONED';

export interface FloorDto extends BaseEntityDto {
  institutionId: UUID;
  campusId: UUID;
  buildingId: UUID;
  code: string;
  name: string;
  levelNumber?: number;
  sortOrder: number;
  status: FloorStatus;
}

export interface CreateFloorDto {
  institutionId: UUID;
  campusId: UUID;
  buildingId: UUID;
  code: string;
  name: string;
  levelNumber?: number;
  sortOrder?: number;
}

export type SpaceType =
  | 'CLASSROOM'
  | 'OFFICE'
  | 'LABORATORY'
  | 'MEETING_ROOM'
  | 'STORAGE_ROOM'
  | 'SERVER_ROOM'
  | 'CAFETERIA_AREA'
  | 'WORKSHOP'
  | 'LIBRARY_AREA'
  | 'SECURITY_ROOM'
  | 'TECHNICAL_ROOM'
  | 'OTHER';

export type SpaceStatus =
  | 'ACTIVE'
  | 'TEMPORARILY_UNAVAILABLE'
  | 'RESTRICTED'
  | 'INACTIVE'
  | 'DECOMMISSIONED';

export interface SpaceDto extends BaseEntityDto {
  institutionId: UUID;
  campusId: UUID;
  buildingId: UUID;
  floorId: UUID;
  code: string;
  name: string;
  spaceType: SpaceType;
  capacity?: number;
  areaSquareMeters?: number;
  status: SpaceStatus;
}

export interface CreateSpaceDto {
  institutionId: UUID;
  campusId: UUID;
  buildingId: UUID;
  floorId: UUID;
  code: string;
  name: string;
  spaceType: SpaceType;
  capacity?: number;
  areaSquareMeters?: number;
}

// Asset Operations
export interface AssetCategoryDto extends BaseEntityDto {
  code: string;
  name: string;
  description?: string;
  requiresSerialNumber: boolean;
  warrantyTracked: boolean;
  maintenanceRelevant: boolean;
  isActive: boolean;
}

export interface CreateAssetCategoryDto {
  code: string;
  name: string;
  description?: string;
  requiresSerialNumber?: boolean;
  warrantyTracked?: boolean;
  maintenanceRelevant?: boolean;
}

export type AssetStatus =
  | 'DRAFT'
  | 'AVAILABLE'
  | 'IN_USE'
  | 'IN_REPAIR'
  | 'LOST'
  | 'STOLEN'
  | 'RETIRED'
  | 'DISPOSED';

export type AssetCondition =
  | 'NEW'
  | 'GOOD'
  | 'FAIR'
  | 'POOR'
  | 'DAMAGED'
  | 'UNKNOWN';

export interface AssetDto extends BaseEntityDto {
  organizationId: UUID;
  institutionId?: UUID;
  assetNumber: string;
  assetTag?: string;
  name: string;
  description?: string;
  categoryId: UUID;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  acquisitionDate?: string;
  purchaseCostMinor?: string;
  purchaseCurrency?: string;
  warrantyStartDate?: string;
  warrantyEndDate?: string;
  status: AssetStatus;
  condition: AssetCondition;
  currentSpaceId?: UUID;
}

export interface CreateAssetDto {
  organizationId: UUID;
  institutionId?: UUID;
  assetNumber?: string;
  assetTag?: string;
  name: string;
  description?: string;
  categoryId: UUID;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  acquisitionDate?: string;
  purchaseCostMinor?: string;
  purchaseCurrency?: string;
  warrantyStartDate?: string;
  warrantyEndDate?: string;
  initialSpaceId?: UUID;
}

export type MovementType =
  | 'INITIAL_PLACEMENT'
  | 'TRANSFER'
  | 'RETURN'
  | 'TEMPORARY_MOVE'
  | 'CORRECTION';

export interface AssetLocationHistoryDto {
  id: UUID;
  tenantId: UUID;
  assetId: UUID;
  fromSpaceId?: UUID;
  toSpaceId?: UUID;
  effectiveAt: string;
  movementType: MovementType;
  reason?: string;
  performedByUserId: UUID;
  createdAt: string;
}

export type CustodyStatus = 'ACTIVE' | 'RETURNED' | 'REVOKED';

export interface AssetCustodyDto {
  id: UUID;
  tenantId: UUID;
  assetId: UUID;
  employeeId: UUID;
  assignedAt: string;
  returnedAt?: string;
  status: CustodyStatus;
  assignedByUserId: UUID;
  returnedByUserId?: UUID;
  notes?: string;
}

export type TransferStatus =
  | 'REQUESTED'
  | 'APPROVED'
  | 'IN_TRANSIT'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

export interface AssetTransferDto {
  id: UUID;
  tenantId: UUID;
  assetId: UUID;
  fromInstitutionId?: UUID;
  fromCampusId?: UUID;
  fromSpaceId?: UUID;
  toInstitutionId?: UUID;
  toCampusId?: UUID;
  toSpaceId?: UUID;
  status: TransferStatus;
  requestedByUserId: UUID;
  approvedByUserId?: UUID;
  completedByUserId?: UUID;
  requestedAt: string;
  approvedAt?: string;
  completedAt?: string;
  reason?: string;
}

export interface AssetDocumentDto {
  id: UUID;
  tenantId: UUID;
  assetId: UUID;
  documentType: string;
  title: string;
  fileReference: string;
  securityClassification: DocumentSecurityClassification;
  uploadedByUserId: UUID;
  createdAt: string;
}
