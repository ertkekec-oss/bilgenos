import type { UUID, TransferStatus } from '@bilgenos/contracts';
import { DomainError } from '../shared/domain-error.js';

export interface AssetTransferProps {
  id: UUID;
  tenantId: UUID;
  assetId: UUID;
  fromInstitutionId?: UUID | undefined;
  fromCampusId?: UUID | undefined;
  fromSpaceId?: UUID | undefined;
  toInstitutionId?: UUID | undefined;
  toCampusId?: UUID | undefined;
  toSpaceId?: UUID | undefined;
  status: TransferStatus;
  requestedByUserId: UUID;
  approvedByUserId?: UUID | undefined;
  completedByUserId?: UUID | undefined;
  requestedAt: Date;
  approvedAt?: Date | undefined;
  completedAt?: Date | undefined;
  reason?: string | undefined;
}

export class AssetTransfer {
  private status: TransferStatus;
  private approvedByUserId?: UUID | undefined;
  private approvedAt?: Date | undefined;
  private completedByUserId?: UUID | undefined;
  private completedAt?: Date | undefined;

  constructor(private readonly props: AssetTransferProps) {
    this.status = props.status;
    this.approvedByUserId = props.approvedByUserId;
    this.approvedAt = props.approvedAt;
    this.completedByUserId = props.completedByUserId;
    this.completedAt = props.completedAt;
  }

  get id(): UUID { return this.props.id; }
  get tenantId(): UUID { return this.props.tenantId; }
  get assetId(): UUID { return this.props.assetId; }
  get fromInstitutionId(): UUID | undefined { return this.props.fromInstitutionId; }
  get fromCampusId(): UUID | undefined { return this.props.fromCampusId; }
  get fromSpaceId(): UUID | undefined { return this.props.fromSpaceId; }
  get toInstitutionId(): UUID | undefined { return this.props.toInstitutionId; }
  get toCampusId(): UUID | undefined { return this.props.toCampusId; }
  get toSpaceId(): UUID | undefined { return this.props.toSpaceId; }
  get currentStatus(): TransferStatus { return this.status; }
  get requestedAt(): Date { return this.props.requestedAt; }
  get requestedByUserId(): UUID { return this.props.requestedByUserId; }
  get currentApprovedByUserId(): UUID | undefined { return this.approvedByUserId; }
  get currentApprovedAt(): Date | undefined { return this.approvedAt; }
  get currentCompletedByUserId(): UUID | undefined { return this.completedByUserId; }
  get currentCompletedAt(): Date | undefined { return this.completedAt; }
  get reason(): string | undefined { return this.props.reason; }

  public approve(approverUserId: UUID): void {
    if (this.status !== 'REQUESTED') {
      throw new DomainError('Only REQUESTED transfers can be approved.');
    }
    if (approverUserId === this.props.requestedByUserId) {
      throw new DomainError('Maker-Checker violation: Requester cannot approve transfer.');
    }
    this.status = 'APPROVED';
    this.approvedByUserId = approverUserId;
    this.approvedAt = new Date();
  }

  public startTransit(): void {
    if (this.status !== 'APPROVED') {
      throw new DomainError('Only APPROVED transfers can enter transit.');
    }
    this.status = 'IN_TRANSIT';
  }

  public complete(completedByUserId: UUID): void {
    if (this.status !== 'APPROVED' && this.status !== 'IN_TRANSIT') {
      throw new DomainError('Cannot complete transfer from status: ' + this.status);
    }
    this.status = 'COMPLETED';
    this.completedByUserId = completedByUserId;
    this.completedAt = new Date();
  }

  public reject(): void {
    if (this.status !== 'REQUESTED') {
      throw new DomainError('Only REQUESTED transfers can be rejected.');
    }
    this.status = 'REJECTED';
  }

  public cancel(): void {
    if (this.status === 'COMPLETED' || this.status === 'REJECTED') {
      throw new DomainError('Cannot cancel finalized transfer.');
    }
    this.status = 'CANCELLED';
  }
}
