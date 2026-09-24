-- CreateTable
CREATE TABLE "transportation_providers" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "tax_number" VARCHAR(50),
    "contact_name" VARCHAR(100),
    "phone" VARCHAR(50),
    "email" VARCHAR(100),
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "transportation_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transportation_vehicles" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "institution_id" UUID NOT NULL,
    "campus_id" UUID NOT NULL,
    "provider_id" UUID,
    "asset_id" UUID,
    "plate_number" VARCHAR(50) NOT NULL,
    "plate_normalized" VARCHAR(50) NOT NULL,
    "vehicle_type" VARCHAR(50) NOT NULL,
    "make" VARCHAR(100),
    "model" VARCHAR(100),
    "model_year" INTEGER,
    "seating_capacity" INTEGER NOT NULL,
    "effective_capacity" INTEGER NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "inspection_expiry_date" DATE,
    "insurance_expiry_date" DATE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "transportation_vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "driver_profiles" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "person_id" UUID NOT NULL,
    "provider_id" UUID,
    "employee_profile_id" UUID,
    "driver_type" VARCHAR(50) NOT NULL,
    "license_number" VARCHAR(100) NOT NULL,
    "license_classes" TEXT[],
    "license_expiry_date" DATE NOT NULL,
    "src_certificate_expiry_date" DATE,
    "psychotechnical_expiry_date" DATE,
    "criminal_record_checked_at" DATE,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "driver_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendant_profiles" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "person_id" UUID NOT NULL,
    "provider_id" UUID,
    "employee_profile_id" UUID,
    "attendant_type" VARCHAR(50) NOT NULL,
    "first_aid_certified" BOOLEAN NOT NULL DEFAULT false,
    "first_aid_expiry_date" DATE,
    "criminal_record_checked_at" DATE,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "attendant_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transportation_routes" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "institution_id" UUID NOT NULL,
    "campus_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "route_type" VARCHAR(50) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    "effective_from" DATE NOT NULL,
    "effective_until" DATE,
    "estimated_duration_minutes" INTEGER,
    "estimated_distance_km" DECIMAL(8,2),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "transportation_routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "route_stops" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "route_id" UUID NOT NULL,
    "sequence_number" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "address" TEXT,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "planned_time" VARCHAR(10),
    "stop_type" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "route_stops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "route_operational_assignments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "route_id" UUID NOT NULL,
    "vehicle_id" UUID NOT NULL,
    "driver_profile_id" UUID NOT NULL,
    "attendant_profile_id" UUID,
    "effective_from" DATE NOT NULL,
    "effective_until" DATE,
    "day_of_week_mask" INTEGER[],
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "route_operational_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transportation_passenger_profiles" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "person_id" UUID NOT NULL,
    "learner_id" UUID,
    "employee_profile_id" UUID,
    "passenger_type" VARCHAR(50) NOT NULL,
    "requires_handover" BOOLEAN NOT NULL DEFAULT false,
    "mobility_notes" TEXT,
    "emergency_contact_name" VARCHAR(100) NOT NULL,
    "emergency_contact_phone" VARCHAR(50) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "transportation_passenger_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passenger_route_assignments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "passenger_profile_id" UUID NOT NULL,
    "route_id" UUID NOT NULL,
    "stop_id" UUID NOT NULL,
    "direction" VARCHAR(50) NOT NULL,
    "effective_from" DATE NOT NULL,
    "effective_until" DATE,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "passenger_route_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passenger_handover_authorizations" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "passenger_profile_id" UUID NOT NULL,
    "authorized_person_id" UUID NOT NULL,
    "relationship_type" VARCHAR(50) NOT NULL,
    "authorization_scope" VARCHAR(50) NOT NULL,
    "verification_code_hash" VARCHAR(255),
    "valid_from" DATE NOT NULL,
    "valid_until" DATE,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "passenger_handover_authorizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transportation_trips" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "institution_id" UUID NOT NULL,
    "campus_id" UUID NOT NULL,
    "route_id" UUID NOT NULL,
    "vehicle_id" UUID NOT NULL,
    "driver_profile_id" UUID NOT NULL,
    "attendant_profile_id" UUID,
    "service_date" DATE NOT NULL,
    "shift_type" VARCHAR(50) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',
    "scheduled_start_time" VARCHAR(10) NOT NULL,
    "actual_start_time" TIMESTAMPTZ,
    "actual_end_time" TIMESTAMPTZ,
    "start_odometer" DECIMAL(10,2),
    "end_odometer" DECIMAL(10,2),
    "passenger_count_expected" INTEGER NOT NULL DEFAULT 0,
    "passenger_count_boarded" INTEGER NOT NULL DEFAULT 0,
    "passenger_count_dropped_off" INTEGER NOT NULL DEFAULT 0,
    "passenger_count_no_show" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "transportation_trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trip_manifest_entries" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "trip_id" UUID NOT NULL,
    "passenger_profile_id" UUID NOT NULL,
    "pickup_stop_id" UUID,
    "dropoff_stop_id" UUID,
    "requires_handover" BOOLEAN NOT NULL DEFAULT false,
    "boarding_status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "boarded_at" TIMESTAMPTZ,
    "dropped_off_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "trip_manifest_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trip_stop_visits" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "trip_id" UUID NOT NULL,
    "route_stop_id" UUID NOT NULL,
    "sequence_number" INTEGER NOT NULL,
    "scheduled_time" VARCHAR(10),
    "actual_arrival_time" TIMESTAMPTZ,
    "actual_departure_time" TIMESTAMPTZ,
    "dwell_time_seconds" INTEGER,
    "status" VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "trip_stop_visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passenger_trip_events" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "trip_id" UUID NOT NULL,
    "passenger_profile_id" UUID NOT NULL,
    "stop_visit_id" UUID,
    "event_type" VARCHAR(50) NOT NULL,
    "recorded_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recorded_by_user_id" UUID NOT NULL,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "passenger_trip_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passenger_handovers" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "trip_id" UUID NOT NULL,
    "passenger_profile_id" UUID NOT NULL,
    "authorization_id" UUID NOT NULL,
    "received_by_person_id" UUID NOT NULL,
    "verified_by_user_id" UUID NOT NULL,
    "handover_timestamp" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" VARCHAR(50) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "passenger_handovers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transportation_exceptions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "trip_id" UUID,
    "passenger_profile_id" UUID,
    "vehicle_id" UUID,
    "driver_profile_id" UUID,
    "category" VARCHAR(50) NOT NULL,
    "severity" VARCHAR(50) NOT NULL,
    "description" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolved_at" TIMESTAMPTZ,
    "resolved_by_user_id" UUID,
    "resolution_notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "transportation_exceptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "transportation_providers_tenant_id_idx" ON "transportation_providers"("tenant_id");

