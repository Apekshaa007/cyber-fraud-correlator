import type { EntityType } from './graph';

export type FindingPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export type VerificationStatus =
  | 'Requires Verification'
  | 'Under Review'
  | 'Corroborated by Secondary Artifact'
  | 'Preserved Conflict';

export interface FindingEntityRef {
  id: string;
  label: string;
  identifier: string;
  type: EntityType;
}

export interface EvidenceProvenance {
  sourceFilename: string;
  reference: string;
  fileType: string;
  sha256: string;
  auditRuleTriggered: string;
  rawRecordExcerpt?: string;
}

export interface FindingItem {
  id: string;
  title: string;
  priority: FindingPriority;
  description: string;
  relatedEntities: FindingEntityRef[];
  evidenceSource: EvidenceProvenance;
  timestamp: string;
  confidence: number;
  verificationStatus: VerificationStatus;
  investigativeGuidance: string;
  isDemo: boolean;
}

export interface FindingFilterState {
  searchQuery: string;
  selectedPriority: string;
  selectedStatus: string;
}
