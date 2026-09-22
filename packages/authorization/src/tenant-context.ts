import { RequestTenantContext, UUID } from '@bilgenos/contracts';
import { CrossTenantViolationError } from '@bilgenos/domain';

export class TenantContextEnforcer {
  /**
   * Asserts that a valid tenant context is present.
   * Throws CrossTenantViolationError if tenant context is missing.
   * NO TENANT CONTEXT = DENY!
   */
  public static assertTenantContext(context?: RequestTenantContext | null): asserts context is RequestTenantContext {
    if (!context || !context.tenantId || typeof context.tenantId !== 'string' || context.tenantId.trim() === '') {
      throw new CrossTenantViolationError('Access Denied: Missing or invalid tenant context. NO TENANT CONTEXT = DENY.');
    }
  }

  /**
   * Enforces that the target entity's tenantId matches the requesting tenantId.
   */
  public static assertTenantMatch(contextTenantId: UUID, entityTenantId: UUID): void {
    if (contextTenantId !== entityTenantId) {
      throw new CrossTenantViolationError(
        `Cross-Tenant Access Denied: Request tenant '${contextTenantId}' cannot access entity of tenant '${entityTenantId}'.`
      );
    }
  }
}
