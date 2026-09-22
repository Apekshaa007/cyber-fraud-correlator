export type EntityType = 'Account' | 'Phone' | 'IP' | 'Device' | 'Transaction';

export type RelationshipType =
  | 'Transaction'
  | 'Registered_Phone'
  | 'Login_IP'
  | 'Device_Access'
  | 'Co_occurrence'
  | 'OTP_Auth';

export interface EvidenceReference {
  filename: string;
  reference: string;
  type: string;
  sha256?: string;
}

export interface RelatedEntitySummary {
  id: string;
  label: string;
  type: EntityType;
  relationship: string;
}

export interface EntityDetail {
  id: string;
  entityType: EntityType;
  identifier: string;
  label: string;
  totalConnections: number;
  riskIndicator: 'low' | 'medium' | 'high' | 'neutral';
  status: string;
  evidenceSources: EvidenceReference[];
  relatedEntities: RelatedEntitySummary[];
  notes?: string;
  isDemo: boolean;
}

export interface WhyConnectedExplanation {
  evidenceSummary: string;
  relationshipDescription: string;
  reason: string;
  supportingBullets: string[];
  evidenceSource: string;
  rowReference: string;
  confidence: number;
}

export interface RelationshipDetail {
  id: string;
  sourceId: string;
  sourceLabel: string;
  sourceType: EntityType;
  targetId: string;
  targetLabel: string;
  targetType: EntityType;
  relationshipType: string;
  amount?: string;
  timestamp: string;
  evidenceSource: string;
  rowReference: string;
  confidence: number;
  whyConnected: WhyConnectedExplanation;
  isDemo: boolean;
}

export interface GraphNodeData extends Record<string, unknown> {
  entityType: EntityType;
  identifier: string;
  label: string;
  connectionsCount: number;
  riskIndicator: 'low' | 'medium' | 'high' | 'neutral';
  isDemo: boolean;
}

export interface GraphEdgeData extends Record<string, unknown> {
  relationshipType: string;
  amount?: string;
  confidence: number;
  evidenceSource: string;
  rowReference: string;
}
