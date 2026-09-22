import * as nodeCrypto from 'node:crypto';
import {
  CreateLearnerDto,
  CreatePersonDto,
  LearnerDto,
  PersonDto,
  RequestTenantContext,
  UUID,
} from '@bilgenos/contracts';
import { AuthorizationKernel, MaskedNotFoundSecurityException, SecurityAuditEntry } from '@bilgenos/authorization';
import {
  InMemoryScopedLearnerRepository,
  InMemoryScopedPersonRepository,
} from '../in-memory/in-memory-scoped-repository.js';
import { CrossTenantViolationError } from '@bilgenos/domain';

export class PersonService {
  constructor(
    private readonly context: RequestTenantContext,
    private readonly personRepo: InMemoryScopedPersonRepository
  ) {}

  public async getPersonById(personId: UUID): Promise<PersonDto> {
    try {
      const person = await this.personRepo.findById(personId);
      if (!person) {
        throw new Error(`Person '${personId}' not found.`);
      }

      AuthorizationKernel.authorizeResourceAccess(
        this.context,
        'person.read',
        { tenantId: person.tenantId, personId: person.id }
      );

      return person;
    } catch (err: unknown) {
      if (err instanceof CrossTenantViolationError) {
        const audit: SecurityAuditEntry = {
          timestamp: new Date().toISOString(),
          tenantId: this.context.tenantId,
          actorUserId: this.context.userId,
          action: 'person.read',
          resourceId: personId,
          decision: 'DENY',
          reason: (err as Error).message,
          maskedAsNotFound: true,
        };
        // Record into central kernel audit logs
        AuthorizationKernel.recordExternalSecurityAudit(audit);
        throw new MaskedNotFoundSecurityException('Person not found', audit);
      }
      throw err;
    }
  }

  public async createPerson(dto: CreatePersonDto): Promise<PersonDto> {
    AuthorizationKernel.authorizeResourceAccess(
      this.context,
      'person.create',
      { tenantId: this.context.tenantId }
    );

    const personId = nodeCrypto.randomUUID();
    return this.personRepo.create({
      id: personId,
      firstName: dto.firstName,
      lastName: dto.lastName,
      nationalIdEncrypted: dto.nationalId,
      birthDate: dto.birthDate,
      gender: dto.gender,
      bloodType: dto.bloodType,
      emergencyPhone: dto.emergencyPhone,
      createdAt: new Date().toISOString(),
    });
  }

  public async updatePerson(personId: UUID, update: Partial<CreatePersonDto>): Promise<PersonDto> {
    try {
      const person = await this.personRepo.findById(personId);
      if (!person) {
        throw new Error(`Person '${personId}' not found.`);
      }

      AuthorizationKernel.authorizeResourceAccess(
        this.context,
        'person.update',
        { tenantId: person.tenantId, personId: person.id }
      );

      const updated: PersonDto = {
        ...person,
        firstName: update.firstName ?? person.firstName,
        lastName: update.lastName ?? person.lastName,
        updatedAt: new Date().toISOString(),
      };

      return this.personRepo.create(updated);
    } catch (err: unknown) {
      if (err instanceof CrossTenantViolationError) {
        const audit: SecurityAuditEntry = {
          timestamp: new Date().toISOString(),
          tenantId: this.context.tenantId,
          actorUserId: this.context.userId,
          action: 'person.update',
          resourceId: personId,
          decision: 'DENY',
          reason: (err as Error).message,
          maskedAsNotFound: true,
        };
        AuthorizationKernel.recordExternalSecurityAudit(audit);
        throw new MaskedNotFoundSecurityException('Person not found', audit);
      }
      throw err;
    }
  }

