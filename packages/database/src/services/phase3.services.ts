import crypto from 'crypto';
import type {
  CreateFinancialAccountDto,
  FinancialAccountDto,
  CreateCollectionDto,
  CollectionDto,
  AllocatePaymentRequestDto,
  PaymentAllocationDto,
  ReceiptDto,
  RequestRefundDto,
  RefundDto,
  RequestTenantContext,
  UUID,
} from '@bilgenos/contracts';
import {
  FinancialAccount,
  Collection,
  PaymentAllocation,
  FinancialLedgerEntry,
  Receipt,
  Refund,
  InvariantViolationError,
  DomainError,
} from '@bilgenos/domain';
import {
  globalDbStorage,
  InMemoryScopedFinancialAccountRepository,
  InMemoryScopedCollectionRepository,
  InMemoryScopedPaymentAllocationRepository,
  InMemoryScopedFinancialLedgerRepository,
  InMemoryScopedReceiptRepository,
  InMemoryScopedRefundRepository,
} from '../in-memory/in-memory-scoped-repository.js';

export class FinanceOperationsService {
  private accountRepo: InMemoryScopedFinancialAccountRepository;
  private collectionRepo: InMemoryScopedCollectionRepository;
  private allocationRepo: InMemoryScopedPaymentAllocationRepository;
  private ledgerRepo: InMemoryScopedFinancialLedgerRepository;
  private receiptRepo: InMemoryScopedReceiptRepository;
  private refundRepo: InMemoryScopedRefundRepository;

  constructor(private readonly context: RequestTenantContext) {
    this.accountRepo = new InMemoryScopedFinancialAccountRepository(context);
    this.collectionRepo = new InMemoryScopedCollectionRepository(context);
    this.allocationRepo = new InMemoryScopedPaymentAllocationRepository(context);
    this.ledgerRepo = new InMemoryScopedFinancialLedgerRepository(context);
    this.receiptRepo = new InMemoryScopedReceiptRepository(context);
    this.refundRepo = new InMemoryScopedRefundRepository(context);
  }

  // 1. FinancialAccount
  public async createAccount(dto: CreateFinancialAccountDto): Promise<FinancialAccountDto> {
    const id = crypto.randomUUID();
    const accountDomain = new FinancialAccount({
      id,
      tenantId: this.context.tenantId,
      institutionId: dto.institutionId,
      name: dto.name,
      accountType: dto.accountType,
      currency: dto.currency || 'TRY',
      accountNumber: dto.accountNumber,
      iban: dto.iban,
      bankName: dto.bankName,
      branchName: dto.branchName,
      isActive: true,
    });

    const record = await this.accountRepo.create({
      id: accountDomain.id,
      institutionId: accountDomain.institutionId,
      name: accountDomain.name,
      accountType: accountDomain.accountType,
      currency: accountDomain.currency,
      accountNumber: accountDomain.accountNumber,
      iban: accountDomain.iban,
      bankName: accountDomain.bankName,
      branchName: accountDomain.branchName,
      isActive: accountDomain.isActive,
    });
    return record;
  }

  public async getAccountProjectedBalance(accountId: UUID): Promise<bigint> {
    const account = await this.accountRepo.findById(accountId);
    if (!account) throw new DomainError(`FinancialAccount ${accountId} not found`);
    const entriesRaw = await this.ledgerRepo.listByAccount(accountId);
    const domainEntries = entriesRaw.map(
      (e: any) =>
        new FinancialLedgerEntry({
          id: e.id,
          tenantId: e.tenantId,
          institutionId: e.institutionId,
          entryNumber: BigInt(e.entryNumber),
          financialAccountId: e.financialAccountId,
          entryType: e.entryType,
          amountMinor: BigInt(e.amountMinor),
          currency: e.currency,
          sourceReferenceType: e.sourceReferenceType,
          sourceReferenceId: e.sourceReferenceId,
          description: e.description,
          isReversed: e.isReversed,
          reversalEntryId: e.reversalEntryId,
          postedAt: new Date(e.postedAt),
        })
    );
    const accountDomain = new FinancialAccount({
      id: account.id,
      tenantId: account.tenantId,
      institutionId: account.institutionId,
      name: account.name,
      accountType: account.accountType,
      currency: account.currency,
      isActive: account.isActive,
    });
    return accountDomain.calculateProjectedBalance(domainEntries);
  }