-- CreateIndex
CREATE INDEX "transportation_providers_organization_id_idx" ON "transportation_providers"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_trans_provider_tenant_code" ON "transportation_providers"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "transportation_vehicles_tenant_id_idx" ON "transportation_vehicles"("tenant_id");

-- CreateIndex
CREATE INDEX "transportation_vehicles_institution_id_idx" ON "transportation_vehicles"("institution_id");

-- CreateIndex
CREATE INDEX "transportation_vehicles_campus_id_idx" ON "transportation_vehicles"("campus_id");

-- CreateIndex
CREATE INDEX "transportation_vehicles_provider_id_idx" ON "transportation_vehicles"("provider_id");

-- CreateIndex
CREATE INDEX "transportation_vehicles_asset_id_idx" ON "transportation_vehicles"("asset_id");

-- CreateIndex
CREATE INDEX "transportation_vehicles_status_idx" ON "transportation_vehicles"("status");

-- CreateIndex
CREATE UNIQUE INDEX "uq_trans_vehicle_tenant_plate" ON "transportation_vehicles"("tenant_id", "plate_normalized");

-- CreateIndex
CREATE INDEX "driver_profiles_tenant_id_idx" ON "driver_profiles"("tenant_id");

-- CreateIndex
CREATE INDEX "driver_profiles_person_id_idx" ON "driver_profiles"("person_id");

