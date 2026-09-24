# BİLGEN OS — PHASE 5: CAMPUS, FACILITY & ASSET OPERATIONS
## Discovery & Architecture Compatibility Report

**Document Date:** September 25, 2026  
**Phase:** 5 — Campus, Facility & Asset Operations  
**Architecture:** Multi-Tenant Education Institution Operations OS (Modular Monolith)  
**Baseline Test Suite:** **79 / 79 PASS (100%) Across 19 Test Suites**  
**Physical Database:** Neon Serverless PostgreSQL (`neondb`)  
**Compatibility Status:** **COMPATIBLE — ZERO COLLISION DETECTED. READY TO IMPLEMENT.**

---

# 1. EXECUTIVE SUMMARY

An exhaustive discovery of the BilgenOS repository confirms that the existing multi-tenant platform foundation (Phases 1–4) provides all structural hooks required for Phase 5. No model collisions, destructive schema changes, or breaking refactorings are required.

Phase 5 will establish:
1. **Physical Institution Structure:** `Campus` (reused) $\to$ `Building` $\to$ `Floor` $\to$ `Space`.
2. **Physical Asset Operations:** `AssetCategory` $\to$ `Asset` $\to$ `AssetLocationHistory`, `AssetCustody`, `AssetTransfer`, `AssetDocument`.

---

# 2. REUSE OF EXISTING INFRASTRUCTURE

| Component | Existing Phase | Reuse Pattern in Phase 5 |
|---|---|---|
| **Campus** | Phase 1 | Reused as-is (`campuses` table). Buildings attach directly to `campusId`. No duplicate Campus entity will be created. |
| **Institution & Organization** | Phase 1 | Scoped boundary for physical assets and facilities. |
| **Person & EmployeeProfile** | Phase 1 & 4 | Asset custodians are strictly validated against active `EmployeeProfile` records. |
| **InstitutionAssignment** | Phase 4 | Custodians' campus/institution eligibility verified against institutional assignments. |
| **Capability Engine** | Phase 1 | Extended with `CAMPUS_OPERATIONS`, `PHYSICAL_SPACES`, `ASSET_MANAGEMENT`, `ASSET_CUSTODY`, `ASSET_TRANSFER` in `CapabilityDagEngine`. |
| **Authorization Kernel** | Phase 1 | Enforces tenant isolation, institution/campus scoping, document security levels (`STANDARD`, `CONFIDENTIAL`, `RESTRICTED`), and 404 existence masking. |
| **Audit & Outbox** | Phase 1 | Every physical relocation, custody change, transfer, and lifecycle change writes to `AuditLog` and `TransactionalOutbox` in the same database transaction. |
| **Idempotency** | Phase 1 | Enforced on asset creation, custody assignments/returns, and transfer completions via `IdempotencyKey`. |

---

# 3. DOMAIN SEPARATIONS & BOUNDARIES

1. **Campus ≠ Building ≠ Floor ≠ Space:** The physical location hierarchy is canonical: `Tenant` $\to$ `Organization` $\to$ `Institution` $\to$ `Campus` $\to$ `Building` $\to$ `Floor` $\to$ `Space`.
2. **Space ≠ Academic Classroom:** Spaces are purely physical rooms (e.g., Room 204). Academic scheduling, grades, and classes are strictly forbidden on `Space`.
3. **Asset ≠ Inventory Item:** Assets are individually serialized or tagged items (laptops, projectors, desks). Bulk consumable stock and warehouse management are out of scope.
4. **Asset Location ≠ Asset Custody:** Physical location (`Space`) and human stewardship (`EmployeeProfile`) are completely decoupled. Moving a laptop does not change its custodian; reassigning custody does not move the laptop.
5. **Asset Transfer ≠ Location Move:** A same-campus room move is an `AssetLocationHistory` movement. A cross-institution/campus transfer is an atomic `AssetTransfer` with Maker-Checker approval.
6. **Asset Purchase Cost ≠ Accounting Book Value:** `purchaseCostMinor` is acquisition metadata; depreciation and fixed asset accounting are strictly out of scope.
7. **Maintenance & Service Desk Boundary:** Asset maintenance hooks (`AssetMaintenanceRequested`, repair statuses) are supported, but full work orders, SLAs, and spare parts engines are deferred.
8. **Payroll Boundary:** Persistently maintained as completely outside Phase 5.

---

# 4. MIGRATION & POSTGRESQL CONCURRENCY STRATEGY

1. **Prisma Versioned Migrations Only:** Migration `20260925000001_phase5_campus_asset_core` will be generated and deployed via `prisma migrate deploy`. `prisma db push` is strictly prohibited.
2. **Neon Serverless PostgreSQL:** All existing data and tables from Phases 1–4 are fully preserved.
3. **Concurrency Controls:**
   - `AssetNumber` generation protected by database unique constraints and sequence locks.
   - `AssetCustody` enforces at most one active primary custody per asset under `FOR UPDATE` locking and unique partial index.
   - `AssetTransfer` enforces at most one active in-flight transfer per asset.
   - `Space` code uniqueness scoped by `[tenantId, floorId, code]`.
   - `Building` code uniqueness scoped by `[tenantId, campusId, code]`.

---

# 5. VERDICT: ARCHITECTURAL COMPATIBILITY CONFIRMED

No destructive collisions detected. Proceeding to implementation.
