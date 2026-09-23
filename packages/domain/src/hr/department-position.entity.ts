import type { UUID } from '@bilgenos/contracts';
import { InvariantViolationError } from '../shared/domain-error.js';

export interface DepartmentProps {
  id: UUID;
  tenantId: UUID;
  institutionId: UUID;
  code: string;
  name: string;
  parentDepartmentId?: UUID | undefined;
  isActive: boolean;
}

export class Department {
  constructor(private readonly props: DepartmentProps) {
    if (!props.code || props.code.trim().length === 0) {
      throw new InvariantViolationError('Department code is required.');
    }
    if (!props.name || props.name.trim().length === 0) {
      throw new InvariantViolationError('Department name is required.');
    }
  }

  get id(): UUID { return this.props.id; }
  get tenantId(): UUID { return this.props.tenantId; }
  get institutionId(): UUID { return this.props.institutionId; }
  get code(): string { return this.props.code; }
  get name(): string { return this.props.name; }
  get parentDepartmentId(): UUID | undefined { return this.props.parentDepartmentId; }
  get isActive(): boolean { return this.props.isActive; }
}

export interface PositionProps {
  id: UUID;
  tenantId: UUID;
  institutionId: UUID;
  departmentId?: UUID | undefined;
  code: string;
  title: string;
  description?: string | undefined;
  isActive: boolean;
}

export class Position {
  constructor(private readonly props: PositionProps) {
    if (!props.code || props.code.trim().length === 0) {
      throw new InvariantViolationError('Position code is required.');
    }
    if (!props.title || props.title.trim().length === 0) {
      throw new InvariantViolationError('Position title is required.');
    }
  }

  get id(): UUID { return this.props.id; }
  get tenantId(): UUID { return this.props.tenantId; }
  get institutionId(): UUID { return this.props.institutionId; }
  get departmentId(): UUID | undefined { return this.props.departmentId; }
  get code(): string { return this.props.code; }
  get title(): string { return this.props.title; }
  get description(): string | undefined { return this.props.description; }
  get isActive(): boolean { return this.props.isActive; }
}
