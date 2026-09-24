import type {
  UUID,
  SpaceType,
  SpaceStatus,
} from '@bilgenos/contracts';
import { InvariantViolationError, DomainError } from '../shared/domain-error.js';

export interface SpaceProps {
  id: UUID;
  tenantId: UUID;
  institutionId: UUID;
  campusId: UUID;
  buildingId: UUID;
  floorId: UUID;
  code: string;
  name: string;
  spaceType: SpaceType;
  capacity?: number | undefined;
  areaSquareMeters?: number | undefined;
  status: SpaceStatus;
}

export class Space {
  private status: SpaceStatus;

  constructor(private readonly props: SpaceProps) {
    if (!props.code || props.code.trim().length === 0) {
      throw new InvariantViolationError('Space code is required.');
    }
    if (!props.name || props.name.trim().length === 0) {
      throw new InvariantViolationError('Space name is required.');
    }
    if (props.capacity !== undefined && props.capacity < 0) {
      throw new InvariantViolationError('Space capacity cannot be negative.');
    }
    this.status = props.status;
  }

  get id(): UUID { return this.props.id; }
  get tenantId(): UUID { return this.props.tenantId; }
  get institutionId(): UUID { return this.props.institutionId; }
  get campusId(): UUID { return this.props.campusId; }
  get buildingId(): UUID { return this.props.buildingId; }
  get floorId(): UUID { return this.props.floorId; }
  get code(): string { return this.props.code; }
  get name(): string { return this.props.name; }
  get spaceType(): SpaceType { return this.props.spaceType; }
  get capacity(): number | undefined { return this.props.capacity; }
  get areaSquareMeters(): number | undefined { return this.props.areaSquareMeters; }
  get currentStatus(): SpaceStatus { return this.status; }

  public markUnavailable(): void {
    if (this.status === 'DECOMMISSIONED') {
      throw new DomainError('Cannot change status of decommissioned space.');
    }
    this.status = 'TEMPORARILY_UNAVAILABLE';
  }

  public reactivate(): void {
    if (this.status === 'DECOMMISSIONED') {
      throw new DomainError('Cannot reactivate decommissioned space.');
    }
    this.status = 'ACTIVE';
  }

  public restrict(): void {
    if (this.status === 'DECOMMISSIONED') {
      throw new DomainError('Cannot restrict decommissioned space.');
    }
    this.status = 'RESTRICTED';
  }

  public decommission(): void {
    this.status = 'DECOMMISSIONED';
  }
}
