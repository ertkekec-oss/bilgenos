# BİLGEN OS — PHASE 4
## HR & Personnel Operations Invariants

**Document:** PHASE-4-HR-INVARIANTS.md  
**Status:** BINDING & PERMANENT ARCHITECTURAL INVARIANTS  
**Phase:** 4  

---

### HR-001: Person ≠ EmployeeProfile
`Person` is the universal biological human identity. `EmployeeProfile` is an individual's institutional employment identity. An individual can simultaneously be a Guardian, a Candidate, and an Employee without duplicating the underlying `Person` record.

### HR-002: EmployeeProfile ≠ UserIdentity
An `EmployeeProfile` does not automatically possess login credentials (`User`). Operational staff, cafeteria personnel, service drivers, and security officers can exist as employees without requiring software accounts.

### HR-003: Employment ≠ InstitutionAssignment
`Employment` is the legal contract between the individual and the corporate `Organization` (SGK, contract type, probation, start/end date). `InstitutionAssignment` is the operational deployment to one or more `Institutions` or `Campuses` (e.g. teaching in College A while serving as Department Head in Prep Center B).

### HR-004: Schedule ≠ Attendance
`WorkSchedule` (and its rules) is the normative institutional expectation (shifts, working hours, break times). `Attendance` (and `AttendanceEvent`) is empirical operational fact (card swipes, kiosk punches, timestamps).

### HR-005: Attendance ≠ Payroll
Phase 4 explicitly excludes payroll calculations, tax withholdings, and salary disbursements. Phase 4 provides verified attendance, worked hours, and approved leaves. A separate Payroll Engine will consume these verified facts in a future phase.

### HR-006: Leave ≠ Absence
`Leave` is a planned, formally requested, and approved entitlement with Maker-Checker governance. `Absence` is an unexcused operational shortfall derived from reconciling expected `WorkSchedule` against actual `AttendanceSessions`.

### HR-007: No Cross-Tenant Employment Relationship
Every HR entity (`EmployeeProfile`, `Employment`, `Assignment`, `Leave`, `AttendanceEvent`) is strictly bound to a single `tenantId`. Cross-tenant employment is prohibited.

### HR-008: No Unauthorized Cross-Institution HR Access
HR records are institution-scoped. Users without multi-campus management authorization cannot access or modify employee records of another institution. Cross-institution queries receive `404 Not Found` (existence masking).

### HR-009: Assignment Percentage Cannot Exceed Policy Limit
The cumulative active `workPercentage` across all concurrent `InstitutionAssignments` for an employee cannot exceed 100%.

### HR-010: No Invalid Employment Date Range
An `Employment` record must have `startDate <= endDate`. Probation end date must fall within the employment tenure.

### HR-011: No Invalid Schedule Effective-Date Overlap
An employee cannot have multiple active `EmployeeScheduleAssignments` with overlapping effective date ranges (`effectiveFrom` to `effectiveUntil`).

### HR-012: Raw Attendance Events Are Auditable Historical Facts
`AttendanceEvent` records (`CHECK_IN`, `CHECK_OUT`) are immutable operational historical facts. They cannot be edited or deleted in-place. Adjustments require explicit audit entries.

### HR-013: Worked Time Is Derived
`minutesWorked` is a derived projection computed from matched `AttendanceSession` pairs, schedule expectations, break deductions, and approved adjustments. It is not an arbitrary mutable field.

### HR-014: Leave Balance Is Derived From Leave Transactions
Leave balance is never an unexplained mutable counter. It is deterministically derived:
$$\text{Effective Balance} = \sum(\text{Valid LeaveTransactions})$$

### HR-015: Leave Balance Cannot Become Invalid Through Concurrent Approval
Concurrent leave approval transactions must use database locks (`FOR UPDATE`) to ensure the resulting leave balance never drops below zero.

### HR-016: Restricted Personnel Documents Require Explicit Authorization
Documents are classified into `STANDARD`, `CONFIDENTIAL`, and `RESTRICTED`. Health reports and criminal records require explicit `hr.document.restricted.read` permissions. Document content is never exposed in generic DTOs or logs.

### HR-017: Termination Preserves Historical Employment
Terminating an employment changes status to `TERMINATED` with timestamp and reason. Destructive deletion of historical employment contracts is strictly forbidden.

### HR-018: BilgenOS Is HR Master
BilgenOS is the single authoritative source of truth for all workforce data, contracts, assignments, attendance, and leave management.

### HR-019: BilgenOkul Academic Staff Is External Mapping, Not HR Master
BilgenOkul does not manage employment, leaves, or contracts. It receives educator provisioning via `ExternalEntityMapping` (`EMPLOYEE \to BILGEN_OKUL_TEACHER`). Academic classrooms and tests remain in BilgenOkul.

### HR-020: Payroll Is Outside Phase 4
No payroll processing, salary tables, or direct financial payables exist in Phase 4.
