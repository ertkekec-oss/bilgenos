import { UUID } from '../shared/types.js';

export interface BaseDomainEvent<T = unknown> {
  eventId: UUID;
  eventType: string;
  tenantId: UUID;
  aggregateId: UUID;
  aggregateType: string;
  timestamp: string;
  payload: T;
  metadata?: Record<string, unknown>;
}

export interface InstitutionCreatedPayload {
  institutionId: UUID;
  organizationId: UUID;
  code: string;
  name: string;
  institutionType: string;
}

export interface PersonCreatedPayload {
  personId: UUID;
  firstName: string;
  lastName: string;
  nationalIdEncrypted?: string;
  birthDate?: string;
}

export interface LearnerCreatedPayload {
  learnerId: UUID;
  personId: UUID;
  institutionId: UUID;
  learnerNumber: string;
}

export interface GuardianRelationshipCreatedPayload {
  relationshipId: UUID;
  guardianPersonId: UUID;
  learnerId: UUID;
  relationshipType: string;
  isLegalGuardian: boolean;
  isFinancialResponsible: boolean;
  isEmergencyContact: boolean;
  isPickupAuthorized: boolean;
}

export interface EducationProgramCreatedPayload {
  programId: UUID;
  institutionId: UUID;
  code: string;
  name: string;
  structureType: string;
}

export interface EnrollmentCreatedPayload {
  enrollmentId: UUID;
  learnerId: UUID;
  institutionId: UUID;
  programId: UUID;
  periodId?: UUID;
  levelId?: UUID;
  cohortId?: UUID;
  status: string;
}

export interface EnrollmentActivatedPayload {
  enrollmentId: UUID;
  learnerId: UUID;
  activatedAt: string;
}

export interface EnrollmentSuspendedPayload {
  enrollmentId: UUID;
  learnerId: UUID;
  reason: string;
  suspendedAt: string;
}

export interface EnrollmentCompletedPayload {
  enrollmentId: UUID;
  learnerId: UUID;
  completedAt: string;
}

export interface CapabilityEnabledPayload {
  institutionId: UUID;
  capabilityKey: string;
  state: 'ENABLED';
}

export interface CapabilityDisabledPayload {
  institutionId: UUID;
  capabilityKey: string;
  previousState: string;
  state: 'DISABLED' | 'READ_ONLY' | 'SUSPENDED';
}
