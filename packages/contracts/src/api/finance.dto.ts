import type { BaseEntityDto, UUID } from '../shared/types.js';

export type FinancialAccountType =
  | 'CASH'
  | 'BANK'
  | 'CARD_CLEARING'
  | 'PAYMENT_PROVIDER_CLEARING'
  | 'OTHER';

export interface FinancialAccountDto extends BaseEntityDto {
  tenantId: UUID;
  institutionId: UUID;
  name: string;
  accountType: FinancialAccountType;
  currency: string;
  accountNumber?: string | undefined;
  iban?: string | undefined;
  bankName?: string | undefined;
  branchName?: string | undefined;
  isActive: boolean;
}

export interface CreateFinancialAccountDto {
  institutionId: UUID;
  name: string;
  accountType: FinancialAccountType;
  currency?: string | undefined;
  accountNumber?: string | undefined;
  iban?: string | undefined;
  bankName?: string | undefined;
  branchName?: string | undefined;
}

export type CollectionStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PARTIALLY_REFUNDED'
  | 'REFUNDED'
  | 'REVERSED'
  | 'FAILED';

export type CollectionPaymentMethod =
  | 'CASH'
  | 'BANK_TRANSFER'
  | 'CREDIT_CARD'
  | 'DIRECT_DEBIT'
  | 'OTHER';

export type CollectionAllocationState =
  | 'UNALLOCATED'
  | 'PARTIALLY_ALLOCATED'
  | 'FULLY_ALLOCATED';

export interface CollectionDto extends BaseEntityDto {
  tenantId: UUID;
  institutionId: UUID;
  financialResponsiblePersonId: UUID;
  financialAccountId: UUID;
  paymentMethod: CollectionPaymentMethod;
  amountMinor: string;
  currency: string;
  collectedAt: string;
  referenceNumber?: string | undefined;
  status: CollectionStatus;
  allocationState: CollectionAllocationState;
  allocatedAmountMinor: string;
  unallocatedAmountMinor: string;
  notes?: string | undefined;
}

export interface CreateCollectionDto {
  institutionId: UUID;
  financialResponsiblePersonId: UUID;
  financialAccountId: UUID;
  paymentMethod: CollectionPaymentMethod;
  amountMinor: string;
  currency?: string | undefined;
  collectedAt?: string | undefined;
  referenceNumber?: string | undefined;
  notes?: string | undefined;
}

export type PaymentAllocationStatus = 'ACTIVE' | 'REVERSED';

export interface PaymentAllocationDto extends BaseEntityDto {
  tenantId: UUID;
  collectionId: UUID;
  paymentInstallmentId: UUID;
  amountMinor: string;
  allocatedAt: string;
  status: PaymentAllocationStatus;
}

export interface AllocatePaymentItemDto {
  paymentInstallmentId: UUID;
  amountMinor: string;
}

export interface AllocatePaymentRequestDto {
  collectionId: UUID;
  allocations: AllocatePaymentItemDto[];
}

export type LedgerEntryType =
  | 'MONEY_IN'
  | 'MONEY_OUT'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT';

export type LedgerSourceReferenceType =
  | 'COLLECTION'
  | 'REFUND'
  | 'REVERSAL'
  | 'TRANSFER'
  | 'ADJUSTMENT';

export interface FinancialLedgerEntryDto extends BaseEntityDto {
  tenantId: UUID;
  institutionId: UUID;
  entryNumber: string;
  financialAccountId: UUID;
  entryType: LedgerEntryType;
  amountMinor: string;
  currency: string;
  sourceReferenceType: LedgerSourceReferenceType;
  sourceReferenceId: UUID;
  description: string;
  isReversed: boolean;
  reversalEntryId?: UUID | undefined;
  postedAt: string;
}

export type ReceiptStatus = 'ISSUED' | 'CANCELLED';

export interface ReceiptDto extends BaseEntityDto {
  tenantId: UUID;
  institutionId: UUID;
  collectionId: UUID;
  receiptNumber: string;
  recipientPersonId: UUID;
  amountMinor: string;
  currency: string;
  documentReference?: string | undefined;
  status: ReceiptStatus;
  issuedAt: string;
}

export type RefundStatus =
  | 'REQUESTED'
  | 'APPROVED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export interface RefundDto extends BaseEntityDto {
  tenantId: UUID;
  institutionId: UUID;
  collectionId: UUID;
  amountMinor: string;
  currency: string;
  reason: string;
  status: RefundStatus;
  requestedByUserId: UUID;
  approvedByUserId?: UUID | undefined;
  completedByUserId?: UUID | undefined;
  refundedAt?: string | undefined;
}

export interface RefundAllocationDto extends BaseEntityDto {
  tenantId: UUID;
  refundId: UUID;
  paymentAllocationId: UUID;
  amountMinor: string;
  status: 'ACTIVE' | 'REVERSED';
}

export interface RequestRefundDto {
  collectionId: UUID;
  amountMinor: string;
  reason: string;
  requestedByUserId: UUID;
  allocationsToReopen?: {
    paymentAllocationId: UUID;
    amountMinor: string;
  }[];
}

export type ReconciliationSourceType =
  | 'BANK'
  | 'CARD'
  | 'PAYMENT_PROVIDER'
  | 'CASH_COUNT';

export type ReconciliationSessionStatus =
  | 'OPEN'
  | 'MATCHED'
  | 'DISCREPANCY'
  | 'CLOSED';

export interface ReconciliationSessionDto extends BaseEntityDto {
  tenantId: UUID;
  institutionId: UUID;
  financialAccountId: UUID;
  sourceType: ReconciliationSourceType;
  sessionDate: string;
  status: ReconciliationSessionStatus;
  externalClosingBalanceMinor: string;
  ledgerClosingBalanceMinor: string;
  discrepancyMinor: string;
}

export type ReconciliationMatchStatus =
  | 'UNMATCHED'
  | 'MATCHED'
  | 'AMBIGUOUS'
  | 'MANUAL';

export interface ReconciliationItemDto extends BaseEntityDto {
  tenantId: UUID;
  sessionId: UUID;
  externalReference: string;
  amountMinor: string;
  transactionDate: string;
  matchedLedgerEntryId?: UUID | undefined;
  matchStatus: ReconciliationMatchStatus;
  confidenceScore?: number | undefined;
  notes?: string | undefined;
}
