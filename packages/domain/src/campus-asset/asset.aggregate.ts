import type {
  UUID,
  AssetStatus,
  AssetCondition,
} from '@bilgenos/contracts';
import { InvariantViolationError, DomainError } from '../shared/domain-error.js';

export interface AssetProps {
  id: UUID;
  tenantId: UUID;
  organizationId: UUID;
  institutionId?: UUID | undefined;
  assetNumber: string;
  assetTag?: string | undefined;
  name: string;
  description?: string | undefined;
  categoryId: UUID;
  manufacturer?: string | undefined;
  model?: string | undefined;
  serialNumber?: string | undefined;
  acquisitionDate?: Date | undefined;
  purchaseCostMinor?: bigint | undefined;
  purchaseCurrency?: string | undefined;
  warrantyStartDate?: Date | undefined;
  warrantyEndDate?: Date | undefined;
  status: AssetStatus;
  condition: AssetCondition;
  currentSpaceId?: UUID | undefined;
}

export class Asset {
  private status: AssetStatus;
  private condition: AssetCondition;
  private currentSpaceId?: UUID | undefined;

  constructor(private readonly props: AssetProps) {
    if (!props.assetNumber || props.assetNumber.trim().length === 0) {
      throw new InvariantViolationError('Asset number is mandatory.');
    }
    if (!props.name || props.name.trim().length === 0) {
      throw new InvariantViolationError('Asset name is mandatory.');
    }
    this.status = props.status;
    this.condition = props.condition;
    this.currentSpaceId = props.currentSpaceId;
  }

  get id(): UUID { return this.props.id; }
  get tenantId(): UUID { return this.props.tenantId; }
  get organizationId(): UUID { return this.props.organizationId; }
  get institutionId(): UUID | undefined { return this.props.institutionId; }
  get assetNumber(): string { return this.props.assetNumber; }
  get assetTag(): string | undefined { return this.props.assetTag; }
  get name(): string { return this.props.name; }
  get description(): string | undefined { return this.props.description; }
  get categoryId(): UUID { return this.props.categoryId; }
  get manufacturer(): string | undefined { return this.props.manufacturer; }
  get model(): string | undefined { return this.props.model; }
  get serialNumber(): string | undefined { return this.props.serialNumber; }
  get acquisitionDate(): Date | undefined { return this.props.acquisitionDate; }
  get purchaseCostMinor(): bigint | undefined { return this.props.purchaseCostMinor; }
  get purchaseCurrency(): string | undefined { return this.props.purchaseCurrency; }
  get warrantyStartDate(): Date | undefined { return this.props.warrantyStartDate; }
  get warrantyEndDate(): Date | undefined { return this.props.warrantyEndDate; }
  get currentStatus(): AssetStatus { return this.status; }
  get currentCondition(): AssetCondition { return this.condition; }
  get currentAssignedSpaceId(): UUID | undefined { return this.currentSpaceId; }

  public activate(): void {
    if (this.status === 'DISPOSED' || this.status === 'RETIRED') {
      throw new DomainError('Cannot activate retired or disposed asset.');
    }
    this.status = 'AVAILABLE';
  }

  public assign(): void {
    if (this.status === 'DISPOSED' || this.status === 'RETIRED' || this.status === 'IN_REPAIR') {
      throw new DomainError('Asset in status ' + this.status + ' cannot be assigned.');
    }
    this.status = 'IN_USE';
  }

  public moveTo(spaceId: UUID): void {
    if (this.status === 'DISPOSED') {
      throw new DomainError('Disposed asset cannot be moved.');
    }
    this.currentSpaceId = spaceId;
  }

  public sendToRepair(): void {
    if (this.status === 'DISPOSED' || this.status === 'RETIRED') {
      throw new DomainError('Cannot send disposed or retired asset to repair.');
    }
    this.status = 'IN_REPAIR';
  }

  public returnFromRepair(): void {
    if (this.status !== 'IN_REPAIR') {
      throw new DomainError('Asset is not currently in repair.');
    }
    this.status = 'AVAILABLE';
  }

  public markLost(): void {
    if (this.status === 'DISPOSED') {
      throw new DomainError('Disposed asset cannot be marked lost.');
    }
    this.status = 'LOST';
  }

  public markStolen(): void {
    if (this.status === 'DISPOSED') {
      throw new DomainError('Disposed asset cannot be marked stolen.');
    }
    this.status = 'STOLEN';
  }

  public retire(): void {
    if (this.status === 'DISPOSED') {
      throw new DomainError('Disposed asset is already finalized.');
    }
    this.status = 'RETIRED';
  }

  public dispose(): void {
    if (this.status === 'DISPOSED') {
      throw new DomainError('Asset is already disposed.');
    }
    this.status = 'DISPOSED';
  }

  public setCondition(newCondition: AssetCondition): void {
    this.condition = newCondition;
  }

  public deriveWarrantyStatus(currentDate: Date = new Date()): 'ACTIVE' | 'EXPIRED' | 'UNKNOWN' {
    if (!this.props.warrantyEndDate) return 'UNKNOWN';
    return currentDate <= this.props.warrantyEndDate ? 'ACTIVE' : 'EXPIRED';
  }
}
