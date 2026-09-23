import type { BaseEntityDto, UUID } from '../shared/types.js';

export interface DepartmentDto extends BaseEntityDto {
  tenantId: UUID;
  institutionId: UUID;
  code: string;
  name: string;
  parentDepartmentId?: UUID | undefined;
  isActive: boolean;
}

export interface PositionDto extends BaseEntityDto {
  tenantId: UUID;
  institutionId: UUID;
  departmentId?: UUID | undefined;
  code: string;
  title: string;
  description?: string | undefined;
  isActive: boolean;
}

export interface EmployeeProfileDto extends BaseEntityDto {
  tenantId: UUID;
  personId: UUID;
  employeeNumber: string;
  userId?: UUID | undefined;
  isActive: boolean;
}

export interface CreateEmployeeProfileDto {
  personId: UUID;
  employeeNumber: string;
  userId?: UUID | undefined;
}

export type EmploymentContractType =
  | 'INDEFINITE'
  | 'FIXED_TERM'
  | 'PART_TIME'
  | 'INTERN';

export type EmploymentStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'PROBATION'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'TERMINATED';

export interface EmploymentDto extends BaseEntityDto {
  tenantId: UUID;
  organizationId: UUID;
  employeeId: UUID;
  contractType: EmploymentContractType;
  status: EmploymentStatus;
  startDate: string;
  endDate?: string | undefined;
  probationEndDate?: string | undefined;
  terminationDate?: string | undefined;
  terminationReason?: string | undefined;
}

export interface CreateEmploymentDto {
  organizationId: UUID;
  employeeId: UUID;
  contractType: EmploymentContractType;
  startDate: string;
  endDate?: string | undefined;
  probationEndDate?: string | undefined;
}

export type AssignmentRoleType =
  | 'EDUCATOR'
  | 'ADMINISTRATIVE'
  | 'SUPPORT'
  | 'MANAGEMENT';

export interface InstitutionAssignmentDto extends BaseEntityDto {
  tenantId: UUID;
  institutionId: UUID;
  campusId?: UUID | undefined;
  employeeId: UUID;
  departmentId?: UUID | undefined;
  positionId?: UUID | undefined;
  roleType: AssignmentRoleType;
  isPrimary: boolean;
  workPercentage: number;
  startDate: string;
  endDate?: string | undefined;
  isActive: boolean;
}

export interface CreateInstitutionAssignmentDto {
  institutionId: UUID;
  campusId?: UUID | undefined;
  employeeId: UUID;
  departmentId?: UUID | undefined;
  positionId?: UUID | undefined;
  roleType: AssignmentRoleType;
  isPrimary?: boolean | undefined;
  workPercentage?: number | undefined;
  startDate: string;
  endDate?: string | undefined;
}

export interface WorkScheduleDto extends BaseEntityDto {
  tenantId: UUID;
  institutionId: UUID;
  name: string;
  code: string;
  isFlexible: boolean;
  isActive: boolean;
  rules?: WorkScheduleRuleDto[] | undefined;
}

export interface WorkScheduleRuleDto {
  id: UUID;
  workScheduleId: UUID;
  dayOfWeek: number; // 1-7
  startTime: string; // "08:30"
  endTime: string;   // "17:00"
  breakMinutes: number;
}

export interface EmployeeScheduleAssignmentDto extends BaseEntityDto {
  tenantId: UUID;
  employeeId: UUID;
  workScheduleId: UUID;
  effectiveFrom: string;
  effectiveUntil?: string | undefined;
}

export type AttendanceEventType = 'CHECK_IN' | 'CHECK_OUT';
export type AttendanceSourceType = 'KIOSK' | 'BIOMETRIC' | 'MOBILE' | 'MANUAL';

export interface AttendanceEventDto extends BaseEntityDto {
  tenantId: UUID;
  institutionId: UUID;
  employeeId: UUID;
  occurredAt: string;
  eventType: AttendanceEventType;
  sourceType: AttendanceSourceType;
  deviceReference?: string | undefined;
}

export interface RecordAttendanceEventDto {
  institutionId: UUID;
  employeeId: UUID;
  occurredAt: string;
  eventType: AttendanceEventType;
  sourceType?: AttendanceSourceType | undefined;
  deviceReference?: string | undefined;
}

export interface AttendanceSessionDto extends BaseEntityDto {
  tenantId: UUID;
  employeeId: UUID;
  workDate: string;
  checkInAt: string;
  checkOutAt?: string | undefined;
  minutesWorked?: number | undefined;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'INCOMPLETE' | 'OVERNIGHT';
}

export type LeaveType =
  | 'ANNUAL'
  | 'SICK'
  | 'MATERNITY'
  | 'UNPAID'
  | 'CASUAL';

export type LeaveUnit = 'FULL_DAY' | 'HALF_DAY' | 'HOURS';

export type LeaveStatus =
  | 'REQUESTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';

export interface EmployeeLeaveDto extends BaseEntityDto {
  tenantId: UUID;
  institutionId: UUID;
  employeeId: UUID;
  leaveType: LeaveType;
  unit: LeaveUnit;
  startDate: string;
  endDate: string;
  unitsCount: number;
  reason?: string | undefined;
  status: LeaveStatus;
  requestedByUserId: UUID;
  approvedByUserId?: UUID | undefined;
  approvedAt?: string | undefined;
}

export interface RequestLeaveDto {
  institutionId: UUID;
  employeeId: UUID;
  leaveType: LeaveType;
  unit: LeaveUnit;
  startDate: string;
  endDate: string;
  unitsCount: number;
  reason?: string | undefined;
  requestedByUserId: UUID;
}

export type LeaveTransactionType =
  | 'ENTITLEMENT_GRANT'
  | 'LEAVE_CONSUMPTION'
  | 'LEAVE_CANCELLATION'
  | 'EXPIRED';

export interface LeaveTransactionDto extends BaseEntityDto {
  tenantId: UUID;
  employeeId: UUID;
  leaveType: LeaveType;
  transactionType: LeaveTransactionType;
  daysAmount: number;
  referenceId?: UUID | undefined;
  postedAt: string;
}

export type DocumentSecurityClassification =
  | 'STANDARD'
  | 'CONFIDENTIAL'
  | 'RESTRICTED';

export type PersonnelDocumentType =
  | 'CV'
  | 'DIPLOMA'
  | 'HEALTH_REPORT'
  | 'CRIMINAL_RECORD'
  | 'CONTRACT'
  | 'CERTIFICATE';

export type PersonnelDocumentStatus = 'VALID' | 'EXPIRED' | 'PENDING_REVIEW';

export interface PersonnelDocumentDto extends BaseEntityDto {
  tenantId: UUID;
  employeeId: UUID;
  documentType: PersonnelDocumentType;
  documentTitle: string;
  fileReference: string;
  securityClassification: DocumentSecurityClassification;
  expiryDate?: string | undefined;
  status: PersonnelDocumentStatus;
  verifiedByUserId?: UUID | undefined;
  verifiedAt?: string | undefined;
}
