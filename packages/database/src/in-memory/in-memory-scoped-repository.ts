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
  leads: new Map<UUID, any>(),
  applications: new Map<UUID, any>(),
  commercialRegistrations: new Map<UUID, any>(),
  contracts: new Map<UUID, any>(),
  paymentPlans: new Map<UUID, any>(),
  externalEntityMappings: new Map<UUID, any>(),
  conflicts: new Map<UUID, any>(),
  financialAccounts: new Map<UUID, any>(),
  collections: new Map<UUID, any>(),
  paymentAllocations: new Map<UUID, any>(),
  financialLedgerEntries: new Map<UUID, any>(),
  receipts: new Map<UUID, any>(),
  refunds: new Map<UUID, any>(),
  refundAllocations: new Map<UUID, any>(),
  reconciliationSessions: new Map<UUID, any>(),
  reconciliationItems: new Map<UUID, any>(),
  clear(): void {
    this.persons.clear();
    this.learners.clear();
    this.guardians.clear();
    this.enrollments.clear();
    this.leads.clear();
    this.applications.clear();
    this.commercialRegistrations.clear();
    this.contracts.clear();
    this.paymentPlans.clear();
    this.externalEntityMappings.clear();
    this.conflicts.clear();
    this.financialAccounts.clear();
    this.collections.clear();
    this.paymentAllocations.clear();
    this.financialLedgerEntries.clear();
    this.receipts.clear();
    this.refunds.clear();
    this.refundAllocations.clear();
    this.reconciliationSessions.clear();
    this.reconciliationItems.clear();
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

export class InMemoryScopedLeadRepository extends ScopedRepositoryBase<any> {
  constructor(context: RequestTenantContext) { super(context); }
  public async findById(id: UUID): Promise<any | null> {
    const item = globalDbStorage.leads.get(id);
    if (!item) return null;
    if (item.tenantId !== this.tenantId) {
      throw new CrossTenantViolationError(`Cross-Tenant Leak Prevented: Tenant '${this.tenantId}' tried to access Lead '${id}'`);
    }
    return item;
  }
  public async create(data: any): Promise<any> {
    const item = { ...data, tenantId: this.tenantId };
    globalDbStorage.leads.set(item.id, item);
    return item;
  }
  public async list(): Promise<any[]> {
    return Array.from(globalDbStorage.leads.values()).filter(l => l.tenantId === this.tenantId);
  }
}

export class InMemoryScopedCommercialRegistrationRepository extends ScopedRepositoryBase<any> {
  constructor(context: RequestTenantContext) { super(context); }
  public async findById(id: UUID): Promise<any | null> {
    const item = globalDbStorage.commercialRegistrations.get(id);
    if (!item) return null;
    if (item.tenantId !== this.tenantId) {
      throw new CrossTenantViolationError(`Cross-Tenant Leak Prevented: Tenant '${this.tenantId}' tried to access CommercialRegistration '${id}'`);
    }
    return item;
  }
  public async create(data: any): Promise<any> {
    const item = { ...data, tenantId: this.tenantId };
    globalDbStorage.commercialRegistrations.set(item.id, item);
    return item;
  }
  public async list(): Promise<any[]> {
    return Array.from(globalDbStorage.commercialRegistrations.values()).filter(r => r.tenantId === this.tenantId);
  }
}

export class InMemoryScopedExternalMappingRepository extends ScopedRepositoryBase<any> {
  constructor(context: RequestTenantContext) { super(context); }
  public async findByLocal(connectionId: UUID, entityType: string, entityId: UUID): Promise<any | null> {
    const match = Array.from(globalDbStorage.externalEntityMappings.values()).find(
      m => m.tenantId === this.tenantId && m.integrationConnectionId === connectionId && m.localEntityType === entityType && m.localEntityId === entityId
    );
    return match || null;
  }
  public async create(data: any): Promise<any> {
    // Check scoped uniqueness
    const existing = Array.from(globalDbStorage.externalEntityMappings.values()).find(
      m => m.tenantId === this.tenantId && m.integrationConnectionId === data.integrationConnectionId &&
           ((m.localEntityType === data.localEntityType && m.localEntityId === data.localEntityId) ||
            (m.externalEntityType === data.externalEntityType && m.externalEntityId === data.externalEntityId))
    );
    if (existing) {
      throw new Error(`Unique mapping violation in connection '${data.integrationConnectionId}'`);
    }
    const item = { ...data, tenantId: this.tenantId };
    globalDbStorage.externalEntityMappings.set(item.id, item);
    return item;
  }
}

export class InMemoryScopedFinancialAccountRepository extends ScopedRepositoryBase<any> {
  constructor(context: RequestTenantContext) { super(context); }
  public async findById(id: UUID): Promise<any | null> {
    const item = globalDbStorage.financialAccounts.get(id);
    if (!item) return null;
    if (item.tenantId !== this.tenantId) {
      throw new CrossTenantViolationError(`Cross-tenant violation: FinancialAccount ${item.id} belongs to different tenant.`);
    }
    return item;
  }
  public async create(data: any): Promise<any> {
    const item = { ...data, tenantId: this.tenantId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    globalDbStorage.financialAccounts.set(item.id, item);
    return item;
  }
  public async listByInstitution(institutionId?: UUID): Promise<any[]> {
    return Array.from(globalDbStorage.financialAccounts.values()).filter(
      a => a.tenantId === this.tenantId && (!institutionId || a.institutionId === institutionId)
    );
  }
}

export class InMemoryScopedCollectionRepository extends ScopedRepositoryBase<any> {
  constructor(context: RequestTenantContext) { super(context); }
  public async findById(id: UUID): Promise<any | null> {
    const item = globalDbStorage.collections.get(id);
    if (!item) return null;
    if (item.tenantId !== this.tenantId) {
      throw new CrossTenantViolationError(`Cross-tenant violation: Collection ${item.id} belongs to different tenant.`);
    }
    return item;
  }
  public async create(data: any): Promise<any> {
    const item = { ...data, tenantId: this.tenantId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    globalDbStorage.collections.set(item.id, item);
    return item;
  }
  public async update(id: UUID, data: Partial<any>): Promise<any> {
    const existing = await this.findById(id);
    if (!existing) throw new Error(`Collection ${id} not found`);
    const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
    globalDbStorage.collections.set(id, updated);
    return updated;
  }
}

export class InMemoryScopedPaymentAllocationRepository extends ScopedRepositoryBase<any> {
  constructor(context: RequestTenantContext) { super(context); }
  public async create(data: any): Promise<any> {
    const item = { ...data, tenantId: this.tenantId, createdAt: new Date().toISOString() };
    globalDbStorage.paymentAllocations.set(item.id, item);
    return item;
  }
  public async findByCollection(collectionId: UUID): Promise<any[]> {
    return Array.from(globalDbStorage.paymentAllocations.values()).filter(
      a => a.tenantId === this.tenantId && a.collectionId === collectionId
    );
  }
  public async findByInstallment(installmentId: UUID): Promise<any[]> {
    return Array.from(globalDbStorage.paymentAllocations.values()).filter(
      a => a.tenantId === this.tenantId && a.paymentInstallmentId === installmentId
    );
  }
  public async update(id: UUID, data: Partial<any>): Promise<any> {
    const existing = globalDbStorage.paymentAllocations.get(id);
    if (!existing || existing.tenantId !== this.tenantId) throw new Error(`Allocation ${id} not found`);
    const updated = { ...existing, ...data };
    globalDbStorage.paymentAllocations.set(id, updated);
    return updated;
  }
}

export class InMemoryScopedFinancialLedgerRepository extends ScopedRepositoryBase<any> {
  constructor(context: RequestTenantContext) { super(context); }
  public async create(data: any): Promise<any> {
    // Unique monotonic entryNumber per tenant
    const existingEntries = Array.from(globalDbStorage.financialLedgerEntries.values()).filter(
      e => e.tenantId === this.tenantId
    );
    const maxEntry = existingEntries.reduce((max, e) => {
      const num = BigInt(e.entryNumber);
      return num > max ? num : max;
    }, 0n);
    const entryNumber = (maxEntry + 1n).toString();
    const item = { ...data, tenantId: this.tenantId, entryNumber, postedAt: new Date().toISOString() };
    globalDbStorage.financialLedgerEntries.set(item.id, item);
    return item;
  }
  public async listByAccount(accountId: UUID): Promise<any[]> {
    return Array.from(globalDbStorage.financialLedgerEntries.values()).filter(
      e => e.tenantId === this.tenantId && e.financialAccountId === accountId
    );
  }
  public async markReversed(id: UUID, reversalEntryId: UUID): Promise<any> {
    const entry = globalDbStorage.financialLedgerEntries.get(id);
    if (!entry || entry.tenantId !== this.tenantId) throw new Error(`Entry ${id} not found`);
    if (entry.isReversed) throw new Error(`Entry ${id} is already reversed`);
    entry.isReversed = true;
    entry.reversalEntryId = reversalEntryId;
    return entry;
  }
}

export class InMemoryScopedReceiptRepository extends ScopedRepositoryBase<any> {
  constructor(context: RequestTenantContext) { super(context); }
  public async create(data: any): Promise<any> {
    // Unique receiptNumber per tenant check
    const existing = Array.from(globalDbStorage.receipts.values()).find(
      r => r.tenantId === this.tenantId && r.receiptNumber === data.receiptNumber
    );
    if (existing) {
      throw new Error(`Receipt number ${data.receiptNumber} already exists in tenant ${this.tenantId}`);
    }
    const item = { ...data, tenantId: this.tenantId, createdAt: new Date().toISOString() };
    globalDbStorage.receipts.set(item.id, item);
    return item;
  }
}

export class InMemoryScopedRefundRepository extends ScopedRepositoryBase<any> {
  constructor(context: RequestTenantContext) { super(context); }
  public async findById(id: UUID): Promise<any | null> {
    const item = globalDbStorage.refunds.get(id);
    if (!item) return null;
    if (item.tenantId !== this.tenantId) {
      throw new CrossTenantViolationError(`Cross-tenant violation: Refund ${item.id} belongs to different tenant.`);
    }
    return item;
  }
  public async create(data: any): Promise<any> {
    const item = { ...data, tenantId: this.tenantId, createdAt: new Date().toISOString() };
    globalDbStorage.refunds.set(item.id, item);
    return item;
  }
  public async update(id: UUID, data: Partial<any>): Promise<any> {
    const existing = await this.findById(id);
    if (!existing) throw new Error(`Refund ${id} not found`);
    const updated = { ...existing, ...data };
    globalDbStorage.refunds.set(id, updated);
    return updated;
  }
  public async createRefundAllocation(data: any): Promise<any> {
    const item = { ...data, tenantId: this.tenantId, createdAt: new Date().toISOString() };
    globalDbStorage.refundAllocations.set(item.id, item);
    return item;
  }
  public async listByCollection(collectionId: UUID): Promise<any[]> {
    return Array.from(globalDbStorage.refunds.values()).filter(
      r => r.tenantId === this.tenantId && r.collectionId === collectionId
    );
  }
}
