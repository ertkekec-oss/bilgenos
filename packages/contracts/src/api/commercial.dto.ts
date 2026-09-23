import type { BaseEntityDto, UUID } from '../shared/types.js';

export type ScholarshipType =
  | 'ACADEMIC'
  | 'ATHLETIC'
  | 'NEED'
  | 'BOARD'
  | 'INSTITUTIONAL';

export type ScholarshipAmountType = 'PERCENTAGE' | 'FIXED_MINOR';

export interface ScholarshipAwardDto extends BaseEntityDto {
  tenantId: UUID;
  institutionId: UUID;
  candidatePersonId: UUID;
  type: ScholarshipType;
  amountType: ScholarshipAmountType;
  value: string;
  reasonCode?: string | undefined;
  approvedByUserId?: UUID | undefined;
  approvedAt?: string | undefined;
  validFrom?: string | undefined;
  validUntil?: string | undefined;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
}

export type DiscountReason =
  | 'SIBLING'
  | 'STAFF'
  | 'EARLY_REGISTRATION'
  | 'CAMPAIGN'
  | 'MANUAL'
  | 'OTHER';

export interface DiscountApplicationDto extends BaseEntityDto {
  tenantId: UUID;
  institutionId: UUID;
  reason: DiscountReason;
  amountMinor: string;
  description?: string | undefined;
}

export type CommercialRegistrationStatus =
  | 'DRAFT'
  | 'PENDING_CONTRACT'
  | 'PENDING_PAYMENT_PLAN'
  | 'READY'
  | 'ACTIVE'
  | 'CANCELLED'
  | 'WITHDRAWN'
  | 'COMPLETED';

export type CommercialIntegrationStatus =
  | 'NOT_REQUIRED'
  | 'PENDING'
  | 'SYNCING'
  | 'SYNCED'
  | 'FAILED'
  | 'CONFLICT';

export interface CommercialRegistrationDto extends BaseEntityDto {
  tenantId: UUID;
  institutionId: UUID;
  candidatePersonId: UUID;
  guardianPersonId?: UUID | undefined;
  financialResponsiblePersonId: UUID;
  applicationId?: UUID | undefined;
  offerId?: UUID | undefined;
  educationPeriodId?: UUID | undefined;
  programId?: UUID | undefined;
  campusId?: UUID | undefined;
  status: CommercialRegistrationStatus;
  integrationStatus: CommercialIntegrationStatus;
  contractId?: UUID | undefined;
  paymentPlanId?: UUID | undefined;
}

export interface CreateCommercialRegistrationDto {
  institutionId: UUID;
  candidatePersonId: UUID;
  guardianPersonId?: UUID | undefined;
  financialResponsiblePersonId: UUID;
  applicationId?: UUID | undefined;
  offerId?: UUID | undefined;
  educationPeriodId?: UUID | undefined;
  programId?: UUID | undefined;
  campusId?: UUID | undefined;
}

export type EducationContractStatus =
  | 'DRAFT'
  | 'ISSUED'
  | 'ACCEPTED'
  | 'SIGNED'
  | 'CANCELLED'
  | 'EXPIRED';

export interface EducationContractDto extends BaseEntityDto {
  tenantId: UUID;
  institutionId: UUID;
  registrationId: UUID;
  contractNumber: string;
  version: number;
  financialResponsiblePersonId: UUID;
  effectiveDate: string;
  expiryDate?: string | undefined;
  status: EducationContractStatus;
  documentReference?: string | undefined;
}

export type PriceComponentType =
  | 'TUITION'
  | 'TRANSPORTATION'
  | 'CAFETERIA'
  | 'MATERIAL'
  | 'ACTIVITY'
  | 'OTHER';

export interface PriceComponentDto {
  type: PriceComponentType;
  amountMinor: string;
  description?: string | undefined;
}

export type PaymentInstallmentStatus =
  | 'PENDING'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'OVERDUE'
  | 'CANCELLED';

export interface PaymentInstallmentDto extends BaseEntityDto {
  tenantId: UUID;
  paymentPlanId: UUID;
  sequence: number;
  dueDate: string;
  amountMinor: string;
  currency: string;
  status: PaymentInstallmentStatus;
}

export interface PaymentPlanDto extends BaseEntityDto {
  tenantId: UUID;
  institutionId: UUID;
  registrationId: UUID;
  totalAmountMinor: string;
  currency: string;
  installments: PaymentInstallmentDto[];
  status: 'DRAFT' | 'ACTIVE' | 'FULFILLED' | 'DEFAULTED';
}
