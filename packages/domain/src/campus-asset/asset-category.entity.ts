import type { UUID } from '@bilgenos/contracts';
import { InvariantViolationError } from '../shared/domain-error.js';

export interface AssetCategoryProps {
  id: UUID;
  tenantId: UUID;
  code: string;
  name: string;
  description?: string | undefined;
  requiresSerialNumber: boolean;
  warrantyTracked: boolean;
  maintenanceRelevant: boolean;
  isActive: boolean;
}

export class AssetCategory {
  constructor(private readonly props: AssetCategoryProps) {
    if (!props.code || props.code.trim().length === 0) {
      throw new InvariantViolationError('Asset category code is required.');
    }
    if (!props.name || props.name.trim().length === 0) {
      throw new InvariantViolationError('Asset category name is required.');
    }
  }

  get id(): UUID { return this.props.id; }
  get tenantId(): UUID { return this.props.tenantId; }
  get code(): string { return this.props.code; }
  get name(): string { return this.props.name; }
  get description(): string | undefined { return this.props.description; }
  get requiresSerialNumber(): boolean { return this.props.requiresSerialNumber; }
  get warrantyTracked(): boolean { return this.props.warrantyTracked; }
  get maintenanceRelevant(): boolean { return this.props.maintenanceRelevant; }
  get isActive(): boolean { return this.props.isActive; }
}
