import { RequestTenantContext, UUID } from '@bilgenos/contracts';
import { TenantContextEnforcer } from '@bilgenos/authorization';
import { CrossTenantViolationError } from '@bilgenos/domain';

export interface BaseTenantEntity {
  id: UUID;
  tenantId: UUID;
}

export abstract class ScopedRepositoryBase<T extends BaseTenantEntity> {
  protected readonly _typeMarker?: T;

  protected constructor(protected readonly context: RequestTenantContext) {
    TenantContextEnforcer.assertTenantContext(context);
  }

  public get tenantId(): UUID {
    return this.context.tenantId;
  }

  /**
   * Enforces that any entity being created or mutated belongs strictly to the requesting tenant.
   */
  protected assertTenantScope(entityTenantId: UUID): void {
    if (this.context.tenantId !== entityTenantId) {
      throw new CrossTenantViolationError(
        `Cross-Tenant Error: Context tenant '${this.context.tenantId}' does not match entity tenant '${entityTenantId}'.`
      );
    }
  }
}
