import type { UUID, DocumentSecurityClassification } from '@bilgenos/contracts';
import { InvariantViolationError } from '../shared/domain-error.js';

export interface AssetDocumentProps {
  id: UUID;
  tenantId: UUID;
  assetId: UUID;
  documentType: string;
  title: string;
  fileReference: string;
  securityClassification: DocumentSecurityClassification;
  uploadedByUserId: UUID;
  createdAt: Date;
}

export class AssetDocument {
  constructor(private readonly props: AssetDocumentProps) {
    if (!props.title || props.title.trim().length === 0) {
      throw new InvariantViolationError('Document title is mandatory.');
    }
    if (!props.fileReference || props.fileReference.trim().length === 0) {
      throw new InvariantViolationError('Secure file reference is mandatory.');
    }
  }

  get id(): UUID { return this.props.id; }
  get tenantId(): UUID { return this.props.tenantId; }
  get assetId(): UUID { return this.props.assetId; }
  get documentType(): string { return this.props.documentType; }
  get title(): string { return this.props.title; }
  get fileReference(): string { return this.props.fileReference; }
  get securityClassification(): DocumentSecurityClassification { return this.props.securityClassification; }
  get uploadedByUserId(): UUID { return this.props.uploadedByUserId; }
  get createdAt(): Date { return this.props.createdAt; }

  public canAccess(userRoles: readonly string[]): boolean {
    if (this.props.securityClassification === 'STANDARD') return true;
    if (this.props.securityClassification === 'CONFIDENTIAL') {
      return userRoles.includes('HR_ADMIN') || userRoles.includes('FACILITY_ADMIN') || userRoles.includes('EXECUTIVE');
    }
    if (this.props.securityClassification === 'RESTRICTED') {
      return userRoles.includes('FACILITY_ADMIN') || userRoles.includes('EXECUTIVE');
    }
    return false;
  }
}
