import { RequestTenantContext, UUID } from '@bilgenos/contracts';
import { DomainError } from '@bilgenos/domain';
import { TenantContextEnforcer } from './tenant-context.js';

export class AuthorizationViolationError extends DomainError {
  constructor(message: string) {
    super(message, 'AUTHORIZATION_DENIED');
  }
}

export interface ResourceScopeTarget {
  tenantId: UUID;
  institutionId?: UUID;
  campusId?: UUID;
  cohortId?: UUID;
  learnerId?: UUID;
  personId?: UUID;
}

export interface GuardianLinkCheck {
  guardianPersonId: UUID;
  learnerId: UUID;
  isCurrentlyValid: boolean;
}

export class ScopeEvaluator {
  /**
   * Asserts that the actor has permission to perform an action on the given resource scope.
   */
  public static evaluateAccess(
    context: RequestTenantContext,
    requiredPermission: string,
    target: ResourceScopeTarget,
    guardianLinks: GuardianLinkCheck[] = []
  ): void {
    // 1. Root Security Boundary: Tenant check (NO TENANT CONTEXT = DENY)
    TenantContextEnforcer.assertTenantContext(context);
    TenantContextEnforcer.assertTenantMatch(context.tenantId, target.tenantId);

    // 2. Permission presence check
    if (!context.permissions.includes(requiredPermission) && !context.roles.includes('PLATFORM_SUPERADMIN')) {
      throw new AuthorizationViolationError(
        `Permission Denied: Missing required permission '${requiredPermission}'.`
      );
    }

    // 3. Platform Superadmin bypasses institutional scopes within the tenant
    if (context.roles.includes('PLATFORM_SUPERADMIN')) {
      return;
    }

    // 4. Institution scope check: Institution A -> Institution B = DENY
    if (target.institutionId && context.institutionId && context.institutionId !== target.institutionId) {
      throw new AuthorizationViolationError(
        `Scope Denied: User is restricted to institution '${context.institutionId}' and cannot access institution '${target.institutionId}'.`
      );
    }

    // 5. Campus scope check
    if (target.campusId && context.campusId && context.campusId !== target.campusId) {
      throw new AuthorizationViolationError(
        `Scope Denied: User is restricted to campus '${context.campusId}' and cannot access campus '${target.campusId}'.`
      );
    }

    // 6. Guardian scope check: Guardian A -> unrelated Learner = DENY, Expired relationship = DENY
    if (context.roles.includes('GUARDIAN') && target.learnerId && context.personId) {
      const link = guardianLinks.find(
        (gl) => gl.guardianPersonId === context.personId && gl.learnerId === target.learnerId
      );

      if (!link) {
        throw new AuthorizationViolationError(
          `Scope Denied: Guardian '${context.personId}' has no relationship with learner '${target.learnerId}'.`
        );
      }

      if (!link.isCurrentlyValid) {
        throw new AuthorizationViolationError(
          `Scope Denied: Guardian relationship between '${context.personId}' and learner '${target.learnerId}' is expired or inactive.`
        );
      }
    }
  }
}
