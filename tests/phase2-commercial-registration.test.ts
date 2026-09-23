import { test, describe, beforeEach } from 'node:test';
import * as assert from 'node:assert/strict';
import * as nodeCrypto from 'node:crypto';
import type { RequestTenantContext, UUID } from '@bilgenos/contracts';
import {
  globalDbStorage,
  InMemoryScopedCommercialRegistrationRepository,
  CommercialService,
  MockTransactionalStorage,
} from '@bilgenos/database';
import {
  CommercialRegistration,
  PaymentPlan,
  PaymentInstallment,
  EducationContract,
  ScholarshipAward,
  DiscountApplication,
  DomainError,
  InvariantViolationError,
} from '@bilgenos/domain';

describe('Phase 2: Commercial Registration & Financial Foundation Verification', () => {
  const tenantId: UUID = '10000000-0000-0000-0000-000000000001';
  const institutionId: UUID = '10000000-0000-0000-0000-000000000010';
  const candidatePersonId: UUID = '10000000-0000-0000-0000-000000000020';
  const financialResponsibleId: UUID = '10000000-0000-0000-0000-000000000030';

  const context: RequestTenantContext = {
    tenantId,
    userId: '11111111-1111-1111-1111-111111111111',
    roles: ['ADMINISTRATOR'],
    permissions: ['commercial.manage'],
  };

  let regRepo: InMemoryScopedCommercialRegistrationRepository;
  let commercialService: CommercialService;

  beforeEach(() => {
    globalDbStorage.clear();
    MockTransactionalStorage.clear();
    regRepo = new InMemoryScopedCommercialRegistrationRepository(context);
    commercialService = new CommercialService(context, regRepo);
  });

  test('1. CommercialRegistration Lifecycle: DRAFT -> PENDING_CONTRACT -> PENDING_PAYMENT_PLAN -> READY -> ACTIVE', async () => {
    const reg = await commercialService.createRegistration({
      institutionId,
      candidatePersonId,
      financialResponsiblePersonId: financialResponsibleId,
    });
    assert.equal(reg.status, 'DRAFT');

    const contractId = nodeCrypto.randomUUID();
    const paymentPlanId = nodeCrypto.randomUUID();

    const readyReg = await commercialService.markRegistrationReady(reg.id, contractId, paymentPlanId);
    assert.equal(readyReg.status, 'READY');

    // Verify Outbox event was atomically emitted!
    assert.equal(MockTransactionalStorage.outbox.length, 1);
    assert.equal(MockTransactionalStorage.outbox[0]?.eventType, 'CommercialRegistrationReady');

    // Activate registration
    const activeReg = await commercialService.activateRegistration(reg.id);
    assert.equal(activeReg.status, 'ACTIVE');

    // Binding Constraint #1: Activation does NOT automatically create a Phase 1 Enrollment!
    assert.equal(
      globalDbStorage.enrollments.size,
      0,
      'CommercialRegistration activation must NOT automatically create a Phase 1 Enrollment.'
    );
  });

  test('2. Binding Constraint #4: Scholarship reason ACADEMIC approved operationally without fake academic engine', () => {
    const award = new ScholarshipAward({
      id: nodeCrypto.randomUUID(),
      tenantId,
      institutionId,
      candidatePersonId,
      type: 'ACADEMIC',
      amountType: 'PERCENTAGE',
      value: 25n, // 25%
      reasonCode: 'YKS_TOP_500_SCHOLARSHIP',
      approvedByUserId: context.userId,
      status: 'ACTIVE',
    });

    assert.equal(award.type, 'ACADEMIC');
    assert.equal(award.value, 25n);
    assert.equal(award.isApproved, true);

    // Over 100% percentage scholarship must fail invariant
    assert.throws(
      () => {
        new ScholarshipAward({
          id: nodeCrypto.randomUUID(),
          tenantId,
          institutionId,
          candidatePersonId,
          type: 'ACADEMIC',
          amountType: 'PERCENTAGE',
          value: 120n,
          status: 'ACTIVE',
        });
      },
      /Percentage scholarship cannot exceed 100%/,
      'Percentage scholarship > 100% must be rejected'
    );
  });

  test('3. Money Invariant: BigInt minor units reconciliation (gross - scholarship - discount = net = sum(installments))', () => {
    const planId = nodeCrypto.randomUUID();

    // Gross: 100,000.00 TL (10000000 minor)
    // Scholarship: 20,000.00 TL (2000000 minor)
    // Discount: 5,000.00 TL (500000 minor)
    // Net: 75,000.00 TL (7500000 minor) = 3 installments of 25,000.00 TL
    const inst1 = new PaymentInstallment({
      id: nodeCrypto.randomUUID(),
      tenantId,
      paymentPlanId: planId,
      sequence: 1,
      dueDate: new Date('2026-10-15'),
      amountMinor: 2500000n,
      currency: 'TRY',
      status: 'PENDING',
    });

    const inst2 = new PaymentInstallment({
      id: nodeCrypto.randomUUID(),
      tenantId,
      paymentPlanId: planId,
      sequence: 2,
      dueDate: new Date('2026-11-15'),
      amountMinor: 2500000n,
      currency: 'TRY',
      status: 'PENDING',
    });

    const inst3 = new PaymentInstallment({
      id: nodeCrypto.randomUUID(),
      tenantId,
      paymentPlanId: planId,
      sequence: 3,
      dueDate: new Date('2026-12-15'),
      amountMinor: 2500000n,
      currency: 'TRY',
      status: 'PENDING',
    });

    const plan = new PaymentPlan({
      id: planId,
      tenantId,
      institutionId,
      registrationId: nodeCrypto.randomUUID(),
      grossAmountMinor: 10000000n,
      scholarshipAmountMinor: 2000000n,
      discountAmountMinor: 500000n,
      currency: 'TRY',
      installments: [inst1, inst2, inst3],
    });

    assert.equal(plan.netContractualAmountMinor, 7500000n);

    // Mismatched installment sum must throw InvariantViolationError
    assert.throws(
      () => {
        new PaymentPlan({
          id: planId,
          tenantId,
          institutionId,
          registrationId: nodeCrypto.randomUUID(),
          grossAmountMinor: 10000000n,
          scholarshipAmountMinor: 2000000n,
          discountAmountMinor: 500000n,
          currency: 'TRY',
          installments: [inst1, inst2], // Sum = 5,000,000 vs net = 7,500,000
        });
      },
      /Payment plan reconciliation failure/,
      'Unreconciled payment installments must be rejected'
    );
  });

  test('4. Binding Constraint #5: Direct arbitrary PATCH status=PAID on PaymentInstallment is forbidden', () => {
    const inst = new PaymentInstallment({
      id: nodeCrypto.randomUUID(),
      tenantId,
      paymentPlanId: nodeCrypto.randomUUID(),
      sequence: 1,
      dueDate: new Date('2026-10-15'),
      amountMinor: 2500000n,
      currency: 'TRY',
      status: 'PENDING',
    });

    // Arbitrary patch must throw
    assert.throws(
      () => {
        inst.markPaidArbitrary();
      },
      /Direct PATCH status=PAID is strictly forbidden/,
      'Direct arbitrary status mutation to PAID must be rejected'
    );

    // Explicit payment allocation works
    inst.allocatePayment(1000000n);
    assert.equal(inst.currentStatus, 'PARTIALLY_PAID');

    inst.allocatePayment(2500000n);
    assert.equal(inst.currentStatus, 'PAID');
  });

  test('5. EducationContract Immutable Versioning: Amending creates v2 preserving v1', () => {
    const contractV1 = new EducationContract({
      id: nodeCrypto.randomUUID(),
      tenantId,
      institutionId,
      registrationId: nodeCrypto.randomUUID(),
      contractNumber: 'KONT-2026-001',
      version: 1,
      financialResponsiblePersonId: financialResponsibleId,
      effectiveDate: new Date('2026-09-01'),
      status: 'DRAFT',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    contractV1.issue();
    contractV1.sign('DOC-SIGN-REF-001');
    assert.equal(contractV1.currentStatus, 'SIGNED');
    assert.equal(contractV1.currentVersion, 1);

    // Amend creates v2 with incremented version and DRAFT status
    const contractV2Id = nodeCrypto.randomUUID();
    const contractV2 = contractV1.createAmendment(contractV2Id);

    assert.equal(contractV2.id, contractV2Id);
    assert.equal(contractV2.currentVersion, 2);
    assert.equal(contractV2.currentStatus, 'DRAFT');
    assert.equal(contractV2.contractNumber, 'KONT-2026-001');

    // Contract v1 remains immutable SIGNED
    assert.equal(contractV1.currentStatus, 'SIGNED');
    assert.equal(contractV1.currentVersion, 1);
  });

  test('6. Invariant: BilgenOkul unavailable ≠ BilgenOS CommercialRegistration rollback', () => {
    const reg = new CommercialRegistration({
      id: nodeCrypto.randomUUID(),
      tenantId,
      institutionId,
      candidatePersonId,
      financialResponsiblePersonId: financialResponsibleId,
      status: 'ACTIVE',
      integrationStatus: 'SYNCING',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Integration failure occurs
    reg.updateIntegrationStatus('FAILED');

    // Commercial Registration business status remains ACTIVE!
    assert.equal(reg.currentStatus, 'ACTIVE', 'Business status must remain ACTIVE despite integration failure');
    assert.equal(reg.currentIntegrationStatus, 'FAILED', 'Integration transport status is isolated to FAILED');
  });
});
