import type { UUID } from '../shared/types.js';
import type { BaseDomainEvent } from './phase1-events.js';

export interface TripScheduledPayload {
  tripId: UUID;
  institutionId: UUID;
  campusId: UUID;
  routeId: UUID;
  vehicleId: UUID;
  driverProfileId: UUID;
  serviceDate: string;
  shiftType: string;
}

export interface TripScheduledEvent extends BaseDomainEvent {
  eventType: 'TripScheduled';
  payload: TripScheduledPayload;
}

export interface TripStartedPayload {
  tripId: UUID;
  institutionId: UUID;
  campusId: UUID;
  routeId: UUID;
  vehicleId: UUID;
  driverProfileId: UUID;
  actualStartTime: string;
  manifestSize: number;
}

export interface TripStartedEvent extends BaseDomainEvent {
  eventType: 'TripStarted';
  payload: TripStartedPayload;
}

export interface TripCompletedPayload {
  tripId: UUID;
  institutionId: UUID;
  actualEndTime: string;
  passengerCountBoarded: number;
  passengerCountDroppedOff: number;
}

export interface TripCompletedEvent extends BaseDomainEvent {
  eventType: 'TripCompleted';
  payload: TripCompletedPayload;
}

export interface TripCancelledPayload {
  tripId: UUID;
  reason: string;
  cancelledByUserId: UUID;
}

export interface TripCancelledEvent extends BaseDomainEvent {
  eventType: 'TripCancelled';
  payload: TripCancelledPayload;
}

export interface PassengerBoardedPayload {
  tripId: UUID;
  passengerProfileId: UUID;
  stopVisitId?: UUID | undefined;
  timestamp: string;
  recordedByUserId: UUID;
}

export interface PassengerBoardedEvent extends BaseDomainEvent {
  eventType: 'PassengerBoarded';
  payload: PassengerBoardedPayload;
}

export interface PassengerDroppedOffPayload {
  tripId: UUID;
  passengerProfileId: UUID;
  stopVisitId?: UUID | undefined;
  timestamp: string;
  recordedByUserId: UUID;
}

export interface PassengerDroppedOffEvent extends BaseDomainEvent {
  eventType: 'PassengerDroppedOff';
  payload: PassengerDroppedOffPayload;
}

export interface PassengerNoShowPayload {
  tripId: UUID;
  passengerProfileId: UUID;
  timestamp: string;
  recordedByUserId: UUID;
}

export interface PassengerNoShowEvent extends BaseDomainEvent {
  eventType: 'PassengerNoShow';
  payload: PassengerNoShowPayload;
}

export interface PassengerHandoverCompletedPayload {
  handoverId: UUID;
  tripId: UUID;
  passengerProfileId: UUID;
  authorizationId: UUID;
  receivedByPersonId: UUID;
  verifiedByUserId: UUID;
  handoverTimestamp: string;
}

export interface PassengerHandoverCompletedEvent extends BaseDomainEvent {
  eventType: 'PassengerHandoverCompleted';
  payload: PassengerHandoverCompletedPayload;
}

export interface HandoverAuthorizationRevokedPayload {
  authorizationId: UUID;
  passengerProfileId: UUID;
  revokedAt: string;
  reason?: string | undefined;
}

export interface HandoverAuthorizationRevokedEvent extends BaseDomainEvent {
  eventType: 'HandoverAuthorizationRevoked';
  payload: HandoverAuthorizationRevokedPayload;
}

export interface TransportationExceptionRaisedPayload {
  exceptionId: UUID;
  tripId?: UUID | undefined;
  passengerProfileId?: UUID | undefined;
  category: string;
  severity: string;
  description: string;
}

export interface TransportationExceptionRaisedEvent extends BaseDomainEvent {
  eventType: 'TransportationExceptionRaised';
  payload: TransportationExceptionRaisedPayload;
}

export interface TransportationRouteCreatedPayload {
  routeId: UUID;
  institutionId: UUID;
  campusId: UUID;
  code: string;
  name: string;
}

export interface TransportationRouteCreatedEvent extends BaseDomainEvent {
  eventType: 'TransportationRouteCreated';
  payload: TransportationRouteCreatedPayload;
}

export interface VehicleAssignedToRoutePayload {
  assignmentId: UUID;
  routeId: UUID;
  vehicleId: UUID;
  driverProfileId: UUID;
}

export interface VehicleAssignedToRouteEvent extends BaseDomainEvent {
  eventType: 'VehicleAssignedToRoute';
  payload: VehicleAssignedToRoutePayload;
}

export type Phase6Event =
  | TripScheduledEvent
  | TripStartedEvent
  | TripCompletedEvent
  | TripCancelledEvent
  | PassengerBoardedEvent
  | PassengerDroppedOffEvent
  | PassengerNoShowEvent
  | PassengerHandoverCompletedEvent
  | HandoverAuthorizationRevokedEvent
  | TransportationExceptionRaisedEvent
  | TransportationRouteCreatedEvent
  | VehicleAssignedToRouteEvent;