  // 2. Collection
  public async createCollection(dto: CreateCollectionDto): Promise<CollectionDto> {
    const id = crypto.randomUUID();
    const amountMinor = BigInt(dto.amountMinor);
    const domain = new Collection({
      id,
      tenantId: this.context.tenantId,
      institutionId: dto.institutionId,
      financialResponsiblePersonId: dto.financialResponsiblePersonId,
      financialAccountId: dto.financialAccountId,
      paymentMethod: dto.paymentMethod,
      amountMinor,
      currency: dto.currency || 'TRY',
      collectedAt: dto.collectedAt ? new Date(dto.collectedAt) : new Date(),
      referenceNumber: dto.referenceNumber,
      status: 'PENDING',
      notes: dto.notes,
    });

    const record = await this.collectionRepo.create({
      id: domain.id,
      institutionId: domain.institutionId,
      financialResponsiblePersonId: domain.financialResponsiblePersonId,
      financialAccountId: domain.financialAccountId,
      paymentMethod: domain.paymentMethod,
      amountMinor: domain.amountMinor.toString(),
      currency: domain.currency,
      collectedAt: domain.collectedAt.toISOString(),
      referenceNumber: domain.referenceNumber,
      status: domain.currentStatus,
      notes: domain.notes,
    });

    return {
      ...record,
      allocationState: 'UNALLOCATED',
      allocatedAmountMinor: '0',
      unallocatedAmountMinor: domain.amountMinor.toString(),
    };
  }

  public async confirmCollection(collectionId: UUID): Promise<CollectionDto> {
    const raw = await this.collectionRepo.findById(collectionId);
    if (!raw) throw new DomainError(`Collection ${collectionId} not found`);

    const domain = new Collection({
      id: raw.id,
      tenantId: raw.tenantId,
      institutionId: raw.institutionId,
      financialResponsiblePersonId: raw.financialResponsiblePersonId,
      financialAccountId: raw.financialAccountId,
      paymentMethod: raw.paymentMethod,
      amountMinor: BigInt(raw.amountMinor),
      currency: raw.currency,
      collectedAt: new Date(raw.collectedAt),
      referenceNumber: raw.referenceNumber,
      status: raw.status,
      notes: raw.notes,
    });

    domain.confirm();

    // Post to Operational Financial Ledger
    await this.ledgerRepo.create({
      id: crypto.randomUUID(),
      institutionId: domain.institutionId,
      financialAccountId: domain.financialAccountId,
      entryType: 'MONEY_IN',
      amountMinor: domain.amountMinor.toString(),
      currency: domain.currency,
      sourceReferenceType: 'COLLECTION',
      sourceReferenceId: domain.id,
      description: `Collection confirmed: ${domain.referenceNumber || domain.id}`,
      isReversed: false,
    });

    const updated = await this.collectionRepo.update(collectionId, {
      status: domain.currentStatus,
    });

    const allocs = await this.allocationRepo.findByCollection(collectionId);
    const summary = domain.getAllocationSummary(
      allocs.map(
        (a: any) =>
          new PaymentAllocation({
            id: a.id,
            tenantId: a.tenantId,
            collectionId: a.collectionId,
            paymentInstallmentId: a.paymentInstallmentId,
            amountMinor: BigInt(a.amountMinor),
            allocatedAt: new Date(a.allocatedAt),
            status: a.status,
          })
      )
    );

    return {
      ...updated,
      allocationState: summary.allocationState,
      allocatedAmountMinor: summary.allocatedAmountMinor.toString(),
      unallocatedAmountMinor: summary.unallocatedAmountMinor.toString(),
    };
  }

