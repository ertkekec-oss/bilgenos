# BİLGEN OS — PHASE 3
## Core Financial Invariants & Money Conservation

**Document:** PHASE-3-FINANCIAL-INVARIANTS.md  
**Status:** ENFORCED & VERIFIED  

---

### 1. The Fundamental Principle: Money Conservation (Binding Decision #3)
Money cannot appear, vanish, or float due to entity status mutations.

#### Collection Conservation Equation:
$$\text{Collection.amountMinor} = \sum(\text{PaymentAllocation.amountMinor})_{\text{ACTIVE}} + \text{unallocatedAmountMinor}$$

- **Authoritative Source:** `Collection.amountMinor` and `PaymentAllocation.amountMinor`.
- **Derived Quantities:** `allocatedAmountMinor` and `unallocatedAmountMinor`.
- **Enforcement:** Attempting to allocate more than the unallocated amount throws `InvariantViolationError`.

#### Installment Conservation Equation:
$$\text{Installment.amountMinor} = \sum(\text{PaymentAllocation.amountMinor})_{\text{ACTIVE}} + \text{outstandingAmountMinor}$$

- **Status Transition Matrix:**
  $$\text{Total Active Allocations} = \begin{cases} 
  0 & \implies \text{PENDING} \\ 
  < \text{Installment.amountMinor} & \implies \text{PARTIALLY\_PAID} \\ 
  = \text{Installment.amountMinor} & \implies \text{PAID} 
  \end{cases}$$
- Overpayment past installment due amount is strictly prohibited and throws an invariant error.

---

### 2. Refund & Reversal Invariants (Binding Decisions #4 & #5)

#### Refund Cap Invariant:
$$\text{Refund.amountMinor} \le \text{Collection.amountMinor} - \sum(\text{Prior Completed Refunds})$$

- **RefundAllocation Requirement:** Every refund must track which historical `PaymentAllocation` was reopened (`Refund \to RefundAllocation \to PaymentAllocation`).
- **Deterministic Installment Reopening:** Upon refund completion, active allocation totals on the linked installment decrease, deterministically reverting status from `PAID` to `PARTIALLY_PAID` or `PENDING`.
- **Maker-Checker Separation:** The user approving a refund (`approvedByUserId`) CANNOT be the user who requested it (`requestedByUserId`).

---

### 3. Absolute No-Float Policy
- All monetary amounts across contracts, domain entities, database columns, and ledger entries use `BigInt` minor units (e.g. 100,000.50 TRY = `10000050n`).
- JavaScript floating point (`Number`) is prohibited for financial arithmetic.
- Currencies cannot be implicitly mixed without explicit currency exchange journal entries.

---

### 4. Ledger Immutability & Anti-Destructive History
- Ledger entries are append-only.
- `UPDATE` and `DELETE` on financial ledger entries are forbidden.
- Corrections must follow the compensating reversal pattern:
  $$\text{Original Entry} \xrightarrow{\text{Compensating Entry (Opposite Sign)}} \text{Reversal Pointer} \longrightarrow \text{Correct Entry}$$
