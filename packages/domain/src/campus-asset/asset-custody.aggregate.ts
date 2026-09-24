import type { UUID, CustodyStatus } from '@bilgenos/contracts';
import { DomainError } from '../shared/domain-error.js';

export interface AssetCustodyProps {
  id: UUID;
  tenantId: UUID;
  assetId: UUID;
  employeeId: UUID;
  assignedAt: Date;
  returnedAt?: Date | undefined;
  status: CustodyStatus;
  assignedByUserId: UUID;
  returnedByUserId?: UUID | undefined;
  notes?: string | undefined;
}

export class AssetCustody {
  private status: CustodyStatus;
  private returnedAt?: Date | undefined;
  private returnedByUserId?: UUID | undefined;

  constructor(private readonly props: AssetCustodyProps) {
    this.status = props.status;
    this.returnedAt = props.returnedAt;
    this.returnedByUserId = props.returnedByUserId;
  }

  get id(): UUID { return this.props.id; }
  get tenantId(): UUID { return this.props.tenantId; }
  get assetId(): UUID { return this.props.assetId; }
  get employeeId(): UUID { return this.props.employeeId; }
  get assignedAt(): Date { return this.props.assignedAt; }
  get currentReturnedAt(): Date | undefined { return this.returnedAt; }
  get currentStatus(): CustodyStatus { return this.status; }
  get assignedByUserId(): UUID { return this.props.assignedByUserId; }
  get currentReturnedByUserId(): UUID | undefined { return this.returnedByUserId; }
  get notes(): string | undefined { return this.props.notes; }

  public returnCustody(returnedByUserId: UUID, returnDate: Date = new Date()): void {
    if (this.status !== 'ACTIVE') {
      throw new DomainError('Custody is not active. Current status: ' + this.status);
    }
    this.status = 'RETURNED';
    this.returnedAt = returnDate;
    this.returnedByUserId = returnedByUserId;
  }

  public revokeCustody(returnedByUserId: UUID, returnDate: Date = new Date()): void {
    if (this.status !== 'ACTIVE') {
      throw new DomainError('Custody is not active.');
    }
    this.status = 'REVOKED';
    this.returnedAt = returnDate;
    this.returnedByUserId = returnedByUserId;
  }
}
