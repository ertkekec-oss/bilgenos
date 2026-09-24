import type { UUID, MovementType } from '@bilgenos/contracts';

export interface AssetLocationHistoryProps {
  id: UUID;
  tenantId: UUID;
  assetId: UUID;
  fromSpaceId?: UUID | undefined;
  toSpaceId?: UUID | undefined;
  effectiveAt: Date;
  movementType: MovementType;
  reason?: string | undefined;
  performedByUserId: UUID;
  createdAt: Date;
}

export class AssetLocationHistory {
  constructor(private readonly props: AssetLocationHistoryProps) {}

  get id(): UUID { return this.props.id; }
  get tenantId(): UUID { return this.props.tenantId; }
  get assetId(): UUID { return this.props.assetId; }
  get fromSpaceId(): UUID | undefined { return this.props.fromSpaceId; }
  get toSpaceId(): UUID | undefined { return this.props.toSpaceId; }
  get effectiveAt(): Date { return this.props.effectiveAt; }
  get movementType(): MovementType { return this.props.movementType; }
  get reason(): string | undefined { return this.props.reason; }
  get performedByUserId(): UUID { return this.props.performedByUserId; }
  get createdAt(): Date { return this.props.createdAt; }
}
