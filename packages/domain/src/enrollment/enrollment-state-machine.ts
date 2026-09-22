import { EnrollmentStatus } from '@bilgenos/contracts';
import { InvalidStateTransitionError } from '../shared/domain-error.js';

export class EnrollmentStateMachine {
  private static readonly ALLOWED_TRANSITIONS: Record<EnrollmentStatus, readonly EnrollmentStatus[]> = {
    DRAFT: ['PENDING', 'CANCELLED'],
    PENDING: ['ACTIVE', 'CANCELLED'],
    ACTIVE: ['SUSPENDED', 'COMPLETED', 'WITHDRAWN', 'CANCELLED', 'TRANSFERRED'],
    SUSPENDED: ['ACTIVE', 'WITHDRAWN', 'CANCELLED', 'TRANSFERRED'],
    COMPLETED: [], // Terminal! No transitions allowed.
    WITHDRAWN: [], // Terminal!
    CANCELLED: [], // Terminal!
    TRANSFERRED: [], // Terminal for this specific enrollment.
  };

  public static canTransition(current: EnrollmentStatus, target: EnrollmentStatus): boolean {
    return this.ALLOWED_TRANSITIONS[current].includes(target);
  }

  public static validateTransition(
    current: EnrollmentStatus,
    target: EnrollmentStatus,
    options?: { transferDetailsProvided?: boolean }
  ): void {
    if (current === target) {
      return;
    }

    if (!this.canTransition(current, target)) {
      if (current === 'COMPLETED' && target === 'ACTIVE') {
        throw new InvalidStateTransitionError(
          current,
          target,
          'A completed enrollment cannot be reactivated directly. A new enrollment record must be created.'
        );
      }
      throw new InvalidStateTransitionError(current, target);
    }

    if (target === 'TRANSFERRED' && !options?.transferDetailsProvided) {
      throw new InvalidStateTransitionError(
        current,
        target,
        'Transfer destination details must be provided when transitioning to TRANSFERRED.'
      );
    }
  }
}
