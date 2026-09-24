import { BaseEntityDto, UUID } from '../shared/types.js';

export type TransportationProviderStatus = 'ACTIVE' | 'SUSPENDED' | 'TERMINATED';
export type VehicleType = 'MINIBUS' | 'MIDIBUS' | 'BUS' | 'VAN';
export type VehicleStatus = 'ACTIVE' | 'MAINTENANCE' | 'OUT_OF_SERVICE' | 'DECOMMISSIONED';
export type DriverType = 'INTERNAL' | 'CONTRACTED';
export type DriverStatus = 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
export type AttendantType = 'INTERNAL' | 'CONTRACTED';
export type AttendantStatus = 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
export type RouteType = 'MORNING_PICKUP' | 'EVENING_DROPOFF' | 'ACTIVITY_SPECIAL';
export type RouteStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
export type StopType = 'PICKUP' | 'DROPOFF' | 'BOTH' | 'CAMPUS_ORIGIN' | 'CAMPUS_DESTINATION';
export type RouteAssignmentStatus = 'ACTIVE' | 'INACTIVE' | 'CANCELLED';
export type PassengerType = 'STUDENT' | 'EMPLOYEE' | 'GUEST';
export type PassengerProfileStatus = 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
export type RouteDirection = 'PICKUP' | 'DROPOFF' | 'BOTH';
export type PassengerAssignmentStatus = 'ACTIVE' | 'SUSPENDED' | 'CANCELLED';
export type HandoverRelationshipType = 'MOTHER' | 'FATHER' | 'GUARDIAN' | 'AUTHORIZED_RELATIVE' | 'OTHER';
export type HandoverScope = 'REGULAR' | 'TEMPORARY_DELEGATE';
export type HandoverAuthStatus = 'ACTIVE' | 'REVOKED' | 'EXPIRED';
export type TripShiftType = 'MORNING' | 'EVENING' | 'SPECIAL';
export type TripStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type BoardingStatus = 'PENDING' | 'BOARDED' | 'DROPPED_OFF' | 'NO_SHOW' | 'CANCELLED';
export type StopVisitStatus = 'SCHEDULED' | 'VISITED' | 'SKIPPED';
export type PassengerTripEventType = 'BOARDED' | 'DROPPED_OFF' | 'NO_SHOW' | 'CANCELLED' | 'MANUAL_OVERRIDE';
export type HandoverMethod = 'PHYSICAL_SIGNATURE' | 'VERIFICATION_PIN' | 'QR_SCAN' | 'VISUAL_STAFF_CONFIRMATION';
export type ExceptionCategory =
  | 'UNAUTHORIZED_HANDOVER_ATTEMPT'
  | 'UNACCOUNTED_PASSENGER'
  | 'ROUTE_DEVIATION'
  | 'ACCIDENT_INCIDENT'
  | 'VEHICLE_BREAKDOWN'
  | 'MEDICAL_EMERGENCY'
  | 'PASSENGER_MISBEHAVIOR'
  | 'WEATHER_DELAY';
export type ExceptionSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface TransportationProviderDto extends BaseEntityDto {
  tenantId: UUID;
  organizationId: UUID;
  name: string;
  code: string;
  taxNumber?: string | undefined;
  contactName?: string | undefined;
  phone?: string | undefined;
  email?: string | undefined;
  status: TransportationProviderStatus;
}

export interface TransportationVehicleDto extends BaseEntityDto {
  tenantId: UUID;
  institutionId: UUID;
  campusId: UUID;
  providerId?: UUID | null | undefined;
  assetId?: UUID | null | undefined;
  plateNumber: string;
  plateNormalized: string;
  vehicleType: VehicleType;
  make?: string | undefined;
  model?: string | undefined;
  modelYear?: number | undefined;
  seatingCapacity: number;
  effectiveCapacity: number;
  status: VehicleStatus;
  inspectionExpiryDate?: string | null | undefined;
  insuranceExpiryDate?: string | null | undefined;
}

export interface DriverProfileDto extends BaseEntityDto {
  tenantId: UUID;
  personId: UUID;
  providerId?: UUID | null | undefined;
  employeeProfileId?: UUID | null | undefined;
  driverType: DriverType;
  licenseNumber: string;
  licenseClasses: string[];
  licenseExpiryDate: string;
  srcCertificateExpiryDate?: string | null | undefined;
  psychotechnicalExpiryDate?: string | null | undefined;
  criminalRecordCheckedAt?: string | null | undefined;
  status: DriverStatus;
}

export interface AttendantProfileDto extends BaseEntityDto {
  tenantId: UUID;
  personId: UUID;
  providerId?: UUID | null | undefined;
  employeeProfileId?: UUID | null | undefined;
  attendantType: AttendantType;
  firstAidCertified: boolean;
  firstAidExpiryDate?: string | null | undefined;
  criminalRecordCheckedAt?: string | null | undefined;
  status: AttendantStatus;
}

