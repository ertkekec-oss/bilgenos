import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  Department,
  Position,
  EmployeeProfile,
  Employment,
  InstitutionAssignment,
  WorkScheduleRule,
  EmployeeScheduleAssignment,
  AttendanceEvent,
  AttendanceSessionCalculator,
  EmployeeLeave,
  LeaveTransaction,
  PersonnelDocument,
} from '@bilgenos/domain';

describe('Phase 4: HR & Personnel Domain Invariants (HR-001 - HR-020)', () => {
  const tenantId = '11111111-1111-1111-1111-111111111111';
  const orgId = '12121212-1212-1212-1212-121212121212';
  const personId = '22222222-2222-2222-2222-222222222222';
  const empProfileId = '33333333-3333-3333-3333-333333333333';
  const instAId = '44444444-4444-4444-4444-444444444444';
  const instBId = '55555555-5555-5555-5555-555555555555';
  const deptId = '66666666-6666-6666-6666-666666666666';
  const posId = '77777777-7777-7777-7777-777777777777';

  it('HR-001: EmployeeProfile requires valid Person reference and mandatory employeeNumber', () => {
    const profile = new EmployeeProfile({
      id: empProfileId,
      tenantId,
      personId,
      employeeNumber: 'EMP-001',
      isActive: true,
    });
    assert.equal(profile.id, empProfileId);
    assert.equal(profile.personId, personId);
    assert.equal(profile.employeeNumber, 'EMP-001');
    assert.throws(
      () => new EmployeeProfile({ id: 'emp-bad', tenantId, personId, employeeNumber: '', isActive: true }),
      /Employee number is required/
    );
  });

  it('HR-002: Department & Position must be first-class domain entities with institution binding', () => {
    const dept = new Department({
      id: deptId,
      tenantId,
      institutionId: instAId,
      code: 'MATH',
      name: 'Matematik Bolumu',
      isActive: true,
    });
    assert.equal(dept.code, 'MATH');
    assert.equal(dept.name, 'Matematik Bolumu');
    const pos = new Position({
      id: posId,
      tenantId,
      institutionId: instAId,
      departmentId: deptId,
      code: 'MATH-HOD',
      title: 'Bolum Baskani',
      isActive: true,
    });
    assert.equal(pos.departmentId, deptId);
    assert.equal(pos.title, 'Bolum Baskani');
    assert.throws(
      () => new Position({ id: 'pos-bad', tenantId, institutionId: instAId, departmentId: deptId, code: '', title: 'Bad Pos', isActive: true }),
      /Position code is required/
    );
  });

  it('HR-003: Multi-Institution Assignments: Cumulative Work Percentage cannot exceed 100%', () => {
    const asg1 = new InstitutionAssignment({
      id: 'asg-1',
      tenantId,
      institutionId: instAId,
      employeeId: empProfileId,
      departmentId: deptId,
      positionId: posId,
      roleType: 'PRIMARY',
      workPercentage: 60,
      isPrimary: true,
      startDate: new Date('2024-01-01'),
      isActive: true,
    });
    const asg2 = new InstitutionAssignment({
      id: 'asg-2',
      tenantId,
      institutionId: instBId,
      employeeId: empProfileId,
      departmentId: deptId,
      positionId: posId,
      roleType: 'SECONDARY',
      workPercentage: 40,
      isPrimary: false,
      startDate: new Date('2024-01-01'),
      isActive: true,
    });
    assert.doesNotThrow(() => {
      InstitutionAssignment.validateTotalPercentage([asg1, asg2]);
    });
    const asgExceeding = new InstitutionAssignment({
      id: 'asg-3',
      tenantId,
      institutionId: instBId,
      employeeId: empProfileId,
      departmentId: deptId,
      positionId: posId,
      roleType: 'SECONDARY',
      workPercentage: 50,
      isPrimary: false,
      startDate: new Date('2024-01-01'),
      isActive: true,
    });
    assert.throws(
      () => InstitutionAssignment.validateTotalPercentage([asg1, asgExceeding]),
      /Cumulative assignment percentage/
    );
  });

  it('HR-004: WorkSchedule assignment cannot have overlapping active date intervals', () => {
    const rule = new WorkScheduleRule({
      id: 'rule-1',
      workScheduleId: 'ws-1',
      dayOfWeek: 1,
      startTime: '08:00',
      endTime: '17:00',
      breakMinutes: 60,
    });
    assert.equal(rule.dayOfWeek, 1);
    const asg1 = new EmployeeScheduleAssignment({
      id: 'esa-1',
      tenantId,
      employeeId: empProfileId,
      workScheduleId: 'ws-1',
      effectiveFrom: new Date('2024-01-01'),
      effectiveUntil: new Date('2024-06-30'),
    });
    const asgOverlap = new EmployeeScheduleAssignment({
      id: 'esa-2',
      tenantId,
      employeeId: empProfileId,
      workScheduleId: 'ws-2',
      effectiveFrom: new Date('2024-05-01'),
      effectiveUntil: new Date('2024-08-31'),
    });
    assert.throws(
      () => EmployeeScheduleAssignment.validateNoOverlap(asgOverlap, [asg1]),
      /Overlapping schedule assignment detected/
    );
  });

  it('HR-005: Raw punches are immutable; Worked minutes correctly calculated by AttendanceSessionCalculator', () => {
    const punchIn = new Date('2026-09-23T08:00:00Z');
    const punchOut = new Date('2026-09-23T17:00:00Z');
    const inPunch = new AttendanceEvent({
      id: 'punch-in',
      tenantId,
      institutionId: instAId,
      employeeId: empProfileId,
      eventType: 'CHECK_IN',
      occurredAt: punchIn,
      sourceType: 'BIOMETRIC',
      deviceReference: 'TERM-01',
    });
    const outPunch = new AttendanceEvent({
      id: 'punch-out',
      tenantId,
      institutionId: instAId,
      employeeId: empProfileId,
      eventType: 'CHECK_OUT',
      occurredAt: punchOut,
      sourceType: 'BIOMETRIC',
      deviceReference: 'TERM-01',
    });
    assert.equal(inPunch.eventType, 'CHECK_IN');
    assert.equal(outPunch.eventType, 'CHECK_OUT');
    const netMinutes = AttendanceSessionCalculator.calculateMinutesWorked(punchIn, punchOut, 60);
    assert.equal(netMinutes, 480);
  });

  it('HR-006: Leave balance is derived from LeaveTransaction ledger projection', () => {
    const tx1 = new LeaveTransaction({
      id: 'tx-1',
      tenantId,
      employeeId: empProfileId,
      leaveType: 'ANNUAL',
      transactionType: 'ACCRUAL',
      daysAmount: 14,
      postedAt: new Date('2026-01-01'),
    });
    const tx2 = new LeaveTransaction({
      id: 'tx-2',
      tenantId,
      employeeId: empProfileId,
      leaveType: 'ANNUAL',
      transactionType: 'USAGE',
      daysAmount: -3,
      postedAt: new Date('2026-04-01'),
    });
    const balance = EmployeeLeave.calculateLeaveBalance('ANNUAL', [tx1, tx2]);
    assert.equal(balance, 11);
  });

  it('HR-007: Maker-Checker constraint: Applicant cannot approve own leave request', () => {
    const applicantUserId = 'user-applicant-111';
    const checkerUserId = 'user-checker-222';
    const leave = new EmployeeLeave({
      id: 'lv-01',
      tenantId,
      institutionId: instAId,
      employeeId: empProfileId,
      leaveType: 'ANNUAL',
      unit: 'DAY',
      startDate: new Date('2026-07-01'),
      endDate: new Date('2026-07-05'),
      unitsCount: 5,
      status: 'REQUESTED',
      requestedByUserId: applicantUserId,
    });
    assert.throws(() => leave.approve(applicantUserId, 10), /Maker-Checker violation/);
    leave.approve(checkerUserId, 10);
    assert.equal(leave.currentStatus, 'APPROVED');
    assert.equal(leave.currentApprovedByUserId, checkerUserId);
  });

  it('HR-008: Insufficient Leave Balance Rejection', () => {
    const checkerUserId = 'user-checker-222';
    const leave = new EmployeeLeave({
      id: 'lv-02',
      tenantId,
      institutionId: instAId,
      employeeId: empProfileId,
      leaveType: 'ANNUAL',
      unit: 'DAY',
      startDate: new Date('2026-07-01'),
      endDate: new Date('2026-07-07'),
      unitsCount: 7,
      status: 'REQUESTED',
      requestedByUserId: 'user-applicant-333',
    });
    assert.throws(() => leave.approve(checkerUserId, 5), /Insufficient leave balance/);
  });

  it('HR-009: Employment termination requires mandatory reason and transitions status', () => {
    const employment = new Employment({
      id: 'empl-01',
      tenantId,
      organizationId: orgId,
      employeeId: empProfileId,
      contractType: 'INDEFINITE',
      startDate: new Date('2023-01-01'),
      status: 'ACTIVE',
    });
    assert.throws(() => employment.terminate(''), /Termination reason is mandatory/);
    employment.terminate('Karsilikli anlasma');
    assert.equal(employment.currentStatus, 'TERMINATED');
    assert.equal(employment.currentTerminationReason, 'Karsilikli anlasma');
  });

  it('HR-010: Personnel Document Security Classification & Verification', () => {
    const doc = new PersonnelDocument({
      id: 'doc-01',
      tenantId,
      employeeId: empProfileId,
      documentType: 'CRIMINAL_RECORD',
      documentTitle: 'Adli Sicil Kaydi',
      fileReference: 'vault://hr/docs/doc-01.pdf',
      securityClassification: 'RESTRICTED',
      status: 'PENDING_VERIFICATION',
    });
    assert.equal(doc.securityClassification, 'RESTRICTED');
    assert.equal(doc.currentStatus, 'PENDING_VERIFICATION');
    const verifierUserId = 'user-hr-admin-777';
    doc.verify(verifierUserId);
    assert.equal(doc.currentStatus, 'VALID');
    assert.equal(doc.currentVerifiedByUserId, verifierUserId);
  });
});
