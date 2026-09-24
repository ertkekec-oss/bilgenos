# BİLGEN OS — PHASE 5: PHYSICAL OPERATIONS INVARIANT CATALOG
## Invariants PHY-001 through PHY-030

**Standard Document:** BilgenOS Physical Operations Invariants  
**Phase:** 5 — Campus, Facility & Asset Operations  
**Architecture:** Multi-Tenant Education Institution Operations OS  

---

### PHY-001: Campus Is Reused From Core
The platform shall reuse the existing Phase 1 `Campus` entity. No duplicate or alternative campus entity shall be introduced.

### PHY-002: Building Belongs To Exactly One Campus
Every `Building` must reference a valid `Campus` and inherit that Campus's `tenantId` and `institutionId`. A Building cannot span multiple Campuses.

### PHY-003: Floor Belongs To Exactly One Building
Every `Floor` must reference a valid `Building` and match the Building's `tenantId`, `institutionId`, and `campusId`.

### PHY-004: Space Belongs To Exactly One Floor
Every `Space` must reference a valid `Floor` and strictly match the Floor's entire upstream hierarchy (`buildingId`, `campusId`, `institutionId`, `tenantId`).

### PHY-005: Physical Hierarchy Cannot Cross Tenant
Under no circumstances may any Building, Floor, or Space reference parent or child physical entities belonging to a different `tenantId`. Cross-tenant hierarchy linking throws `CROSS_TENANT_PHYSICAL_RELATION`.

### PHY-006: Space ≠ Academic Classroom
A `Space` represents an operational physical envelope (room, hall, lab). It shall not store academic curriculum, class designations, student enrollments, or grade levels.

### PHY-007: Asset ≠ Inventory Item
An `Asset` is an individually traceable, serialized or asset-tagged durable physical item. Assets shall not store bulk consumable stock quantities.

### PHY-008: Asset Location ≠ Asset Custody
An Asset's physical placement (`Space`) is independent of the human personnel responsible for it (`EmployeeProfile`). Mutating location never automatically mutates custody, and vice-versa.

### PHY-009: Asset Transfer ≠ Location Move
A simple physical relocation within an institution is recorded via `AssetLocationHistory`. An inter-campus or inter-institution transfer requires a formal `AssetTransfer` aggregate with lifecycle transitions.

### PHY-010: Asset Purchase Cost ≠ Accounting Book Value
`purchaseCostMinor` and `purchaseCurrency` represent historical acquisition metadata. They shall not be used to compute mutable ledger depreciation or general ledger book value in Phase 5.

### PHY-011: No Mutable Depreciation Accounting In Phase 5
Phase 5 shall not calculate or post depreciation journal entries. Fixed asset accounting belongs strictly to future general ledger phases.

### PHY-012: Asset Number Is Scoped Unique
Every Asset must possess an `assetNumber` that is strictly unique within the tenant scope (`[tenantId, assetNumber]`). Concurrency races during asset creation must fail with `ASSET_NUMBER_CONFLICT`.

### PHY-013: Location Codes Are Scoped Unique
Building codes are unique per Campus (`[tenantId, campusId, code]`). Floor codes are unique per Building (`[tenantId, buildingId, code]`). Space codes are unique per Floor (`[tenantId, floorId, code]`).

### PHY-014: Asset Movement History Is Preserved
Physical location changes must append an immutable record to `AssetLocationHistory`. The historical movement log must never be truncated or overwritten.

### PHY-015: Current Location Must Be Explainable By History
`Asset.currentSpaceId` is a read-optimized projection. Every non-null `currentSpaceId` must directly correspond to the latest effective record in `AssetLocationHistory`.

### PHY-016: At Most One Active Primary Custody Per Asset
An Asset can have at most one active custody assignment (`status: ACTIVE`) at any point in time. Competing concurrent assignments must resolve to exactly one winner under `FOR UPDATE` locking.

### PHY-017: Custodian Must Be Valid Within Tenant
The assigned custodian must reference an active `EmployeeProfile` belonging to the identical `tenantId` and having an active employment contract or institutional assignment.

### PHY-018: Formal Transfer Is Atomic
Completion of an `AssetTransfer` must mutate transfer status, record `AssetLocationHistory`, update current location projection, write audit log, and enqueue transactional outbox within a single physical database transaction. Any failure triggers total rollback.

### PHY-019: Conflicting Active Transfers Are Forbidden
An Asset may have at most one pending or in-transit formal transfer at a time. Attempting to initiate a concurrent transfer on an already-in-transfer asset throws `ASSET_TRANSFER_ALREADY_ACTIVE`.

### PHY-020: Disposed Assets Are Never Physically Deleted
Disposing of an Asset transitions its lifecycle to `DISPOSED` and records disposal metadata. Disposed asset rows and their historical movement, custody, and transfer logs are permanently retained.

### PHY-021: Lost/Stolen Does Not Erase Custody History
Marking an asset as `LOST` or `STOLEN` updates asset lifecycle status and records audit events, but does not purge historical or current custody records. Stewardship accountability is preserved.

### PHY-022: Sensitive Asset Documents Require Explicit Authorization
`AssetDocument` records marked `CONFIDENTIAL` or `RESTRICTED` require elevated role permissions (`asset.document.confidential.read` / `asset.document.restricted.read`).

### PHY-023: No Cross-Tenant Asset Relationship
No Asset may be assigned to a Space, Custodian, or Transfer Destination belonging to another tenant. Violations throw `CROSS_TENANT_PHYSICAL_RELATION`.

### PHY-024: Institution/Campus Scope Is Enforced
Users scoped to Institution A cannot read, create, or mutate Assets belonging to Institution B without explicit cross-institution permission.

### PHY-025: Asset Lifecycle Mutation Is Domain-Controlled
Direct status modification via generic update queries is forbidden. Lifecycle transitions (`activate`, `assign`, `sendToRepair`, `returnFromRepair`, `markLost`, `retire`, `dispose`) must execute through dedicated domain aggregate methods.

### PHY-026: Historical Records Are Not Silently Rewritten
Past location movements, custody records, and transfer histories are append-only. Rectifying historical errors requires an explicit compensatory record (`movementType: CORRECTION`).

### PHY-027: Operational Ledger Is Not Asset Accounting
Physical asset transactions do not automatically write to Phase 3 `FinancialLedgerEntry`. The operational money ledger and physical asset tracking remain cleanly separated bounded contexts.

### PHY-028: Maintenance Engine Is Outside Phase 5
Phase 5 supports operational status flags (`IN_REPAIR`) and event hooks (`AssetMaintenanceRequested`), but does not implement technician dispatch, SLAs, spare parts, or maintenance work order engines.

### PHY-029: QR/Public Scan Does Not Bypass Authorization
Scanning an asset barcode or QR tag provides an opaque identifier that requires authenticated, scoped authorization to view detailed asset attributes.

### PHY-030: BilgenOS Is Physical Operations System Of Record
BilgenOS is the authoritative master for all physical facilities and assets. External systems (including BilgenOkul) consume spaces and assets through integration boundaries and never own physical operational data.
