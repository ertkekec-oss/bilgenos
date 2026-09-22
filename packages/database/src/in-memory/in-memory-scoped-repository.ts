import {
  EnrollmentDto,
  GuardianRelationshipDto,
  LearnerDto,
  PersonDto,
  RequestTenantContext,
  UUID,
} from '@bilgenos/contracts';
import { ScopedRepositoryBase } from '../scoped-repository.base.js';
import { CrossTenantViolationError } from '@bilgenos/domain';

// In-Memory Shared Storage (Simulates PostgreSQL multi-tenant database)
export const globalDbStorage = {
  persons: new Map<UUID, PersonDto>(),
  learners: new Map<UUID, LearnerDto>(),
  guardians: new Map<UUID, GuardianRelationshipDto>(),
  enrollments: new Map<UUID, EnrollmentDto>(),
  clear(): void {
    this.persons.clear();
    this.learners.clear();
    this.guardians.clear();
    this.enrollments.clear();
  },
};

export class InMemoryScopedPersonRepository extends ScopedRepositoryBase<PersonDto> {
  constructor(context: RequestTenantContext) {
    super(context);
  }

  public async findById(id: UUID): Promise<PersonDto | null> {
    const person = globalDbStorage.persons.get(id);
    if (!person) return null;
    // CRITICAL: Prevent cross-tenant data leak
    if (person.tenantId !== this.tenantId) {
      throw new CrossTenantViolationError(
        `Cross-Tenant Leak Prevented: Tenant '${this.tenantId}' attempted to access Person '${id}' belonging to Tenant '${person.tenantId}'.`
      );
    }
    return person;
  }

  public async create(data: Omit<PersonDto, 'tenantId'>): Promise<PersonDto> {
    const person: PersonDto = {
      ...data,
      tenantId: this.tenantId,
    };
    globalDbStorage.persons.set(person.id, person);
    return person;
  }

  public async list(): Promise<PersonDto[]> {
    return Array.from(globalDbStorage.persons.values()).filter(
      (p) => p.tenantId === this.tenantId
    );
  }
}

export class InMemoryScopedLearnerRepository extends ScopedRepositoryBase<LearnerDto> {
  constructor(context: RequestTenantContext) {
    super(context);
  }

  public async findById(id: UUID): Promise<LearnerDto | null> {
    const learner = globalDbStorage.learners.get(id);
    if (!learner) return null;
    if (learner.tenantId !== this.tenantId) {
      throw new CrossTenantViolationError(
        `Cross-Tenant Leak Prevented: Tenant '${this.tenantId}' attempted to access Learner '${id}' belonging to Tenant '${learner.tenantId}'.`
      );
    }
    return learner;
  }

  public async create(data: Omit<LearnerDto, 'tenantId'>): Promise<LearnerDto> {
    // Assert person belongs to the same tenant!
    const person = globalDbStorage.persons.get(data.personId);
    if (person && person.tenantId !== this.tenantId) {
      throw new CrossTenantViolationError(
        `Cross-Tenant FK Denied: Cannot link Learner to Person belonging to another tenant.`
      );
    }

    const learner: LearnerDto = {
      ...data,
      tenantId: this.tenantId,
    };
    globalDbStorage.learners.set(learner.id, learner);
    return learner;
  }
}

export class InMemoryScopedEnrollmentRepository extends ScopedRepositoryBase<EnrollmentDto> {
  constructor(context: RequestTenantContext) {
    super(context);
  }

  public async findById(id: UUID): Promise<EnrollmentDto | null> {
    const enrollment = globalDbStorage.enrollments.get(id);
    if (!enrollment) return null;
    if (enrollment.tenantId !== this.tenantId) {
      throw new CrossTenantViolationError(
        `Cross-Tenant Leak Prevented: Tenant '${this.tenantId}' attempted to access Enrollment '${id}' belonging to Tenant '${enrollment.tenantId}'.`
      );
    }
    return enrollment;
  }

  public async create(data: Omit<EnrollmentDto, 'tenantId'>): Promise<EnrollmentDto> {
    const enrollment: EnrollmentDto = {
      ...data,
      tenantId: this.tenantId,
    };
    globalDbStorage.enrollments.set(enrollment.id, enrollment);
    return enrollment;
  }
}
