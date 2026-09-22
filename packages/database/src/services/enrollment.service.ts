import * as nodeCrypto from 'node:crypto';
import {
  CreateEnrollmentDto,
  EnrollmentDto,
  RequestTenantContext,
  UUID,
} from '@bilgenos/contracts';
import { AuthorizationKernel, MaskedNotFoundSecurityException, SecurityAuditEntry } from '@bilgenos/authorization';
import {
  InMemoryScopedEnrollmentRepository,
  InMemoryScopedLearnerRepository,
} from '../in-memory/in-memory-scoped-repository.js';
import { CrossTenantViolationError, Enrollment, EnrollmentStateMachine } from '@bilgenos/domain';

export interface TransferResult {
  sourceEnrollment: EnrollmentDto;
  targetEnrollment: EnrollmentDto;
}

export class EnrollmentService {
  constructor(
    private readonly context: RequestTenantContext,
    private readonly enrollmentRepo: InMemoryScopedEnrollmentRepository,
    private readonly learnerRepo: InMemoryScopedLearnerRepository
  ) {}

  public async getEnrollmentById(enrollmentId: UUID): Promise<EnrollmentDto> {
    try {
      const enrollment = await this.enrollmentRepo.findById(enrollmentId);
      if (!enrollment) {
        throw new Error(`Enrollment '${enrollmentId}' not found.`);
      }

      AuthorizationKernel.authorizeResourceAccess(
        this.context,
        'enrollment.read',
        { tenantId: enrollment.tenantId, learnerId: enrollment.learnerId }
      );

      return enrollment;
    } catch (err: unknown) {
      if (err instanceof CrossTenantViolationError) {
        const audit: SecurityAuditEntry = {
          timestamp: new Date().toISOString(),
          tenantId: this.context.tenantId,
          actorUserId: this.context.userId,
          action: 'enrollment.read',
          resourceId: enrollmentId,
          decision: 'DENY',
          reason: (err as Error).message,
          maskedAsNotFound: true,
        };
        AuthorizationKernel.recordExternalSecurityAudit(audit);
        throw new MaskedNotFoundSecurityException('Enrollment not found', audit);
      }
      throw err;
    }
  }

