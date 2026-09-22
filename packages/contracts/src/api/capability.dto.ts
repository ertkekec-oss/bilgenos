import { BaseEntityDto, UUID } from '../shared/types.js';

export type CapabilityState = 'ENABLED' | 'READ_ONLY' | 'DISABLED' | 'SUSPENDED';

export type CapabilityKey =
  | 'ACADEMIC'
  | 'CURRICULUM'
  | 'ASSESSMENT'
  | 'QUESTION_BANK'
  | 'EXAM_PREP'
  | 'ATTENDANCE'
  | 'FINANCE'
  | 'TRANSPORTATION'
  | 'TRANSPORT_TRACKING'
  | 'CAFETERIA'
  | 'GUIDANCE'
  | 'CRM'
  | 'COMMUNICATION'
  | 'CAMPUS'
  | 'AI';

export interface InstitutionCapabilityDto extends BaseEntityDto {
  institutionId: UUID;
  capabilityKey: CapabilityKey;
  state: CapabilityState;
  settings?: Record<string, unknown>;
}

export interface SetCapabilityStateDto {
  capabilityKey: CapabilityKey;
  state: CapabilityState;
  settings?: Record<string, unknown>;
}
