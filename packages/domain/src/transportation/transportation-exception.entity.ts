import {
  TransportationExceptionDto,
  ExceptionCategory,
  ExceptionSeverity,
  UUID,
} from '@bilgenos/contracts';

export class TransportationException {
  private props: TransportationExceptionDto;

  constructor(props: TransportationExceptionDto) {
    this.props = { ...props };
  }

  public static create(props: Omit<TransportationExceptionDto, 'createdAt' | 'updatedAt' | 'resolved'>): TransportationException {
    const now = new Date().toISOString();
    return new TransportationException({
      ...props,
      resolved: false,
      createdAt: now,
      updatedAt: now,
    });
  }

  public get id(): UUID { return this.props.id; }
  public get tripId(): UUID | null | undefined { return this.props.tripId; }
  public get category(): ExceptionCategory { return this.props.category; }
  public get severity(): ExceptionSeverity { return this.props.severity; }
  public get description(): string { return this.props.description; }
  public get resolved(): boolean { return this.props.resolved; }

  public resolve(resolvedByUserId: UUID, notes?: string): void {
    this.props.resolved = true;
    this.props.resolvedAt = new Date().toISOString();
    this.props.resolvedByUserId = resolvedByUserId;
    this.props.resolutionNotes = notes ?? null;
    this.props.updatedAt = new Date().toISOString();
  }

  public toDto(): TransportationExceptionDto {
    return { ...this.props };
  }
}
