-- CreateTable
CREATE TABLE "financial_accounts" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "institution_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "account_type" VARCHAR(50) NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'TRY',
    "account_number" VARCHAR(100),
    "iban" VARCHAR(50),
    "bank_name" VARCHAR(100),
    "branch_name" VARCHAR(100),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "financial_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collections" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "institution_id" UUID NOT NULL,
    "financial_responsible_person_id" UUID NOT NULL,
    "financial_account_id" UUID NOT NULL,
    "payment_method" VARCHAR(50) NOT NULL,
    "amount_minor" BIGINT NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'TRY',
    "collected_at" TIMESTAMPTZ NOT NULL,
    "reference_number" VARCHAR(100),
    "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_allocations" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "collection_id" UUID NOT NULL,
    "payment_installment_id" UUID NOT NULL,
    "amount_minor" BIGINT NOT NULL,
    "allocated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_ledger_entries" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "institution_id" UUID NOT NULL,
    "entry_number" BIGINT NOT NULL,
    "financial_account_id" UUID NOT NULL,
    "entry_type" VARCHAR(50) NOT NULL,
    "amount_minor" BIGINT NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'TRY',
    "source_reference_type" VARCHAR(50) NOT NULL,
    "source_reference_id" UUID NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "is_reversed" BOOLEAN NOT NULL DEFAULT false,
    "reversal_entry_id" UUID,
    "posted_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "financial_ledger_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receipts" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "institution_id" UUID NOT NULL,
    "collection_id" UUID NOT NULL,
    "receipt_number" VARCHAR(100) NOT NULL,
    "recipient_person_id" UUID NOT NULL,
    "amount_minor" BIGINT NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'TRY',
    "document_reference" VARCHAR(255),
    "status" VARCHAR(20) NOT NULL DEFAULT 'ISSUED',
    "issued_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refunds" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "institution_id" UUID NOT NULL,
    "collection_id" UUID NOT NULL,
    "amount_minor" BIGINT NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'TRY',
    "reason" TEXT NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'REQUESTED',
    "requested_by_user_id" UUID NOT NULL,
    "approved_by_user_id" UUID,
    "completed_by_user_id" UUID,
    "refunded_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refunds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refund_allocations" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "refund_id" UUID NOT NULL,
    "payment_allocation_id" UUID NOT NULL,
    "amount_minor" BIGINT NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refund_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reconciliation_sessions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "institution_id" UUID NOT NULL,
    "financial_account_id" UUID NOT NULL,
    "source_type" VARCHAR(50) NOT NULL,
    "session_date" DATE NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    "external_closing_balance_minor" BIGINT NOT NULL,
    "ledger_closing_balance_minor" BIGINT NOT NULL,
    "discrepancy_minor" BIGINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reconciliation_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reconciliation_items" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "external_reference" VARCHAR(100) NOT NULL,
    "amount_minor" BIGINT NOT NULL,
    "transaction_date" DATE NOT NULL,
    "matched_ledger_entry_id" UUID,
    "match_status" VARCHAR(20) NOT NULL DEFAULT 'UNMATCHED',
    "confidence_score" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reconciliation_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "financial_accounts_tenant_id_idx" ON "financial_accounts"("tenant_id");

-- CreateIndex
CREATE INDEX "financial_accounts_institution_id_idx" ON "financial_accounts"("institution_id");

-- CreateIndex
CREATE INDEX "collections_tenant_id_idx" ON "collections"("tenant_id");

-- CreateIndex
CREATE INDEX "collections_institution_id_idx" ON "collections"("institution_id");

-- CreateIndex
CREATE INDEX "collections_financial_responsible_person_id_idx" ON "collections"("financial_responsible_person_id");

-- CreateIndex
CREATE INDEX "collections_status_idx" ON "collections"("status");

-- CreateIndex
CREATE INDEX "payment_allocations_tenant_id_idx" ON "payment_allocations"("tenant_id");

-- CreateIndex
CREATE INDEX "payment_allocations_collection_id_idx" ON "payment_allocations"("collection_id");

-- CreateIndex
CREATE INDEX "payment_allocations_payment_installment_id_idx" ON "payment_allocations"("payment_installment_id");

-- CreateIndex
CREATE INDEX "financial_ledger_entries_tenant_id_idx" ON "financial_ledger_entries"("tenant_id");

-- CreateIndex
CREATE INDEX "financial_ledger_entries_institution_id_idx" ON "financial_ledger_entries"("institution_id");

-- CreateIndex
CREATE INDEX "financial_ledger_entries_financial_account_id_idx" ON "financial_ledger_entries"("financial_account_id");

-- CreateIndex
CREATE INDEX "financial_ledger_entries_posted_at_idx" ON "financial_ledger_entries"("posted_at");

-- CreateIndex
CREATE UNIQUE INDEX "uq_ledger_tenant_entry_number" ON "financial_ledger_entries"("tenant_id", "entry_number");

-- CreateIndex
CREATE INDEX "receipts_tenant_id_idx" ON "receipts"("tenant_id");

-- CreateIndex
CREATE INDEX "receipts_institution_id_idx" ON "receipts"("institution_id");

-- CreateIndex
CREATE INDEX "receipts_collection_id_idx" ON "receipts"("collection_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_receipts_tenant_number" ON "receipts"("tenant_id", "receipt_number");

-- CreateIndex
CREATE INDEX "refunds_tenant_id_idx" ON "refunds"("tenant_id");

-- CreateIndex
CREATE INDEX "refunds_institution_id_idx" ON "refunds"("institution_id");

-- CreateIndex
CREATE INDEX "refunds_collection_id_idx" ON "refunds"("collection_id");

-- CreateIndex
CREATE INDEX "refund_allocations_tenant_id_idx" ON "refund_allocations"("tenant_id");

-- CreateIndex
CREATE INDEX "refund_allocations_refund_id_idx" ON "refund_allocations"("refund_id");

-- CreateIndex
CREATE INDEX "refund_allocations_payment_allocation_id_idx" ON "refund_allocations"("payment_allocation_id");

-- CreateIndex
CREATE INDEX "reconciliation_sessions_tenant_id_idx" ON "reconciliation_sessions"("tenant_id");

-- CreateIndex
CREATE INDEX "reconciliation_sessions_financial_account_id_idx" ON "reconciliation_sessions"("financial_account_id");

-- CreateIndex
CREATE INDEX "reconciliation_items_tenant_id_idx" ON "reconciliation_items"("tenant_id");

-- CreateIndex
CREATE INDEX "reconciliation_items_session_id_idx" ON "reconciliation_items"("session_id");

-- AddForeignKey
ALTER TABLE "collections" ADD CONSTRAINT "collections_financial_account_id_fkey" FOREIGN KEY ("financial_account_id") REFERENCES "financial_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_ledger_entries" ADD CONSTRAINT "financial_ledger_entries_financial_account_id_fkey" FOREIGN KEY ("financial_account_id") REFERENCES "financial_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refund_allocations" ADD CONSTRAINT "refund_allocations_refund_id_fkey" FOREIGN KEY ("refund_id") REFERENCES "refunds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refund_allocations" ADD CONSTRAINT "refund_allocations_payment_allocation_id_fkey" FOREIGN KEY ("payment_allocation_id") REFERENCES "payment_allocations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reconciliation_items" ADD CONSTRAINT "reconciliation_items_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "reconciliation_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

