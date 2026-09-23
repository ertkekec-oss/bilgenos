import crypto from 'crypto';
import type {
  CreateEmployeeProfileDto,
  EmployeeProfileDto,
  CreateEmploymentDto,
  EmploymentDto,
  CreateInstitutionAssignmentDto,
  InstitutionAssignmentDto,
  RequestLeaveDto,
  EmployeeLeaveDto,
  RecordAttendanceEventDto,
  AttendanceEventDto,
  RequestTenantContext,
  UUID,
} from '@bilgenos/contracts';
import {
  EmployeeProfile,
  Employment,
  InstitutionAssignment,
  EmployeeLeave,
  LeaveTransaction,
  AttendanceEvent,
  AttendanceSessionCalculator,
  DomainError,
} from '@bilgenos/domain';
import {
  InMemoryScopedEmployeeRepository,
  InMemoryScopedEmploymentRepository,
  InMemoryScopedAssignmentRepository,
  InMemoryScopedLeaveRepository,
  InMemoryScopedAttendanceRepository,
} from '../in-memory/in-memory-scoped-repository.js';

export class HROperationsService {
  private employeeRepo: InMemoryScopedEmployeeRepository;
  private employmentRepo: InMemoryScopedEmploymentRepository;
  private assignmentRepo: InMemoryScopedAssignmentRepository;
  private leaveRepo: InMemoryScopedLeaveRepository;
  private attendanceRepo: InMemoryScopedAttendanceRepository;

  constructor(private readonly context: RequestTenantContext) {
    this.employeeRepo = new InMemoryScopedEmployeeRepository(context);
    this.employmentRepo = new InMemoryScopedEmploymentRepository(context);
    this.assignmentRepo = new InMemoryScopedAssignmentRepository(context);
    this.leaveRepo = new InMemoryScopedLeaveRepository(context);
    this.attendanceRepo = new InMemoryScopedAttendanceRepository(context);
  }

  // 1. Employee Profile
  public async createEmployeeProfile(dto: CreateEmployeeProfileDto): Promise<EmployeeProfileDto> {
    const id = crypto.randomUUID();
    const domain = new EmployeeProfile({
      id,
      tenantId: this.context.tenantId,
      personId: dto.personId,
      employeeNumber: dto.employeeNumber,
      userId: dto.userId,
      isActive: true,
    });

    const record = await this.employeeRepo.create({
      id: domain.id,
      personId: domain.personId,
      employeeNumber: domain.employeeNumber,
      userId: domain.userId,
      isActive: domain.isActive,
    });
    return record;
  }

  public async getEmployeeById(id: UUID): Promise<EmployeeProfileDto | null> {
    return this.employeeRepo.findById(id);
  }

  // 2. Employment Contract Lifecycle
  public async createEmployment(dto: CreateEmploymentDto): Promise<EmploymentDto> {
    const id = crypto.randomUUID();
    const startDate = new Date(dto.startDate);
    const endDate = dto.endDate ? new Date(dto.endDate) : undefined;
    const probationEndDate = dto.probationEndDate ? new Date(dto.probationEndDate) : undefined;

    const domain = new Employment({
      id,
      tenantId: this.context.tenantId,
      organizationId: dto.organizationId,
      employeeId: dto.employeeId,
      contractType: dto.contractType,
      status: 'DRAFT',
      startDate,
      endDate,
      probationEndDate,
    });

    const record = await this.employmentRepo.create({
      id: domain.id,
      organizationId: domain.organizationId,
      employeeId: domain.employeeId,
      contractType: domain.contractType,
      status: domain.currentStatus,
      startDate: domain.startDate.toISOString().split('T')[0],
      endDate: domain.endDate ? domain.endDate.toISOString().split('T')[0] : undefined,
      probationEndDate: domain.probationEndDate ? domain.probationEndDate.toISOString().split('T')[0] : undefined,
    });
    return record;
  }

