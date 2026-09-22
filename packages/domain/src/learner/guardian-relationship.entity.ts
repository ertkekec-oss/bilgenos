import { RelationshipStatus, RelationshipType, UUID } from '@bilgenos/contracts';
import { InvariantViolationError } from '../shared/domain-error.js';

export interface GuardianRelationshipProps {
  id: UUID;
  tenantId: UUID;
  guardianPersonId: UUID;
  learnerId: UUID;
  relationshipType: RelationshipType;
  isLegalGuardian: boolean;
  isFinancialResponsible: boolean;
  isEmergencyContact: boolean;
  isPickupAuthorized: boolean;
  validFrom: Date;
  validUntil?: Date;
  status: RelationshipStatus;
  custodyNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class GuardianRelationship {
  constructor(private readonly props: GuardianRelationshipProps) {
    this.validate();
  }

  private validate(): void {
    if (!this.props.tenantId) {
      throw new InvariantViolationError('Guardian relationship must belong to a tenant.');
    }
    if (!this.props.guardianPersonId) {
      throw new InvariantViolationError('Guardian Person ID is required.');
    }
    if (!this.props.learnerId) {
      throw new InvariantViolationError('Learner ID is required.');
    }
    if (this.props.validUntil && this.props.validUntil < this.props.validFrom) {
      throw new InvariantViolationError('validUntil cannot be earlier than validFrom.');
    }
  }

  get id(): UUID { return this.props.id; }
  get tenantId(): UUID { return this.props.tenantId; }
  get guardianPersonId(): UUID { return this.props.guardianPersonId; }
  get learnerId(): UUID { return this.props.learnerId; }
  get relationshipType(): RelationshipType { return this.props.relationshipType; }
  get isLegalGuardian(): boolean { return this.props.isLegalGuardian; }
  get isFinancialResponsible(): boolean { return this.props.isFinancialResponsible; }
  get isEmergencyContact(): boolean { return this.props.isEmergencyContact; }
  get isPickupAuthorized(): boolean { return this.props.isPickupAuthorized; }
  get validFrom(): Date { return this.props.validFrom; }
  get validUntil(): Date | undefined { return this.props.validUntil; }
  get status(): RelationshipStatus { return this.props.status; }
  get custodyNotes(): string | undefined { return this.props.custodyNotes; }

  public isCurrentlyValid(referenceDate: Date = new Date()): boolean {
    if (this.props.status !== 'ACTIVE') {
      return false;
    }
    if (referenceDate < this.props.validFrom) {
      return false;
    }
    if (this.props.validUntil && referenceDate > this.props.validUntil) {
      return false;
    }
    return true;
  }
}