  // 3. Payment Allocation
  public async allocatePayment(dto: AllocatePaymentRequestDto): Promise<{
    allocations: PaymentAllocationDto[];
    collection: CollectionDto;
  }> {
    const rawCollection = await this.collectionRepo.findById(dto.collectionId);
    if (!rawCollection) throw new DomainError(`Collection ${dto.collectionId} not found`);
    if (rawCollection.status !== 'CONFIRMED' && rawCollection.status !== 'PARTIALLY_REFUNDED') {
      throw new DomainError('Cannot allocate money from unconfirmed collection. Current status: ' + rawCollection.status);
    }

    const domainCollection = new Collection({
      id: rawCollection.id,
      tenantId: rawCollection.tenantId,
      institutionId: rawCollection.institutionId,
      financialResponsiblePersonId: rawCollection.financialResponsiblePersonId,
      financialAccountId: rawCollection.financialAccountId,
      paymentMethod: rawCollection.paymentMethod,
      amountMinor: BigInt(rawCollection.amountMinor),
      currency: rawCollection.currency,
      collectedAt: new Date(rawCollection.collectedAt),
      referenceNumber: rawCollection.referenceNumber,
      status: rawCollection.status,
    });

    // Check existing allocations
    const existingRawAllocs = await this.allocationRepo.findByCollection(dto.collectionId);
    const existingDomainAllocs = existingRawAllocs.map(
      (a: any) =>
        new PaymentAllocation({
          id: a.id,
          tenantId: a.tenantId,
          collectionId: a.collectionId,
          paymentInstallmentId: a.paymentInstallmentId,
          amountMinor: BigInt(a.amountMinor),
          allocatedAt: new Date(a.allocatedAt),
          status: a.status,
        })
    );


    const newAllocs: PaymentAllocationDto[] = [];
    const proposedAllocs = [...existingDomainAllocs];

    for (const item of dto.allocations) {
      const allocMinor = BigInt(item.amountMinor);
      const allocId = crypto.randomUUID();
      const newAllocDomain = new PaymentAllocation({
        id: allocId,
        tenantId: this.context.tenantId,
        collectionId: dto.collectionId,
        paymentInstallmentId: item.paymentInstallmentId,
        amountMinor: allocMinor,
        allocatedAt: new Date(),
        status: 'ACTIVE',
      });

      proposedAllocs.push(newAllocDomain);

      // Verify overall collection money conservation invariant
      domainCollection.getAllocationSummary(proposedAllocs);

      // Update installment paid status
      // Find installment across payment plans
      let matchedInstallment: any = null;
      for (const plan of globalDbStorage.paymentPlans.values()) {
        const found = plan.installments?.find((i: any) => i.id === item.paymentInstallmentId);
        if (found) {
          matchedInstallment = found;
          break;
        }
      }

      if (matchedInstallment) {
        // Calculate cumulative active allocations for this installment
        const instAllocs = await this.allocationRepo.findByInstallment(item.paymentInstallmentId);
        const priorPaid = instAllocs
          .filter((a: any) => a.status === 'ACTIVE')
          .reduce((sum: bigint, a: any) => sum + BigInt(a.amountMinor), 0n);
        const totalPaid = priorPaid + allocMinor;
        const instDue = BigInt(matchedInstallment.amountMinor);

        if (totalPaid > instDue) {
          throw new InvariantViolationError(
            `Overpayment on installment ${item.paymentInstallmentId}: total paid (${totalPaid}) exceeds installment amount (${instDue})`
          );
        }

        matchedInstallment.status = totalPaid === instDue ? 'PAID' : 'PARTIALLY_PAID';
      }

      const created = await this.allocationRepo.create({
        id: newAllocDomain.id,
        collectionId: newAllocDomain.collectionId,
        paymentInstallmentId: newAllocDomain.paymentInstallmentId,
        amountMinor: newAllocDomain.amountMinor.toString(),
        allocatedAt: newAllocDomain.allocatedAt.toISOString(),
        status: newAllocDomain.status,
      });
      newAllocs.push(created);
    }

    const finalSummary = domainCollection.getAllocationSummary(proposedAllocs);

    return {
      allocations: newAllocs,
      collection: {
        ...rawCollection,
        allocationState: finalSummary.allocationState,
        allocatedAmountMinor: finalSummary.allocatedAmountMinor.toString(),
        unallocatedAmountMinor: finalSummary.unallocatedAmountMinor.toString(),
      },
    };
  }

