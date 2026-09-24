import type { UUID } from '../shared/types.js';
import type { BaseDomainEvent } from './phase1-events.js';

export interface BuildingCreatedPayload {
  buildingId: UUID;
  campusId: UUID;
  institutionId: UUID;
  code: string;
  name: string;
}

export interface BuildingCreatedEvent extends BaseDomainEvent {
  eventType: 'BuildingCreated';
  payload: BuildingCreatedPayload;
}

export interface SpaceCreatedPayload {
  spaceId: UUID;
  floorId: UUID;
  buildingId: UUID;
  campusId: UUID;
  institutionId: UUID;
  code: string;
  name: string;
}

export interface SpaceCreatedEvent extends BaseDomainEvent {
  eventType: 'SpaceCreated';
  payload: SpaceCreatedPayload;
}

export interface AssetCreatedPayload {
  assetId: UUID;
  assetNumber: string;
  name: string;
  categoryId: UUID;
}

export interface AssetCreatedEvent extends BaseDomainEvent {
  eventType: 'AssetCreated';
  payload: AssetCreatedPayload;
}

export interface AssetLocationChangedPayload {
  assetId: UUID;
  fromSpaceId?: UUID | undefined;
  toSpaceId?: UUID | undefined;
  movementType: string;
  performedByUserId: UUID;
}

export interface AssetLocationChangedEvent extends BaseDomainEvent {
  eventType: 'AssetLocationChanged';
  payload: AssetLocationChangedPayload;
}

export interface AssetCustodyAssignedPayload {
  assetId: UUID;
  custodyId: UUID;
  employeeId: UUID;
  assignedByUserId: UUID;
}

export interface AssetCustodyAssignedEvent extends BaseDomainEvent {
  eventType: 'AssetCustodyAssigned';
  payload: AssetCustodyAssignedPayload;
}

export interface AssetCustodyReturnedPayload {
  assetId: UUID;
  custodyId: UUID;
  employeeId: UUID;
  returnedByUserId: UUID;
}

export interface AssetCustodyReturnedEvent extends BaseDomainEvent {
  eventType: 'AssetCustodyReturned';
  payload: AssetCustodyReturnedPayload;
}

export interface AssetTransferRequestedPayload {
  transferId: UUID;
  assetId: UUID;
  toInstitutionId?: UUID | undefined;
  toCampusId?: UUID | undefined;
  toSpaceId?: UUID | undefined;
  requestedByUserId: UUID;
}

export interface AssetTransferRequestedEvent extends BaseDomainEvent {
  eventType: 'AssetTransferRequested';
  payload: AssetTransferRequestedPayload;
}

export interface AssetTransferCompletedPayload {
  transferId: UUID;
  assetId: UUID;
  destinationSpaceId?: UUID | undefined;
  completedByUserId: UUID;
}

export interface AssetTransferCompletedEvent extends BaseDomainEvent {
  eventType: 'AssetTransferCompleted';
  payload: AssetTransferCompletedPayload;
}
