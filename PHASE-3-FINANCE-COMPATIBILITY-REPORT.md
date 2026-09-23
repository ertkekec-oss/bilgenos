# BİLGEN OS — PHASE 3
## Finance Compatibility & Boundary Report

**Document:** PHASE-3-FINANCE-COMPATIBILITY-REPORT.md  
**Status:** COMPLETE  
**Architecture:** Multi-Tenant Education Institution Operations OS  

---

### 1. Architectural Distinction: Operational Ledger ≠ General Ledger (Binding Decision #1)
BilgenOS Phase 3 deliberately implements an **Operational Money Journal** rather than a general double-entry accounting ledger.

- **FinancialAccount Boundaries:** Represents physical or clearing vaults where money is held or transacted:
  ```text
  CASH
  BANK
  CARD_CLEARING
  PAYMENT_PROVIDER_CLEARING
  OTHER
  ```
- **General Ledger Exclusion:** Accounting accounts such as `RECEIVABLE`, `INCOME`, `LIABILITY` are explicitly excluded from Phase 3. Full statutory/general accounting belongs to a future dedicated Accounting bounded context.
- **Entry Structure:** `FinancialLedgerEntry` records operational cash movements (`MONEY_IN`, `MONEY_OUT`, `TRANSFER_IN`, `TRANSFER_OUT`) tied directly to external source operations (`COLLECTION`, `REFUND`, `REVERSAL`).

---

### 2. Upstream Compatibility with Phase 1 & Phase 2
- **Phase 1 (Core Identity & Enrollment):**
  - `Person`, `Learner`, `GuardianRelationship` are completely unmodified.
  - `FinancialResponsiblePerson` from Phase 1/2 is the authoritative payer entity for all Phase 3 `Collection` and `Receipt` records.
- **Phase 2 (Admissions & Commercial Registration):**
  - `PaymentPlan` and `PaymentInstallment` continue to represent contractual receivables and due schedules.
  - `PaymentInstallment` is NEVER reinterpreted as an authoritative ledger.
  - `PaymentInstallment.status` can only be satisfied via `PaymentAllocation`, maintaining the anti-arbitrary status patch invariant.
- **Transactional Outbox & Capability DAG:**
  - Fully compatible; financial events (`CollectionConfirmed`, `PaymentAllocated`, `LedgerEntryPosted`, `ReceiptIssued`, `RefundCompleted`) integrate seamlessly with Outbox atomicity.

---

### 3. Non-Authoritative Balance Principle (Binding Decision #2)
- **No Mutable Balance Truth:** `FinancialAccount` does not store an authoritative mutable `balanceMinor` column.
- **Projection Model:** Account balances are dynamically and deterministically derived from the append-only `FinancialLedgerEntry` projection:
  $$\text{Projected Balance} = \sum (\text{MONEY\_IN} + \text{TRANSFER\_IN}) - \sum (\text{MONEY\_OUT} + \text{TRANSFER\_OUT})$$
- **Rebuildability:** Any balance cache can be destroyed and accurately rebuilt from ledger entries at any instant without financial discrepancies.