  public async deletePerson(personId: UUID): Promise<void> {
    try {
      const person = await this.personRepo.findById(personId);
      if (!person) {
        throw new Error(`Person '${personId}' not found.`);
      }

      AuthorizationKernel.authorizeResourceAccess(
        this.context,
        'person.delete',
        { tenantId: person.tenantId, personId: person.id }
      );
    } catch (err: unknown) {
      if (err instanceof CrossTenantViolationError) {
        const audit: SecurityAuditEntry = {
          timestamp: new Date().toISOString(),
          tenantId: this.context.tenantId,
          actorUserId: this.context.userId,
          action: 'person.delete',
          resourceId: personId,
          decision: 'DENY',
          reason: (err as Error).message,
          maskedAsNotFound: true,
        };
        AuthorizationKernel.recordExternalSecurityAudit(audit);
        throw new MaskedNotFoundSecurityException('Person not found', audit);
      }
      throw err;
    }
  }
}

export class LearnerService {
  constructor(
    private readonly context: RequestTenantContext,
    private readonly learnerRepo: InMemoryScopedLearnerRepository,
    private readonly personRepo: InMemoryScopedPersonRepository
  ) {}

  public async getLearnerById(learnerId: UUID): Promise<LearnerDto> {
    try {
      const learner = await this.learnerRepo.findById(learnerId);
      if (!learner) {
        throw new Error(`Learner '${learnerId}' not found.`);
      }

      AuthorizationKernel.authorizeResourceAccess(
        this.context,
        'learner.read',
        { tenantId: learner.tenantId, learnerId: learner.id }
      );

      return learner;
    } catch (err: unknown) {
      if (err instanceof CrossTenantViolationError) {
        const audit: SecurityAuditEntry = {
          timestamp: new Date().toISOString(),
          tenantId: this.context.tenantId,
          actorUserId: this.context.userId,
          action: 'learner.read',
          resourceId: learnerId,
          decision: 'DENY',
          reason: (err as Error).message,
          maskedAsNotFound: true,
        };
        AuthorizationKernel.recordExternalSecurityAudit(audit);
        throw new MaskedNotFoundSecurityException('Learner not found', audit);
      }
      throw err;
    }
  }

  public async createLearner(dto: CreateLearnerDto): Promise<LearnerDto> {
    AuthorizationKernel.authorizeResourceAccess(
      this.context,
      'learner.create',
      { tenantId: this.context.tenantId }
    );

    // Verify Person belongs to the same tenant!
    const person = await this.personRepo.findById(dto.personId);
    if (!person) {
      throw new Error(`Person '${dto.personId}' not found.`);
    }

    if (person.tenantId !== this.context.tenantId) {
      throw new CrossTenantViolationError(
        `Cross-Tenant Error: Cannot create Learner for Person belonging to another tenant.`
      );
    }

    const learnerId = nodeCrypto.randomUUID();
    return this.learnerRepo.create({
      id: learnerId,
      personId: dto.personId,
      institutionId: dto.institutionId,
      learnerNumber: dto.learnerNumber,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    });
  }

  public async updateLearner(learnerId: UUID, update: { learnerNumber?: string }): Promise<LearnerDto> {
    try {
      const learner = await this.learnerRepo.findById(learnerId);
      if (!learner) {
        throw new Error(`Learner '${learnerId}' not found.`);
      }

      AuthorizationKernel.authorizeResourceAccess(
        this.context,
        'learner.update',
        { tenantId: learner.tenantId, learnerId: learner.id }
      );

      const updated: LearnerDto = {
        ...learner,
        learnerNumber: update.learnerNumber ?? learner.learnerNumber,
        updatedAt: new Date().toISOString(),
      };

      return this.learnerRepo.create(updated);
    } catch (err: unknown) {
      if (err instanceof CrossTenantViolationError) {
        const audit: SecurityAuditEntry = {
          timestamp: new Date().toISOString(),
          tenantId: this.context.tenantId,
          actorUserId: this.context.userId,
          action: 'learner.update',
          resourceId: learnerId,
          decision: 'DENY',
          reason: (err as Error).message,
          maskedAsNotFound: true,
        };
        AuthorizationKernel.recordExternalSecurityAudit(audit);
        throw new MaskedNotFoundSecurityException('Learner not found', audit);
      }
      throw err;
    }
  }
}
