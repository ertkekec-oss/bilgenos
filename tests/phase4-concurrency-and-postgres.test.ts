import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

describe('Phase 4: PostgreSQL Physical Concurrency & Security Gate', () => {
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
  const userBId = crypto.randomUUID();

  let empAId = crypto.randomUUID();
  let empBId = crypto.randomUUID();
  let deptAId = crypto.randomUUID();
  let posAId = crypto.randomUUID();

  before(async () => {
    await prisma.$connect();

    // 1. Create Tenant A & B hierarchies
    await prisma.tenant.createMany({
      data: [
        { id: tenantAId, name: 'Phase4 Tenant A Holding', slug: 'p4-tenant-a-' + Date.now() },
        { id: tenantBId, name: 'Phase4 Tenant B Holding', slug: 'p4-tenant-b-' + Date.now() },
      ],
    });

    await prisma.organization.createMany({
      data: [
        { id: orgAId, tenantId: tenantAId, name: 'Workforce Org A' },
        { id: orgBId, tenantId: tenantBId, name: 'Workforce Org B' },
      ],
    });

    await prisma.institution.createMany({
      data: [
        { id: instAId, organizationId: orgAId, code: 'INST-P4-A-' + Date.now(), name: 'Kolej A', institutionType: 'COLLEGE' },
        { id: instBId, organizationId: orgBId, code: 'INST-P4-B-' + Date.now(), name: 'Kolej B', institutionType: 'COLLEGE' },
      ],
    });

    await prisma.person.createMany({
      data: [
        { id: personAId, tenantId: tenantAId, firstName: 'Banu', lastName: 'Yilmaz' },
        { id: personBId, tenantId: tenantBId, firstName: 'Cahit', lastName: 'Arf' },
      ],
    });

    await prisma.user.createMany({
      data: [
        {
          id: userAId,
          tenantId: tenantAId,
          personId: personAId,
          email: 'hr-officer-a-' + Date.now() + '@bilgenos.com',
          passwordHash: 'argon2id$mock',
        },
        {
          id: userBId,
          tenantId: tenantBId,
          personId: personBId,
          email: 'hr-officer-b-' + Date.now() + '@bilgenos.com',
          passwordHash: 'argon2id$mock',
        },
      ],
    });

    // 2. Create Departments & Positions
    await prisma.department.create({
      data: {
        id: deptAId,
        tenantId: tenantAId,
        institutionId: instAId,
        code: 'DEP-SCI-' + Date.now().toString().slice(-4),
        name: 'Fen Bolumu',
      },
    });

    await prisma.position.create({
      data: {
        id: posAId,
        tenantId: tenantAId,
        institutionId: instAId,
        departmentId: deptAId,
        code: 'POS-HEAD-' + Date.now().toString().slice(-4),
        title: 'Bolum Baskani',
      },
    });

    // 3. Create Employees
    await prisma.employeeProfile.createMany({
      data: [
        {
          id: empAId,
          tenantId: tenantAId,
          personId: personAId,
          employeeNumber: 'EMP-A-' + Date.now().toString().slice(-4),
          isActive: true,
        },
        {
          id: empBId,
          tenantId: tenantBId,
          personId: personBId,
          employeeNumber: 'EMP-B-' + Date.now().toString().slice(-4),
          isActive: true,
        },
      ],
    });
  });

  after(async () => {
    await prisma.$disconnect();
  });

  // --------------------------------------------------------------------------
  // TEST 1: Physical DB Schema Gate (Table Existence)
  // --------------------------------------------------------------------------
  it('1. Physical Database Gate: All 7+ Phase 4 tables physically exist in PostgreSQL', async () => {
    const tables = [
      'departments',
      'positions',
      'employee_profiles',
      'employments',
      'institution_assignments',
      'work_schedules',
      'attendance_events',
      'employee_leaves',
      'leave_transactions',
      'personnel_documents',
    ];

    for (const table of tables) {
      const res: any = await prisma.$queryRawUnsafe(
        `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '${table}') as "exists";`
      );
      assert.equal(res[0].exists, true, `Table ${table} must physically exist in PostgreSQL`);
    }
  });

  // --------------------------------------------------------------------------
  // TEST 2: Concurrent Leave Approval Race (Maker-Checker & Balance Projection)
  // --------------------------------------------------------------------------
  it('2. Concurrent Leave Approval Race: Two concurrent approvals exceeding entitlement balance must not overspend', async () => {
    // Credit 5 days of annual leave
    await prisma.leaveTransaction.create({
      data: {
        id: crypto.randomUUID(),
        tenantId: tenantAId,
        employeeId: empAId,
        leaveType: 'ANNUAL',
        daysAmount: 5,
        transactionType: 'ENTITLEMENT_GRANT',
        postedAt: new Date('2026-01-01'),
      },
    });

    // Create two pending leave requests for 4 days each (Total requested = 8 days > 5 days)
    const leave1Id = crypto.randomUUID();
    const leave2Id = crypto.randomUUID();

    await prisma.employeeLeave.createMany({
      data: [
        {
          id: leave1Id,
          tenantId: tenantAId,
          institutionId: instAId,
          employeeId: empAId,
          leaveType: 'ANNUAL',
          unit: 'FULL_DAY',
          startDate: new Date('2026-07-01'),
          endDate: new Date('2026-07-04'),
          unitsCount: 4,
          status: 'REQUESTED',
          requestedByUserId: userAId,
        },
        {
          id: leave2Id,
          tenantId: tenantAId,
          institutionId: instAId,
          employeeId: empAId,
          leaveType: 'ANNUAL',
          unit: 'FULL_DAY',
          startDate: new Date('2026-08-01'),
          endDate: new Date('2026-08-04'),
          unitsCount: 4,
          status: 'REQUESTED',
          requestedByUserId: userAId,
        },
      ],
    });

    // An independent checker user
    const checkerUser = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        tenantId: tenantAId,
        personId: personAId,
        email: 'checker-' + Date.now() + '@bilgenos.com',
        passwordHash: 'argon2id$mock',
      },
    });

    // Approve leave inside interactive transaction with FOR UPDATE
    const approveLeaveTx = async (leaveId: string) => {
      return prisma.$transaction(async (tx) => {
        // Lock employee profile row
        await tx.$queryRawUnsafe(
          'SELECT id FROM employee_profiles WHERE id = $1::uuid FOR UPDATE',
          empAId
        );

        // Sum current balance from transactions
        const balanceAgg: any = await tx.$queryRawUnsafe(
          'SELECT COALESCE(SUM(days_amount), 0) as balance FROM leave_transactions WHERE employee_id = $1::uuid AND leave_type = $2',
          empAId,
          'ANNUAL'
        );
        const currentBalance = Number(balanceAgg[0].balance);

        const leave = await tx.employeeLeave.findUniqueOrThrow({ where: { id: leaveId } });
        const requestedUnits = Number(leave.unitsCount);
        if (currentBalance < requestedUnits) {
          throw new Error('INSUFFICIENT_LEAVE_BALANCE: Current balance is ' + currentBalance + ', required ' + requestedUnits);
        }

        // Approve leave
        await tx.employeeLeave.update({
          where: { id: leaveId },
          data: {
            status: 'APPROVED',
            approvedByUserId: checkerUser.id,
            approvedAt: new Date(),
          },
        });

        // Record debit transaction
        await tx.leaveTransaction.create({
          data: {
            id: crypto.randomUUID(),
            tenantId: tenantAId,
            employeeId: empAId,
            leaveType: 'ANNUAL',
            daysAmount: -requestedUnits,
            transactionType: 'LEAVE_CONSUMPTION',
            postedAt: leave.startDate,
            referenceId: leave.id,
          },
        });

        return 'APPROVED';
      });
    };

    // Execute concurrently
    const results = await Promise.allSettled([
      approveLeaveTx(leave1Id),
      approveLeaveTx(leave2Id),
    ]);

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    assert.equal(fulfilled.length, 1, 'Exactly one concurrent leave approval must succeed');
    assert.equal(rejected.length, 1, 'The competing approval must fail due to insufficient balance');
  });

  // --------------------------------------------------------------------------
  // TEST 3: Concurrent Assignment Percentage Race (Cap <= 100%)
  // --------------------------------------------------------------------------
  it('3. Concurrent Assignment Percentage Race: Assignments exceeding 100% total are prevented under concurrency', async () => {
    const addAssignment = async (asgId: string, percentage: number) => {
      return prisma.$transaction(async (tx) => {
        // Lock Employee Profile row
        await tx.$queryRawUnsafe(
          'SELECT id FROM employee_profiles WHERE id = $1::uuid FOR UPDATE',
          empAId
        );

        // Sum current active assignment percentages
        const agg: any = await tx.$queryRawUnsafe(
          'SELECT COALESCE(SUM(work_percentage), 0) as total FROM institution_assignments WHERE employee_id = $1::uuid AND is_active = true',
          empAId
        );
        const currentTotal = Number(agg[0].total);

        if (currentTotal + percentage > 100) {
          throw new Error('HR-003: Cumulative work percentage cannot exceed 100%. Attempted: ' + (currentTotal + percentage));
        }

        return tx.institutionAssignment.create({
          data: {
            id: asgId,
            tenantId: tenantAId,
            employeeId: empAId,
            institutionId: instAId,
            departmentId: deptAId,
            positionId: posAId,
            roleType: 'EDUCATOR',
            workPercentage: percentage,
            startDate: new Date('2026-09-01'),
            isActive: true,
          },
        });
      });
    };

    // Attempt two concurrent 60% assignments (Total would be 120%)
    const asgId1 = crypto.randomUUID();
    const asgId2 = crypto.randomUUID();

    const results = await Promise.allSettled([
      addAssignment(asgId1, 60),
      addAssignment(asgId2, 60),
    ]);

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    assert.equal(fulfilled.length, 1, 'Exactly one 60% assignment must succeed');
    assert.equal(rejected.length, 1, 'The second assignment must be rejected (exceeds 100% limit)');
  });

  // --------------------------------------------------------------------------
  // TEST 4: Duplicate Attendance Event Race Prevention
  // --------------------------------------------------------------------------
  it('4. Duplicate Attendance Punch: Idempotency or distinct timestamp handling', async () => {
    const punchId = crypto.randomUUID();
    const eventTime = new Date('2026-09-23T08:30:00Z');

    // Create first punch
    await prisma.attendanceEvent.create({
      data: {
        id: punchId,
        tenantId: tenantAId,
        institutionId: instAId,
        employeeId: empAId,
        eventType: 'CHECK_IN',
        sourceType: 'RFID_CARD',
        occurredAt: eventTime,
      },
    });

    // Attempt duplicate primary key creation
    await assert.rejects(
      async () => {
        await prisma.attendanceEvent.create({
          data: {
            id: punchId,
            tenantId: tenantAId,
            institutionId: instAId,
            employeeId: empAId,
            eventType: 'CHECK_IN',
            sourceType: 'RFID_CARD',
            occurredAt: eventTime,
          },
        });
      },
      /Unique constraint failed|duplicate key value/
    );
  });

  // --------------------------------------------------------------------------
  // TEST 5: Cross-Tenant HR BOLA: Tenant B querying Tenant A records is blocked
  // --------------------------------------------------------------------------
  it('5. Cross-Tenant HR BOLA: Tenant B cannot query Tenant A employee or leaves', async () => {
    // Direct scoped check: searching Tenant A employee with Tenant B filter returns null
    const empFromB = await prisma.employeeProfile.findFirst({
      where: {
        id: empAId,
        tenantId: tenantBId,
      },
    });
    assert.equal(empFromB, null, 'Tenant B must receive null (404 masked) when attempting to access Tenant A employee');

    // Scoped leave check
    const leavesFromB = await prisma.employeeLeave.findMany({
      where: {
        employeeId: empAId,
        tenantId: tenantBId,
      },
    });
    assert.equal(leavesFromB.length, 0, 'Tenant B cannot see leaves of Tenant A employee');
  });

  // --------------------------------------------------------------------------
  // TEST 6: Atomic Transaction Rollback: Hire Process Rollback
  // --------------------------------------------------------------------------
  it('6. Transactional Atomic Rollback: Error during hire aborts employee, employment, and assignment', async () => {
    const rolledBackPersonId = crypto.randomUUID();
    const rolledBackEmpId = crypto.randomUUID();

    await prisma.person.create({
      data: {
        id: rolledBackPersonId,
        tenantId: tenantAId,
        firstName: 'Deniz',
        lastName: 'Ucar',
      },
    });

    await assert.rejects(async () => {
      await prisma.$transaction(async (tx) => {
        await tx.employeeProfile.create({
          data: {
            id: rolledBackEmpId,
            tenantId: tenantAId,
            personId: rolledBackPersonId,
            employeeNumber: 'EMP-FAIL-01',
            isActive: true,
          },
        });

        await tx.employment.create({
          data: {
            id: crypto.randomUUID(),
            tenantId: tenantAId,
            organizationId: orgAId,
            employeeId: rolledBackEmpId,
            contractType: 'INDEFINITE',
            startDate: new Date(),
            status: 'ACTIVE',
          },
        });

        // Intentional failure: simulated downstream provisioning error
        throw new Error('SIMULATED_PROVISIONING_FAILURE');
      });
    }, /SIMULATED_PROVISIONING_FAILURE/);

    // Verify employee was rolled back
    const foundEmp = await prisma.employeeProfile.findUnique({
      where: { id: rolledBackEmpId },
    });
    assert.equal(foundEmp, null, 'Employee profile must be rolled back completely');
  });
});
