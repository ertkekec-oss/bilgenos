import { BaseEntityDto, UUID } from '../shared/types.js';

export interface PersonDto extends BaseEntityDto {
  tenantId: UUID;
  nationalIdEncrypted?: string | undefined;
  firstName: string;
  lastName: string;
  birthDate?: string | undefined;
  gender?: string | undefined;
  bloodType?: string | undefined;
  emergencyPhone?: string | undefined;
  updatedAt?: string | undefined;
}

export interface CreatePersonDto {
  nationalId?: string | undefined;
  firstName: string;
  lastName: string;
  birthDate?: string | undefined;
  gender?: string | undefined;
  bloodType?: string | undefined;
  emergencyPhone?: string | undefined;
}

export interface UserDto extends BaseEntityDto {
  tenantId: UUID;
  personId: UUID;
  email: string;
  phoneNumber?: string | undefined;
  isActive: boolean;
}

export interface CreateUserDto {
  personId: UUID;
  email: string;
  phoneNumber?: string | undefined;
  password?: string | undefined;
}

export type ScopeType =
  | 'PLATFORM'
  | 'ORGANIZATION'
  | 'INSTITUTION'
  | 'CAMPUS'
  | 'COHORT'
  | 'OWN_CHILDREN'
  | 'OWN_STUDENTS'
  | 'SELF';

export interface UserRoleAssignmentDto extends BaseEntityDto {
  userId: UUID;
  roleKey: string;
  scopeType: ScopeType;
  scopeId?: UUID | undefined;
  isPrimary: boolean;
  validFrom: string;
  validTo?: string | undefined;
}