  public async activateEmployment(employmentId: UUID): Promise<EmploymentDto> {
    const raw = await this.employmentRepo.findById(employmentId);
    if (!raw) throw new DomainError(`Employment ${employmentId} not found`);

    const domain = new Employment({
      id: raw.id,
      tenantId: raw.tenantId,
      organizationId: raw.organizationId,
      employeeId: raw.employeeId,
      contractType: raw.contractType,
      status: raw.status,
      startDate: new Date(raw.startDate),
      endDate: raw.endDate ? new Date(raw.endDate) : undefined,
      probationEndDate: raw.probationEndDate ? new Date(raw.probationEndDate) : undefined,
    });

    domain.activate();

    const updated = await this.employmentRepo.update(employmentId, {
      status: domain.currentStatus,
    });
    return updated;
  }

  public async terminateEmployment(employmentId: UUID, reason: string, date: Date = new Date()): Promise<EmploymentDto> {
    const raw = await this.employmentRepo.findById(employmentId);
    if (!raw) throw new DomainError(`Employment ${employmentId} not found`);

    const domain = new Employment({
      id: raw.id,
      tenantId: raw.tenantId,
      organizationId: raw.organizationId,
      employeeId: raw.employeeId,
      contractType: raw.contractType,
      status: raw.status,
      startDate: new Date(raw.startDate),
      endDate: raw.endDate ? new Date(raw.endDate) : undefined,
      probationEndDate: raw.probationEndDate ? new Date(raw.probationEndDate) : undefined,
    });

    domain.terminate(reason, date);

    const updated = await this.employmentRepo.update(employmentId, {
      status: domain.currentStatus,
      terminationDate: domain.currentTerminationDate?.toISOString().split('T')[0],
      terminationReason: domain.currentTerminationReason,
    });
    return updated;
  }

  // 3. Institution Assignment
  public async createAssignment(dto: CreateInstitutionAssignmentDto): Promise<InstitutionAssignmentDto> {
    const existingRaw = await this.assignmentRepo.findByEmployee(dto.employeeId);
    const existingDomain = existingRaw.map(
      (a: any) =>
        new InstitutionAssignment({
          id: a.id,
          tenantId: a.tenantId,
          institutionId: a.institutionId,
          campusId: a.campusId,
          employeeId: a.employeeId,
          departmentId: a.departmentId,
          positionId: a.positionId,
          roleType: a.roleType,
          isPrimary: a.isPrimary,
          workPercentage: a.workPercentage,
          startDate: new Date(a.startDate),
          endDate: a.endDate ? new Date(a.endDate) : undefined,
          isActive: a.isActive,
        })
    );

    const newAssignment = new InstitutionAssignment({
      id: crypto.randomUUID(),
      tenantId: this.context.tenantId,
      institutionId: dto.institutionId,
      campusId: dto.campusId,
      employeeId: dto.employeeId,
      departmentId: dto.departmentId,
      positionId: dto.positionId,
      roleType: dto.roleType,
      isPrimary: dto.isPrimary ?? (existingDomain.length === 0),
      workPercentage: dto.workPercentage ?? 100,
      startDate: new Date(dto.startDate),
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      isActive: true,
    });

    // Invariant HR-009: Cumulative percentage <= 100
    InstitutionAssignment.validateTotalPercentage([...existingDomain, newAssignment]);

    const record = await this.assignmentRepo.create({
      id: newAssignment.id,
      institutionId: newAssignment.institutionId,
      campusId: newAssignment.campusId,
      employeeId: newAssignment.employeeId,
      departmentId: newAssignment.departmentId,
      positionId: newAssignment.positionId,
      roleType: newAssignment.roleType,
      isPrimary: newAssignment.isPrimary,
      workPercentage: newAssignment.workPercentage,
      startDate: newAssignment.startDate.toISOString().split('T')[0],
      endDate: newAssignment.endDate ? newAssignment.endDate.toISOString().split('T')[0] : undefined,
      isActive: newAssignment.isActive,
    });
    return record;
  }

  // 4. Leave Management & Entitlement Ledger
  public async grantLeaveEntitlement(employeeId: UUID, leaveType: any, days: number): Promise<void> {
    await this.leaveRepo.addTransaction({
      id: crypto.randomUUID(),
      employeeId,
      leaveType,
      transactionType: 'ENTITLEMENT_GRANT',
      daysAmount: days,
    });
  }

