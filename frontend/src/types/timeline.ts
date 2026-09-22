import type { EntityType } from './graph';

export type TimelineEventType =
  | 'Evidence_Ingested'
  | 'Authentication_Event'
  | 'Transaction_Executed'
  | 'Communication_Session'
  | 'Red_Flag_Detected'
  | 'Entity_Identified';

export type TimelineEventSeverity = 'normal' | 'notice' | 'flagged';

export interface TimelineEntityRef {
  id: string;
  label: string;
  type: EntityType;
  identifier: string;
}

export interface TimelineEvidenceSource {
  filename: string;
  reference: string;
  type: string;
  sha256?: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  date: string;
  time: string;
  eventType: TimelineEventType;
  eventLabel: string;
  primaryEntity: TimelineEntityRef;
  secondaryEntity?: TimelineEntityRef;
  description: string;
  evidenceSource: TimelineEvidenceSource;
  severity: TimelineEventSeverity;
  metadata?: Record<string, string | number>;
  isDemo: boolean;
}

export interface TimelineFilterState {
  searchQuery: string;
  selectedEventType: string;
  selectedEntityType: string;
  sortOrder: 'asc' | 'desc';
}
