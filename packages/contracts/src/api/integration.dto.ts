import type { BaseEntityDto, UUID } from '../shared/types.js';

export type IntegrationProviderCode = 'BILGEN_OKUL' | string;

export type IntegrationConnectionStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'DEGRADED'
  | 'SUSPENDED'
  | 'DISABLED';

export interface IntegrationConnectionDto extends BaseEntityDto {
  tenantId: UUID;
  institutionId?: UUID | undefined;
  providerCode: IntegrationProviderCode;
  status: IntegrationConnectionStatus;
  lastSuccessfulSyncAt?: string | undefined;
  lastFailedSyncAt?: string | undefined;
}

export type LocalEntityType = 'PERSON' | 'LEARNER' | 'INSTITUTION' | 'GUARDIAN';
export type ExternalEntityType = 'BILGEN_OKUL_STUDENT' | 'BILGEN_OKUL_GUARDIAN' | 'BILGEN_OKUL_INSTITUTION' | string;

export interface ExternalEntityMappingDto extends BaseEntityDto {
  tenantId: UUID;
  integrationConnectionId: UUID;
  localEntityType: LocalEntityType;
  localEntityId: UUID;
  externalEntityType: ExternalEntityType;
  externalEntityId: string;
  externalVersion?: string | undefined;
  syncStatus: 'SYNCED' | 'PENDING' | 'CONFLICT' | 'FAILED';
  lastSyncedAt?: string | undefined;
}

export type IntegrationConflictStatus = 'OPEN' | 'RESOLVED' | 'IGNORED';

export interface IntegrationConflictDto extends BaseEntityDto {
  tenantId: UUID;
  integrationConnectionId: UUID;
  entityType: string;
  localCandidateId?: UUID | undefined;
  externalCandidateId?: string | undefined;
  reason: string;
  resolutionDetails?: string | undefined;
  status: IntegrationConflictStatus;
}

export interface DeadLetterEntryDto extends BaseEntityDto {
  tenantId: UUID;
  integrationConnectionId: UUID;
  jobId: UUID;
  payloadType: string;
  errorMessage: string;
  attempts: number;
}
