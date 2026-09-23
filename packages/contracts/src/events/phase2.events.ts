import type { UUID } from '../shared/types.js';
import type { BaseDomainEvent } from './phase1-events.js';

export interface CommercialRegistrationReadyPayload {
  registrationId: UUID;
  tenantId: UUID;
  institutionId: UUID;
  candidatePersonId: UUID;
  guardianPersonId?: UUID | undefined;
  financialResponsiblePersonId: UUID;
  programId?: UUID | undefined;
}

export interface CommercialRegistrationReadyEvent extends BaseDomainEvent {
  eventType: 'CommercialRegistrationReady';
  payload: CommercialRegistrationReadyPayload;
}

export interface CommercialRegistrationActivatedPayload {
  registrationId: UUID;
  tenantId: UUID;
  institutionId: UUID;
}

export interface CommercialRegistrationActivatedEvent extends BaseDomainEvent {
  eventType: 'CommercialRegistrationActivated';
  payload: CommercialRegistrationActivatedPayload;
}

export interface AdmissionOfferAcceptedPayload {
  offerId: UUID;
  applicationId: UUID;
  netAmountMinor: string;
  currency: string;
}

export interface AdmissionOfferAcceptedEvent extends BaseDomainEvent {
  eventType: 'AdmissionOfferAccepted';
  payload: AdmissionOfferAcceptedPayload;
}

export interface EducationContractSignedPayload {
  contractId: UUID;
  registrationId: UUID;
  contractNumber: string;
  version: number;
}

export interface EducationContractSignedEvent extends BaseDomainEvent {
  eventType: 'EducationContractSigned';
  payload: EducationContractSignedPayload;
}

export interface IntegrationSyncCompletedPayload {
  connectionId: UUID;
  localEntityId: UUID;
  externalEntityId: string;
  entityType: string;
}

export interface IntegrationSyncCompletedEvent extends BaseDomainEvent {
  eventType: 'IntegrationSyncCompleted';
  payload: IntegrationSyncCompletedPayload;
}

export interface IntegrationConflictDetectedPayload {
  conflictId: UUID;
  connectionId: UUID;
  reason: string;
}

export interface IntegrationConflictDetectedEvent extends BaseDomainEvent {
  eventType: 'IntegrationConflictDetected';
  payload: IntegrationConflictDetectedPayload;
}