-- CreateIndex
CREATE INDEX "driver_profiles_provider_id_idx" ON "driver_profiles"("provider_id");

-- CreateIndex
CREATE INDEX "driver_profiles_employee_profile_id_idx" ON "driver_profiles"("employee_profile_id");

-- CreateIndex
CREATE INDEX "driver_profiles_status_idx" ON "driver_profiles"("status");

-- CreateIndex
CREATE UNIQUE INDEX "uq_driver_tenant_license" ON "driver_profiles"("tenant_id", "license_number");

-- CreateIndex
CREATE INDEX "attendant_profiles_tenant_id_idx" ON "attendant_profiles"("tenant_id");

-- CreateIndex
CREATE INDEX "attendant_profiles_person_id_idx" ON "attendant_profiles"("person_id");

-- CreateIndex
CREATE INDEX "attendant_profiles_provider_id_idx" ON "attendant_profiles"("provider_id");

-- CreateIndex
CREATE INDEX "attendant_profiles_employee_profile_id_idx" ON "attendant_profiles"("employee_profile_id");

-- CreateIndex
CREATE INDEX "attendant_profiles_status_idx" ON "attendant_profiles"("status");

-- CreateIndex
CREATE INDEX "transportation_routes_tenant_id_idx" ON "transportation_routes"("tenant_id");

-- CreateIndex
CREATE INDEX "transportation_routes_institution_id_idx" ON "transportation_routes"("institution_id");

-- CreateIndex
CREATE INDEX "transportation_routes_campus_id_idx" ON "transportation_routes"("campus_id");

-- CreateIndex
CREATE INDEX "transportation_routes_status_idx" ON "transportation_routes"("status");

-- CreateIndex
CREATE UNIQUE INDEX "uq_route_tenant_campus_code" ON "transportation_routes"("tenant_id", "campus_id", "code");

-- CreateIndex
CREATE INDEX "route_stops_tenant_id_idx" ON "route_stops"("tenant_id");

