-- CreateTable
CREATE TABLE "departments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "institution_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "parent_department_id" UUID,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "positions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "institution_id" UUID NOT NULL,
    "department_id" UUID,
    "code" VARCHAR(50) NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_profiles" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "person_id" UUID NOT NULL,
    "employee_number" VARCHAR(50) NOT NULL,
    "user_id" UUID,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "employee_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "contract_type" VARCHAR(50) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "probation_end_date" DATE,
    "termination_date" DATE,
    "termination_reason" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "employments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "institution_assignments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "institution_id" UUID NOT NULL,
    "campus_id" UUID,
    "employee_id" UUID NOT NULL,
    "department_id" UUID,
    "position_id" UUID,
    "role_type" VARCHAR(50) NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT true,
    "work_percentage" INTEGER NOT NULL DEFAULT 100,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "institution_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_schedules" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "institution_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "is_flexible" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "work_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_schedule_rules" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "work_schedule_id" UUID NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "start_time" VARCHAR(10) NOT NULL,
    "end_time" VARCHAR(10) NOT NULL,
    "break_minutes" INTEGER NOT NULL DEFAULT 60,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "work_schedule_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_schedule_assignments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "work_schedule_id" UUID NOT NULL,
    "effective_from" DATE NOT NULL,
    "effective_until" DATE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employee_schedule_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_events" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "institution_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "occurred_at" TIMESTAMPTZ NOT NULL,
    "event_type" VARCHAR(50) NOT NULL,
    "source_type" VARCHAR(50) NOT NULL DEFAULT 'KIOSK',
    "device_reference" VARCHAR(100),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_sessions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "work_date" DATE NOT NULL,
    "check_in_at" TIMESTAMPTZ NOT NULL,
    "check_out_at" TIMESTAMPTZ,
    "minutes_worked" INTEGER,
    "status" VARCHAR(50) NOT NULL DEFAULT 'COMPLETED',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_entitlements" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "leave_type" VARCHAR(50) NOT NULL,
    "year" INTEGER NOT NULL,
    "entitled_days" DECIMAL(5,1) NOT NULL,
    "valid_from" DATE NOT NULL,
    "valid_until" DATE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leave_entitlements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_transactions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "leave_type" VARCHAR(50) NOT NULL,
    "transaction_type" VARCHAR(50) NOT NULL,
    "days_amount" DECIMAL(5,1) NOT NULL,
    "reference_id" UUID,
    "posted_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leave_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_leaves" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "institution_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "leave_type" VARCHAR(50) NOT NULL,
    "unit" VARCHAR(20) NOT NULL DEFAULT 'FULL_DAY',
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "units_count" DECIMAL(5,1) NOT NULL,
    "reason" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'REQUESTED',
    "requested_by_user_id" UUID NOT NULL,
    "approved_by_user_id" UUID,
    "approved_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "employee_leaves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personnel_documents" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "document_type" VARCHAR(50) NOT NULL,
    "document_title" VARCHAR(255) NOT NULL,
    "file_reference" VARCHAR(255) NOT NULL,
    "security_classification" VARCHAR(20) NOT NULL DEFAULT 'STANDARD',
    "expiry_date" DATE,
    "status" VARCHAR(20) NOT NULL DEFAULT 'VALID',
    "verified_by_user_id" UUID,
    "verified_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "personnel_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "departments_tenant_id_idx" ON "departments"("tenant_id");

