import type { UUID } from '../shared/types.js';
import type { BaseDomainEvent } from './phase1-events.js';

export interface EmployeeHiredPayload {
  employeeId: UUID;
  tenantId: UUID;
  personId: UUID;
  employeeNumber: string;
  organizationId: UUID;
}

export interface EmployeeHiredEvent extends BaseDomainEvent {
  eventType: 'EmployeeHired';
  payload: EmployeeHiredPayload;
}

export interface AssignmentCreatedPayload {
  assignmentId: UUID;
  tenantId: UUID;
  institutionId: UUID;
  campusId?: UUID | undefined;
  employeeId: UUID;
  roleType: string;
  workPercentage: number;
}

export interface AssignmentCreatedEvent extends BaseDomainEvent {
  eventType: 'AssignmentCreated';
  payload: AssignmentCreatedPayload;
}

export interface AttendanceRecordedPayload {
  eventId: UUID;
  tenantId: UUID;
  institutionId: UUID;
  employeeId: UUID;
  occurredAt: string;
  eventType: string;
}

export interface AttendanceRecordedEvent extends BaseDomainEvent {
  eventType: 'AttendanceRecorded';
  payload: AttendanceRecordedPayload;
}

export interface LeaveApprovedPayload {
  leaveId: UUID;
  tenantId: UUID;
  institutionId: UUID;
  employeeId: UUID;
  leaveType: string;
  unitsCount: number;
  approvedByUserId: UUID;
}

export interface LeaveApprovedEvent extends BaseDomainEvent {
  eventType: 'LeaveApproved';
  payload: LeaveApprovedPayload;
}

export interface StaffSyncRequestedPayload {
  employeeId: UUID;
  tenantId: UUID;
  institutionId: UUID;
  externalProviderCode: string;
}

export interface StaffSyncRequestedEvent extends BaseDomainEvent {
  eventType: 'StaffSyncRequested';
  payload: StaffSyncRequestedPayload;
}
