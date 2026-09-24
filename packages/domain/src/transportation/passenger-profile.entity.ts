import {
  TransportationPassengerProfileDto,
  PassengerProfileStatus,
  PassengerType,
  UUID,
} from '@bilgenos/contracts';
import { InvariantViolationError } from '../shared/domain-error.js';

export interface CreatePassengerProfileProps {
  id: UUID;
  tenantId: UUID;
  personId: UUID;
  learnerId?: UUID | null;
  employeeProfileId?: UUID | null;
  passengerType: PassengerType;
  requiresHandover?: boolean;
  mobilityNotes?: string | null;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

export class TransportationPassengerProfile {
  private props: TransportationPassengerProfileDto;

  constructor(props: TransportationPassengerProfileDto) {
    this.props = { ...props };
  }

  public static create(props: CreatePassengerProfileProps): TransportationPassengerProfile {
    if (!props.emergencyContactName || !props.emergencyContactPhone) {
      throw new InvariantViolationError('Emergency contact name and phone are required for passenger profile.');
    }
    // TRN-002 & TRN-003: If STUDENT, learnerId should be provided
    const requiresHandover = props.requiresHandover ?? (props.passengerType === 'STUDENT');
    const now = new Date().toISOString();

    return new TransportationPassengerProfile({
      ...props,
      requiresHandover,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    });
  }

  public get id(): UUID { return this.props.id; }
  public get tenantId(): UUID { return this.props.tenantId; }
  public get personId(): UUID { return this.props.personId; }
  public get passengerType(): PassengerType { return this.props.passengerType; }
  public get requiresHandover(): boolean { return this.props.requiresHandover; }
  public get status(): PassengerProfileStatus { return this.props.status; }

  public suspend(): void {
    this.props.status = 'SUSPENDED';
    this.props.updatedAt = new Date().toISOString();
  }

  public reactivate(): void {
    this.props.status = 'ACTIVE';
    this.props.updatedAt = new Date().toISOString();
  }

  public toDto(): TransportationPassengerProfileDto {
    return { ...this.props };
  }
}
