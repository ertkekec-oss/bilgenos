import { BaseEntityDto, UUID } from '../shared/types.js';

export type InstitutionType =
  | 'PUBLIC_SCHOOL'
  | 'PRIVATE_SCHOOL'
  | 'COLLEGE'
  | 'PRESCHOOL'
  | 'COURSE_CENTER'
  | 'EXAM_PREP_CENTER'
  | 'LANGUAGE_SCHOOL'
  | 'VOCATIONAL_TRAINING'
  | 'ARTS_EDUCATION'
  | 'CORPORATE_TRAINING'
  | 'OTHER';

export interface InstitutionDto extends BaseEntityDto {
  tenantId: UUID;
  organizationId: UUID;
  code: string;
  name: string;
  institutionType: InstitutionType;
  isActive: boolean;
}

export interface CreateInstitutionDto {
  organizationId: UUID;
  code: string;
  name: string;
  institutionType: InstitutionType;
}

export interface CampusDto extends BaseEntityDto {
  institutionId: UUID;
  name: string;
  city?: string;
  address?: string;
  isActive: boolean;
}

export interface CreateCampusDto {
  institutionId: UUID;
  name: string;
  city?: string;
  address?: string;
}
