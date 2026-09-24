# BİLGEN OS — PHASE 6: TRANSPORTATION OPERATIONS INVARIANT CATALOG
## Invariants TRN-001 through TRN-040

**Standard Document:** BilgenOS Transportation Operations Invariants  
**Phase:** 6 — Transportation Operations  
**Architecture:** Multi-Tenant Education Institution Operations OS  

---

### TRN-001: BilgenOS Owns Transportation Operations
BilgenOS is the single authoritative system of record for all transportation operations, including fleets, drivers, routes, stops, passenger assignments, trips, boarding logs, and guardian handovers.

### TRN-002: BilgenOkul Remains Academic Student Master
BilgenOkul is the master for student identity, grade levels, and academic enrollments. BilgenOS does not duplicate the academic master; it links via `Person` and `Learner` references.

### TRN-003: Transportation Passenger ≠ Academic Student Master
A transportation passenger profile (`TransportationPassengerProfile`) captures operational travel requirements (mobility needs, pickup/dropoff requirements, emergency contacts) and does not store academic curriculum or grades.

### TRN-004: Vehicle ≠ Asset
A vehicle (`TransportationVehicle`) is an operational transport entity with license plate, seating capacity, inspection expiry, and insurance data. It is decoupled from physical fixed asset management.

### TRN-005: Owned Vehicle May Reference Asset
Vehicles owned directly by the institution may reference an existing Phase 5 `Asset` record (`assetId`) to link physical tracking with operational fleet dispatch.

### TRN-006: External Vehicle Does Not Require Asset
Vehicles operated by third-party contracted transportation companies reference a `TransportationProvider` and do not require or create an `Asset` record.

### TRN-007: Driver Identity ≠ EmployeeProfile
Driver profiles represent licensed vehicle operators. Drivers may be third-party contractors (`Person` + `TransportationProvider`) or internal institutional staff.

### TRN-008: External Driver Does Not Require Employment
External contracted drivers do not require an active `EmployeeProfile` or payroll record in Phase 4 HR; their commercial vetting and compliance are managed under `TransportationProvider`.

### TRN-009: Route ≠ Trip
A Route (`TransportationRoute`) is a normative reusable service plan. A Trip (`TransportationTrip`) is an empirical, time-stamped operational execution of a route for a specific date and shift.

### TRN-010: RouteStop ≠ TripStopVisit
A `RouteStop` defines the planned stop location, sequence, and scheduled time. A `TripStopVisit` records the actual empirical arrival, departure, and dwell time during a specific trip.

### TRN-011: Passenger Assignment ≠ Boarding
Assigning a passenger to a route establishes an operational entitlement. It does not indicate that the passenger has boarded the vehicle.

### TRN-012: Boarding ≠ Drop-off
Boarding records when and where a passenger enters the vehicle. Drop-off records when and where the passenger leaves the vehicle. They are distinct, immutable domain events.

### TRN-013: Drop-off ≠ Guardian Handover
Dropping a student off at a stop is a vehicle physical event. For students requiring supervision, custodial release is an explicit, verified `PassengerHandover` domain action.

### TRN-014: Planned Time ≠ Actual Time
Scheduled arrival and departure times on routes and stops are normative targets. Actual arrival, departure, and delay times are recorded as empirical metrics on trips and stop visits.

### TRN-015: Vehicle Capacity Is Not Mutable Availability
Vehicle seating capacity (`seatingCapacity`) is a fixed physical specification. Available seats must be derived from active assignments and must never be stored as a mutable drifting counter.

### TRN-016: Passenger Assignment Cannot Exceed Capacity
The total count of active passenger assignments for a vehicle/shift cannot exceed the vehicle's effective passenger seating capacity. Over-assignment is strictly rejected with `VEHICLE_CAPACITY_EXCEEDED`.

### TRN-017: Conflicting Vehicle Assignments Are Forbidden
A vehicle cannot be simultaneously assigned to multiple active routes or trips operating across overlapping time windows. Violations throw `VEHICLE_ASSIGNMENT_CONFLICT`.

### TRN-018: Conflicting Driver Assignments Are Forbidden
A driver cannot be scheduled or dispatched to operate overlapping routes or trips simultaneously. Violations throw `DRIVER_ALREADY_IN_ACTIVE_TRIP` or `DRIVER_ASSIGNMENT_CONFLICT`.

### TRN-019: Trip Uses Historical Operational Snapshot
When a trip is initiated, it captures a frozen manifest snapshot of the assigned passengers, stops, vehicle, driver, and attendant. Subsequent edits to the normative route do not alter active or historical trips.

