import { describe, it } from 'node:test';
import assert from 'node:assert';
import { PrismaClient } from '@prisma/client';

describe('Phase 2: Live PostgreSQL (Neon) Physical Verification Gate', () => {
  const prisma = new PrismaClient();

  const testTenantId = 'aaaaaaaa-2222-2222-2222-aaaaaaaaaaaa';
  const testInstId = 'dddddddd-4444-4444-4444-dddddddddddd';
  const testCandidatePersonId = 'eeeeeeee-5555-5555-5555-eeeeeeeeeeee';
  const testFinancialResponsibleId = 'ffffffff-7777-7777-7777-ffffffffffff';

  it('1. Live PostgreSQL: Verify Phase 2 Physical Tables exist in public schema', async () => {
    const tables = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN (
        'leads',
        'admission_applications',
        'admission_offers',
        'commercial_registrations',
        'education_contracts',
        'payment_plans',
        'payment_installments',
        'integration_providers',
        'integration_connections',
        'external_entity_mappings'
      )
      ORDER BY table_name;
    `;

    assert.equal(tables.length, 10, 'All 10 Phase 2 physical tables must exist on Neon PostgreSQL');
  });

  it('2. Live PostgreSQL: Physical Lead & AdmissionApplication creation', async () => {
    const lead = await prisma.lead.create({
      data: {
        tenantId: testTenantId,
        institutionId: testInstId,
        source: 'WEBSITE',
        status: 'NEW',
        notesSummary: 'Canlı Neon PostgreSQL Aday Öğrenci Testi',
      },
    });

    assert.ok(lead.id);
    assert.strictEqual(lead.source, 'WEBSITE');

    const app = await prisma.admissionApplication.create({
      data: {
        tenantId: testTenantId,
        institutionId: testInstId,
        leadId: lead.id,
        candidatePersonId: testCandidatePersonId,
        status: 'SUBMITTED',
      },
    });

    assert.ok(app.id);
    assert.strictEqual(app.status, 'SUBMITTED');

    // Clean up
    await prisma.admissionApplication.delete({ where: { id: app.id } });
    await prisma.lead.delete({ where: { id: lead.id } });
  });

  it('3. Live PostgreSQL: Physical CommercialRegistration, EducationContract & PaymentInstallments with BigInt', async () => {
    const reg = await prisma.commercialRegistration.create({
      data: {
        tenantId: testTenantId,
        institutionId: testInstId,
        candidatePersonId: testCandidatePersonId,
        financialResponsiblePersonId: testFinancialResponsibleId,
        status: 'READY',
        integrationStatus: 'PENDING',
      },
    });

    assert.ok(reg.id);

    const contractNumber = `KONT-LIVE-${Date.now()}`;
    const contract = await prisma.educationContract.create({
      data: {
        tenantId: testTenantId,
        institutionId: testInstId,
        registrationId: reg.id,
        contractNumber,
        version: 1,
        financialResponsiblePersonId: testFinancialResponsibleId,
        effectiveDate: new Date('2026-09-01'),
        status: 'SIGNED',
      },
    });

    assert.strictEqual(contract.version, 1);
    assert.strictEqual(contract.status, 'SIGNED');

    // Create PaymentPlan with BigInt minor amounts
    const plan = await prisma.paymentPlan.create({
      data: {
        tenantId: testTenantId,
        institutionId: testInstId,
        registrationId: reg.id,
        totalAmountMinor: 7500000n, // 75,000.00 TL
        currency: 'TRY',
        status: 'ACTIVE',
      },
    });

    const inst1 = await prisma.paymentInstallment.create({
      data: {
        tenantId: testTenantId,
        paymentPlanId: plan.id,
        sequence: 1,
        dueDate: new Date('2026-10-15'),
        amountMinor: 2500000n,
        currency: 'TRY',
        status: 'PENDING',
      },
    });

    assert.strictEqual(inst1.sequence, 1);
    assert.strictEqual(inst1.amountMinor, 2500000n);

    // Clean up
    await prisma.paymentInstallment.delete({ where: { id: inst1.id } });
    await prisma.paymentPlan.delete({ where: { id: plan.id } });
    await prisma.educationContract.delete({ where: { id: contract.id } });
    await prisma.commercialRegistration.delete({ where: { id: reg.id } });
  });

  it('4. Live PostgreSQL: Physical ExternalEntityMapping Unique Constraint enforcement', async () => {
    const connId = '11111111-9999-9999-9999-111111111111';
    const localPersonId = '22222222-9999-9999-9999-222222222222';
    const extStudentId = `BOKUL-TEST-${Date.now()}`;

    // Clean up any previous test mapping
    await prisma.externalEntityMapping.deleteMany({
      where: {
        tenantId: testTenantId,
        integrationConnectionId: connId,
      },
    });

    // First mapping succeeds
    const mapping1 = await prisma.externalEntityMapping.create({
      data: {
        tenantId: testTenantId,
        integrationConnectionId: connId,
        localEntityType: 'PERSON',
        localEntityId: localPersonId,
        externalEntityType: 'BILGEN_OKUL_STUDENT',
        externalEntityId: extStudentId,
        syncStatus: 'SYNCED',
      },
    });

    assert.ok(mapping1.id);

    // Duplicate mapping for same local person under same connection must throw unique constraint error!
    let duplicateRejected = false;
    try {
      await prisma.externalEntityMapping.create({
        data: {
          tenantId: testTenantId,
          integrationConnectionId: connId,
          localEntityType: 'PERSON',
          localEntityId: localPersonId,
          externalEntityType: 'BILGEN_OKUL_STUDENT',
          externalEntityId: `BOKUL-OTHER-${Date.now()}`,
          syncStatus: 'SYNCED',
        },
      });
    } catch (err: any) {
      duplicateRejected = true;
      assert.match(err.message, /Unique constraint failed|uq_ext_mapping_local/);
    }

    assert.strictEqual(duplicateRejected, true, 'Physical unique constraint must reject duplicate local entity mapping');

    // Clean up
    await prisma.externalEntityMapping.delete({ where: { id: mapping1.id } });
  });
});
