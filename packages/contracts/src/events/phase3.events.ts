import type { UUID } from '../shared/types.js';
import type { BaseDomainEvent } from './phase1-events.js';

export interface CollectionConfirmedPayload {
  collectionId: UUID;
  tenantId: UUID;
  institutionId: UUID;
  financialResponsiblePersonId: UUID;
  financialAccountId: UUID;
  amountMinor: string;
  currency: string;
  collectedAt: string;
}

export interface CollectionConfirmedEvent extends BaseDomainEvent {
  eventType: 'CollectionConfirmed';
  payload: CollectionConfirmedPayload;
}

export interface PaymentAllocatedPayload {
  collectionId: UUID;
  paymentAllocationId: UUID;
  paymentInstallmentId: UUID;
  allocatedMinor: string;
  installmentRemainingMinor: string;
  installmentNewStatus: string;
}

export interface PaymentAllocatedEvent extends BaseDomainEvent {
  eventType: 'PaymentAllocated';
  payload: PaymentAllocatedPayload;
}

export interface LedgerEntryPostedPayload {
  ledgerEntryId: UUID;
  tenantId: UUID;
  institutionId: UUID;
  entryNumber: string;
  financialAccountId: UUID;
  entryType: string;
  amountMinor: string;
  currency: string;
  sourceReferenceType: string;
  sourceReferenceId: UUID;
}

export interface LedgerEntryPostedEvent extends BaseDomainEvent {
  eventType: 'LedgerEntryPosted';
  payload: LedgerEntryPostedPayload;
}

export interface ReceiptIssuedPayload {
  receiptId: UUID;
  tenantId: UUID;
  institutionId: UUID;
  receiptNumber: string;
  collectionId: UUID;
  recipientPersonId: UUID;
  amountMinor: string;
}

export interface ReceiptIssuedEvent extends BaseDomainEvent {
  eventType: 'ReceiptIssued';
  payload: ReceiptIssuedPayload;
}

export interface RefundCompletedPayload {
  refundId: UUID;
  tenantId: UUID;
  institutionId: UUID;
  collectionId: UUID;
  amountMinor: string;
  currency: string;
  reopenedAllocations: {
    paymentAllocationId: UUID;
    paymentInstallmentId: UUID;
    amountMinor: string;
  }[];
}

export interface RefundCompletedEvent extends BaseDomainEvent {
  eventType: 'RefundCompleted';
  payload: RefundCompletedPayload;
}
