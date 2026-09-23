import {
  UUID,
  ScholarshipType,
  ScholarshipAmountType,
  DiscountReason,
} from '@bilgenos/contracts';
import { InvariantViolationError } from '../shared/domain-error.js';

export interface ScholarshipAwardProps {
  id: UUID;
  tenantId: UUID;
  institutionId: UUID;
  candidatePersonId: UUID;
  type: ScholarshipType;
  amountType: ScholarshipAmountType;
  value: bigint; // Percentage (e.g. 50n for 50%) or fixed minor amount
  reasonCode?: string | undefined;
  approvedByUserId?: UUID | undefined;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
}

export class ScholarshipAward {
  constructor(private readonly props: ScholarshipAwardProps) {
    if (props.value <= 0n) {
      throw new InvariantViolationError('Scholarship value must be positive.');
    }
    if (props.amountType === 'PERCENTAGE' && props.value > 100n) {
      throw new InvariantViolationError('Percentage scholarship cannot exceed 100%.');
    }
  }

  get id(): UUID { return this.props.id; }
  get type(): ScholarshipType { return this.props.type; }
  get amountType(): ScholarshipAmountType { return this.props.amountType; }
  get value(): bigint { return this.props.value; }
  get isApproved(): boolean { return Boolean(this.props.approvedByUserId); }
}

export interface DiscountApplicationProps {
  id: UUID;
  tenantId: UUID;
  institutionId: UUID;
  reason: DiscountReason;
  amountMinor: bigint;
}

export class DiscountApplication {
  constructor(private readonly props: DiscountApplicationProps) {
    if (props.amountMinor <= 0n) {
      throw new InvariantViolationError('Discount amount must be positive.');
    }
  }

  get id(): UUID { return this.props.id; }
  get reason(): DiscountReason { return this.props.reason; }
  get amountMinor(): bigint { return this.props.amountMinor; }
}
