-- CreateTable
CREATE TABLE "buildings" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "institution_id" UUID NOT NULL,
    "campus_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "building_type" VARCHAR(50) NOT NULL DEFAULT 'EDUCATION',
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "opened_at" DATE,
    "closed_at" DATE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "buildings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "floors" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "institution_id" UUID NOT NULL,
    "campus_id" UUID NOT NULL,
    "building_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "level_number" INTEGER,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "floors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spaces" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "institution_id" UUID NOT NULL,
    "campus_id" UUID NOT NULL,
    "building_id" UUID NOT NULL,
    "floor_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "space_type" VARCHAR(50) NOT NULL DEFAULT 'CLASSROOM',
    "capacity" INTEGER,
    "area_sqm" DECIMAL(8,2),
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "spaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_categories" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "requires_serial_number" BOOLEAN NOT NULL DEFAULT false,
    "warranty_tracked" BOOLEAN NOT NULL DEFAULT true,
    "maintenance_relevant" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "asset_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assets" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "institution_id" UUID,
    "asset_number" VARCHAR(100) NOT NULL,
    "asset_tag" VARCHAR(100),
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "category_id" UUID NOT NULL,
    "manufacturer" VARCHAR(100),
    "model" VARCHAR(100),
    "serial_number" VARCHAR(100),
    "acquisition_date" DATE,
    "purchase_cost_minor" BIGINT,
    "purchase_currency" VARCHAR(10) DEFAULT 'TRY',
    "warranty_start_date" DATE,
    "warranty_end_date" DATE,
    "status" VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE',
    "condition" VARCHAR(50) NOT NULL DEFAULT 'GOOD',
    "current_space_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_location_histories" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "asset_id" UUID NOT NULL,
    "from_space_id" UUID,
    "to_space_id" UUID,
    "effective_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "movement_type" VARCHAR(50) NOT NULL DEFAULT 'INITIAL_PLACEMENT',
    "reason" TEXT,
    "performed_by_user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asset_location_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_custodies" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "asset_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "assigned_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returned_at" TIMESTAMPTZ,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "assigned_by_user_id" UUID NOT NULL,
    "returned_by_user_id" UUID,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asset_custodies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_transfers" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "asset_id" UUID NOT NULL,
    "from_institution_id" UUID,
    "from_campus_id" UUID,
    "from_space_id" UUID,
    "to_institution_id" UUID,
    "to_campus_id" UUID,
    "to_space_id" UUID,
    "status" VARCHAR(50) NOT NULL DEFAULT 'REQUESTED',
    "requested_by_user_id" UUID NOT NULL,
    "approved_by_user_id" UUID,
    "completed_by_user_id" UUID,
    "requested_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_at" TIMESTAMPTZ,
    "completed_at" TIMESTAMPTZ,
    "reason" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asset_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_documents" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "asset_id" UUID NOT NULL,
    "document_type" VARCHAR(50) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "file_reference" VARCHAR(500) NOT NULL,
    "security_classification" VARCHAR(50) NOT NULL DEFAULT 'STANDARD',
    "uploaded_by_user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asset_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_number_sequences" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "scope_key" VARCHAR(100) NOT NULL,
    "last_number" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "asset_number_sequences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "buildings_tenant_id_idx" ON "buildings"("tenant_id");

