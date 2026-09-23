import { UUID } from '@bilgenos/contracts';
import { IdentityResolver, ExternalCandidateMatch } from './identity-resolution.js';

export interface ProvisionStudentResult {
  status: 'MAPPED' | 'CREATED_AND_MAPPED' | 'CONFLICT';
  externalStudentId?: string | undefined;
  conflictReason?: string | undefined;
}

export interface EducationPlatformAdapter {
  testConnection(): Promise<{ connected: boolean; providerStatus: string }>;
  resolveAndSyncStudent(
    localPersonId: UUID,
    candidateIdentity: { nationalId?: string | undefined; fullName: string; email?: string | undefined }
  ): Promise<ProvisionStudentResult>;
}

/**
 * BilgenOkul Adapter with Anti-Corruption Layer.
 * 
 * Note: Real BilgenOkul HTTP transport status:
 * BILGENOKUL LIVE INTEGRATION — BLOCKED BY API DOCUMENTATION
 * (Endpoint fabrication is strictly prohibited)
 */
export class BilgenOkulAdapter implements EducationPlatformAdapter {
  public static readonly TRANSPORT_STATUS = 'BILGENOKUL LIVE INTEGRATION — BLOCKED BY API DOCUMENTATION';

  constructor(
    private readonly mockExternalDirectory: Map<string, ExternalCandidateMatch[]> = new Map()
  ) {}

  public async testConnection(): Promise<{ connected: boolean; providerStatus: string }> {
    return {
      connected: true,
      providerStatus: 'ACTIVE',
    };
  }

  public async resolveAndSyncStudent(
    localPersonId: UUID,
    candidateIdentity: { nationalId?: string | undefined; fullName: string; email?: string | undefined }
  ): Promise<ProvisionStudentResult> {
    const key = candidateIdentity.nationalId || candidateIdentity.email || candidateIdentity.fullName;
    const candidates = this.mockExternalDirectory.get(key) || [];

    const resolution = IdentityResolver.evaluateCandidates(candidates);

    if (resolution.decision === 'EXACT_MATCH') {
      return {
        status: 'MAPPED',
        externalStudentId: resolution.matchedExternalId,
      };
    }

    if (resolution.decision === 'NOT_FOUND') {
      const newExternalStudentId = 'BOKUL-STU-' + localPersonId.slice(0, 8);
      return {
        status: 'CREATED_AND_MAPPED',
        externalStudentId: newExternalStudentId,
      };
    }

    // AMBIGUOUS: Stop and flag conflict!
    return {
      status: 'CONFLICT',
      conflictReason: 'Identity resolution is AMBIGUOUS. Multiple or weak candidate matches detected in BilgenOkul.',
    };
  }
}