export interface TransportationRouteDto extends BaseEntityDto {
  tenantId: UUID;
  institutionId: UUID;
  campusId: UUID;
  code: string;
  name: string;
  routeType: RouteType;
  status: RouteStatus;
  effectiveFrom: string;
  effectiveUntil?: string | null | undefined;
  estimatedDurationMinutes?: number | undefined;
  estimatedDistanceKm?: number | undefined;
}

export interface RouteStopDto extends BaseEntityDto {
  tenantId: UUID;
  routeId: UUID;
  sequenceNumber: number;
  name: string;
  address?: string | null | undefined;
  latitude?: number | null | undefined;
  longitude?: number | null | undefined;
  plannedTime?: string | null | undefined;
  stopType: StopType;
}

export interface RouteOperationalAssignmentDto extends BaseEntityDto {
  tenantId: UUID;
  routeId: UUID;
  vehicleId: UUID;
  driverProfileId: UUID;
  attendantProfileId?: UUID | null | undefined;
  effectiveFrom: string;
  effectiveUntil?: string | null | undefined;
  dayOfWeekMask: number[];
  status: RouteAssignmentStatus;
}

export interface TransportationPassengerProfileDto extends BaseEntityDto {
  tenantId: UUID;
  personId: UUID;
  learnerId?: UUID | null | undefined;
  employeeProfileId?: UUID | null | undefined;
  passengerType: PassengerType;
  requiresHandover: boolean;
  mobilityNotes?: string | null | undefined;
  emergencyContactName: string;
  emergencyContactPhone: string;
  status: PassengerProfileStatus;
}

export interface PassengerRouteAssignmentDto extends BaseEntityDto {
  tenantId: UUID;
  passengerProfileId: UUID;
  routeId: UUID;
  stopId: UUID;
  direction: RouteDirection;
  effectiveFrom: string;
  effectiveUntil?: string | null | undefined;
  status: PassengerAssignmentStatus;
}

export interface PassengerHandoverAuthorizationDto extends BaseEntityDto {
  tenantId: UUID;
  passengerProfileId: UUID;
  authorizedPersonId: UUID;
  relationshipType: HandoverRelationshipType;
  authorizationScope: HandoverScope;
  verificationCodeHash?: string | null | undefined;
  validFrom: string;
  validUntil?: string | null | undefined;
  status: HandoverAuthStatus;
  notes?: string | null | undefined;
}

export interface TransportationTripDto extends BaseEntityDto {
  tenantId: UUID;
  institutionId: UUID;
  campusId: UUID;
  routeId: UUID;
  vehicleId: UUID;
  driverProfileId: UUID;
  attendantProfileId?: UUID | null | undefined;
  serviceDate: string;
  shiftType: TripShiftType;
  status: TripStatus;
  scheduledStartTime: string;
  actualStartTime?: string | null | undefined;
  actualEndTime?: string | null | undefined;
  startOdometer?: number | null | undefined;
  endOdometer?: number | null | undefined;
  passengerCountExpected: number;
  passengerCountBoarded: number;
  passengerCountDroppedOff: number;
  passengerCountNoShow: number;
}

export interface TripManifestEntryDto extends BaseEntityDto {
  tenantId: UUID;
  tripId: UUID;
  passengerProfileId: UUID;
  pickupStopId?: UUID | null | undefined;
  dropoffStopId?: UUID | null | undefined;
  requiresHandover: boolean;
  boardingStatus: BoardingStatus;
  boardedAt?: string | null | undefined;
  droppedOffAt?: string | null | undefined;
}

export interface TripStopVisitDto extends BaseEntityDto {
  tenantId: UUID;
  tripId: UUID;
  routeStopId: UUID;
  sequenceNumber: number;
  scheduledTime?: string | null | undefined;
  actualArrivalTime?: string | null | undefined;
  actualDepartureTime?: string | null | undefined;
  dwellTimeSeconds?: number | null | undefined;
  status: StopVisitStatus;
}

export interface PassengerTripEventDto extends BaseEntityDto {
  tenantId: UUID;
  tripId: UUID;
  passengerProfileId: UUID;
  stopVisitId?: UUID | null | undefined;
  eventType: PassengerTripEventType;
  recordedAt: string;
  recordedByUserId: UUID;
  latitude?: number | null | undefined;
  longitude?: number | null | undefined;
  notes?: string | null | undefined;
}

export interface PassengerHandoverDto extends BaseEntityDto {
  tenantId: UUID;
  tripId: UUID;
  passengerProfileId: UUID;
  authorizationId: UUID;
  receivedByPersonId: UUID;
  verifiedByUserId: UUID;
  handoverTimestamp: string;
  method: HandoverMethod;
  notes?: string | null | undefined;
}

export interface TransportationExceptionDto extends BaseEntityDto {
  tenantId: UUID;
  tripId?: UUID | null | undefined;
  passengerProfileId?: UUID | null | undefined;
  vehicleId?: UUID | null | undefined;
  driverProfileId?: UUID | null | undefined;
  category: ExceptionCategory;
  severity: ExceptionSeverity;
  description: string;
  resolved: boolean;
  resolvedAt?: string | null | undefined;
  resolvedByUserId?: UUID | null | undefined;
  resolutionNotes?: string | null | undefined;
}
