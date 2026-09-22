import { BaseEntityDto, UUID } from '../shared/types.js';

export type LearnerStatus = 'ACTIVE' | 'COMPLETED' | 'SUSPENDED' | 'DROPPED';

export interface LearnerDto extends BaseEntityDto {
  tenantId: UUID;
  personId: UUID;
  institutionId: UUID;
  learnerNumber: string;
  status: LearnerStatus;
}

export interface CreateLearnerDto {
  personId: UUID;
  institutionId: UUID;
  learnerNumber: string;
}

export interface ExamPrepProfileDto extends BaseEntityDto {
  learnerId: UUID;
  targetExam: string;
  targetScore?: number;
  targetRanking?: number;
  baselineScore?: number;
  targetInstitutionText?: string;
}

export interface SetExamPrepProfileDto {
  targetExam: string;
  targetScore?: number;
  targetRanking?: number;
  baselineScore?: number;
  targetInstitutionText?: string;
}