  public async getLeaveBalance(employeeId: UUID, leaveType: any): Promise<number> {
    const rawTx = await this.leaveRepo.getTransactionsByEmployee(employeeId, leaveType);
    const domainTx = rawTx.map(
      (t: any) =>
        new LeaveTransaction({
          id: t.id,
          tenantId: t.tenantId,
          employeeId: t.employeeId,
          leaveType: t.leaveType,
          transactionType: t.transactionType,
          daysAmount: Number(t.daysAmount),
          referenceId: t.referenceId,
          postedAt: new Date(t.postedAt),
        })
    );
    return EmployeeLeave.calculateLeaveBalance(leaveType, domainTx);
  }

  public async requestLeave(dto: RequestLeaveDto): Promise<EmployeeLeaveDto> {
    const id = crypto.randomUUID();
    const domain = new EmployeeLeave({
      id,
      tenantId: this.context.tenantId,
      institutionId: dto.institutionId,
      employeeId: dto.employeeId,
      leaveType: dto.leaveType,
      unit: dto.unit,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      unitsCount: dto.unitsCount,
      reason: dto.reason,
      status: 'REQUESTED',
      requestedByUserId: dto.requestedByUserId,
    });

    const record = await this.leaveRepo.create({
      id: domain.id,
      institutionId: domain.institutionId,
      employeeId: domain.employeeId,
      leaveType: domain.leaveType,
      unit: domain.unit,
      startDate: domain.startDate.toISOString().split('T')[0],
      endDate: domain.endDate.toISOString().split('T')[0],
      unitsCount: domain.unitsCount,
      reason: domain.reason,
      status: domain.currentStatus,
      requestedByUserId: domain.requestedByUserId,
    });
    return record;
  }

  public async approveLeave(leaveId: UUID, approverUserId: UUID): Promise<EmployeeLeaveDto> {
    const raw = await this.leaveRepo.findById(leaveId);
    if (!raw) throw new DomainError(`Leave ${leaveId} not found`);

    const domain = new EmployeeLeave({
      id: raw.id,
      tenantId: raw.tenantId,
      institutionId: raw.institutionId,
      employeeId: raw.employeeId,
      leaveType: raw.leaveType,
      unit: raw.unit,
      startDate: new Date(raw.startDate),
      endDate: new Date(raw.endDate),
      unitsCount: Number(raw.unitsCount),
      reason: raw.reason,
      status: raw.status,
      requestedByUserId: raw.requestedByUserId,
    });

    const balance = await this.getLeaveBalance(raw.employeeId, raw.leaveType);
    domain.approve(approverUserId, balance);

    // Deduct from entitlement ledger via LEAVE_CONSUMPTION transaction
    await this.leaveRepo.addTransaction({
      id: crypto.randomUUID(),
      employeeId: domain.employeeId,
      leaveType: domain.leaveType,
      transactionType: 'LEAVE_CONSUMPTION',
      daysAmount: -domain.unitsCount,
      referenceId: domain.id,
    });

    const updated = await this.leaveRepo.update(leaveId, {
      status: domain.currentStatus,
      approvedByUserId: domain.currentApprovedByUserId,
      approvedAt: domain.currentApprovedAt?.toISOString(),
    });
    return updated;
  }

  // 5. Attendance Events
  public async recordAttendanceEvent(dto: RecordAttendanceEventDto): Promise<AttendanceEventDto> {
    const id = crypto.randomUUID();
    const domain = new AttendanceEvent({
      id,
      tenantId: this.context.tenantId,
      institutionId: dto.institutionId,
      employeeId: dto.employeeId,
      occurredAt: new Date(dto.occurredAt),
      eventType: dto.eventType,
      sourceType: dto.sourceType || 'KIOSK',
      deviceReference: dto.deviceReference,
    });

    const record = await this.attendanceRepo.recordEvent({
      id: domain.id,
      institutionId: domain.institutionId,
      employeeId: domain.employeeId,
      occurredAt: domain.occurredAt.toISOString(),
      eventType: domain.eventType,
      sourceType: domain.sourceType,
      deviceReference: domain.deviceReference,
    });
    return record;
  }

  public deriveSessionWorkedMinutes(checkIn: Date, checkOut: Date, breakMinutes: number = 0): number {
    return AttendanceSessionCalculator.calculateMinutesWorked(checkIn, checkOut, breakMinutes);
  }
}
