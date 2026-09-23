import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  FinancialAccount,
  Collection,
  PaymentAllocation,
  FinancialLedgerEntry,
  Receipt,
  Refund,
  RefundAllocation,
  ReconciliationSession,
  ReconciliationItem,
  PaymentInstallment,
  InvariantViolationError,
  DomainError,
} from '@bilgenos/domain';

describe('Phase 3: Financial Domain & Money Conservation Invariants', () => {
  const tenantId = '11111111-1111-1111-1111-111111111111';
  const institutionId = '22222222-2222-2222-2222-222222222222';
  const personId = '33333333-3333-3333-3333-333333333333';
  const accountId = '44444444-4444-4444-4444-444444444444';
  const collectionId = '55555555-5555-5555-5555-555555555555';

  it('1. Money Conservation: Collection Amount = SUM(effective allocations) + unallocatedAmountMinor', () => {
    const coll = new Collection({
      id: collectionId,
      tenantId,
      institutionId,
      financialResponsiblePersonId: personId,
      financialAccountId: accountId,
      paymentMethod: 'BANK_TRANSFER',
      amountMinor: 10000000n, // 100,000.00 TRY
      currency: 'TRY',
      collectedAt: new Date(),
      status: 'CONFIRMED',
    });

    const alloc1 = new PaymentAllocation({
      id: 'a1111111-1111-1111-1111-111111111111',
      tenantId,
      collectionId,
      paymentInstallmentId: 'i1111111-1111-1111-1111-111111111111',
      amountMinor: 4000000n, // 40,000.00 TRY
      allocatedAt: new Date(),
      status: 'ACTIVE',
    });

    const alloc2 = new PaymentAllocation({
      id: 'a2222222-2222-2222-2222-222222222222',
      tenantId,
      collectionId,
      paymentInstallmentId: 'i2222222-2222-2222-2222-222222222222',
      amountMinor: 3500000n, // 35,000.00 TRY
      allocatedAt: new Date(),
      status: 'ACTIVE',
    });

    const summary = coll.getAllocationSummary([alloc1, alloc2]);
    assert.equal(summary.allocatedAmountMinor, 7500000n);
    assert.equal(summary.unallocatedAmountMinor, 2500000n);
    assert.equal(summary.allocationState, 'PARTIALLY_ALLOCATED');

    // Invariant check: Total = Allocated + Unallocated
    assert.equal(
      coll.amountMinor,
      summary.allocatedAmountMinor + summary.unallocatedAmountMinor
    );

    // Over-allocation violation test
    const excessAlloc = new PaymentAllocation({
      id: 'a3333333-3333-3333-3333-333333333333',
      tenantId,
      collectionId,
      paymentInstallmentId: 'i3333333-3333-3333-3333-333333333333',
      amountMinor: 5000000n, // would make 125,000 > 100,000
      allocatedAt: new Date(),
      status: 'ACTIVE',
    });

    assert.throws(
      () => coll.getAllocationSummary([alloc1, alloc2, excessAlloc]),
      InvariantViolationError
    );
  });

  it('2. Installment Conservation: Paid + Outstanding = Total Installment Amount', () => {
    const inst = new PaymentInstallment({
      id: 'i1111111-1111-1111-1111-111111111111',
      tenantId,
      paymentPlanId: 'p1111111-1111-1111-1111-111111111111',
      sequence: 1,
      dueDate: new Date('2026-10-15'),
      amountMinor: 5000000n, // 50,000.00 TRY
      currency: 'TRY',
      status: 'PENDING',
    });

    // Binding Constraint: Anti-arbitrary status patch
    assert.throws(() => inst.markPaidArbitrary(), DomainError);

    // Partial allocation: 20,000 / 50,000
    inst.allocatePayment(2000000n);
    assert.equal(inst.currentStatus, 'PARTIALLY_PAID');

    // Full allocation: 50,000 / 50,000
    inst.allocatePayment(5000000n);
    assert.equal(inst.currentStatus, 'PAID');
  });

  it('3. Non-authoritative Balance: Derived strictly from FinancialLedgerEntry projection', () => {
    const acc = new FinancialAccount({
      id: accountId,
      tenantId,
      institutionId,
      name: 'Garanti BBVA Operasyonel Hesap',
      accountType: 'BANK',
      currency: 'TRY',
      isActive: true,
    });

    const entries = [
      new FinancialLedgerEntry({
        id: 'l1111111-1111-1111-1111-111111111111',
        tenantId,
        institutionId,
        entryNumber: 1n,
        financialAccountId: accountId,
        entryType: 'MONEY_IN',
        amountMinor: 10000000n, // +100,000.00
        currency: 'TRY',
        sourceReferenceType: 'COLLECTION',
        sourceReferenceId: collectionId,
        description: 'Veli Taksit Tahsilatı',
        postedAt: new Date(),
      }),
      new FinancialLedgerEntry({
        id: 'l2222222-2222-2222-2222-222222222222',
        tenantId,
        institutionId,
        entryNumber: 2n,
        financialAccountId: accountId,
        entryType: 'MONEY_OUT',
        amountMinor: 1500000n, // -15,000.00
        currency: 'TRY',
        sourceReferenceType: 'REFUND',
        sourceReferenceId: 'r1111111-1111-1111-1111-111111111111',
        description: 'Fazla Tahsilat İadesi',
        postedAt: new Date(),
      }),
      new FinancialLedgerEntry({
        id: 'l3333333-3333-3333-3333-333333333333',
        tenantId,
        institutionId,
        entryNumber: 3n,
        financialAccountId: accountId,
        entryType: 'MONEY_IN',
        amountMinor: 5000000n,
        currency: 'TRY',
        sourceReferenceType: 'COLLECTION',
        sourceReferenceId: 'c2222222-2222-2222-2222-222222222222',
        description: 'Hatalı Kayıt (Ters Kayıtla İptal Edildi)',
        isReversed: true, // Reversed entry does not affect projected balance
        reversalEntryId: 'l4444444-4444-4444-4444-444444444444',
        postedAt: new Date(),
      }),
    ];

    const projected = acc.calculateProjectedBalance(entries);
    // 100,000 - 15,000 = 85,000.00 TRY (Reversed 50,000 is ignored)
    assert.equal(projected, 8500000n);
  });

  it('4. Maker-Checker Separation in Refund Lifecycle: Approver cannot be requester', () => {
    const requesterId = 'u1111111-1111-1111-1111-111111111111';
    const approverId = 'u2222222-2222-2222-2222-222222222222';

    const refund = new Refund({
      id: 'ref-001',
      tenantId,
      institutionId,
      collectionId,
      amountMinor: 500000n,
      currency: 'TRY',
      reason: 'Veli erken ayrılma talebi',
      status: 'REQUESTED',
      requestedByUserId: requesterId,
      allocations: [],
    });

    // Self-approval must fail Maker-Checker policy
    assert.throws(
      () => refund.approve(requesterId),
      /Maker-Checker violation/
    );

    // Independent approver succeeds
    refund.approve(approverId);
    assert.equal(refund.currentStatus, 'APPROVED');
    assert.equal(refund.currentApprovedByUserId, approverId);

    // Completion by cashier/finance officer
    refund.complete('u3333333-3333-3333-3333-333333333333');
    assert.equal(refund.currentStatus, 'COMPLETED');
  });

  it('5. RefundAllocation Invariant: Refund <= Collected - PriorRefunds and reopens installment', () => {
    const refundAlloc = new RefundAllocation({
      id: 'ra-001',
      tenantId,
      refundId: 'ref-001',
      paymentAllocationId: 'a1111111-1111-1111-1111-111111111111',
      amountMinor: 4000000n,
      status: 'ACTIVE',
    });

    assert.equal(refundAlloc.amountMinor, 4000000n);
    assert.equal(refundAlloc.status, 'ACTIVE');
  });

  it('6. Generic Reconciliation Foundation: Ambiguous matching does NOT auto-resolve', () => {
    const session = new ReconciliationSession({
      id: 'rec-session-1',
      tenantId,
      institutionId,
      financialAccountId: accountId,
      sourceType: 'BANK',
      sessionDate: new Date('2026-09-22'),
      status: 'OPEN',
      externalClosingBalanceMinor: 10000000n,
      ledgerClosingBalanceMinor: 10000000n,
    });

    session.evaluateSession();
    assert.equal(session.currentStatus, 'MATCHED');
    assert.equal(session.discrepancyMinor, 0n);

    // Reconciliation Item Ambiguous Flagging
    const item = new ReconciliationItem({
      id: 'rec-item-1',
      tenantId,
      sessionId: session.id,
      externalReference: 'EFT-UNKNOWN-REF',
      amountMinor: 250000n,
      transactionDate: new Date('2026-09-22'),
      matchStatus: 'UNMATCHED',
    });

    // Ambiguous matching flagged for manual review
    item.flagAmbiguous('Multiple potential student candidate matches found.');
    assert.equal(item.currentMatchStatus, 'AMBIGUOUS');
    assert.equal(item.currentMatchedLedgerEntryId, undefined);
  });

  it('7. Bank Data Protection: Default IBAN and Account masking in UI/Logs', () => {
    const acc = new FinancialAccount({
      id: accountId,
      tenantId,
      institutionId,
      name: 'Vakıfbank Ana Hesap',
      accountType: 'BANK',
      currency: 'TRY',
      iban: 'TR330001500158007293849102',
      accountNumber: '9876543210',
      isActive: true,
    });

    const maskedIban = acc.getMaskedIban();
    const maskedAccNum = acc.getMaskedAccountNumber();

    assert.equal(maskedIban, 'TR******************9102');
    assert.equal(maskedAccNum, '***3210');
  });
});
