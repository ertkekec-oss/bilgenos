import { DomainError } from '../shared/domain-error.js';

export class RouteNotActiveError extends DomainError {
  constructor(message: string = 'Route is not active.') {
    super(message, 'ROUTE_NOT_ACTIVE');
  }
}

export class RouteAssignmentConflictError extends DomainError {
  constructor(message: string = 'Route operational assignment conflict detected.') {
    super(message, 'ROUTE_ASSIGNMENT_CONFLICT');
  }
}

export class VehicleNotAvailableError extends DomainError {
  constructor(message: string = 'Vehicle is not available for assignment.') {
    super(message, 'VEHICLE_NOT_AVAILABLE');
  }
}

export class VehicleCapacityExceededError extends DomainError {
  constructor(message: string = 'Assigned passengers exceed vehicle seating capacity.') {
    super(message, 'VEHICLE_CAPACITY_EXCEEDED');
  }
}

export class VehicleAlreadyInActiveTripError extends DomainError {
  constructor(message: string = 'Vehicle is already operating an active trip.') {
    super(message, 'VEHICLE_ALREADY_IN_ACTIVE_TRIP');
  }
}

export class DriverNotEligibleError extends DomainError {
  constructor(message: string = 'Driver is not qualified or compliant.') {
    super(message, 'DRIVER_NOT_ELIGIBLE');
  }
}

export class DriverAlreadyInActiveTripError extends DomainError {
  constructor(message: string = 'Driver is already operating an active trip.') {
    super(message, 'DRIVER_ALREADY_IN_ACTIVE_TRIP');
  }
}

export class PassengerAssignmentConflictError extends DomainError {
  constructor(message: string = 'Passenger has conflicting active route assignment for this shift/direction.') {
    super(message, 'PASSENGER_ASSIGNMENT_CONFLICT');
  }
}

export class PassengerNotInManifestError extends DomainError {
  constructor(message: string = 'Passenger is not on this trip manifest.') {
    super(message, 'PASSENGER_NOT_IN_MANIFEST');
  }
}

export class PassengerAlreadyBoardedError extends DomainError {
  constructor(message: string = 'Passenger has already boarded this trip.') {
    super(message, 'PASSENGER_ALREADY_BOARDED');
  }
}

export class PassengerNotOnboardError extends DomainError {
  constructor(message: string = 'Passenger is not currently onboard.') {
    super(message, 'PASSENGER_NOT_ONBOARD');
  }
}

export class HandoverRequiredError extends DomainError {
  constructor(message: string = 'Student requires authorized guardian handover.') {
    super(message, 'HANDOVER_REQUIRED');
  }
}

export class HandoverNotAuthorizedError extends DomainError {
  constructor(message: string = 'Recipient is not authorized for passenger handover.') {
    super(message, 'HANDOVER_NOT_AUTHORIZED');
  }
}

export class HandoverAlreadyCompletedError extends DomainError {
  constructor(message: string = 'Passenger handover has already been completed for this journey.') {
    super(message, 'HANDOVER_ALREADY_COMPLETED');
  }
}

export class TripNotStartableError extends DomainError {
  constructor(message: string = 'Trip cannot be started.') {
    super(message, 'TRIP_NOT_STARTABLE');
  }
}

export class TripAlreadyStartedError extends DomainError {
  constructor(message: string = 'Trip has already started.') {
    super(message, 'TRIP_ALREADY_STARTED');
  }
}

export class TripNotCompletableError extends DomainError {
  constructor(message: string = 'Trip cannot be completed until all onboard passengers are dropped off.') {
    super(message, 'TRIP_NOT_COMPLETABLE');
  }
}

export class CrossTenantTransportRelationError extends DomainError {
  constructor(message: string = 'Transportation entity violates tenant boundary.') {
    super(message, 'CROSS_TENANT_TRANSPORT_RELATION');
  }
}

export class CrossInstitutionTransportAccessError extends DomainError {
  constructor(message: string = 'Cross-institution transport access forbidden.') {
    super(message, 'CROSS_INSTITUTION_TRANSPORT_ACCESS');
  }
}

export class IdempotencyPayloadConflictError extends DomainError {
  constructor(message: string = 'Idempotency key reused with mismatched payload.') {
    super(message, 'IDEMPOTENCY_PAYLOAD_CONFLICT');
  }
}

export class VehicleAssignmentConflictError extends DomainError {
  constructor(message: string = 'Vehicle is already assigned to a conflicting route.') {
    super(message, 'VEHICLE_ASSIGNMENT_CONFLICT');
  }
}
