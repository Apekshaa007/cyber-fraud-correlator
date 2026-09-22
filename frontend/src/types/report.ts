import type { CaseInfo } from './dashboard';
import type { FindingItem } from './findings';
import type { TimelineEvent } from './timeline';

export interface ReportEvidenceItem {
  filename: string;
  type: string;
  size: string;
  recordsIndexed: number;
  sha256: string;
  ingestTimestamp: string;
  verificationStatus: string;
}

export interface ReportEntityCategorySummary {
  category: string;
  count: number;
  description: string;
  keyIdentifiers: string[];
}

export interface ReportProvenanceStep {
  stepNumber: number;
  stage: string;
  ruleName: string;
  artifactCitation: string;
  verificationMethod: string;
  status: string;
}

export interface InvestigationReportData {
  caseInfo: CaseInfo;
  reportMetadata: {
    reportId: string;
    generatedAt: string;
    classificationLevel: string;
    preparedBy: string;
    hashIntegrityVerified: boolean;
    isDemo: boolean;
  };
  executiveSummary: {
    overviewText: string[];
    investigativeCautionNotice: string;
    keyTakeaways: string[];
  };
  evidenceSummary: {
    totalArtifacts: number;
    totalIndexedRecords: number;
    artifacts: ReportEvidenceItem[];
  };
  entitySummary: {
    totalEntities: number;
    categories: ReportEntityCategorySummary[];
  };
  relationshipSummary: {
    totalRelationships: number;
    financialTransactionsCount: number;
    cellularAssociationsCount: number;
    networkGatewayMatchesCount: number;
    deviceBindingsCount: number;
    summaryText: string;
  };
  timelineSummary: {
    recordedSpan: string;
    totalEvents: number;
    flaggedAnomaliesCount: number;
    keyMilestones: TimelineEvent[];
  };
  findingsSummary: {
    totalFindings: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    findingsList: FindingItem[];
  };
  provenanceChain: {
    certificationStatement: string;
    steps: ReportProvenanceStep[];
  };
  investigatorSignoff: {
    analystName: string;
    role: string;
    organization: string;
    signoffTimestamp: string;
    auditStatus: string;
  };
}
