import type { InvestigationReportData } from '../types/index.ts';
import { MOCK_FINDINGS } from './findingsData.ts';
import { MOCK_TIMELINE_EVENTS } from './timelineData.ts';


export const MOCK_REPORT_DATA: InvestigationReportData = {
  caseInfo: {
    caseId: 'DEMO-CASE-001',
    caseTitle: 'Cyber Fraud Investigation & Digital Artifact Correlation Dossier',
    status: 'Analysis Ready (Forensic Review Complete)',
    classification: 'Forensic Tier-1 / Restricted Sandbox',
    leadAnalyst: 'Lead Forensic Investigator',
    lastUpdated: '2026-09-22 02:30 IST',
    isDemo: true,
  },
  reportMetadata: {
    reportId: 'REP-2026-001-DEMO',
    generatedAt: '2026-09-22 02:30:15 IST',
    classificationLevel: 'LAW ENFORCEMENT & FORENSIC ANALYST EYES ONLY — SIMULATED DEMO',
    preparedBy: 'Digital Forensics & Artifact Correlation Engine v0.1.0',
    hashIntegrityVerified: true,
    isDemo: true,
  },
  executiveSummary: {
    overviewText: [
      'This investigative report compiles cross-artifact correlations synthesized from five digital evidentiary files (CDR.csv, IPDR.csv, Bank_Transactions.xlsx, Device.json, and Email.txt) associated with Case DEMO-CASE-001.',
      'Correlation algorithms identified 28 distinct entities spanning bank accounts, cellular subscriber MSISDNs, IP gateway sessions, and mobile hardware identifiers, interconnected through 47 observed relationships.',
      'Analysis flagged a primary transaction vector involving an outward transfer of ₹42,000 (TXN-2026-9812) from Account A (DEMO-ACC-001) to intermediary Account B (DEMO-ACC-002), followed rapidly by an attempted cash-out withdrawal of ₹40,000 within 6 minutes.',
      'IPDR session correlation detected concurrent gateway IP usage (192.168.1.105) between Account A authentication and Phone B cellular data sessions within a 4-minute temporal proximity window.',
    ],
    investigativeCautionNotice:
      'IMPORTANT FORENSIC SAFEGUARD: Shared public IP addresses or cellular tower sectors do NOT establish verified physical identity or criminal culpability. Correlation indicates technical co-occurrence requiring independent human investigator verification. Preserved conflicts remain active in the case ledger.',
    keyTakeaways: [
      'Origin account DEMO-ACC-001 initiated ₹42,000 electronic funds debit via IMPS at 14:32 IST.',
      'Beneficiary account DEMO-ACC-002 credited at 14:32 IST with immediate ATM withdrawal request at 14:38 IST.',
      'Identical public IP gateway 192.168.1.105 observed routing both Account A and Phone B data connections.',
      'Device B (IMEI: 864209041234567) registered new banking token at 14:35 IST from unverified network.',
    ],
  },
  evidenceSummary: {
    totalArtifacts: 5,
    totalIndexedRecords: 10723,
    artifacts: [
      {
        filename: 'CDR.csv',
        type: 'CSV',
        size: '2.4 MB',
        recordsIndexed: 1420,
        sha256: 'DEMO_MOCK_SHA256_e82f7c19a04b89df',
        ingestTimestamp: '2026-09-21 09:10 IST',
        verificationStatus: 'SHA-256 Verified (Mock)',
      },
      {
        filename: 'IPDR.csv',
        type: 'CSV',
        size: '8.1 MB',
        recordsIndexed: 8950,
        sha256: 'DEMO_MOCK_SHA256_b37d94f28c5a21e0',
        ingestTimestamp: '2026-09-21 09:42 IST',
        verificationStatus: 'SHA-256 Verified (Mock)',
      },
      {
        filename: 'Bank_Transactions.xlsx',
        type: 'XLSX',
        size: '1.2 MB',
        recordsIndexed: 340,
        sha256: 'DEMO_MOCK_SHA256_9c2184ad701f56be',
        ingestTimestamp: '2026-09-21 10:15 IST',
        verificationStatus: 'SHA-256 Verified (Mock)',
      },
      {
        filename: 'Device.json',
        type: 'JSON',
        size: '412 KB',
        recordsIndexed: 12,
        sha256: 'DEMO_MOCK_SHA256_5a49ef107c39201b',
        ingestTimestamp: '2026-09-21 11:00 IST',
        verificationStatus: 'SHA-256 Verified (Mock)',
      },
      {
        filename: 'Email.txt',
        type: 'TXT',
        size: '64 KB',
        recordsIndexed: 1,
        sha256: 'DEMO_MOCK_SHA256_31f7ba09e4d5882c',
        ingestTimestamp: '2026-09-21 11:35 IST',
        verificationStatus: 'SHA-256 Verified (Mock)',
      },
    ],
  },
  entitySummary: {
    totalEntities: 28,
    categories: [
      {
        category: 'Bank Accounts',
        count: 4,
        description: 'Origin, beneficiary, and secondary intermediary settlement accounts.',
        keyIdentifiers: ['DEMO-ACC-001 (Account A)', 'DEMO-ACC-002 (Account B)'],
      },
      {
        category: 'Phone Numbers (MSISDN)',
        count: 7,
        description: 'Subscriber lines identified in CDR call sessions and banking SMS alerts.',
        keyIdentifiers: ['+91 98765 43210 (Phone A)', '+91 91234 56789 (Phone B)'],
      },
      {
        category: 'IP Addresses',
        count: 9,
        description: 'Public gateway and broadband subnet routing identifiers logged in IPDR data.',
        keyIdentifiers: ['192.168.1.105 (Gateway A)', '103.21.244.0 (Subnet B)'],
      },
      {
        category: 'Hardware & Devices',
        count: 3,
        description: 'Mobile handsets and hardware tokens identified via device telemetry.',
        keyIdentifiers: ['IMEI: 864209041234567 (Device B / Pixel 7)'],
      },
      {
        category: 'Transactions',
        count: 5,
        description: 'Disputed fund transfers and rapid withdrawal cash-out attempts.',
        keyIdentifiers: ['TXN-2026-9812 (₹42,000)', 'WDL-2026-0041 (₹40,000)'],
      },
    ],
  },
  relationshipSummary: {
    totalRelationships: 47,
    financialTransactionsCount: 14,
    cellularAssociationsCount: 18,
    networkGatewayMatchesCount: 10,
    deviceBindingsCount: 5,
    summaryText:
      'Cross-artifact correlation synthesized 47 links connecting accounts to cellular devices, transactional beneficiaries, and shared internet routing nodes. Strongest linkages exist between Account A, Transaction TXN-2026-9812, and Account B (0.98 confidence), and between Phone A and Account A registration (0.95 confidence).',
  },
  timelineSummary: {
    recordedSpan: '2026-09-20 09:10 IST to 14:38 IST (5 hours 28 minutes)',
    totalEvents: 12,
    flaggedAnomaliesCount: 4,
    keyMilestones: MOCK_TIMELINE_EVENTS.slice(0, 6),
  },
  findingsSummary: {
    totalFindings: 6,
    criticalCount: 1,
    highCount: 2,
    mediumCount: 2,
    lowCount: 1,
    findingsList: MOCK_FINDINGS,
  },
  provenanceChain: {
    certificationStatement:
      'All digital artifacts cataloged in this dossier have been verified against simulated SHA-256 cryptographic checkpoints in compliance with Digital Evidence Chain-of-Custody Level 2 protocols.',
    steps: [
      {
        stepNumber: 1,
        stage: 'Artifact Intake & Hash Verification',
        ruleName: 'RULE_INGEST_SHA256_INTEGRITY',
        artifactCitation: 'CDR.csv, Bank_Transactions.xlsx, IPDR.csv, Device.json, Email.txt',
        verificationMethod: 'Cryptographic Checksum Registry',
        status: 'Integrity Verified',
      },
      {
        stepNumber: 2,
        stage: 'Entity Extraction & Token Normalization',
        ruleName: 'RULE_EXTRACT_BANK_MSISDN_IP',
        artifactCitation: 'Cross-file regex parsing & schema normalization',
        verificationMethod: 'Multi-Schema Ingestion Engine',
        status: '28 Entities Mapped',
      },
      {
        stepNumber: 3,
        stage: 'Cross-Artifact Topological Correlation',
        ruleName: 'RULE_CORRELATE_TOPOLOGY_V2',
        artifactCitation: 'Graph edge linking engine',
        verificationMethod: 'Adjacency Matrix Co-occurrence Solver',
        status: '47 Links Synthesized',
      },
      {
        stepNumber: 4,
        stage: 'Anomaly Detection & Red Flag Scoring',
        ruleName: 'RULE_VELOCITY_FAST_CASHOUT_V2',
        artifactCitation: 'Bank_Transactions.xlsx Row 194 & IPDR.csv Row 230',
        verificationMethod: 'Temporal Burst & Gateway Proximity Scorer',
        status: '6 Red Flags Documented',
      },
    ],
  },
  investigatorSignoff: {
    analystName: 'Lead Cyber Fraud Analyst (Badge #CFD-8802)',
    role: 'Senior Digital Forensics Examiner',
    organization: 'Cyber Fraud Digital Artifacts Investigation Unit',
    signoffTimestamp: '2026-09-22 02:30:00 IST',
    auditStatus: 'CHAIN-OF-CUSTODY AUDIT LEVEL 2 • MOCK CERTIFICATION',
  },
};
