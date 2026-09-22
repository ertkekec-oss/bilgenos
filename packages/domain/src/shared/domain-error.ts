export class DomainError extends Error {
  constructor(message: string, public readonly code: string = 'DOMAIN_ERROR') {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InvariantViolationError extends DomainError {
  constructor(message: string) {
    super(message, 'INVARIANT_VIOLATION');
  }
}

export class InvalidStateTransitionError extends DomainError {
  constructor(fromState: string, toState: string, reason?: string) {
    const msg = `Invalid state transition from '${fromState}' to '${toState}'.${reason ? ` Reason: ${reason}` : ''}`;
    super(msg, 'INVALID_STATE_TRANSITION');
  }
}

export class CapabilityDependencyError extends DomainError {
  constructor(capability: string, missingDependency: string) {
    super(
      `Cannot activate capability '${capability}'. Prerequisite capability '${missingDependency}' is not enabled.`,
      'CAPABILITY_DEPENDENCY_ERROR'
    );
  }
}

export class CapabilityCycleError extends DomainError {
  constructor(cyclePath: string[]) {
    super(
      `Capability dependency cycle detected: ${cyclePath.join(' -> ')}`,
      'CAPABILITY_CYCLE_ERROR'
    );
  }
}

export class CrossTenantViolationError extends DomainError {
  constructor(message: string = 'Cross-tenant boundary violation detected.') {
    super(message, 'CROSS_TENANT_VIOLATION');
  }
}
