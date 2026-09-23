import * as nodeCrypto from 'node:crypto';
import type {
  RequestTenantContext,
  UUID,
  CreateLeadDto,
  LeadDto,
  CommercialRegistrationDto,
  CreateCommercialRegistrationDto,
  CommercialRegistrationReadyEvent,
} from '@bilgenos/contracts';
import {
  CommercialRegistration,
  Lead,
  BilgenOkulAdapter,
  WebhookVerificationStrategy,
  DomainError,
} from '@bilgenos/domain';
import {
  InMemoryScopedLeadRepository,
  InMemoryScopedCommercialRegistrationRepository,
  InMemoryScopedExternalMappingRepository,
} from '../in-memory/in-memory-scoped-repository.js';
import { TransactionalMutationRunner } from './transactional-mutation-runner.js';

export class AdmissionsService {
  constructor(
    private readonly context: RequestTenantContext,
    private readonly leadRepo: InMemoryScopedLeadRepository
  ) {}

  public async createLead(dto: CreateLeadDto): Promise<LeadDto> {
    const id = nodeCrypto.randomUUID();
    const lead = new Lead({
      id,
      tenantId: this.context.tenantId,
      institutionId: dto.institutionId,
      candidatePersonId: dto.candidatePersonId,
      guardianPersonId: dto.guardianPersonId,
      source: dto.source,
      status: 'NEW',
      assignedToUserId: dto.assignedToUserId,
      interestedProgramId: dto.interestedProgramId,
      notesSummary: dto.notesSummary,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.leadRepo.create({
      id: lead.id,
      institutionId: lead.institutionId,
      candidatePersonId: lead.candidatePersonId,
      source: lead.source,
      status: lead.currentStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  public async advanceLeadStatus(leadId: UUID, nextStatus: any): Promise<LeadDto> {
    const lead = await this.leadRepo.findById(leadId);
    if (!lead) throw new Error(`Lead '${leadId}' not found.`);

    const updated = {
      ...lead,
      status: nextStatus,
      updatedAt: new Date().toISOString(),
    };
    return this.leadRepo.create(updated);
  }
}

export class CommercialService {
  constructor(
    private readonly context: RequestTenantContext,
    private readonly regRepo: InMemoryScopedCommercialRegistrationRepository
  ) {}

  public async createRegistration(dto: CreateCommercialRegistrationDto): Promise<CommercialRegistrationDto> {
    const id = nodeCrypto.randomUUID();
    const reg = new CommercialRegistration({
      id,
      tenantId: this.context.tenantId,
      institutionId: dto.institutionId,
      candidatePersonId: dto.candidatePersonId,
      guardianPersonId: dto.guardianPersonId,
      financialResponsiblePersonId: dto.financialResponsiblePersonId,
      applicationId: dto.applicationId,
      offerId: dto.offerId,
      educationPeriodId: dto.educationPeriodId,
      programId: dto.programId,
      campusId: dto.campusId,
      status: 'DRAFT',
      integrationStatus: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.regRepo.create({
      id: reg.id,
      institutionId: reg.institutionId,
      candidatePersonId: reg.candidatePersonId,
      guardianPersonId: reg.guardianPersonId,
      financialResponsiblePersonId: reg.financialResponsiblePersonId,
      status: reg.currentStatus,
      integrationStatus: reg.currentIntegrationStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  public async markRegistrationReady(
    registrationId: UUID,
    contractId: UUID,
    paymentPlanId: UUID
  ): Promise<CommercialRegistrationDto> {
    return TransactionalMutationRunner.execute(this.context, {
      actionName: 'commercial_registration.mark_ready',
      aggregateType: 'CommercialRegistration',
      aggregateId: registrationId,
      validateInvariants: () => {},
      mutateDomain: async () => {
        const existing = await this.regRepo.findById(registrationId);
        if (!existing) throw new Error('Registration not found');

        const domain = new CommercialRegistration({
          id: existing.id,
          tenantId: existing.tenantId,
          institutionId: existing.institutionId,
          candidatePersonId: existing.candidatePersonId,
          financialResponsiblePersonId: existing.financialResponsiblePersonId,
          status: existing.status,
          integrationStatus: existing.integrationStatus,
          contractId,
          paymentPlanId,
          createdAt: new Date(existing.createdAt),
          updatedAt: new Date(),
        });

        domain.markReady();

        const updated: CommercialRegistrationDto = {
          ...existing,
          status: domain.currentStatus,
          contractId,
          paymentPlanId,
          updatedAt: new Date().toISOString(),
        };

        return this.regRepo.create(updated);
      },
      createEvent: (result): CommercialRegistrationReadyEvent => ({
        eventId: nodeCrypto.randomUUID(),
        eventType: 'CommercialRegistrationReady',
        tenantId: this.context.tenantId,
        aggregateId: result.id,
        aggregateType: 'CommercialRegistration',
        timestamp: new Date().toISOString(),
        payload: {
          registrationId: result.id,
          tenantId: this.context.tenantId,
          institutionId: result.institutionId,
          candidatePersonId: result.candidatePersonId,
          financialResponsiblePersonId: result.financialResponsiblePersonId,
        },
      }),
    });
  }

  /**
   * Binding Constraint #1:
   * CommercialRegistration activation does NOT automatically create or activate Phase 1 Enrollment.
   * ServiceEnrollment is distinct.
   */
  public async activateRegistration(registrationId: UUID): Promise<CommercialRegistrationDto> {
    const existing = await this.regRepo.findById(registrationId);
    if (!existing) throw new Error('Registration not found');

    const domain = new CommercialRegistration({
      id: existing.id,
      tenantId: existing.tenantId,
      institutionId: existing.institutionId,
      candidatePersonId: existing.candidatePersonId,
      financialResponsiblePersonId: existing.financialResponsiblePersonId,
      status: existing.status,
      integrationStatus: existing.integrationStatus,
      contractId: existing.contractId,
      paymentPlanId: existing.paymentPlanId,
      createdAt: new Date(existing.createdAt),
      updatedAt: new Date(),
    });

    domain.activate();

    const updated: CommercialRegistrationDto = {
      ...existing,
      status: domain.currentStatus,
      updatedAt: new Date().toISOString(),
    };

    return this.regRepo.create(updated);
  }
}

export class IntegrationHubService {
  constructor(
    private readonly context: RequestTenantContext,
    private readonly mappingRepo: InMemoryScopedExternalMappingRepository,
    private readonly regRepo: InMemoryScopedCommercialRegistrationRepository,
    private readonly adapter: BilgenOkulAdapter
  ) {}

  public async processProvisioning(
    connectionId: UUID,
    registrationId: UUID,
    candidateIdentity: { nationalId?: string | undefined; fullName: string; email?: string | undefined }
  ): Promise<{ status: string; externalId?: string | undefined; conflictReason?: string | undefined }> {
    const registration = await this.regRepo.findById(registrationId);
    if (!registration) throw new Error('Registration not found');

    const result = await this.adapter.resolveAndSyncStudent(registration.candidatePersonId, candidateIdentity);

    if (result.status === 'MAPPED' || result.status === 'CREATED_AND_MAPPED') {
      await this.mappingRepo.create({
        id: nodeCrypto.randomUUID(),
        tenantId: this.context.tenantId,
        integrationConnectionId: connectionId,
        localEntityType: 'PERSON',
        localEntityId: registration.candidatePersonId,
        externalEntityType: 'BILGEN_OKUL_STUDENT',
        externalEntityId: result.externalStudentId!,
        syncStatus: 'SYNCED',
        lastSyncedAt: new Date().toISOString(),
      });

      // Update registration integration status to SYNCED
      await this.regRepo.create({
        ...registration,
        integrationStatus: 'SYNCED',
        updatedAt: new Date().toISOString(),
      });

      return { status: 'SYNCED', externalId: result.externalStudentId ?? undefined };
    }

    if (result.status === 'CONFLICT') {
      // Invariant: Integration conflict updates registration integrationStatus to CONFLICT, does NOT rollback registration
      await this.regRepo.create({
        ...registration,
        integrationStatus: 'CONFLICT',
        updatedAt: new Date().toISOString(),
      });

      return { status: 'CONFLICT', conflictReason: result.conflictReason ?? undefined };
    }

    return { status: 'FAILED' };
  }

  /**
   * Binding Constraint #3:
   * Provider-independent webhook verification
   */
  public async processInboundWebhook(
    _providerCode: string,
    strategy: WebhookVerificationStrategy,
    headers: Record<string, string | string[] | undefined>,
    payload: string | Buffer
  ): Promise<boolean> {
    const isValid = await strategy.verify({ headers, payload });
    if (!isValid) {
      throw new DomainError('Inbound webhook verification failed.');
    }
    return true;
  }
}
