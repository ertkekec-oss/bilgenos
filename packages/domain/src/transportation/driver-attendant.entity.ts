import {
  DriverProfileDto,
  DriverStatus,
  DriverType,
  AttendantProfileDto,
  AttendantStatus,
  AttendantType,
  UUID,
} from '@bilgenos/contracts';
import { InvariantViolationError } from '../shared/domain-error.js';
import { DriverNotEligibleError } from './transportation-errors.js';

export interface CreateDriverProfileProps {
  id: UUID;
  tenantId: UUID;
  personId: UUID;
  providerId?: UUID | null;
  employeeProfileId?: UUID | null;
  driverType: DriverType;
  licenseNumber: string;
  licenseClasses: string[];
  licenseExpiryDate: string;
  srcCertificateExpiryDate?: string | null;
  psychotechnicalExpiryDate?: string | null;
  criminalRecordCheckedAt?: string | null;
}

export class DriverProfile {
  private props: DriverProfileDto;

  constructor(props: DriverProfileDto) {
    this.props = { ...props };
  }

  public static create(props: CreateDriverProfileProps): DriverProfile {
    if (!props.licenseNumber || props.licenseNumber.trim().length === 0) {
      throw new InvariantViolationError('Driver license number is required.');
    }
    if (!props.licenseClasses || props.licenseClasses.length === 0) {
      throw new InvariantViolationError('Driver must have at least one license category.');
    }
    // TRN-007 & TRN-008: Internal driver requires employeeProfileId; Contracted driver requires providerId
    if (props.driverType === 'INTERNAL' && !props.employeeProfileId) {
      throw new InvariantViolationError('Internal driver must reference an EmployeeProfile.');
    }
    if (props.driverType === 'CONTRACTED' && !props.providerId) {
      throw new InvariantViolationError('Contracted external driver must reference a TransportationProvider.');
    }

    const now = new Date().toISOString();
    return new DriverProfile({
      ...props,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    });
  }

  public get id(): UUID { return this.props.id; }
  public get tenantId(): UUID { return this.props.tenantId; }
  public get personId(): UUID { return this.props.personId; }
  public get driverType(): DriverType { return this.props.driverType; }
  public get status(): DriverStatus { return this.props.status; }

  public isEligible(referenceDate: Date = new Date()): boolean {
    if (this.props.status !== 'ACTIVE') return false;
    if (new Date(this.props.licenseExpiryDate) < referenceDate) return false;
    if (this.props.srcCertificateExpiryDate && new Date(this.props.srcCertificateExpiryDate) < referenceDate) {
      return false;
    }
    if (this.props.psychotechnicalExpiryDate && new Date(this.props.psychotechnicalExpiryDate) < referenceDate) {
      return false;
    }
    return true;
  }

  public assertEligible(referenceDate: Date = new Date()): void {
    if (!this.isEligible(referenceDate)) {
      throw new DriverNotEligibleError('Driver is either inactive or has expired credentials.');
    }
  }

  public suspend(): void {
    this.props.status = 'SUSPENDED';
    this.props.updatedAt = new Date().toISOString();
  }

  public reactivate(): void {
    this.props.status = 'ACTIVE';
    this.props.updatedAt = new Date().toISOString();
  }

  public toDto(): DriverProfileDto {
    return { ...this.props };
  }
}

export interface CreateAttendantProfileProps {
  id: UUID;
  tenantId: UUID;
  personId: UUID;
  providerId?: UUID | null;
  employeeProfileId?: UUID | null;
  attendantType: AttendantType;
  firstAidCertified: boolean;
  firstAidExpiryDate?: string | null;
  criminalRecordCheckedAt?: string | null;
}

export class AttendantProfile {
  private props: AttendantProfileDto;

  constructor(props: AttendantProfileDto) {
    this.props = { ...props };
  }

  public static create(props: CreateAttendantProfileProps): AttendantProfile {
    const now = new Date().toISOString();
    return new AttendantProfile({
      ...props,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    });
  }

  public get id(): UUID { return this.props.id; }
  public get tenantId(): UUID { return this.props.tenantId; }
  public get personId(): UUID { return this.props.personId; }
  public get attendantType(): AttendantType { return this.props.attendantType; }
  public get status(): AttendantStatus { return this.props.status; }

  public toDto(): AttendantProfileDto {
    return { ...this.props };
  }
}
