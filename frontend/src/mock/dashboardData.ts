import type { DashboardData } from '../types';

/**
 * Mock data for the Cyber Fraud Analysis & Digital Artifact Correlator Dashboard.
 * 
 * STRICT COMPLIANCE RULES:
 * - All data is explicitly flagged as DEMO/MOCK.
 * - Adheres to investigative safety rules (no accusations of guilt or criminal status).
 * - Preserves evidence chain-of-custody placeholders.
 */
export const MOCK_DASHBOARD_DATA: DashboardData = {
  caseHeader: {
    caseId: 'DEMO-CASE-001',
    caseTitle: 'Cyber Fraud Investigation',
    status: 'Analysis Ready',
    classification: 'Forensic Tier-1 / Restricted Sandbox',
    leadAnalyst: 'Lead Forensic Investigator',
    lastUpdated: '2026-09-21 14:32 IST',
    isDemo: true,
  },
  stats: [
    {
      id: 'stat-evidence-files',
      label: 'Evidence Files',
      value: 5,
      subtext: 'Ingested forensic artifacts',
      badge: 'DEMO DATA',
      category: 'evidence',
      isDemo: true,
    },
    {
      id: 'stat-entities',
      label: 'Entities',
      value: 28,
      subtext: 'Discovered across artifacts',
      badge: 'DEMO DATA',
      category: 'entities',
      isDemo: true,
    },
    {
      id: 'stat-relationships',
      label: 'Relationships',
      value: 47,
      subtext: 'Cross-artifact correlations',
      badge: 'DEMO DATA',
      category: 'relationships',
      isDemo: true,
    },
    {
      id: 'stat-red-flags',
      label: 'Red Flags',
      value: 8,
      subtext: 'Anomalies requiring verification',
      badge: 'DEMO DATA',
      category: 'red_flags',
      isDemo: true,
    },
    {
      id: 'stat-high-priority',
      label: 'High Priority Findings',
      value: 3,
      subtext: 'Pending analyst review',
      badge: 'DEMO DATA',
      category: 'high_priority',
      isDemo: true,
    },
  ],
  recentEvidence: [
    {
      id: 'evd-001',
      filename: 'CDR.csv',
      fileType: 'CSV',
      uploadedAt: '2026-09-21 09:10 IST',
      fileSize: '2.4 MB',
      status: 'Processed (Mock)',
      recordsCount: 1420,
      sha256: 'DEMO_MOCK_SHA256_e82f7c19a04b89df',
      isDemo: true,
    },
    {
      id: 'evd-002',
      filename: 'IPDR.csv',
      fileType: 'CSV',
      uploadedAt: '2026-09-21 09:42 IST',
      fileSize: '8.1 MB',
      status: 'Processed (Mock)',
      recordsCount: 8950,
      sha256: 'DEMO_MOCK_SHA256_b37d94f28c5a21e0',
      isDemo: true,
    },
    {
      id: 'evd-003',
      filename: 'Bank_Transactions.xlsx',
      fileType: 'XLSX',
      uploadedAt: '2026-09-21 10:15 IST',
      fileSize: '1.2 MB',
      status: 'Processed (Mock)',
      recordsCount: 340,
      sha256: 'DEMO_MOCK_SHA256_9c2184ad701f56be',
      isDemo: true,
    },
    {
      id: 'evd-004',
      filename: 'Device.json',
      fileType: 'JSON',
      uploadedAt: '2026-09-21 11:00 IST',
      fileSize: '412 KB',
      status: 'Processed (Mock)',
      recordsCount: 12,
      sha256: 'DEMO_MOCK_SHA256_5a49ef107c39201b',
      isDemo: true,
    },
    {
      id: 'evd-005',
      filename: 'Email.txt',
      fileType: 'TXT',
      uploadedAt: '2026-09-21 11:35 IST',
      fileSize: '64 KB',
      status: 'Processed (Mock)',
      recordsCount: 1,
      sha256: 'DEMO_MOCK_SHA256_31f7ba09e4d5882c',
      isDemo: true,
    },
  ],
  overview: {
    evidenceProcessed: {
      count: 5,
      label: 'Evidence Processed',
      details: '100% indexed across 5 forensic artifacts (CSV, XLSX, JSON, TXT)',
      changeRate: 'Fully Cataloged',
    },
    entitiesDiscovered: {
      count: 28,
      label: 'Entities Discovered',
      details: 'Identified phone numbers, bank accounts, IP addresses & device identifiers',
      changeRate: '+6 from IPDR correlation',
    },
    relationshipsDiscovered: {
      count: 47,
      label: 'Relationships Discovered',
      details: 'Co-occurrence, financial transfers & communication links detected',
      changeRate: '+14 cross-artifact links',
    },
    redFlagsDetected: {
      count: 8,
      label: 'Red Flags Detected',
      details: 'Shared identifier patterns & rapid transaction bursts flagged for verification',
      changeRate: 'Requires Analyst Review',
    },
    investigativeNotes: [
      'Forensic Notice: Shared IP or IMEI does not establish verified physical identity.',
      'Investigative Caution: Detected relationships represent correlation, not confirmation of guilt.',
      'Conflict Preservation: All contradictory timestamps and disputed accounts are preserved in the audit log.',
      'Chain-of-Custody: Mock artifact verification hashes simulate cryptographic integrity standards.',
    ],
    isDemo: true,
  },
};