### TRN-020: Completed Trip Is Not Rewritten By Route Changes
Once a trip enters `COMPLETED` or `CANCELLED` status, its manifest, stop visit records, passenger events, and handovers are strictly immutable historical facts.

### TRN-021: Raw Passenger Trip Events Are Historical Facts
Events such as `BOARDED`, `DROPPED_OFF`, `NO_SHOW`, and `CANCELLED` are append-only domain facts with exact timestamps and recorder IDs. They are never overwritten or deleted.

### TRN-022: Duplicate Boarding Is Forbidden
A passenger cannot be recorded as `BOARDED` more than once within the same trip. A secondary boarding attempt must be rejected with `PASSENGER_ALREADY_BOARDED`.

### TRN-023: Invalid Drop-off Transition Is Forbidden
A passenger cannot be marked as `DROPPED_OFF` unless they have previously been recorded as `BOARDED` on that specific trip. Premature drop-off throws `PASSENGER_NOT_ONBOARD`.

### TRN-024: Guardian Handover Requires Effective Authorization
A student designated as requiring handover (`requiresHandover: true`) can only be released to an individual with an active, non-expired `PassengerHandoverAuthorization`. Violations throw `HANDOVER_NOT_AUTHORIZED`.

### TRN-025: Authorization Revocation Takes Immediate Effect
When a handover authorization is revoked or expires, all subsequent handover attempts for that individual must immediately fail, even if the trip is currently in progress.

### TRN-026: Minor Movement Data Is Protected
Passenger pickup locations, home stops, boarding times, and guardian handover logs are classified as sensitive student data and access is restricted to authorized roles.

### TRN-027: Transportation Fee ≠ Collection
Transportation operational entities do not own billing, installment tracking, or payment collection. Fees are contracted in Phase 2 and collected in Phase 3.

### TRN-028: No Transportation Financial Ledger
Phase 6 contains zero financial ledgers or account balances. All accounting truth remains strictly in the Phase 3 operational ledger.

### TRN-029: GPS Position ≠ Business State
Raw GPS coordinates and telemetry are non-authoritative sensor data. Trip state, passenger boarding, and handover completion must be explicitly confirmed business transactions.

### TRN-030: No Cross-Tenant Transportation Relationship
Under no circumstances may any provider, vehicle, driver, route, stop, passenger, or trip link across different `tenantId`s. Violations throw `CROSS_TENANT_TRANSPORT_RELATION`.

### TRN-031: Institution/Campus Scope Is Enforced
Transportation resources are scoped to the institution and campus. Cross-institution access without explicit multi-institution authorization is rejected.

### TRN-032: Trip Start Is Domain Controlled
A trip can only transition from `SCHEDULED` to `IN_PROGRESS` if the assigned vehicle and driver are verified, active, compliant, and not locked in another active trip. Violations throw `TRIP_NOT_STARTABLE`.

### TRN-033: Trip Completion Is Domain Controlled
A trip cannot be marked as `COMPLETED` if any onboard passenger has not been accounted for via drop-off or explicit exception logging. Violations throw `TRIP_NOT_COMPLETABLE`.

### TRN-034: Trip Manifest Is Historically Stable
The list of expected passengers for a trip snapshot is locked upon trip dispatch. Late additions or removals must be tracked as explicit trip manifest modifications with audit logging.

### TRN-035: One Passenger Cannot Have Conflicting Active Service Assignments
A passenger cannot have overlapping active route assignments for the same direction (e.g. two Morning Pickup routes) on the same effective dates. Violations throw `PASSENGER_ASSIGNMENT_CONFLICT`.

### TRN-036: One Passenger Journey Has At Most One Effective Successful Handover
A passenger's single trip drop-off can have at most one successful custodial handover event. Duplicate handover attempts throw `HANDOVER_ALREADY_COMPLETED`.

### TRN-037: Transportation Documents Use Secure Vaulting
Driver licenses, criminal background checks, vehicle insurance policies, and inspection certificates are stored with document classification (`STANDARD`, `CONFIDENTIAL`, `RESTRICTED`) and audited access.

### TRN-038: Sensitive Operations Are Audited
All route creations, driver reassignments, trip state changes, manual passenger overrides, and security exceptions write immutable records to `AuditLog`.

### TRN-039: Retryable Mobile Actions Are Idempotent
All driver and attendant mobile terminal actions (start trip, record boarding, complete handover) must require an `IdempotencyKey`. Replays return the original response; conflicting payloads throw `IDEMPOTENCY_PAYLOAD_CONFLICT`.

### TRN-040: BilgenOS Is Transportation System Of Record
All third-party transport integrations, driver mobile devices, attendant apps, and parent portal feeds must treat BilgenOS as the sole operational source of truth.
