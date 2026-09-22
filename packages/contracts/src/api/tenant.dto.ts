import { BaseEntityDto, UUID } from '../shared/types.js';

export interface TenantDto extends BaseEntityDto {
  name: string;
  slug: string;
  isActive: boolean;
}

export interface CreateTenantDto {
  name: string;
  slug: string;
}

export interface OrganizationDto extends BaseEntityDto {
  tenantId: UUID;
  name: string;
  taxNumber?: string;
  isActive: boolean;
}

export interface CreateOrganizationDto {
  tenantId: UUID;
  name: string;
  taxNumber?: string;
}
