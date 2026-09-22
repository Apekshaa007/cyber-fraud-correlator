export interface CaseInfo {
  caseId: string;
  caseTitle: string;
  status: string;
  classification: string;
  leadAnalyst: string;
  lastUpdated: string;
  isDemo: boolean;
}

export type StatCategory = 'evidence' | 'entities' | 'relationships' | 'red_flags' | 'high_priority';

export interface DashboardStatCard {
  id: string;
  label: string;
  value: number | string;
  subtext: string;
  badge?: string;
  category: StatCategory;
  isDemo: boolean;
}

export interface RecentEvidenceRecord {
  id: string;
  filename: string;
  fileType: 'CSV' | 'XLSX' | 'JSON' | 'TXT';
  uploadedAt: string;
  fileSize: string;
  status: 'Processed (Mock)' | 'Ready (Mock)' | 'Analyzed (Mock)';
  recordsCount: number;
  sha256: string;
  isDemo: boolean;
}

export interface MetricSummary {
  count: number;
  label: string;
  details: string;
  changeRate?: string;
}

export interface InvestigationOverviewData {
  evidenceProcessed: MetricSummary;
  entitiesDiscovered: MetricSummary;
  relationshipsDiscovered: MetricSummary;
  redFlagsDetected: MetricSummary;
  investigativeNotes: string[];
  isDemo: boolean;
}

export interface DashboardData {
  caseHeader: CaseInfo;
  stats: DashboardStatCard[];
  recentEvidence: RecentEvidenceRecord[];
  overview: InvestigationOverviewData;
}
