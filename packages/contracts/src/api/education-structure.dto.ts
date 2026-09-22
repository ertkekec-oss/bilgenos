import { BaseEntityDto, UUID } from '../shared/types.js';

export interface EducationPeriodDto extends BaseEntityDto {
  institutionId: UUID;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface CreateEducationPeriodDto {
  institutionId: UUID;
  name: string;
  startDate: string;
  endDate: string;
}

export type ProgramStructureType =
  | 'K12'
  | 'EXAM_PREP'
  | 'LANGUAGE'
  | 'VOCATIONAL'
  | 'WORKSHOP'
  | 'OTHER';

export interface EducationProgramDto extends BaseEntityDto {
  institutionId: UUID;
  code: string;
  name: string;
  structureType: ProgramStructureType;
  hasLevels: boolean;
  isActive: boolean;
}

export interface CreateEducationProgramDto {
  institutionId: UUID;
  code: string;
  name: string;
  structureType: ProgramStructureType;
  hasLevels?: boolean;
}

export interface EducationLevelDto extends BaseEntityDto {
  programId: UUID;
  name: string;
  orderIndex: number;
}

export interface CreateEducationLevelDto {
  programId: UUID;
  name: string;
  orderIndex: number;
}

export interface EducationCohortDto extends BaseEntityDto {
  campusId: UUID;
  programId: UUID;
  levelId?: UUID; // Optional: workshops, short seminars do not require a level
  periodId?: UUID; // Optional: rolling/open cohorts do not require a fixed annual period
  name: string;
  startDate: string;
  endDate: string;
  capacity: number;
  isActive: boolean;
}

export interface CreateEducationCohortDto {
  campusId: UUID;
  programId: UUID;
  levelId?: UUID;
  periodId?: UUID;
  name: string;
  startDate: string;
  endDate: string;
  capacity?: number;
}
