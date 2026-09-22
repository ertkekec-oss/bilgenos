export type UUID = string;

export interface BaseEntityDto {
  id: UUID;
  createdAt: string;
  updatedAt?: string | undefined;
}

export interface TenantScopedDto extends BaseEntityDto {
  tenantId: UUID;
}

export interface PaginationParams {
  page?: number | undefined;
  limit?: number | undefined;
  sortBy?: string | undefined;
  sortOrder?: 'asc' | 'desc' | undefined;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RequestTenantContext {
  tenantId: UUID;
  userId?: UUID | undefined;
  personId?: UUID | undefined;
  institutionId?: UUID | undefined;
  campusId?: UUID | undefined;
  roles: string[];
  permissions: string[];
}