-- CreateIndex
CREATE INDEX "route_stops_route_id_idx" ON "route_stops"("route_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_route_stop_seq" ON "route_stops"("route_id", "sequence_number");

-- CreateIndex
CREATE INDEX "route_operational_assignments_tenant_id_idx" ON "route_operational_assignments"("tenant_id");

-- CreateIndex
CREATE INDEX "route_operational_assignments_route_id_idx" ON "route_operational_assignments"("route_id");

-- CreateIndex
CREATE INDEX "route_operational_assignments_vehicle_id_idx" ON "route_operational_assignments"("vehicle_id");

-- CreateIndex
CREATE INDEX "route_operational_assignments_driver_profile_id_idx" ON "route_operational_assignments"("driver_profile_id");

-- CreateIndex
CREATE INDEX "route_operational_assignments_status_idx" ON "route_operational_assignments"("status");

-- CreateIndex
CREATE INDEX "transportation_passenger_profiles_tenant_id_idx" ON "transportation_passenger_profiles"("tenant_id");

-- CreateIndex
CREATE INDEX "transportation_passenger_profiles_person_id_idx" ON "transportation_passenger_profiles"("person_id");

-- CreateIndex
CREATE INDEX "transportation_passenger_profiles_learner_id_idx" ON "transportation_passenger_profiles"("learner_id");

-- CreateIndex
CREATE INDEX "transportation_passenger_profiles_status_idx" ON "transportation_passenger_profiles"("status");

-- CreateIndex
CREATE UNIQUE INDEX "uq_trans_pass_tenant_person" ON "transportation_passenger_profiles"("tenant_id", "person_id");

-- CreateIndex
CREATE INDEX "passenger_route_assignments_tenant_id_idx" ON "passenger_route_assignments"("tenant_id");

-- CreateIndex
CREATE INDEX "passenger_route_assignments_passenger_profile_id_idx" ON "passenger_route_assignments"("passenger_profile_id");

-- CreateIndex
CREATE INDEX "passenger_route_assignments_route_id_idx" ON "passenger_route_assignments"("route_id");

-- CreateIndex
CREATE INDEX "passenger_route_assignments_stop_id_idx" ON "passenger_route_assignments"("stop_id");

-- CreateIndex
CREATE INDEX "passenger_route_assignments_status_idx" ON "passenger_route_assignments"("status");

-- CreateIndex
CREATE INDEX "passenger_handover_authorizations_tenant_id_idx" ON "passenger_handover_authorizations"("tenant_id");

-- CreateIndex
CREATE INDEX "passenger_handover_authorizations_passenger_profile_id_idx" ON "passenger_handover_authorizations"("passenger_profile_id");

-- CreateIndex
CREATE INDEX "passenger_handover_authorizations_authorized_person_id_idx" ON "passenger_handover_authorizations"("authorized_person_id");

-- CreateIndex
CREATE INDEX "passenger_handover_authorizations_status_idx" ON "passenger_handover_authorizations"("status");

-- CreateIndex
CREATE INDEX "transportation_trips_tenant_id_idx" ON "transportation_trips"("tenant_id");

-- CreateIndex
CREATE INDEX "transportation_trips_vehicle_id_idx" ON "transportation_trips"("vehicle_id");

-- CreateIndex
CREATE INDEX "transportation_trips_driver_profile_id_idx" ON "transportation_trips"("driver_profile_id");

-- CreateIndex
CREATE INDEX "transportation_trips_service_date_idx" ON "transportation_trips"("service_date");

-- CreateIndex
CREATE INDEX "transportation_trips_status_idx" ON "transportation_trips"("status");

-- CreateIndex
CREATE UNIQUE INDEX "uq_trip_tenant_route_date_shift" ON "transportation_trips"("tenant_id", "route_id", "service_date", "shift_type");

-- CreateIndex
CREATE INDEX "trip_manifest_entries_tenant_id_idx" ON "trip_manifest_entries"("tenant_id");

-- CreateIndex
CREATE INDEX "trip_manifest_entries_trip_id_idx" ON "trip_manifest_entries"("trip_id");

-- CreateIndex
CREATE INDEX "trip_manifest_entries_boarding_status_idx" ON "trip_manifest_entries"("boarding_status");

-- CreateIndex
CREATE UNIQUE INDEX "uq_manifest_trip_passenger" ON "trip_manifest_entries"("trip_id", "passenger_profile_id");

-- CreateIndex
CREATE INDEX "trip_stop_visits_tenant_id_idx" ON "trip_stop_visits"("tenant_id");

-- CreateIndex
CREATE INDEX "trip_stop_visits_trip_id_idx" ON "trip_stop_visits"("trip_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_stop_visit_trip_stop" ON "trip_stop_visits"("trip_id", "route_stop_id");

-- CreateIndex
CREATE INDEX "passenger_trip_events_tenant_id_idx" ON "passenger_trip_events"("tenant_id");

-- CreateIndex
CREATE INDEX "passenger_trip_events_trip_id_idx" ON "passenger_trip_events"("trip_id");

-- CreateIndex
CREATE INDEX "passenger_trip_events_passenger_profile_id_idx" ON "passenger_trip_events"("passenger_profile_id");

-- CreateIndex
CREATE INDEX "passenger_trip_events_event_type_idx" ON "passenger_trip_events"("event_type");

-- CreateIndex
CREATE INDEX "passenger_handovers_tenant_id_idx" ON "passenger_handovers"("tenant_id");

-- CreateIndex
CREATE INDEX "passenger_handovers_authorization_id_idx" ON "passenger_handovers"("authorization_id");

-- CreateIndex
CREATE INDEX "passenger_handovers_received_by_person_id_idx" ON "passenger_handovers"("received_by_person_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_handover_trip_passenger" ON "passenger_handovers"("trip_id", "passenger_profile_id");

-- CreateIndex
CREATE INDEX "transportation_exceptions_tenant_id_idx" ON "transportation_exceptions"("tenant_id");

-- CreateIndex
CREATE INDEX "transportation_exceptions_trip_id_idx" ON "transportation_exceptions"("trip_id");

-- CreateIndex
CREATE INDEX "transportation_exceptions_category_idx" ON "transportation_exceptions"("category");

-- CreateIndex
CREATE INDEX "transportation_exceptions_resolved_idx" ON "transportation_exceptions"("resolved");

-- AddForeignKey
ALTER TABLE "transportation_providers" ADD CONSTRAINT "transportation_providers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transportation_vehicles" ADD CONSTRAINT "transportation_vehicles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transportation_vehicles" ADD CONSTRAINT "transportation_vehicles_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transportation_vehicles" ADD CONSTRAINT "transportation_vehicles_campus_id_fkey" FOREIGN KEY ("campus_id") REFERENCES "campuses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transportation_vehicles" ADD CONSTRAINT "transportation_vehicles_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "transportation_providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transportation_vehicles" ADD CONSTRAINT "transportation_vehicles_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_profiles" ADD CONSTRAINT "driver_profiles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_profiles" ADD CONSTRAINT "driver_profiles_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_profiles" ADD CONSTRAINT "driver_profiles_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "transportation_providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_profiles" ADD CONSTRAINT "driver_profiles_employee_profile_id_fkey" FOREIGN KEY ("employee_profile_id") REFERENCES "employee_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendant_profiles" ADD CONSTRAINT "attendant_profiles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendant_profiles" ADD CONSTRAINT "attendant_profiles_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendant_profiles" ADD CONSTRAINT "attendant_profiles_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "transportation_providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendant_profiles" ADD CONSTRAINT "attendant_profiles_employee_profile_id_fkey" FOREIGN KEY ("employee_profile_id") REFERENCES "employee_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transportation_routes" ADD CONSTRAINT "transportation_routes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transportation_routes" ADD CONSTRAINT "transportation_routes_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transportation_routes" ADD CONSTRAINT "transportation_routes_campus_id_fkey" FOREIGN KEY ("campus_id") REFERENCES "campuses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_stops" ADD CONSTRAINT "route_stops_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "transportation_routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_operational_assignments" ADD CONSTRAINT "route_operational_assignments_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "transportation_routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_operational_assignments" ADD CONSTRAINT "route_operational_assignments_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "transportation_vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_operational_assignments" ADD CONSTRAINT "route_operational_assignments_driver_profile_id_fkey" FOREIGN KEY ("driver_profile_id") REFERENCES "driver_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_operational_assignments" ADD CONSTRAINT "route_operational_assignments_attendant_profile_id_fkey" FOREIGN KEY ("attendant_profile_id") REFERENCES "attendant_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transportation_passenger_profiles" ADD CONSTRAINT "transportation_passenger_profiles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transportation_passenger_profiles" ADD CONSTRAINT "transportation_passenger_profiles_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transportation_passenger_profiles" ADD CONSTRAINT "transportation_passenger_profiles_learner_id_fkey" FOREIGN KEY ("learner_id") REFERENCES "learners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transportation_passenger_profiles" ADD CONSTRAINT "transportation_passenger_profiles_employee_profile_id_fkey" FOREIGN KEY ("employee_profile_id") REFERENCES "employee_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passenger_route_assignments" ADD CONSTRAINT "passenger_route_assignments_passenger_profile_id_fkey" FOREIGN KEY ("passenger_profile_id") REFERENCES "transportation_passenger_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passenger_route_assignments" ADD CONSTRAINT "passenger_route_assignments_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "transportation_routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passenger_route_assignments" ADD CONSTRAINT "passenger_route_assignments_stop_id_fkey" FOREIGN KEY ("stop_id") REFERENCES "route_stops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passenger_handover_authorizations" ADD CONSTRAINT "passenger_handover_authorizations_passenger_profile_id_fkey" FOREIGN KEY ("passenger_profile_id") REFERENCES "transportation_passenger_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passenger_handover_authorizations" ADD CONSTRAINT "passenger_handover_authorizations_authorized_person_id_fkey" FOREIGN KEY ("authorized_person_id") REFERENCES "persons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transportation_trips" ADD CONSTRAINT "transportation_trips_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transportation_trips" ADD CONSTRAINT "transportation_trips_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transportation_trips" ADD CONSTRAINT "transportation_trips_campus_id_fkey" FOREIGN KEY ("campus_id") REFERENCES "campuses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transportation_trips" ADD CONSTRAINT "transportation_trips_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "transportation_routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transportation_trips" ADD CONSTRAINT "transportation_trips_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "transportation_vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transportation_trips" ADD CONSTRAINT "transportation_trips_driver_profile_id_fkey" FOREIGN KEY ("driver_profile_id") REFERENCES "driver_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transportation_trips" ADD CONSTRAINT "transportation_trips_attendant_profile_id_fkey" FOREIGN KEY ("attendant_profile_id") REFERENCES "attendant_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_manifest_entries" ADD CONSTRAINT "trip_manifest_entries_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "transportation_trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_manifest_entries" ADD CONSTRAINT "trip_manifest_entries_passenger_profile_id_fkey" FOREIGN KEY ("passenger_profile_id") REFERENCES "transportation_passenger_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_stop_visits" ADD CONSTRAINT "trip_stop_visits_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "transportation_trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_stop_visits" ADD CONSTRAINT "trip_stop_visits_route_stop_id_fkey" FOREIGN KEY ("route_stop_id") REFERENCES "route_stops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passenger_trip_events" ADD CONSTRAINT "passenger_trip_events_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "transportation_trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passenger_trip_events" ADD CONSTRAINT "passenger_trip_events_passenger_profile_id_fkey" FOREIGN KEY ("passenger_profile_id") REFERENCES "transportation_passenger_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passenger_trip_events" ADD CONSTRAINT "passenger_trip_events_stop_visit_id_fkey" FOREIGN KEY ("stop_visit_id") REFERENCES "trip_stop_visits"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passenger_handovers" ADD CONSTRAINT "passenger_handovers_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "transportation_trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passenger_handovers" ADD CONSTRAINT "passenger_handovers_passenger_profile_id_fkey" FOREIGN KEY ("passenger_profile_id") REFERENCES "transportation_passenger_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passenger_handovers" ADD CONSTRAINT "passenger_handovers_authorization_id_fkey" FOREIGN KEY ("authorization_id") REFERENCES "passenger_handover_authorizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passenger_handovers" ADD CONSTRAINT "passenger_handovers_received_by_person_id_fkey" FOREIGN KEY ("received_by_person_id") REFERENCES "persons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transportation_exceptions" ADD CONSTRAINT "transportation_exceptions_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "transportation_trips"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transportation_exceptions" ADD CONSTRAINT "transportation_exceptions_passenger_profile_id_fkey" FOREIGN KEY ("passenger_profile_id") REFERENCES "transportation_passenger_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transportation_exceptions" ADD CONSTRAINT "transportation_exceptions_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "transportation_vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transportation_exceptions" ADD CONSTRAINT "transportation_exceptions_driver_profile_id_fkey" FOREIGN KEY ("driver_profile_id") REFERENCES "driver_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

