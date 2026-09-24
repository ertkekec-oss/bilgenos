import { TransportationProviderDto, TransportationProviderStatus, UUID } from '@bilgenos/contracts';
import { InvariantViolationError, InvalidStateTransitionError } from '../shared/domain-error.js';

export interface CreateTransportationProviderProps {
  id: UUID;
  tenantId: UUID;
  organizationId: UUID;
  name: string;
  code: string;
  taxNumber?: string | undefined;
  contactName?: string | undefined;
  phone?: string | undefined;
  email?: string | undefined;
}

export class TransportationProvider {
  private props: TransportationProviderDto;

  constructor(props: TransportationProviderDto) {
    this.props = { ...props };
  }

  public static create(props: CreateTransportationProviderProps): TransportationProvider {
    if (!props.name || props.name.trim().length === 0) {
      throw new InvariantViolationError('Transportation provider name is required.');
    }
    if (!props.code || props.code.trim().length === 0) {
      throw new InvariantViolationError('Transportation provider code is required.');
    }
    const now = new Date().toISOString();
    return new TransportationProvider({
      ...props,
      code: props.code.trim().toUpperCase(),
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    });
  }

  public get id(): UUID { return this.props.id; }
  public get tenantId(): UUID { return this.props.tenantId; }
  public get organizationId(): UUID { return this.props.organizationId; }
  public get name(): string { return this.props.name; }
  public get code(): string { return this.props.code; }
  public get status(): TransportationProviderStatus { return this.props.status; }

  public suspend(): void {
    if (this.props.status === 'TERMINATED') {
      throw new InvalidStateTransitionError(this.props.status, 'SUSPENDED');
    }
    this.props.status = 'SUSPENDED';
    this.props.updatedAt = new Date().toISOString();
  }

  public reactivate(): void {
    if (this.props.status === 'TERMINATED') {
      throw new InvalidStateTransitionError(this.props.status, 'ACTIVE');
    }
    this.props.status = 'ACTIVE';
    this.props.updatedAt = new Date().toISOString();
  }

  public terminate(): void {
    this.props.status = 'TERMINATED';
    this.props.updatedAt = new Date().toISOString();
  }

  public toDto(): TransportationProviderDto {
    return { ...this.props };
  }
}