  // 4. Receipt
  public async issueReceipt(collectionId: UUID, recipientPersonId: UUID, receiptNumber: string, documentReference?: string): Promise<ReceiptDto> {
    const coll = await this.collectionRepo.findById(collectionId);
    if (!coll) throw new DomainError(`Collection ${collectionId} not found`);
    if (coll.status !== 'CONFIRMED' && coll.status !== 'PARTIALLY_REFUNDED') {
      throw new DomainError('Receipts can only be issued for confirmed collections.');
    }

    const domain = new Receipt({
      id: crypto.randomUUID(),
      tenantId: this.context.tenantId,
      institutionId: coll.institutionId,
      collectionId,
      receiptNumber,
      recipientPersonId,
      amountMinor: BigInt(coll.amountMinor),
      currency: coll.currency,
      documentReference,
      status: 'ISSUED',
      issuedAt: new Date(),
    });

    const record = await this.receiptRepo.create({
      id: domain.id,
      institutionId: domain.institutionId,
      collectionId: domain.collectionId,
      receiptNumber: domain.receiptNumber,
      recipientPersonId: domain.recipientPersonId,
      amountMinor: domain.amountMinor.toString(),
      currency: domain.currency,
      documentReference: domain.documentReference,
      status: domain.currentStatus,
      issuedAt: domain.issuedAt.toISOString(),
    });
    return record;
  }

  // 5. Refund & RefundAllocation
  public async requestRefund(dto: RequestRefundDto): Promise<RefundDto> {
    const coll = await this.collectionRepo.findById(dto.collectionId);
    if (!coll) throw new DomainError(`Collection ${dto.collectionId} not found`);

    const refundAmountMinor = BigInt(dto.amountMinor);

    // Invariant: Refund <= Collected - PriorRefunds
    const priorRefunds = await this.refundRepo.listByCollection(dto.collectionId);
    const priorCompletedMinor = priorRefunds
      .filter((r: any) => r.status === 'COMPLETED')
      .reduce((sum: bigint, r: any) => sum + BigInt(r.amountMinor), 0n);

    const maxRefundable = BigInt(coll.amountMinor) - priorCompletedMinor;
    if (refundAmountMinor > maxRefundable) {
      throw new InvariantViolationError(
        `Refund amount (${refundAmountMinor}) exceeds refundable collected amount (${maxRefundable})`
      );
    }

    const refundId = crypto.randomUUID();
    const refundDomain = new Refund({
      id: refundId,
      tenantId: this.context.tenantId,
      institutionId: coll.institutionId,
      collectionId: dto.collectionId,
      amountMinor: refundAmountMinor,
      currency: coll.currency,
      reason: dto.reason,
      status: 'REQUESTED',
      requestedByUserId: dto.requestedByUserId,
      allocations: [],
    });

    const record = await this.refundRepo.create({
      id: refundDomain.id,
      institutionId: refundDomain.institutionId,
      collectionId: refundDomain.collectionId,
      amountMinor: refundDomain.amountMinor.toString(),
      currency: refundDomain.currency,
      reason: refundDomain.reason,
      status: refundDomain.currentStatus,
      requestedByUserId: refundDomain.requestedByUserId,
    });

    // Save requested refund allocations
    if (dto.allocationsToReopen) {
      for (const item of dto.allocationsToReopen) {
        await this.refundRepo.createRefundAllocation({
          id: crypto.randomUUID(),
          refundId: record.id,
          paymentAllocationId: item.paymentAllocationId,
          amountMinor: item.amountMinor,
          status: 'ACTIVE',
        });
      }
    }

    return record;
  }