-- CreateIndex
CREATE INDEX "buildings_campus_id_idx" ON "buildings"("campus_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_buildings_campus_code" ON "buildings"("tenant_id", "campus_id", "code");

-- CreateIndex
CREATE INDEX "floors_tenant_id_idx" ON "floors"("tenant_id");

-- CreateIndex
CREATE INDEX "floors_building_id_idx" ON "floors"("building_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_floors_building_code" ON "floors"("tenant_id", "building_id", "code");

-- CreateIndex
CREATE INDEX "spaces_tenant_id_idx" ON "spaces"("tenant_id");

-- CreateIndex
CREATE INDEX "spaces_building_id_idx" ON "spaces"("building_id");

-- CreateIndex
CREATE INDEX "spaces_floor_id_idx" ON "spaces"("floor_id");

-- CreateIndex
CREATE INDEX "spaces_status_idx" ON "spaces"("status");

-- CreateIndex
CREATE UNIQUE INDEX "uq_spaces_floor_code" ON "spaces"("tenant_id", "floor_id", "code");

-- CreateIndex
CREATE INDEX "asset_categories_tenant_id_idx" ON "asset_categories"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_asset_categories_tenant_code" ON "asset_categories"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "assets_tenant_id_idx" ON "assets"("tenant_id");

-- CreateIndex
CREATE INDEX "assets_organization_id_idx" ON "assets"("organization_id");

-- CreateIndex
CREATE INDEX "assets_institution_id_idx" ON "assets"("institution_id");

-- CreateIndex
CREATE INDEX "assets_category_id_idx" ON "assets"("category_id");

-- CreateIndex
CREATE INDEX "assets_status_idx" ON "assets"("status");

-- CreateIndex
CREATE INDEX "assets_current_space_id_idx" ON "assets"("current_space_id");

-- CreateIndex
CREATE INDEX "assets_warranty_end_date_idx" ON "assets"("warranty_end_date");

-- CreateIndex
CREATE UNIQUE INDEX "uq_assets_tenant_number" ON "assets"("tenant_id", "asset_number");

-- CreateIndex
CREATE INDEX "asset_location_histories_tenant_id_idx" ON "asset_location_histories"("tenant_id");

-- CreateIndex
CREATE INDEX "asset_location_histories_asset_id_idx" ON "asset_location_histories"("asset_id");

-- CreateIndex
CREATE INDEX "asset_location_histories_effective_at_idx" ON "asset_location_histories"("effective_at");

-- CreateIndex
CREATE INDEX "asset_custodies_tenant_id_idx" ON "asset_custodies"("tenant_id");

-- CreateIndex
CREATE INDEX "asset_custodies_asset_id_idx" ON "asset_custodies"("asset_id");

-- CreateIndex
CREATE INDEX "asset_custodies_employee_id_idx" ON "asset_custodies"("employee_id");

-- CreateIndex
CREATE INDEX "asset_custodies_status_idx" ON "asset_custodies"("status");

-- CreateIndex
CREATE INDEX "asset_transfers_tenant_id_idx" ON "asset_transfers"("tenant_id");

-- CreateIndex
CREATE INDEX "asset_transfers_asset_id_idx" ON "asset_transfers"("asset_id");

-- CreateIndex
CREATE INDEX "asset_transfers_status_idx" ON "asset_transfers"("status");

-- CreateIndex
CREATE INDEX "asset_documents_tenant_id_idx" ON "asset_documents"("tenant_id");

-- CreateIndex
CREATE INDEX "asset_documents_asset_id_idx" ON "asset_documents"("asset_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_asset_seq_tenant_scope" ON "asset_number_sequences"("tenant_id", "scope_key");

-- AddForeignKey
ALTER TABLE "buildings" ADD CONSTRAINT "buildings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buildings" ADD CONSTRAINT "buildings_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buildings" ADD CONSTRAINT "buildings_campus_id_fkey" FOREIGN KEY ("campus_id") REFERENCES "campuses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "floors" ADD CONSTRAINT "floors_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "floors" ADD CONSTRAINT "floors_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "buildings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spaces" ADD CONSTRAINT "spaces_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spaces" ADD CONSTRAINT "spaces_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "buildings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spaces" ADD CONSTRAINT "spaces_floor_id_fkey" FOREIGN KEY ("floor_id") REFERENCES "floors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_categories" ADD CONSTRAINT "asset_categories_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "asset_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_current_space_id_fkey" FOREIGN KEY ("current_space_id") REFERENCES "spaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_location_histories" ADD CONSTRAINT "asset_location_histories_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_location_histories" ADD CONSTRAINT "asset_location_histories_from_space_id_fkey" FOREIGN KEY ("from_space_id") REFERENCES "spaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_location_histories" ADD CONSTRAINT "asset_location_histories_to_space_id_fkey" FOREIGN KEY ("to_space_id") REFERENCES "spaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_custodies" ADD CONSTRAINT "asset_custodies_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_custodies" ADD CONSTRAINT "asset_custodies_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employee_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_transfers" ADD CONSTRAINT "asset_transfers_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_documents" ADD CONSTRAINT "asset_documents_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

