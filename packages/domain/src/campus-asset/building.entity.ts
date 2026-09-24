import type {
  UUID,
  BuildingType,
  BuildingStatus,
} from '@bilgenos/contracts';
import { InvariantViolationError, DomainError } from '../shared/domain-error.js';

export interface BuildingProps {
  id: UUID;
  tenantId: UUID;
  institutionId: UUID;
  campusId: UUID;
  code: string;
  name: string;
  buildingType: BuildingType;
  status: BuildingStatus;
  openedAt?: Date | undefined;
  closedAt?: Date | undefined;
}

export class Building {
  private status: BuildingStatus;
  private closedAt?: Date | undefined;

  constructor(private readonly props: BuildingProps) {
    if (!props.code || props.code.trim().length === 0) {
      throw new InvariantViolationError('Building code is required.');
    }
    if (!props.name || props.name.trim().length === 0) {
      throw new InvariantViolationError('Building name is required.');
    }
    this.status = props.status;
    this.closedAt = props.closedAt;
  }

  get id(): UUID { return this.props.id; }
  get tenantId(): UUID { return this.props.tenantId; }
  get institutionId(): UUID { return this.props.institutionId; }
  get campusId(): UUID { return this.props.campusId; }
  get code(): string { return this.props.code; }
  get name(): string { return this.props.name; }
  get buildingType(): BuildingType { return this.props.buildingType; }
  get currentStatus(): BuildingStatus { return this.status; }
  get openedAt(): Date | undefined { return this.props.openedAt; }
  get currentClosedAt(): Date | undefined { return this.closedAt; }

  public activate(): void {
    if (this.status === 'DECOMMISSIONED') {
      throw new DomainError('Cannot activate decommissioned building.');
    }
    this.status = 'ACTIVE';
    this.closedAt = undefined;
  }

  public closeTemporarily(): void {
    if (this.status === 'DECOMMISSIONED') {
      throw new DomainError('Cannot close decommissioned building.');
    }
    this.status = 'TEMPORARILY_CLOSED';
  }

  public decommission(closedAt: Date = new Date()): void {
    this.status = 'DECOMMISSIONED';
    this.closedAt = closedAt;
  }
}
