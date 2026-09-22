import { BaseEntityDto, UUID } from '../shared/types.js';

export type EnrollmentStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'COMPLETED'
  | 'WITHDRAWN'
  | 'CANCELLED'
  | 'TRANSFERRED';

export interface EnrollmentDto extends BaseEntityDto {
  tenantId: UUID;
  institutionId: UUID;
  campusId?: UUID | undefined;
  periodId?: UUID | undefined;
  programId: UUID;
  levelId?: UUID | undefined;
  cohortId?: UUID | undefined; // Optional: individual/tutoring sessions
  learnerId: UUID;
  enrollmentNumber: string;
  status: EnrollmentStatus;
  startDate: string;
  expectedEndDate?: string | undefined;
  actualEndDate?: string | undefined;
  cancellationReason?: string | undefined;
  transferDetails?: {
    targetInstitutionId?: UUID | undefined;
    targetCohortId?: UUID | undefined;
    transferredAt: string;
    reason?: string | undefined;
  } | undefined;
  metadata?: Record<string, unknown> | undefined;
}

export interface CreateEnrollmentDto {
  institutionId: UUID;
  campusId?: UUID | undefined;
  periodId?: UUID | undefined;
  programId: UUID;
  levelId?: UUID | undefined;
  cohortId?: UUID | undefined;
  learnerId: UUID;
  startDate: string;
  expectedEndDate?: string | undefined;
  metadata?: Record<string, unknown> | undefined;
}

export interface TransitionEnrollmentDto {
  targetStatus: EnrollmentStatus;
  reason?: string | undefined;
  targetCohortId?: UUID | undefined;
  targetInstitutionId?: UUID | undefined;
}
