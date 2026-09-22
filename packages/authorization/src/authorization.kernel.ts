import { RequestTenantContext, UUID } from '@bilgenos/contracts';
import { DomainError } from '@bilgenos/domain';
import { TenantContextEnforcer } from './tenant-context.js';
import { GuardianLinkCheck, ResourceScopeTarget, ScopeEvaluator } from './scope-evaluator.js';

export interface SecurityAuditEntry {
  timestamp: string;
  tenantId: UUID;
  actorUserId?: UUID | undefined;
  action: string;
  resourceId?: UUID | undefined;
  decision: 'ALLOW' | 'DENY';
  reason?: string | undefined;
  maskedAsNotFound: boolean;
}

/**
 * Exception raised when an operation is denied and must be masked as 404 Not Found
 * to external callers so as not to reveal resource existence across tenant boundaries.
 */
export class MaskedNotFoundSecurityException extends DomainError {
  constructor(
    message: string = 'Resource not found',
    public readonly auditEntry: SecurityAuditEntry
  ) {
    super(message, 'NOT_FOUND_MASKED');
  }
}

export class AuthorizationKernel {
  private static readonly securityAuditLogs: SecurityAuditEntry[] = [];

  public static getSecurityAuditLogs(): readonly SecurityAuditEntry[] {
    return this.securityAuditLogs;
  }

  public static clearAuditLogs(): void {
    this.securityAuditLogs.length = 0;
  }

  public static recordExternalSecurityAudit(entry: SecurityAuditEntry): void {
    this.securityAuditLogs.push(entry);
  }

  /**
   * Central security gate enforcing:
   * 1. Tenant boundary validation (NO TENANT CONTEXT = DENY)
   * 2. Cross-tenant existence masking (Masks cross-tenant probing as 404)
   * 3. Scoped RBAC/ABAC permission evaluation
   * 4. Audit trail logging
   */
  public static authorizeResourceAccess(
    context: RequestTenantContext,
    requiredPermission: string,
    target: ResourceScopeTarget,
    guardianLinks: GuardianLinkCheck[] = []
  ): void {
    // 1. Assert tenant context is present
    try {
      TenantContextEnforcer.assertTenantContext(context);
    } catch (err: unknown) {
      const error = err as Error;
      this.recordExternalSecurityAudit({
        timestamp: new Date().toISOString(),
        tenantId: context?.tenantId ?? 'UNKNOWN',
        actorUserId: context?.userId,
        action: requiredPermission,
        resourceId: target.personId || target.learnerId,
        decision: 'DENY',
        reason: error.message,
        maskedAsNotFound: false,
      });
      throw err;
    }

    // 2. Cross-tenant defense-in-depth: If target belongs to another tenant, mask as 404!
    if (target.tenantId && target.tenantId !== context.tenantId) {
      const audit: SecurityAuditEntry = {
        timestamp: new Date().toISOString(),
        tenantId: context.tenantId,
        actorUserId: context.userId,
        action: requiredPermission,
        resourceId: target.personId || target.learnerId,
        decision: 'DENY',
        reason: `Cross-tenant probe detected. Tenant '${context.tenantId}' probed resource of Tenant '${target.tenantId}'.`,
        maskedAsNotFound: true,
      };
      this.recordExternalSecurityAudit(audit);
      throw new MaskedNotFoundSecurityException('Resource not found', audit);
    }

    // 3. Permission and Scope check
    try {
      ScopeEvaluator.evaluateAccess(context, requiredPermission, target, guardianLinks);
      this.recordExternalSecurityAudit({
        timestamp: new Date().toISOString(),
        tenantId: context.tenantId,
        actorUserId: context.userId,
        action: requiredPermission,
        resourceId: target.personId || target.learnerId,
        decision: 'ALLOW',
        reason: undefined,
        maskedAsNotFound: false,
      });
    } catch (err: unknown) {
      const error = err as Error;
      this.recordExternalSecurityAudit({
        timestamp: new Date().toISOString(),
        tenantId: context.tenantId,
        actorUserId: context.userId,
        action: requiredPermission,
        resourceId: target.personId || target.learnerId,
        decision: 'DENY',
        reason: error.message,
        maskedAsNotFound: false,
      });
      throw err;
    }
  }
}
