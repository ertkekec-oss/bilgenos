import type {
  UUID,
  FloorStatus,
} from '@bilgenos/contracts';
import { InvariantViolationError } from '../shared/domain-error.js';

export interface FloorProps {
  id: UUID;
  tenantId: UUID;
  institutionId: UUID;
  campusId: UUID;
  buildingId: UUID;
  code: string;
  name: string;
  levelNumber?: number | undefined;
  sortOrder: number;
  status: FloorStatus;
}

export class Floor {
  private status: FloorStatus;

  constructor(private readonly props: FloorProps) {
    if (!props.code || props.code.trim().length === 0) {
      throw new InvariantViolationError('Floor code is required.');
    }
    if (!props.name || props.name.trim().length === 0) {
      throw new InvariantViolationError('Floor name is required.');
    }
    this.status = props.status;
  }

  get id(): UUID { return this.props.id; }
  get tenantId(): UUID { return this.props.tenantId; }
  get institutionId(): UUID { return this.props.institutionId; }
  get campusId(): UUID { return this.props.campusId; }
  get buildingId(): UUID { return this.props.buildingId; }
  get code(): string { return this.props.code; }
  get name(): string { return this.props.name; }
  get levelNumber(): number | undefined { return this.props.levelNumber; }
  get sortOrder(): number { return this.props.sortOrder; }
  get currentStatus(): FloorStatus { return this.status; }
}
