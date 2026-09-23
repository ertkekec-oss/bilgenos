export type ResolutionDecision = 'EXACT_MATCH' | 'NOT_FOUND' | 'AMBIGUOUS';

export interface IdentityResolutionInput {
  nationalIdEncrypted?: string | undefined;
  email?: string | undefined;
  phone?: string | undefined;
  fullName: string;
}

export interface ExternalCandidateMatch {
  externalId: string;
  confidence: 'EXACT' | 'WEAK' | 'AMBIGUOUS';
  metadata?: Record<string, unknown> | undefined;
}

/**
 * Binding Constraint #2:
 * Identity resolution must strictly adhere to:
 * - EXACT_MATCH -> map
 * - NOT_FOUND -> create -> map
 * - AMBIGUOUS -> IntegrationConflict -> STOP
 * Weak or fuzzy matches must NOT automatically merge!
 */
export class IdentityResolver {
  public static evaluateCandidates(candidates: ExternalCandidateMatch[]): {
    decision: ResolutionDecision;
    matchedExternalId?: string | undefined;
  } {
    if (candidates.length === 0) {
      return { decision: 'NOT_FOUND' };
    }

    const first = candidates[0];
    if (candidates.length === 1 && first && first.confidence === 'EXACT') {
      return { decision: 'EXACT_MATCH', matchedExternalId: first.externalId };
    }

    // Multiple candidates or non-exact candidate -> AMBIGUOUS
    return { decision: 'AMBIGUOUS' };
  }
}
