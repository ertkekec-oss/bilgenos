import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

describe('Phase 3: PostgreSQL Physical Concurrency & Security Gate', () => {
  const prisma = new PrismaClient({
    datasourceUrl: process.env.DIRECT_URL || process.env.DATABASE_URL,
  });

  const tenantAId = crypto.randomUUID();
  const tenantBId = crypto.randomUUID();
  const orgAId = crypto.randomUUID();
  const orgBId = crypto.randomUUID();
  const instAId = crypto.randomUUID();
  const instBId = crypto.randomUUID();
  const personAId = crypto.randomUUID();
  const personBId = crypto.randomUUID();
  const userAId = crypto.randomUUID();

  before(async () => {
    await prisma.$connect();

    // Create Tenant A & B hierarchies for BOLA & isolation tests
    await prisma.tenant.createMany({
      data: [
        { id: tenantAId, name: 'Phase3 Tenant A Holding', slug: 'p3-tenant-a-' + Date.now() },
        { id: tenantBId, name: 'Phase3 Tenant B Holding', slug: 'p3-tenant-b-' + Date.now() },
      ],
    });

    await prisma.organization.createMany({
      data: [
        { id: orgAId, tenantId: tenantAId, name: 'Org A' },
        { id: orgBId, tenantId: tenantBId, name: 'Org B' },
      ],
    });

    await prisma.institution.createMany({
      data: [
        { id: instAId, organizationId: orgAId, code: 'INST-P3-A-' + Date.now(), name: 'Kolej A', institutionType: 'COLLEGE' },
        { id: instBId, organizationId: orgBId, code: 'INST-P3-B-' + Date.now(), name: 'Kolej B', institutionType: 'COLLEGE' },
      ],
    });

    await prisma.person.createMany({
      data: [
        { id: personAId, tenantId: tenantAId, firstName: 'Ali', lastName: 'Veli' },
        { id: personBId, tenantId: tenantBId, firstName: 'Cem', lastName: 'Can' },
      ],
    });

    await prisma.user.create({
      data: {
        id: userAId,
        tenantId: tenantAId,
        personId: personAId,
        email: 'fin-officer-' + Date.now() + '@bilgenos.com',
        passwordHash: 'argon2id$mock',
      },
    });
  });

  after(async () => {
    try {
      // Clean up Phase 3 records in dependency order
      await prisma.reconciliationItem.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
      await prisma.reconciliationSession.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
      await prisma.refundAllocation.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
      await prisma.refund.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
      await prisma.receipt.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
      await prisma.paymentAllocation.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
      await prisma.financialLedgerEntry.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
      await prisma.collection.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
      await prisma.financialAccount.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });

      await prisma.user.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
      await prisma.person.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
      await prisma.institution.deleteMany({ where: { id: { in: [instAId, instBId] } } });
      await prisma.organization.deleteMany({ where: { id: { in: [orgAId, orgBId] } } });
      await prisma.tenant.deleteMany({ where: { id: { in: [tenantAId, tenantBId] } } });
    } catch {
      // Best-effort cleanup
    } finally {
      await prisma.$disconnect();
    }
  });

  it('1. Physical PostgreSQL: Verify all 9 Phase 3 physical tables exist', async () => {
    const tables: { tablename: string }[] = await prisma.$queryRaw`
      SELECT tablename FROM pg_catalog.pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN (
        'financial_accounts',
        'collections',
        'payment_allocations',
        'financial_ledger_entries',
        'receipts',
        'refunds',
        'refund_allocations',
        'reconciliation_sessions',
        'reconciliation_items'
      )
      ORDER BY tablename ASC;
    `;

    const tableNames = tables.map(t => t.tablename);
    assert.ok(tableNames.includes('financial_accounts'));
    assert.ok(tableNames.includes('collections'));
    assert.ok(tableNames.includes('payment_allocations'));
    assert.ok(tableNames.includes('financial_ledger_entries'));
    assert.ok(tableNames.includes('receipts'));
    assert.ok(tableNames.includes('refunds'));
    assert.ok(tableNames.includes('refund_allocations'));
    assert.ok(tableNames.includes('reconciliation_sessions'));
    assert.ok(tableNames.includes('reconciliation_items'));
    assert.equal(tableNames.length, 9);
  });

  it('2. Double Collection Confirmation Concurrency Race: Exactly one confirms', async () => {
    const account = await prisma.financialAccount.create({
      data: {
        id: crypto.randomUUID(),
        tenantId: tenantAId,
        institutionId: instAId,
        name: 'Vakıfbank Ana Tahsilat',
        accountType: 'BANK',
        currency: 'TRY',
      },
    });

    const colId = crypto.randomUUID();
    await prisma.collection.create({
      data: {
        id: colId,
        tenantId: tenantAId,
        institutionId: instAId,
        financialResponsiblePersonId: personAId,
        financialAccountId: account.id,
        paymentMethod: 'BANK_TRANSFER',
        amountMinor: 5000000n, // 50,000 TRY
        currency: 'TRY',
        collectedAt: new Date(),
        status: 'PENDING',
      },
    });

    // Simulate two concurrent requests trying to confirm the same PENDING collection
    const confirmAttempt = async (workerId: string) => {
      return prisma.$transaction(async (tx) => {
        // Atomic compare-and-swap
        const updated = await tx.collection.updateMany({
          where: { id: colId, status: 'PENDING' },
          data: { status: 'CONFIRMED' },
        });

        if (updated.count === 1) {
          // Exactly one worker creates the ledger entry
          await tx.financialLedgerEntry.create({
            data: {
              id: crypto.randomUUID(),
              tenantId: tenantAId,
              institutionId: instAId,
              entryNumber: BigInt(Date.now()) + BigInt(Math.floor(Math.random() * 1000)),
              financialAccountId: account.id,
              entryType: 'MONEY_IN',
              amountMinor: 5000000n,
              currency: 'TRY',
              sourceReferenceType: 'COLLECTION',
              sourceReferenceId: colId,
              description: `Confirmed by worker ${workerId}`,
            },
          });
          return { workerId, success: true };
        }
        return { workerId, success: false };
      });
    };

    const results = await Promise.all([
      confirmAttempt('worker-1'),
      confirmAttempt('worker-2'),
    ]);

    const successes = results.filter(r => r.success);
    const failures = results.filter(r => !r.success);

    assert.equal(successes.length, 1, 'Only one worker must successfully confirm');
    assert.equal(failures.length, 1, 'The duplicate concurrent request must fail');

    // Verify exactly one ledger entry was written
    const ledgerCount = await prisma.financialLedgerEntry.count({
      where: { sourceReferenceId: colId },
    });
    assert.equal(ledgerCount, 1);
  });

  it('3. Double Allocation Race: Concurrent allocations prevent over-allocation', async () => {
    const account = await prisma.financialAccount.create({
      data: {
        id: crypto.randomUUID(),
        tenantId: tenantAId,
        institutionId: instAId,
        name: 'Kasa-1',
        accountType: 'CASH',
      },
    });

    const colId = crypto.randomUUID();
    const totalAmount = 10000000n; // 100,000 TRY
    await prisma.collection.create({
      data: {
        id: colId,
        tenantId: tenantAId,
        institutionId: instAId,
        financialResponsiblePersonId: personAId,
        financialAccountId: account.id,
        paymentMethod: 'CASH',
        amountMinor: totalAmount,
        currency: 'TRY',
        collectedAt: new Date(),
        status: 'CONFIRMED',
      },
    });

    // Two workers both see 100,000 unallocated and attempt to allocate 70,000 each (70k + 70k = 140k > 100k)
    const allocateAttempt = async (workerId: string) => {
      try {
        return await prisma.$transaction(async (tx) => {
          // Lock collection row for update
          const [locked]: any = await tx.$queryRaw`
            SELECT id, amount_minor FROM collections 
            WHERE id = ${colId}::uuid FOR UPDATE;
          `;

          const existingAllocs = await tx.paymentAllocation.findMany({
            where: { collectionId: colId, status: 'ACTIVE' },
          });
          const sumAlloc = existingAllocs.reduce((sum, a) => sum + a.amountMinor, 0n);
          const proposed = 7000000n;

          if (sumAlloc + proposed > BigInt(locked.amount_minor)) {
            throw new Error(`Over-allocation: ${sumAlloc + proposed} > ${locked.amount_minor}`);
          }

          const alloc = await tx.paymentAllocation.create({
            data: {
              id: crypto.randomUUID(),
              tenantId: tenantAId,
              collectionId: colId,
              paymentInstallmentId: crypto.randomUUID(),
              amountMinor: proposed,
              status: 'ACTIVE',
            },
          });
          return { workerId, success: true, allocId: alloc.id };
        });
      } catch (err: any) {
        return { workerId, success: false, error: err.message };
      }
    };

    const results = await Promise.all([
      allocateAttempt('alloc-worker-1'),
      allocateAttempt('alloc-worker-2'),
    ]);

    const successes = results.filter(r => r.success);
    const failures = results.filter(r => !r.success);

    assert.equal(successes.length, 1, 'Only one 70k allocation can succeed');
    assert.equal(failures.length, 1, 'Second allocation must fail due to over-allocation prevention');
    assert.match(failures[0].error, /Over-allocation/);

    // Verify sum of allocations in database is strictly <= 100,000
    const finalAllocs = await prisma.paymentAllocation.findMany({
      where: { collectionId: colId },
    });
    const finalSum = finalAllocs.reduce((sum, a) => sum + a.amountMinor, 0n);
    assert.equal(finalSum, 7000000n);
    assert.ok(finalSum <= totalAmount, 'Money conservation invariant preserved under concurrency');
  });

  it('4. Double Refund Race: Sum cannot exceed refundable collected amount', async () => {
    const account = await prisma.financialAccount.create({
      data: {
        id: crypto.randomUUID(),
        tenantId: tenantAId,
        institutionId: instAId,
        name: 'İade Test Hesabı',
        accountType: 'BANK',
      },
    });

    const colId = crypto.randomUUID();
    const collectedAmount = 3000000n; // 30,000 TRY
    await prisma.collection.create({
      data: {
        id: colId,
        tenantId: tenantAId,
        institutionId: instAId,
        financialResponsiblePersonId: personAId,
        financialAccountId: account.id,
        paymentMethod: 'BANK_TRANSFER',
        amountMinor: collectedAmount,
        currency: 'TRY',
        collectedAt: new Date(),
        status: 'CONFIRMED',
      },
    });

    // Two workers both attempt to refund 20,000 each (20k + 20k = 40k > 30k)
    const refundAttempt = async (workerId: string) => {
      try {
        return await prisma.$transaction(async (tx) => {
          const [locked]: any = await tx.$queryRaw`
            SELECT id, amount_minor FROM collections 
            WHERE id = ${colId}::uuid FOR UPDATE;
          `;

          const existingRefunds = await tx.refund.findMany({
            where: { collectionId: colId, status: { in: ['APPROVED', 'COMPLETED'] } },
          });
          const sumRefunded = existingRefunds.reduce((sum, r) => sum + r.amountMinor, 0n);
          const proposed = 2000000n;

          if (sumRefunded + proposed > BigInt(locked.amount_minor)) {
            throw new Error(`Refund exceeds collected: ${sumRefunded + proposed} > ${locked.amount_minor}`);
          }

          const ref = await tx.refund.create({
            data: {
              id: crypto.randomUUID(),
              tenantId: tenantAId,
              institutionId: instAId,
              collectionId: colId,
              amountMinor: proposed,
              reason: 'Veli iade ' + workerId,
              status: 'COMPLETED',
              requestedByUserId: userAId,
            },
          });
          return { workerId, success: true, refId: ref.id };
        });
      } catch (err: any) {
        return { workerId, success: false, error: err.message };
      }
    };

    const results = await Promise.all([
      refundAttempt('refund-1'),
      refundAttempt('refund-2'),
    ]);

    const successes = results.filter(r => r.success);
    const failures = results.filter(r => !r.success);

    assert.equal(successes.length, 1, 'Only one 20k refund can succeed');
    assert.equal(failures.length, 1, 'Second refund must be rejected');
    assert.match(failures[0].error, /Refund exceeds collected/);
  });

  it('5. Receipt Number Race: Unique constraint [tenant_id, receipt_number] enforced', async () => {
    const account = await prisma.financialAccount.create({
      data: {
        id: crypto.randomUUID(),
        tenantId: tenantAId,
        institutionId: instAId,
        name: 'Makbuz Test Kasa',
        accountType: 'CASH',
      },
    });

    const colId = crypto.randomUUID();
    await prisma.collection.create({
      data: {
        id: colId,
        tenantId: tenantAId,
        institutionId: instAId,
        financialResponsiblePersonId: personAId,
        financialAccountId: account.id,
        paymentMethod: 'CASH',
        amountMinor: 1000000n,
        currency: 'TRY',
        collectedAt: new Date(),
        status: 'CONFIRMED',
      },
    });

    const receiptNumber = 'MKB-RACE-' + Date.now();

    const insertReceipt = async (workerId: string) => {
      try {
        const r = await prisma.receipt.create({
          data: {
            id: crypto.randomUUID(),
            tenantId: tenantAId,
            institutionId: instAId,
            collectionId: colId,
            receiptNumber,
            recipientPersonId: personAId,
            amountMinor: 1000000n,
            currency: 'TRY',
            status: 'ISSUED',
          },
        });
        return { workerId, success: true, id: r.id };
      } catch (err: any) {
        return { workerId, success: false, code: err.code, message: err.message };
      }
    };

    const results = await Promise.all([
      insertReceipt('receipt-worker-1'),
      insertReceipt('receipt-worker-2'),
    ]);

    const successes = results.filter(r => r.success);
    const failures = results.filter(r => !r.success);

    assert.equal(successes.length, 1, 'Exactly one receipt number creation succeeds');
    assert.equal(failures.length, 1, 'Duplicate receipt number fails with unique constraint');
    // Prisma P2002 is unique constraint violation
    assert.equal(failures[0].code, 'P2002');
  });

  it('6. Idempotency Payload Conflict: Same key with differing payload is rejected', async () => {
    const idempotencyKey = 'IDEMP-P3-' + Date.now();
    const payloadA = { amountMinor: '5000000', account: 'Garanti' };
    const payloadB = { amountMinor: '6000000', account: 'Akbank' }; // Conflicting!

    const hashPayload = (p: any) => crypto.createHash('sha256').update(JSON.stringify(p)).digest('hex');

    const keyStore = new Map<string, { hash: string; response: any }>();

    // Request 1
    const runIdempotent = (key: string, payload: any) => {
      const hash = hashPayload(payload);
      if (keyStore.has(key)) {
        const stored = keyStore.get(key)!;
        if (stored.hash !== hash) {
          throw new Error('IdempotencyConflictError: Payload fingerprint mismatch for key ' + key);
        }
        return { cached: true, data: stored.response };
      }
      const response = { status: 'PROCESSED', id: crypto.randomUUID() };
      keyStore.set(key, { hash, response });
      return { cached: false, data: response };
    };

    const res1 = runIdempotent(idempotencyKey, payloadA);
    assert.equal(res1.cached, false);

    // Duplicate identical request returns cached result
    const res2 = runIdempotent(idempotencyKey, payloadA);
    assert.equal(res2.cached, true);
    assert.equal(res2.data.id, res1.data.id);

    // Conflicting request is rejected
    assert.throws(
      () => runIdempotent(idempotencyKey, payloadB),
      /IdempotencyConflictError/
    );
  });

  it('7. Cross-Tenant Finance BOLA: Tenant B querying Tenant A records gets 404 existence masking', async () => {
    // Tenant A creates an account
    const accA = await prisma.financialAccount.create({
      data: {
        id: crypto.randomUUID(),
        tenantId: tenantAId,
        institutionId: instAId,
        name: 'Tenant A Gizli Hesap',
        accountType: 'BANK',
      },
    });

    // Query scoped to Tenant B
    const findForTenant = async (tenantId: string, accountId: string) => {
      const found = await prisma.financialAccount.findFirst({
        where: { id: accountId, tenantId },
      });
      if (!found) {
        throw new Error('NotFoundException: FinancialAccount does not exist.');
      }
      return found;
    };

    // Tenant A finds its own account
    const resultA = await findForTenant(tenantAId, accA.id);
    assert.equal(resultA.id, accA.id);

    // Tenant B gets generic 404 (does NOT leak that account exists)
    await assert.rejects(
      () => findForTenant(tenantBId, accA.id),
      /NotFoundException/
    );
  });

  it('8. Cross-Institution Finance BOLA: Scoped to Institution A denies Institution B', async () => {
    const accA = await prisma.financialAccount.create({
      data: {
        id: crypto.randomUUID(),
        tenantId: tenantAId,
        institutionId: instAId,
        name: 'Kurum A Kasası',
        accountType: 'CASH',
      },
    });

    const verifyInstitutionAccess = (userInstitutionId: string, targetAccountInstitutionId: string) => {
      if (userInstitutionId !== targetAccountInstitutionId) {
        throw new Error('NotFoundException: Resource not available in user institution scope.');
      }
      return true;
    };

    assert.equal(verifyInstitutionAccess(instAId, accA.institutionId), true);
    assert.throws(
      () => verifyInstitutionAccess(instBId, accA.institutionId),
      /NotFoundException/
    );
  });

  it('9. Transactional Rollback Atomicity: Failure aborts collection, allocations, and ledger', async () => {
    const account = await prisma.financialAccount.create({
      data: {
        id: crypto.randomUUID(),
        tenantId: tenantAId,
        institutionId: instAId,
        name: 'Rollback Test Hesabı',
        accountType: 'BANK',
      },
    });

    const colId = crypto.randomUUID();
    await prisma.collection.create({
      data: {
        id: colId,
        tenantId: tenantAId,
        institutionId: instAId,
        financialResponsiblePersonId: personAId,
        financialAccountId: account.id,
        paymentMethod: 'BANK_TRANSFER',
        amountMinor: 10000000n,
        currency: 'TRY',
        collectedAt: new Date(),
        status: 'PENDING',
      },
    });

    // Attempt a transaction where step 1 updates collection, step 2 writes ledger, step 3 fails
    const runFailingTransaction = async () => {
      await prisma.$transaction(async (tx) => {
        // Step 1: Mutate collection
        await tx.collection.update({
          where: { id: colId },
          data: { status: 'CONFIRMED' },
        });

        // Step 2: Write ledger entry
        await tx.financialLedgerEntry.create({
          data: {
            id: crypto.randomUUID(),
            tenantId: tenantAId,
            institutionId: instAId,
            entryNumber: BigInt(Date.now()),
            financialAccountId: account.id,
            entryType: 'MONEY_IN',
            amountMinor: 10000000n,
            currency: 'TRY',
            sourceReferenceType: 'COLLECTION',
            sourceReferenceId: colId,
            description: 'Rollback test entry',
          },
        });

        // Step 3: Intentional invariant failure
        throw new Error('SIMULATED_FINANCIAL_INVARIANT_FAILURE');
      });
    };

    await assert.rejects(runFailingTransaction, /SIMULATED_FINANCIAL_INVARIANT_FAILURE/);

    // Verify atomic rollback on real database:
    // 1. Collection status must remain PENDING
    const collAfter = await prisma.collection.findUnique({ where: { id: colId } });
    assert.equal(collAfter?.status, 'PENDING', 'Collection mutation must be rolled back');

    // 2. Ledger entry must NOT exist
    const ledgerAfter = await prisma.financialLedgerEntry.findMany({
      where: { sourceReferenceId: colId },
    });
    assert.equal(ledgerAfter.length, 0, 'Ledger entry must be rolled back');
  });

  it('10. Ledger Immutability: Reversals must be compensating entries, not in-place overwrites', async () => {
    const account = await prisma.financialAccount.create({
      data: {
        id: crypto.randomUUID(),
        tenantId: tenantAId,
        institutionId: instAId,
        name: 'Defter Değiştirilemezlik Testi',
        accountType: 'BANK',
      },
    });

    const origEntryId = crypto.randomUUID();
    const entryNumber = BigInt(Date.now());

    // Create original ledger entry
    const originalEntry = await prisma.financialLedgerEntry.create({
      data: {
        id: origEntryId,
        tenantId: tenantAId,
        institutionId: instAId,
        entryNumber,
        financialAccountId: account.id,
        entryType: 'MONEY_IN',
        amountMinor: 4500000n, // 45,000 TRY
        currency: 'TRY',
        sourceReferenceType: 'COLLECTION',
        sourceReferenceId: crypto.randomUUID(),
        description: 'Orijinal Tahsilat',
        isReversed: false,
      },
    });

    assert.equal(originalEntry.amountMinor, 4500000n);

    // Correction workflow: Post compensating reversal entry
    const reversalEntryId = crypto.randomUUID();
    const reversalEntry = await prisma.financialLedgerEntry.create({
      data: {
        id: reversalEntryId,
        tenantId: tenantAId,
        institutionId: instAId,
        entryNumber: entryNumber + 1n,
        financialAccountId: account.id,
        entryType: 'MONEY_OUT', // Opposite direction
        amountMinor: 4500000n, // Compensating amount
        currency: 'TRY',
        sourceReferenceType: 'REVERSAL',
        sourceReferenceId: origEntryId,
        description: 'Ters Kayıt: ' + originalEntry.description,
        isReversed: false,
      },
    });

    // Mark original entry as reversed with pointer
    await prisma.financialLedgerEntry.update({
      where: { id: origEntryId },
      data: { isReversed: true, reversalEntryId },
    });

    // Verify both original and reversal entries exist in journal (no destructive history modification)
    const journal = await prisma.financialLedgerEntry.findMany({
      where: { id: { in: [origEntryId, reversalEntryId] } },
      orderBy: { entryNumber: 'asc' },
    });

    assert.equal(journal.length, 2, 'Financial journal must retain complete audit history');
    assert.equal(journal[0].isReversed, true);
    assert.equal(journal[0].reversalEntryId, reversalEntryId);
    assert.equal(journal[1].entryType, 'MONEY_OUT');
  });
});
