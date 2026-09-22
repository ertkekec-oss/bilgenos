import { BaseEntityDto, UUID } from '../shared/types.js';

export type RelationshipType =
  | 'MOTHER'
  | 'FATHER'
  | 'LEGAL_GUARDIAN'
  | 'FOSTER_PARENT'
  | 'SIBLING'
  | 'GRANDPARENT'
  | 'EMERGENCY_CONTACT'
  | 'OTHER';

export type RelationshipStatus = 'ACTIVE' | 'REVOKED' | 'EXPIRED';

export interface GuardianRelationshipDto extends BaseEntityDto {
  tenantId: UUID;
  guardianPersonId: UUID;
  learnerId: UUID;
  relationshipType: RelationshipType;
  isLegalGuardian: boolean;
  isFinancialResponsible: boolean;
  isEmergencyContact: boolean;
  isPickupAuthorized: boolean;
  validFrom: string;
  validUntil?: string;
  status: RelationshipStatus;
  custodyNotes?: string;
}

export interface CreateGuardianRelationshipDto {
  guardianPersonId: UUID;
  learnerId: UUID;
  relationshipType: RelationshipType;
  isLegalGuardian?: boolean;
  isFinancialResponsible?: boolean;
  isEmergencyContact?: boolean;
  isPickupAuthorized?: boolean;
  validFrom?: string;
  validUntil?: string;
  custodyNotes?: string;
}