  public async approveRefund(refundId: UUID, approverUserId: UUID): Promise<RefundDto> {
    const refund = await this.refundRepo.findById(refundId);
    if (!refund) throw new DomainError(`Refund ${refundId} not found`);

    const domain = new Refund({
      id: refund.id,
      tenantId: refund.tenantId,
      institutionId: refund.institutionId,
      collectionId: refund.collectionId,
      amountMinor: BigInt(refund.amountMinor),
      currency: refund.currency,
      reason: refund.reason,
      status: refund.status,
      requestedByUserId: refund.requestedByUserId,
      approvedByUserId: refund.approvedByUserId,
      allocations: [],
    });

    domain.approve(approverUserId);

    const updated = await this.refundRepo.update(refundId, {
      status: domain.currentStatus,
      approvedByUserId: domain.currentApprovedByUserId,
    });
    return updated;
  }

  public async completeRefund(refundId: UUID, completerUserId: UUID): Promise<RefundDto> {
    const refund = await this.refundRepo.findById(refundId);
    if (!refund) throw new DomainError(`Refund ${refundId} not found`);

    const coll = await this.collectionRepo.findById(refund.collectionId);
    if (!coll) throw new DomainError(`Collection ${refund.collectionId} not found`);

    const domain = new Refund({
      id: refund.id,
      tenantId: refund.tenantId,
      institutionId: refund.institutionId,
      collectionId: refund.collectionId,
      amountMinor: BigInt(refund.amountMinor),
      currency: refund.currency,
      reason: refund.reason,
      status: refund.status,
      requestedByUserId: refund.requestedByUserId,
      approvedByUserId: refund.approvedByUserId,
      allocations: [],
    });

    domain.complete(completerUserId);

    // Post to Operational Financial Ledger: MONEY_OUT
    await this.ledgerRepo.create({
      id: crypto.randomUUID(),
      institutionId: domain.institutionId,
      financialAccountId: coll.financialAccountId,
      entryType: 'MONEY_OUT',
      amountMinor: domain.amountMinor.toString(),
      currency: domain.currency,
      sourceReferenceType: 'REFUND',
      sourceReferenceId: domain.id,
      description: `Refund completed: ${domain.reason}`,
      isReversed: false,
    });

    // Reopen installment paid balance for any associated refund allocations
    const refundAllocs = Array.from(globalDbStorage.refundAllocations.values()).filter(
      (ra: any) => ra.refundId === refundId && ra.status === 'ACTIVE'
    );
    for (const ra of refundAllocs) {
      const origAlloc = globalDbStorage.paymentAllocations.get(ra.paymentAllocationId);
      if (origAlloc) {
        origAlloc.status = 'REVERSED';
        // Recalculate installment
        for (const plan of globalDbStorage.paymentPlans.values()) {
          const inst = plan.installments?.find((i: any) => i.id === origAlloc.paymentInstallmentId);
          if (inst) {
            const remainingActive = Array.from(globalDbStorage.paymentAllocations.values())
              .filter((a: any) => a.paymentInstallmentId === inst.id && a.status === 'ACTIVE')
              .reduce((sum: bigint, a: any) => sum + BigInt(a.amountMinor), 0n);
            const instDue = BigInt(inst.amountMinor);
            if (remainingActive === 0n) {
              inst.status = 'PENDING';
            } else if (remainingActive < instDue) {
              inst.status = 'PARTIALLY_PAID';
            } else {
              inst.status = 'PAID';
            }
          }
        }
      }
    }

    // Update collection status
    const allRefunds = await this.refundRepo.listByCollection(coll.id);
    const totalCompleted = allRefunds
      .filter((r: any) => r.status === 'COMPLETED' || r.id === refundId)
      .reduce((sum: bigint, r: any) => sum + BigInt(r.amountMinor), 0n);

    if (totalCompleted === BigInt(coll.amountMinor)) {
      await this.collectionRepo.update(coll.id, { status: 'REFUNDED' });
    } else {
      await this.collectionRepo.update(coll.id, { status: 'PARTIALLY_REFUNDED' });
    }

    const updated = await this.refundRepo.update(refundId, {
      status: domain.currentStatus,
      completedByUserId: domain.currentCompletedByUserId,
      refundedAt: domain.currentRefundedAt?.toISOString(),
    });
    return updated;
  }
}
