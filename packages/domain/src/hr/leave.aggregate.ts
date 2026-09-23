import type {
  UUID,
  LeaveType,
  LeaveUnit,
  LeaveStatus,
  LeaveTransactionType,
} from '@bilgenos/contracts';
import { InvariantViolationError, DomainError } from '../shared/domain-error.js';

export interface LeaveTransactionProps {
  id: UUID;
  tenantId: UUID;
  employeeId: UUID;
  leaveType: LeaveType;
  transactionType: LeaveTransactionType;
  daysAmount: number;
  referenceId?: UUID | undefined;
  postedAt: Date;
}

export class LeaveTransaction {
  constructor(private readonly props: LeaveTransactionProps) {}

  get id(): UUID { return this.props.id; }
  get tenantId(): UUID { return this.props.tenantId; }
  get employeeId(): UUID { return this.props.employeeId; }
  get leaveType(): LeaveType { return this.props.leaveType; }
  get transactionType(): LeaveTransactionType { return this.props.transactionType; }
  get daysAmount(): number { return this.props.daysAmount; }
  get referenceId(): UUID | undefined { return this.props.referenceId; }
  get postedAt(): Date { return this.props.postedAt; }
}

export interface EmployeeLeaveProps {
  id: UUID;
  tenantId: UUID;
  institutionId: UUID;
  employeeId: UUID;
  leaveType: LeaveType;
  unit: LeaveUnit;
  startDate: Date;
  endDate: Date;
  unitsCount: number;
  reason?: string | undefined;
  status: LeaveStatus;
  requestedByUserId: UUID;
  approvedByUserId?: UUID | undefined;
  approvedAt?: Date | undefined;
}

export class EmployeeLeave {
  private status: LeaveStatus;
  private approvedByUserId?: UUID | undefined;
  private approvedAt?: Date | undefined;

  constructor(private readonly props: EmployeeLeaveProps) {
    if (props.startDate > props.endDate) {
      throw new InvariantViolationError('Leave startDate cannot be after endDate.');
    }
    if (props.unitsCount <= 0) {
      throw new InvariantViolationError('Leave unitsCount must be strictly greater than zero.');
    }
    this.status = props.status;
    this.approvedByUserId = props.approvedByUserId;
    this.approvedAt = props.approvedAt;
  }

  get id(): UUID { return this.props.id; }
  get tenantId(): UUID { return this.props.tenantId; }
  get institutionId(): UUID { return this.props.institutionId; }
  get employeeId(): UUID { return this.props.employeeId; }
  get leaveType(): LeaveType { return this.props.leaveType; }
  get unit(): LeaveUnit { return this.props.unit; }
  get startDate(): Date { return this.props.startDate; }
  get endDate(): Date { return this.props.endDate; }
  get unitsCount(): number { return this.props.unitsCount; }
  get reason(): string | undefined { return this.props.reason; }
  get currentStatus(): LeaveStatus { return this.status; }
  get requestedByUserId(): UUID { return this.props.requestedByUserId; }
  get currentApprovedByUserId(): UUID | undefined { return this.approvedByUserId; }
  get currentApprovedAt(): Date | undefined { return this.approvedAt; }

  /**
   * Invariant HR-014:
   * Leave balance is derived from the sum of LeaveTransactions.
   */
  public static calculateLeaveBalance(
    leaveType: LeaveType,
    transactions: readonly LeaveTransaction[]
  ): number {
    return transactions
      .filter((t) => t.leaveType === leaveType)
      .reduce((sum, t) => sum + t.daysAmount, 0);
  }

  /**
   * Maker-Checker Approval
   */
  public approve(approverUserId: UUID, availableBalance: number): void {
    if (this.status !== 'REQUESTED') {
      throw new DomainError('Only REQUESTED leaves can be approved. Current: ' + this.status);
    }
    if (approverUserId === this.props.requestedByUserId) {
      throw new DomainError('Maker-Checker violation: Approver cannot be the same user who requested the leave.');
    }
    if (this.props.unitsCount > availableBalance) {
      throw new InvariantViolationError(
        'Insufficient leave balance: requested ' + this.props.unitsCount + ' days but available is ' + availableBalance
      );
    }
    this.status = 'APPROVED';
    this.approvedByUserId = approverUserId;
    this.approvedAt = new Date();
  }

  public reject(): void {
    if (this.status !== 'REQUESTED') {
      throw new DomainError('Only REQUESTED leaves can be rejected.');
    }
    this.status = 'REJECTED';
  }

  public cancel(): void {
    if (this.status === 'REJECTED') {
      throw new DomainError('Cannot cancel rejected leave.');
    }
    this.status = 'CANCELLED';
  }
}
