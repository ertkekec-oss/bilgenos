import type {
  UUID,
  PersonnelDocumentType,
  DocumentSecurityClassification,
  PersonnelDocumentStatus,
} from '@bilgenos/contracts';
import { InvariantViolationError, DomainError } from '../shared/domain-error.js';

export interface PersonnelDocumentProps {
  id: UUID;
  tenantId: UUID;
  employeeId: UUID;
  documentType: PersonnelDocumentType;
  documentTitle: string;
  fileReference: string;
  securityClassification: DocumentSecurityClassification;
  expiryDate?: Date | undefined;
  status: PersonnelDocumentStatus;
  verifiedByUserId?: UUID | undefined;
  verifiedAt?: Date | undefined;
}

export class PersonnelDocument {
  private status: PersonnelDocumentStatus;
  private verifiedByUserId?: UUID | undefined;
  private verifiedAt?: Date | undefined;

  constructor(private readonly props: PersonnelDocumentProps) {
    if (!props.documentTitle || props.documentTitle.trim().length === 0) {
      throw new InvariantViolationError('Document title is required.');
    }
    if (!props.fileReference || props.fileReference.trim().length === 0) {
      throw new InvariantViolationError('Secure file reference is required.');
    }
    this.status = props.status;
    this.verifiedByUserId = props.verifiedByUserId;
    this.verifiedAt = props.verifiedAt;
  }

  get id(): UUID { return this.props.id; }
  get tenantId(): UUID { return this.props.tenantId; }
  get employeeId(): UUID { return this.props.employeeId; }
  get documentType(): PersonnelDocumentType { return this.props.documentType; }
  get documentTitle(): string { return this.props.documentTitle; }
  get fileReference(): string { return this.props.fileReference; }
  get securityClassification(): DocumentSecurityClassification { return this.props.securityClassification; }
  get expiryDate(): Date | undefined { return this.props.expiryDate; }
  get currentStatus(): PersonnelDocumentStatus { return this.status; }
  get currentVerifiedByUserId(): UUID | undefined { return this.verifiedByUserId; }
  get currentVerifiedAt(): Date | undefined { return this.verifiedAt; }

  public verify(verifierUserId: UUID): void {
    if (this.status === 'VALID') {
      throw new DomainError('Document is already verified and valid.');
    }
    this.status = 'VALID';
    this.verifiedByUserId = verifierUserId;
    this.verifiedAt = new Date();
  }
}