  public async createEnrollment(dto: CreateEnrollmentDto): Promise<EnrollmentDto> {
    AuthorizationKernel.authorizeResourceAccess(
      this.context,
      'enrollment.create',
      { tenantId: this.context.tenantId, learnerId: dto.learnerId }
    );

    // Verify Learner belongs to the same tenant!
    const learner = await this.learnerRepo.findById(dto.learnerId);
    if (!learner) {
      throw new Error(`Learner '${dto.learnerId}' not found.`);
    }

    const enrollmentId = nodeCrypto.randomUUID();
    const enrollmentNumber = `ENR-${Date.now().toString().slice(-6)}`;

    // Domain Invariant: cohortId can be undefined/null for 1-on-1 tutoring sessions
    const domainEnrollment = new Enrollment({
      id: enrollmentId,
      tenantId: this.context.tenantId,
      institutionId: dto.institutionId,
      campusId: dto.campusId,
      periodId: dto.periodId,
      programId: dto.programId,
      levelId: dto.levelId,
      cohortId: dto.cohortId,
      learnerId: dto.learnerId,
      enrollmentNumber,
      status: 'DRAFT',
      startDate: new Date(dto.startDate),
      expectedEndDate: dto.expectedEndDate ? new Date(dto.expectedEndDate) : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.enrollmentRepo.create({
      id: domainEnrollment.id,
      institutionId: domainEnrollment.institutionId,
      campusId: domainEnrollment.campusId,
      periodId: domainEnrollment.periodId,
      programId: domainEnrollment.programId,
      levelId: domainEnrollment.levelId,
      cohortId: domainEnrollment.cohortId,
      learnerId: domainEnrollment.learnerId,
      enrollmentNumber: domainEnrollment.enrollmentNumber,
      status: domainEnrollment.currentStatus,
      startDate: domainEnrollment.startDate.toISOString(),
      expectedEndDate: domainEnrollment.expectedEndDate?.toISOString(),
      metadata: dto.metadata,
      createdAt: new Date().toISOString(),
    });
  }

  public async submitEnrollment(enrollmentId: UUID): Promise<EnrollmentDto> {
    const enrollment = await this.getEnrollmentById(enrollmentId);

    AuthorizationKernel.authorizeResourceAccess(
      this.context,
      'enrollment.submit',
      { tenantId: enrollment.tenantId, learnerId: enrollment.learnerId }
    );

    EnrollmentStateMachine.validateTransition(enrollment.status, 'PENDING');

    const updated: EnrollmentDto = {
      ...enrollment,
      status: 'PENDING',
      updatedAt: new Date().toISOString(),
    };

    return this.enrollmentRepo.create(updated);
  }

  public async activateEnrollment(enrollmentId: UUID): Promise<EnrollmentDto> {
    const enrollment = await this.getEnrollmentById(enrollmentId);

    AuthorizationKernel.authorizeResourceAccess(
      this.context,
      'enrollment.activate',
      { tenantId: enrollment.tenantId, learnerId: enrollment.learnerId }
    );

    EnrollmentStateMachine.validateTransition(enrollment.status, 'ACTIVE');

    const updated: EnrollmentDto = {
      ...enrollment,
      status: 'ACTIVE',
      updatedAt: new Date().toISOString(),
    };

    return this.enrollmentRepo.create(updated);
  }

  public async completeEnrollment(enrollmentId: UUID): Promise<EnrollmentDto> {
    const enrollment = await this.getEnrollmentById(enrollmentId);

    AuthorizationKernel.authorizeResourceAccess(
      this.context,
      'enrollment.complete',
      { tenantId: enrollment.tenantId, learnerId: enrollment.learnerId }
    );

    EnrollmentStateMachine.validateTransition(enrollment.status, 'COMPLETED');

    const updated: EnrollmentDto = {
      ...enrollment,
      status: 'COMPLETED',
      actualEndDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return this.enrollmentRepo.create(updated);
  }

  /**
   * Transfer:
   * Enrollment A (ACTIVE) -> TRANSFERRED (terminal for A)
   * Creates Enrollment B (ACTIVE) with traceable transfer relationship.
   */
  public async transferEnrollment(
    sourceEnrollmentId: UUID,
    options: {
      targetInstitutionId?: UUID | undefined;
      targetCohortId?: UUID | undefined;
      targetProgramId?: UUID | undefined;
      reason?: string | undefined;
    }
  ): Promise<TransferResult> {
    const source = await this.getEnrollmentById(sourceEnrollmentId);

    AuthorizationKernel.authorizeResourceAccess(
      this.context,
      'enrollment.transfer',
      { tenantId: source.tenantId, learnerId: source.learnerId }
    );

    EnrollmentStateMachine.validateTransition(source.status, 'TRANSFERRED', {
      transferDetailsProvided: Boolean(options.targetCohortId || options.targetInstitutionId),
    });

    const targetEnrollmentId = nodeCrypto.randomUUID();
    const targetProgramId = options.targetProgramId || source.programId;
    const targetInstitutionId = options.targetInstitutionId || source.institutionId;

    // 1. Mark source as TRANSFERRED (Terminal status)
    const updatedSource: EnrollmentDto = {
      ...source,
      status: 'TRANSFERRED',
      actualEndDate: new Date().toISOString(),
      cancellationReason: options.reason,
      transferDetails: {
        targetInstitutionId,
        targetCohortId: options.targetCohortId,
        transferredAt: new Date().toISOString(),
        reason: options.reason,
      },
      updatedAt: new Date().toISOString(),
    };
    await this.enrollmentRepo.create(updatedSource);

    // 2. Create Target Enrollment B preserving lineage
    const targetEnrollment: EnrollmentDto = {
      id: targetEnrollmentId,
      tenantId: this.context.tenantId,
      institutionId: targetInstitutionId,
      campusId: source.campusId,
      periodId: source.periodId,
      programId: targetProgramId,
      levelId: source.levelId,
      cohortId: options.targetCohortId,
      learnerId: source.learnerId,
      enrollmentNumber: `ENR-${Date.now().toString().slice(-6)}`,
      status: 'ACTIVE',
      startDate: new Date().toISOString(),
      metadata: {
        transferredFromEnrollmentId: sourceEnrollmentId,
        transferReason: options.reason,
      },
      createdAt: new Date().toISOString(),
    };
    await this.enrollmentRepo.create(targetEnrollment);

    return {
      sourceEnrollment: updatedSource,
      targetEnrollment,
    };
  }
}
