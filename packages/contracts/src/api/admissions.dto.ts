import type { BaseEntityDto, UUID } from '../shared/types.js';

export type LeadSource =
  | 'WEBSITE'
  | 'PHONE'
  | 'WALK_IN'
  | 'REFERRAL'
  | 'CAMPAIGN'
  | 'SOCIAL'
  | 'PARTNER'
  | 'IMPORT'
  | 'OTHER';

export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'APPLICATION'
  | 'OFFERED'
  | 'WON'
  | 'LOST'
  | 'ARCHIVED';

export interface LeadDto extends BaseEntityDto {
  tenantId: UUID;
  institutionId: UUID;
  candidatePersonId?: UUID | undefined;
  guardianPersonId?: UUID | undefined;
  source: LeadSource;
  status: LeadStatus;
  assignedToUserId?: UUID | undefined;
  interestedProgramId?: UUID | undefined;
  interestedCampusId?: UUID | undefined;
  notesSummary?: string | undefined;
}

export interface CreateLeadDto {
  institutionId: UUID;
  candidatePersonId?: UUID | undefined;
  guardianPersonId?: UUID | undefined;
  source: LeadSource;
  assignedToUserId?: UUID | undefined;
  interestedProgramId?: UUID | undefined;
  interestedCampusId?: UUID | undefined;
  notesSummary?: string | undefined;
}

export type AdmissionApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'CONVERTED';

export interface AdmissionApplicationDto extends BaseEntityDto {
  tenantId: UUID;
  institutionId: UUID;
  leadId: UUID;
  candidatePersonId: UUID;
  targetCampusId?: UUID | undefined;
  requestedEducationPeriodId?: UUID | undefined;
  requestedProgramId?: UUID | undefined;
  requestedLevelId?: UUID | undefined;
  status: AdmissionApplicationStatus;
  submittedAt?: string | undefined;
  approvedAt?: string | undefined;
  rejectedAt?: string | undefined;
}

export interface CreateAdmissionApplicationDto {
  institutionId: UUID;
  leadId: UUID;
  candidatePersonId: UUID;
  targetCampusId?: UUID | undefined;
  requestedEducationPeriodId?: UUID | undefined;
  requestedProgramId?: UUID | undefined;
  requestedLevelId?: UUID | undefined;
}

export type AdmissionActivityType =
  | 'CALL'
  | 'MEETING'
  | 'EMAIL'
  | 'MESSAGE'
  | 'VISIT'
  | 'NOTE'
  | 'FOLLOW_UP';

export interface AdmissionActivityDto extends BaseEntityDto {
  tenantId: UUID;
  leadId: UUID;
  performedByUserId: UUID;
  type: AdmissionActivityType;
  summary: string;
  performedAt: string;
}

export type AdmissionOfferStatus =
  | 'DRAFT'
  | 'PRESENTED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'EXPIRED';

export interface AdmissionOfferDto extends BaseEntityDto {
  tenantId: UUID;
  institutionId: UUID;
  applicationId: UUID;
  currency: string;
  listAmountMinor: string;
  scholarshipAmountMinor: string;
  discountAmountMinor: string;
  netAmountMinor: string;
  validUntil?: string | undefined;
  status: AdmissionOfferStatus;
}
