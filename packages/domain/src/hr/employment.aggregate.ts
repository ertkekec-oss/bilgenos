import type {
  UUID,
  EmploymentContractType,
  EmploymentStatus,
} from '@bilgenos/contracts';
import { InvariantViolationError, DomainError } from '../shared/domain-error.js';

export interface EmploymentProps {
  id: UUID;
  tenantId: UUID;
  organizationId: UUID;
  employeeId: UUID;
  contractType: EmploymentContractType;
  status: EmploymentStatus;
  startDate: Date;
  endDate?: Date | undefined;
  probationEndDate?: Date | undefined;
  terminationDate?: Date | undefined;
  terminationReason?: string | undefined;
}

export class Employment {
  private status: EmploymentStatus;
  private terminationDate?: Date | undefined;
  private terminationReason?: string | undefined;

  constructor(private readonly props: EmploymentProps) {
    if (props.endDate && props.startDate > props.endDate) {
      throw new InvariantViolationError('Employment startDate cannot be after endDate.');
    }
    this.status = props.status;
    this.terminationDate = props.terminationDate;
    this.terminationReason = props.terminationReason;
  }

  get id(): UUID { return this.props.id; }
  get tenantId(): UUID { return this.props.tenantId; }
  get organizationId(): UUID { return this.props.organizationId; }
  get employeeId(): UUID { return this.props.employeeId; }
  get contractType(): EmploymentContractType { return this.props.contractType; }
  get currentStatus(): EmploymentStatus { return this.status; }
  get startDate(): Date { return this.props.startDate; }
  get endDate(): Date | undefined { return this.props.endDate; }
  get probationEndDate(): Date | undefined { return this.props.probationEndDate; }
  get currentTerminationDate(): Date | undefined { return this.terminationDate; }
  get currentTerminationReason(): string | undefined { return this.terminationReason; }

  public activate(): void {
    if (this.status !== 'DRAFT' && this.status !== 'PENDING' && this.status !== 'PROBATION') {
      throw new DomainError('Cannot activate employment from status: ' + this.status);
    }
    this.status = 'ACTIVE';
  }

  public suspend(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'PROBATION') {
      throw new DomainError('Only ACTIVE or PROBATION employments can be suspended.');
    }
    this.status = 'SUSPENDED';
  }

  public terminate(reason: string, date: Date = new Date()): void {
    if (this.status === 'TERMINATED') {
      throw new DomainError('Employment is already terminated.');
    }
    if (!reason || reason.trim().length === 0) {
      throw new InvariantViolationError('Termination reason is mandatory.');
    }
    this.status = 'TERMINATED';
    this.terminationDate = date;
    this.terminationReason = reason;
  }
}
