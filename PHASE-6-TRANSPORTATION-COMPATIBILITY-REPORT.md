# BİLGEN OS — PHASE 6: TRANSPORTATION OPERATIONS
## Discovery & Architecture Compatibility Report

**Document Date:** September 25, 2026  
**Phase:** 6 — Transportation Operations  
**Architecture:** Multi-Tenant Education Institution Operations OS (Modular Monolith)  
**Baseline Test Suite:** **94 / 94 PASS (100%) Across 21 Test Suites**  
**Physical Database:** Neon Serverless PostgreSQL (`neondb`)  
**Compatibility Status:** **COMPATIBLE — ZERO COLLISION DETECTED. READY TO IMPLEMENT.**

---

# 1. EXECUTIVE SUMMARY

An exhaustive discovery of the BilgenOS repository confirms that the existing multi-tenant platform foundation (Phases 1–5) provides all necessary structural hooks for Phase 6 (Transportation Operations). No existing models are broken or redefined. All new operational entities cleanly extend the schema and domain boundaries.

Phase 6 establishes the authoritative operational truth for:
1. **Fleet & Personnel:** `TransportationProvider`, `TransportationVehicle`, `DriverProfile`, `AttendantProfile`.
2. **Normative Routes & Stops:** `TransportationRoute`, `RouteStop`, `RouteOperationalAssignment`.
3. **Passenger Logistics & Safe Handover:** `TransportationPassengerProfile`, `PassengerRouteAssignment`, `PassengerHandoverAuthorization`.
4. **Empirical Execution & Incidents:** `TransportationTrip`, `TripManifestEntry`, `TripStopVisit`, `PassengerTripEvent`, `PassengerHandover`, `TransportationException`.

---

# 2. REUSE OF EXISTING INFRASTRUCTURE

| Component | Existing Phase | Reuse Pattern in Phase 6 |
|---|---|---|
| **Tenant, Institution & Campus** | Phase 1 | Scoped multi-tenant boundary for providers, routes, vehicles, stops, and trips. Routes and vehicles are scoped to institution and campus. |
| **Person & Learner** | Phase 1 & 2 | Students transported reference `Person` & `Learner`. Student academic master remains in BilgenOkul; BilgenOS owns the operational transportation passenger profile. |
| **EmployeeProfile** | Phase 4 | Internal drivers and attendants reference active `EmployeeProfile` records. External contracted personnel reference `Person` + `TransportationProvider`. |
| **Asset (Physical Vehicles)** | Phase 5 | Owned institution vehicles reference `Asset` (`assetId`) in Phase 5 physical assets. External contracted vehicles reference `TransportationProvider`. |
| **GuardianRelationship** | Phase 1 & 2 | Handover authorizations link to existing `GuardianRelationship` or vetted authorized non-guardian individuals. |
| **Capability Engine** | Phase 1 | Extended with `TRANSPORTATION`, `TRANSPORTATION_ROUTES`, `TRANSPORTATION_FLEET`, `TRANSPORTATION_PASSENGERS`, `TRANSPORTATION_TRIPS`, `TRANSPORTATION_HANDOVER` in `CapabilityDagEngine`. |
| **Authorization Kernel** | Phase 1 | Enforces tenant isolation, institution/campus scoping, document security classifications, and 404 existence masking. |
| **Audit & Outbox** | Phase 1 | Every trip lifecycle transition, boarding, drop-off, handover, and exception writes to `AuditLog` and `TransactionalOutbox` in the same database transaction. |
| **Idempotency** | Phase 1 | Enforced on trip start, passenger boarding, drop-off, and handover via `IdempotencyKey`. |

---

# 3. DOMAIN SEPARATIONS & BOUNDARIES

1. **BilgenOS Owns Transportation Operations:** BilgenOS is the authoritative system of record for routes, stops, vehicle rosters, crew assignments, manifests, daily trips, boarding, drop-offs, and safe guardian handovers.
2. **BilgenOkul Remains Academic Student Master:** Academic enrollment and grade records belong to BilgenOkul. BilgenOS does not duplicate academic student data. Live sync is formally documented as BLOCKED pending BilgenOkul API specifications.
3. **Vehicle ≠ Asset:** An owned vehicle is a physical asset with an `Asset` link; a contracted vehicle belongs to a `TransportationProvider` without asset inventory tracking.
4. **Driver ≠ EmployeeProfile:** In-house drivers reference `EmployeeProfile`; external subcontractor drivers reference `TransportationProvider` + `Person`.
5. **Route ≠ Trip:** A Route is a reusable normative template (stops, planned arrival times, sequence). A Trip is an empirical daily execution of a route with historical frozen snapshot data.
6. **RouteStop ≠ TripStopVisit:** A RouteStop is the planned station. A TripStopVisit is the actual recorded stop arrival, departure, and dwell time.
7. **Passenger Assignment ≠ Boarding ≠ Drop-off ≠ Guardian Handover:** These are distinct, immutable domain facts.
8. **Safe Guardian Handover:** For students requiring authorized handover, `DROPPED_OFF` is not terminal without an authorized `PassengerHandover` event.
9. **Capacity Conservation:** Effective passenger capacity is strictly derived from active assignments and vehicle capacity. No mutable seat counter drift. Concurrency safety is guaranteed via PostgreSQL row-locking.
10. **Finance Boundary:** Transportation does not calculate billing or post financial ledgers. Transportation service obligations flow to Phase 2 contracts and Phase 3 collection ledgers.
11. **GPS Boundary:** GPS coordinates are auxiliary telemetry; they do not dictate business truth. Trip state transitions are explicitly commanded domain events.

---

# 4. MIGRATION & POSTGRESQL CONCURRENCY STRATEGY

1. **Prisma Versioned Migrations Only:** Migration `20260925000002_phase6_transportation_core` will be created and applied via `npx prisma migrate deploy`. `prisma db push` is strictly prohibited.
2. **PostgreSQL Concurrency Controls:**
   - `SELECT ... FOR UPDATE` on vehicle and route assignment records to prevent last-seat capacity races.
   - Partial unique indexes for preventing double active operational assignments of the same vehicle or driver.
   - Idempotency key checking to eliminate duplicate boarding or duplicate handover races.
   - Row-level isolation and transactional rollback atomicity.
