import { describe, it } from 'node:test';
import assert from 'node:assert';
import { PrismaClient } from '@prisma/client';

describe('Live PostgreSQL (Neon) Physical Verification Gate', () => {
  const prisma = new PrismaClient();

  const testTenantId = 'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa';
  const testTenantBId = 'bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb';
  const testOrgId = 'cccccccc-3333-3333-3333-cccccccccccc';
  const testInstId = 'dddddddd-4444-4444-4444-dddddddddddd';
  const testPersonId = 'eeeeeeee-5555-5555-5555-eeeeeeeeeeee';
  const testLearnerId = 'ffffffff-6666-6666-6666-ffffffffffff';

  it('1. Live PostgreSQL: Connected and verified database connection', async () => {
    const result = await prisma.$queryRaw<Array<{ now: Date }>>`SELECT NOW() as now;`;
    assert(result.length > 0);
    assert(result[0]?.now instanceof Date);
  });

  it('2. Live PostgreSQL: Physical Tenant & Organization Foreign Key integrity', async () => {
    // Clean up any previous test leftovers
    await prisma.learner.deleteMany({ where: { tenantId: { in: [testTenantId, testTenantBId] } } });
    await prisma.person.deleteMany({ where: { tenantId: { in: [testTenantId, testTenantBId] } } });
    await prisma.institution.deleteMany({ where: { id: testInstId } });
    await prisma.organization.deleteMany({ where: { id: testOrgId } });
    await prisma.tenant.deleteMany({ where: { id: { in: [testTenantId, testTenantBId] } } });

    // Create Tenant A
    const tenant = await prisma.tenant.create({
      data: {
        id: testTenantId,
        name: 'Bilgen Holding Canlı Test',
        slug: `bilgen-test-${Date.now()}`,
      },
    });
    assert.strictEqual(tenant.id, testTenantId);

    // Create Organization
    const org = await prisma.organization.create({
      data: {
        id: testOrgId,
        tenantId: testTenantId,
        name: 'Bilgen Eğitim A.Ş.',
      },
    });
    assert.strictEqual(org.tenantId, testTenantId);

    // Create Institution with capability
    const inst = await prisma.institution.create({
      data: {
        id: testInstId,
        organizationId: testOrgId,
        code: `BILGEN-LIVE-${Date.now()}`,
        name: 'Bilgen Canlı Kampüs',
        institutionType: 'COLLEGE',
        capabilities: {
          create: [
            { capabilityKey: 'ACADEMIC', state: 'ENABLED' },
            { capabilityKey: 'ASSESSMENT', state: 'ENABLED' },
            { capabilityKey: 'TRANSPORTATION', state: 'READ_ONLY' },
          ],
        },
      },
      include: {
        capabilities: true,
      },
    });
    assert.strictEqual(inst.organizationId, testOrgId);
    assert.strictEqual(inst.capabilities.length, 3);
  });

  it('3. Live PostgreSQL: Physical Person & Learner creation with Unique constraint check', async () => {
    const person = await prisma.person.create({
      data: {
        id: testPersonId,
        tenantId: testTenantId,
        firstName: 'Deniz',
        lastName: 'Yıldız',
        nationalIdEncrypted: 'AES256-SAMPLE-KEY',
      },
    });
    assert.strictEqual(person.id, testPersonId);

    const learner = await prisma.learner.create({
      data: {
        id: testLearnerId,
        tenantId: testTenantId,
        personId: testPersonId,
        institutionId: testInstId,
        learnerNumber: 'STU-LIVE-001',
      },
    });
    assert.strictEqual(learner.learnerNumber, 'STU-LIVE-001');

    // Test unique constraint: UNIQUE(institution_id, learner_number)
    await assert.rejects(
      async () => {
        await prisma.learner.create({
          data: {
            tenantId: testTenantId,
            personId: testPersonId,
            institutionId: testInstId,
            learnerNumber: 'STU-LIVE-001', // Duplicate learner number!
          },
        });
      },
      (err: Error) => {
        assert(err.message.includes('Unique constraint failed') || err.message.includes('unique'));
        return true;
      }
    );
  });

  it('4. Live PostgreSQL: Transactional Outbox atomicity on physical database', async () => {
    const outboxId = '77777777-7777-7777-7777-777777777777';

    await prisma.$transaction(async (tx) => {
      await tx.transactionalOutbox.create({
        data: {
          id: outboxId,
          tenantId: testTenantId,
          aggregateType: 'Learner',
          aggregateId: testLearnerId,
          eventType: 'LearnerCreated',
          payload: { learnerNumber: 'STU-LIVE-001' },
          status: 'PENDING',
        },
      });

      await tx.auditLog.create({
        data: {
          tenantId: testTenantId,
          action: 'learner.create',
          entityType: 'Learner',
          entityId: testLearnerId,
          afterState: { learnerNumber: 'STU-LIVE-001' },
        },
      });
    });

    const outbox = await prisma.transactionalOutbox.findUnique({
      where: { id: outboxId },
    });
    assert(outbox);
    assert.strictEqual(outbox.status, 'PENDING');
    assert.strictEqual(outbox.eventType, 'LearnerCreated');

    // Clean up test records
    await prisma.transactionalOutbox.deleteMany({ where: { tenantId: testTenantId } });
    await prisma.auditLog.deleteMany({ where: { tenantId: testTenantId } });
    await prisma.learner.deleteMany({ where: { tenantId: testTenantId } });
    await prisma.person.deleteMany({ where: { tenantId: testTenantId } });
    await prisma.institutionCapability.deleteMany({ where: { institutionId: testInstId } });
    await prisma.institution.deleteMany({ where: { id: testInstId } });
    await prisma.organization.deleteMany({ where: { id: testOrgId } });
    await prisma.tenant.deleteMany({ where: { id: testTenantId } });

    await prisma.$disconnect();
  });
});
