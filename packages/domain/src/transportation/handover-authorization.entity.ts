import {
  PassengerHandoverAuthorizationDto,
  HandoverAuthStatus,
  HandoverRelationshipType,
  HandoverScope,
  UUID,
} from '@bilgenos/contracts';

export interface CreateHandoverAuthorizationProps {
  id: UUID;
  tenantId: UUID;
  passengerProfileId: UUID;
  authorizedPersonId: UUID;
  relationshipType: HandoverRelationshipType;
  authorizationScope: HandoverScope;
  verificationCodeHash?: string | null;
  validFrom: string;
  validUntil?: string | null;
  notes?: string | null;
}

export class PassengerHandoverAuthorization {
  private props: PassengerHandoverAuthorizationDto;

  constructor(props: PassengerHandoverAuthorizationDto) {
    this.props = { ...props };
  }

  public static create(props: CreateHandoverAuthorizationProps): PassengerHandoverAuthorization {
    const now = new Date().toISOString();
    return new PassengerHandoverAuthorization({
      ...props,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    });
  }

  public get id(): UUID { return this.props.id; }
  public get tenantId(): UUID { return this.props.tenantId; }
  public get passengerProfileId(): UUID { return this.props.passengerProfileId; }
  public get authorizedPersonId(): UUID { return this.props.authorizedPersonId; }
  public get status(): HandoverAuthStatus { return this.props.status; }
  public get validFrom(): string { return this.props.validFrom; }
  public get validUntil(): string | null | undefined { return this.props.validUntil; }

  // TRN-024 & TRN-025: Revocation takes immediate effect
  public isAuthorized(referenceDate: Date = new Date()): boolean {
    if (this.props.status !== 'ACTIVE') return false;
    const from = new Date(this.props.validFrom);
    if (from > referenceDate) return false;
    if (this.props.validUntil && new Date(this.props.validUntil) < referenceDate) {
      return false;
    }
    return true;
  }

  public revoke(reason?: string): void {
    this.props.status = 'REVOKED';
    if (reason) {
      this.props.notes = this.props.notes ? `${this.props.notes}; Revoked: ${reason}` : `Revoked: ${reason}`;
    }
    this.props.updatedAt = new Date().toISOString();
  }

  public toDto(): PassengerHandoverAuthorizationDto {
    return { ...this.props };
  }
}
