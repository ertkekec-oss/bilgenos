import { TransportationVehicleDto, VehicleStatus, VehicleType, UUID } from '@bilgenos/contracts';
import { InvariantViolationError, InvalidStateTransitionError } from '../shared/domain-error.js';

export interface CreateVehicleProps {
  id: UUID;
  tenantId: UUID;
  institutionId: UUID;
  campusId: UUID;
  providerId?: UUID | null;
  assetId?: UUID | null;
  plateNumber: string;
  vehicleType: VehicleType;
  make?: string;
  model?: string;
  modelYear?: number;
  seatingCapacity: number;
  effectiveCapacity?: number;
  inspectionExpiryDate?: string | null;
  insuranceExpiryDate?: string | null;
}

export class TransportationVehicle {
  private props: TransportationVehicleDto;

  constructor(props: TransportationVehicleDto) {
    this.props = { ...props };
  }

  public static normalizePlate(plate: string): string {
    return plate.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  }

  public static create(props: CreateVehicleProps): TransportationVehicle {
    if (!props.plateNumber || props.plateNumber.trim().length === 0) {
      throw new InvariantViolationError('Vehicle license plate is required.');
    }
    if (props.seatingCapacity <= 0) {
      throw new InvariantViolationError('Seating capacity must be greater than zero.');
    }
    const effectiveCap = props.effectiveCapacity ?? props.seatingCapacity;
    if (effectiveCap > props.seatingCapacity || effectiveCap <= 0) {
      throw new InvariantViolationError('Effective capacity cannot exceed physical seating capacity or be non-positive.');
    }

    // TRN-005 & TRN-006: Owned vehicle may reference asset, external requires provider
    // Either assetId or providerId must be supplied, or owned internally
    const normalized = TransportationVehicle.normalizePlate(props.plateNumber);
    const now = new Date().toISOString();

    return new TransportationVehicle({
      id: props.id,
      tenantId: props.tenantId,
      institutionId: props.institutionId,
      campusId: props.campusId,
      providerId: props.providerId ?? null,
      assetId: props.assetId ?? null,
      plateNumber: props.plateNumber.trim().toUpperCase(),
      plateNormalized: normalized,
      vehicleType: props.vehicleType,
      make: props.make,
      model: props.model,
      modelYear: props.modelYear,
      seatingCapacity: props.seatingCapacity,
      effectiveCapacity: effectiveCap,
      status: 'ACTIVE',
      inspectionExpiryDate: props.inspectionExpiryDate ?? null,
      insuranceExpiryDate: props.insuranceExpiryDate ?? null,
      createdAt: now,
      updatedAt: now,
    });
  }

  public get id(): UUID { return this.props.id; }
  public get tenantId(): UUID { return this.props.tenantId; }
  public get institutionId(): UUID { return this.props.institutionId; }
  public get campusId(): UUID { return this.props.campusId; }
  public get providerId(): UUID | null | undefined { return this.props.providerId; }
  public get assetId(): UUID | null | undefined { return this.props.assetId; }
  public get plateNumber(): string { return this.props.plateNumber; }
  public get plateNormalized(): string { return this.props.plateNormalized; }
  public get seatingCapacity(): number { return this.props.seatingCapacity; }
  public get effectiveCapacity(): number { return this.props.effectiveCapacity; }
  public get status(): VehicleStatus { return this.props.status; }

  public isCompliant(referenceDate: Date = new Date()): boolean {
    if (this.props.status !== 'ACTIVE') return false;
    if (this.props.inspectionExpiryDate && new Date(this.props.inspectionExpiryDate) < referenceDate) {
      return false;
    }
    if (this.props.insuranceExpiryDate && new Date(this.props.insuranceExpiryDate) < referenceDate) {
      return false;
    }
    return true;
  }

  public setMaintenance(): void {
    if (this.props.status === 'DECOMMISSIONED') {
      throw new InvalidStateTransitionError(this.props.status, 'MAINTENANCE');
    }
    this.props.status = 'MAINTENANCE';
    this.props.updatedAt = new Date().toISOString();
  }

  public setOutOfService(): void {
    if (this.props.status === 'DECOMMISSIONED') {
      throw new InvalidStateTransitionError(this.props.status, 'OUT_OF_SERVICE');
    }
    this.props.status = 'OUT_OF_SERVICE';
    this.props.updatedAt = new Date().toISOString();
  }

  public reactivate(): void {
    if (this.props.status === 'DECOMMISSIONED') {
      throw new InvalidStateTransitionError(this.props.status, 'ACTIVE');
    }
    this.props.status = 'ACTIVE';
    this.props.updatedAt = new Date().toISOString();
  }

  public decommission(): void {
    this.props.status = 'DECOMMISSIONED';
    this.props.updatedAt = new Date().toISOString();
  }

  public toDto(): TransportationVehicleDto {
    return { ...this.props };
  }
}