-- CreateIndex
CREATE INDEX "departments_institution_id_idx" ON "departments"("institution_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_departments_institution_code" ON "departments"("institution_id", "code");

-- CreateIndex
CREATE INDEX "positions_tenant_id_idx" ON "positions"("tenant_id");

-- CreateIndex
CREATE INDEX "positions_institution_id_idx" ON "positions"("institution_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_positions_institution_code" ON "positions"("institution_id", "code");

-- CreateIndex
CREATE INDEX "employee_profiles_tenant_id_idx" ON "employee_profiles"("tenant_id");

-- CreateIndex
CREATE INDEX "employee_profiles_person_id_idx" ON "employee_profiles"("person_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_employees_tenant_number" ON "employee_profiles"("tenant_id", "employee_number");

-- CreateIndex
CREATE INDEX "employments_tenant_id_idx" ON "employments"("tenant_id");

-- CreateIndex
CREATE INDEX "employments_organization_id_idx" ON "employments"("organization_id");

-- CreateIndex
CREATE INDEX "employments_employee_id_idx" ON "employments"("employee_id");

-- CreateIndex
CREATE INDEX "employments_status_idx" ON "employments"("status");

-- CreateIndex
CREATE INDEX "institution_assignments_tenant_id_idx" ON "institution_assignments"("tenant_id");

-- CreateIndex
CREATE INDEX "institution_assignments_institution_id_idx" ON "institution_assignments"("institution_id");

-- CreateIndex
CREATE INDEX "institution_assignments_campus_id_idx" ON "institution_assignments"("campus_id");

-- CreateIndex
CREATE INDEX "institution_assignments_employee_id_idx" ON "institution_assignments"("employee_id");

-- CreateIndex
CREATE INDEX "work_schedules_tenant_id_idx" ON "work_schedules"("tenant_id");

-- CreateIndex
CREATE INDEX "work_schedules_institution_id_idx" ON "work_schedules"("institution_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_work_schedules_code" ON "work_schedules"("institution_id", "code");

-- CreateIndex
CREATE INDEX "work_schedule_rules_tenant_id_idx" ON "work_schedule_rules"("tenant_id");

-- CreateIndex
CREATE INDEX "work_schedule_rules_work_schedule_id_idx" ON "work_schedule_rules"("work_schedule_id");

-- CreateIndex
CREATE INDEX "employee_schedule_assignments_tenant_id_idx" ON "employee_schedule_assignments"("tenant_id");

-- CreateIndex
CREATE INDEX "employee_schedule_assignments_employee_id_idx" ON "employee_schedule_assignments"("employee_id");

-- CreateIndex
CREATE INDEX "employee_schedule_assignments_work_schedule_id_idx" ON "employee_schedule_assignments"("work_schedule_id");

-- CreateIndex
CREATE INDEX "attendance_events_tenant_id_idx" ON "attendance_events"("tenant_id");

-- CreateIndex
CREATE INDEX "attendance_events_institution_id_idx" ON "attendance_events"("institution_id");

-- CreateIndex
CREATE INDEX "attendance_events_employee_id_idx" ON "attendance_events"("employee_id");

-- CreateIndex
CREATE INDEX "attendance_events_occurred_at_idx" ON "attendance_events"("occurred_at");

-- CreateIndex
CREATE INDEX "attendance_sessions_tenant_id_idx" ON "attendance_sessions"("tenant_id");

-- CreateIndex
CREATE INDEX "attendance_sessions_employee_id_idx" ON "attendance_sessions"("employee_id");

-- CreateIndex
CREATE INDEX "attendance_sessions_work_date_idx" ON "attendance_sessions"("work_date");

-- CreateIndex
CREATE INDEX "leave_entitlements_tenant_id_idx" ON "leave_entitlements"("tenant_id");

-- CreateIndex
CREATE INDEX "leave_entitlements_employee_id_idx" ON "leave_entitlements"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_leave_entitlement_emp_year" ON "leave_entitlements"("employee_id", "leave_type", "year");

-- CreateIndex
CREATE INDEX "leave_transactions_tenant_id_idx" ON "leave_transactions"("tenant_id");

-- CreateIndex
CREATE INDEX "leave_transactions_employee_id_idx" ON "leave_transactions"("employee_id");

-- CreateIndex
CREATE INDEX "leave_transactions_leave_type_idx" ON "leave_transactions"("leave_type");

-- CreateIndex
CREATE INDEX "employee_leaves_tenant_id_idx" ON "employee_leaves"("tenant_id");

-- CreateIndex
CREATE INDEX "employee_leaves_institution_id_idx" ON "employee_leaves"("institution_id");

-- CreateIndex
CREATE INDEX "employee_leaves_employee_id_idx" ON "employee_leaves"("employee_id");

-- CreateIndex
CREATE INDEX "employee_leaves_status_idx" ON "employee_leaves"("status");

-- CreateIndex
CREATE INDEX "personnel_documents_tenant_id_idx" ON "personnel_documents"("tenant_id");

-- CreateIndex
CREATE INDEX "personnel_documents_employee_id_idx" ON "personnel_documents"("employee_id");

-- CreateIndex
CREATE INDEX "personnel_documents_security_classification_idx" ON "personnel_documents"("security_classification");

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "positions" ADD CONSTRAINT "positions_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "positions" ADD CONSTRAINT "positions_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_profiles" ADD CONSTRAINT "employee_profiles_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_profiles" ADD CONSTRAINT "employee_profiles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employments" ADD CONSTRAINT "employments_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employments" ADD CONSTRAINT "employments_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employee_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institution_assignments" ADD CONSTRAINT "institution_assignments_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institution_assignments" ADD CONSTRAINT "institution_assignments_campus_id_fkey" FOREIGN KEY ("campus_id") REFERENCES "campuses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institution_assignments" ADD CONSTRAINT "institution_assignments_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employee_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institution_assignments" ADD CONSTRAINT "institution_assignments_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institution_assignments" ADD CONSTRAINT "institution_assignments_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "positions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_schedules" ADD CONSTRAINT "work_schedules_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_schedule_rules" ADD CONSTRAINT "work_schedule_rules_work_schedule_id_fkey" FOREIGN KEY ("work_schedule_id") REFERENCES "work_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_schedule_assignments" ADD CONSTRAINT "employee_schedule_assignments_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employee_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_schedule_assignments" ADD CONSTRAINT "employee_schedule_assignments_work_schedule_id_fkey" FOREIGN KEY ("work_schedule_id") REFERENCES "work_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_events" ADD CONSTRAINT "attendance_events_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_events" ADD CONSTRAINT "attendance_events_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employee_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_sessions" ADD CONSTRAINT "attendance_sessions_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employee_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_leaves" ADD CONSTRAINT "employee_leaves_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_leaves" ADD CONSTRAINT "employee_leaves_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employee_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personnel_documents" ADD CONSTRAINT "personnel_documents_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employee_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

