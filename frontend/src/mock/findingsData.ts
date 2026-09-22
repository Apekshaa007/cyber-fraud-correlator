import type { FindingItem } from '../types';

/**
 * Mock Findings & Red Flags for DEMO-CASE-001.
 * STRICT INVESTIGATIVE PROTOCOL:
 * - Neutral terminology ("Potential anomaly detected", "Requires verification", "Shared identifier").
 * - Does NOT state or imply guilt.
 * - Explicit demo/mock designation.
 */
export const MOCK_FINDINGS: FindingItem[] = [
  {
    id: 'finding-001',
    title: 'Rapid Fund Depletion Attempt',
    priority: 'Critical',
    description: 'Potential anomaly detected: Immediate ATM debit request of ₹40,000 initiated within 6 minutes of receiving an inward electronic transfer of ₹42,000 from origin Account A.',
    relatedEntities: [
      {
        id: 'node-acc-b',
        label: 'Account B (Beneficiary)',
        identifier: 'DEMO-ACC-002',
        type: 'Account',
      },
      {
        id: 'node-txn-a',
        label: 'Transaction A',
        identifier: 'TXN-2026-9812',
        type: 'Transaction',
      },
    ],
    evidenceSource: {
      sourceFilename: 'Bank_Transactions.xlsx',
      reference: 'Row 194',
      fileType: 'XLSX',
      sha256: 'DEMO_MOCK_SHA256_9c2184ad701f56be',
      auditRuleTriggered: 'RULE_VELOCITY_FAST_CASHOUT_V2',
      rawRecordExcerpt: 'TXN_ID: WDL-2026-0041 | AMT: ₹40,000.00 | ACC: DEMO-ACC-002 | TIME: 14:38:12 IST | STATUS: PENDING_ANALYST_HOLD',
    },
    timestamp: '2026-09-20 14:38 IST',
    confidence: 0.96,
    verificationStatus: 'Under Review',
    investigativeGuidance: 'Cross-reference with physical ATM CCTV records and verify beneficiary identity prior to administrative disposition.',
    isDemo: true,
  },
  {
    id: 'finding-002',
    title: 'Shared Public Gateway IP Overlap',
    priority: 'High',
    description: 'Potential anomaly detected: Two distinct entities (Account A banking login and Phone B cellular data session) routed traffic through identical public gateway IP address within a 4-minute proximity window.',
    relatedEntities: [
      {
        id: 'node-ip-a',
        label: 'IP Address A (Gateway)',
        identifier: '192.168.1.105',
        type: 'IP',
      },
      {
        id: 'node-acc-a',
        label: 'Account A (Origin)',
        identifier: 'DEMO-ACC-001',
        type: 'Account',
      },
      {
        id: 'node-phone-b',
        label: 'Phone B',
        identifier: '+91 91234 56789',
        type: 'Phone',
      },
    ],
    evidenceSource: {
      sourceFilename: 'IPDR.csv',
      reference: 'Rows 104, 230',
      fileType: 'CSV',
      sha256: 'DEMO_MOCK_SHA256_b37d94f28c5a21e0',
      auditRuleTriggered: 'RULE_NET_CORRELATION_SHARED_GATEWAY',
      rawRecordExcerpt: 'SRC_IP: 192.168.1.105 | DST_PORT: 443 | PROTO: TCP | SESSIONS: [ACC_A_LOGIN @ 14:30, MSISDN_B_DATA @ 14:34]',
    },
    timestamp: '2026-09-20 14:34 IST',
    confidence: 0.88,
    verificationStatus: 'Requires Verification',
    investigativeGuidance: 'Investigative Notice: Shared IP does not prove individual identity or shared ownership. Determine whether source is a residential NAT or public Wi-Fi hotspot.',
    isDemo: true,
  },
  {
    id: 'finding-003',
    title: 'High Velocity Electronic Funds Transfer',
    priority: 'High',
    description: 'High-value funds transfer (₹42,000) executed via IMPS immediate settlement immediately following initial authentication session from a previously unrecorded IP gateway.',
    relatedEntities: [
      {
        id: 'node-acc-a',
        label: 'Account A (Origin)',
        identifier: 'DEMO-ACC-001',
        type: 'Account',
      },
      {
        id: 'node-acc-b',
        label: 'Account B (Beneficiary)',
        identifier: 'DEMO-ACC-002',
        type: 'Account',
      },
      {
        id: 'node-txn-a',
        label: 'Transaction A',
        identifier: 'TXN-2026-9812',
        type: 'Transaction',
      },
    ],
    evidenceSource: {
      sourceFilename: 'Bank_Transactions.xlsx',
      reference: 'Row 183',
      fileType: 'XLSX',
      sha256: 'DEMO_MOCK_SHA256_9c2184ad701f56be',
      auditRuleTriggered: 'RULE_TXN_BURST_OUTWARD_NEW_BENEFICIARY',
      rawRecordExcerpt: 'TXN_REF: TXN-2026-9812 | MODE: IMPS | DEBIT: DEMO-ACC-001 | CREDIT: DEMO-ACC-002 | AMT: ₹42,000 | TIME: 14:32:45 IST',
    },
    timestamp: '2026-09-20 14:32 IST',
    confidence: 0.98,
    verificationStatus: 'Corroborated by Secondary Artifact',
    investigativeGuidance: 'Settlement confirmed on banking ledger. Requires confirmation of sender authorization through registered contact channels.',
    isDemo: true,
  },
  {
    id: 'finding-004',
    title: 'Device Token Hardware Discrepancy',
    priority: 'Medium',
    description: 'Mobile banking application binding registered for Device B reflects hardware token and IMEI differing from historic account profile access patterns.',
    relatedEntities: [
      {
        id: 'node-device-b',
        label: 'Device B (Handset)',
        identifier: 'IMEI: 864209041234567',
        type: 'Device',
      },
      {
        id: 'node-acc-b',
        label: 'Account B (Beneficiary)',
        identifier: 'DEMO-ACC-002',
        type: 'Account',
      },
    ],
    evidenceSource: {
      sourceFilename: 'Device.json',
      reference: 'Object #3',
      fileType: 'JSON',
      sha256: 'DEMO_MOCK_SHA256_5a49ef107c39201b',
      auditRuleTriggered: 'RULE_DEVICE_FINGERPRINT_ANOMALY',
      rawRecordExcerpt: '{"device_id": "DEV-003", "imei": "864209041234567", "model": "Pixel 7", "os": "Android 13", "binding_date": "2026-09-20T14:35:00Z"}',
    },
    timestamp: '2026-09-20 14:35 IST',
    confidence: 0.82,
    verificationStatus: 'Under Review',
    investigativeGuidance: 'Device fingerprint confirms application token generation. Request hardware installation telemetry and SIM carrier binding history.',
    isDemo: true,
  },
  {
    id: 'finding-005',
    title: 'Off-Hours Cell Tower Co-occurrence',
    priority: 'Medium',
    description: 'Cellular CDR analysis identifies concurrent cell tower sector ping between Phone A and the target geographic transmission radius during authentication sequence.',
    relatedEntities: [
      {
        id: 'node-phone-a',
        label: 'Phone A',
        identifier: '+91 98765 43210',
        type: 'Phone',
      },
    ],
    evidenceSource: {
      sourceFilename: 'CDR.csv',
      reference: 'Row 58',
      fileType: 'CSV',
      sha256: 'DEMO_MOCK_SHA256_e82f7c19a04b89df',
      auditRuleTriggered: 'RULE_TELCO_CELL_TOWER_COOCCURRENCE',
      rawRecordExcerpt: 'MSISDN: +919876543210 | CGI: 404-12-882-01 | AZIMUTH: 120 | DURATION: 142s | CALL_TYPE: DATA_SESSION',
    },
    timestamp: '2026-09-20 12:20 IST',
    confidence: 0.79,
    verificationStatus: 'Requires Verification',
    investigativeGuidance: 'Cellular tower sector telemetry indicates antenna area coverage only, not specific geographic pin-point coordinates.',
    isDemo: true,
  },
  {
    id: 'finding-006',
    title: 'Disposable Webmail Domain Pattern in Disputed Artifact',
    priority: 'Low',
    description: 'Electronic correspondence header analysis in Email.txt reveals transient MX record routing associated with digital notification records.',
    relatedEntities: [
      {
        id: 'node-acc-a',
        label: 'Account A',
        identifier: 'DEMO-ACC-001',
        type: 'Account',
      },
    ],
    evidenceSource: {
      sourceFilename: 'Email.txt',
      reference: 'Line 14',
      fileType: 'TXT',
      sha256: 'DEMO_MOCK_SHA256_31f7ba09e4d5882c',
      auditRuleTriggered: 'RULE_MAIL_DISPOSABLE_DOMAIN_MATCH',
      rawRecordExcerpt: 'Return-Path: <notice@transient-relay-demo.net> | Received-SPF: Pass | DKIM-Signature: v=1; d=transient-relay-demo.net',
    },
    timestamp: '2026-09-21 11:35 IST',
    confidence: 0.71,
    verificationStatus: 'Preserved Conflict',
    investigativeGuidance: 'Domain registration records may indicate third-party notification forwarder. Preserved in evidence ledger pending registrar audit.',
    isDemo: true,
  },
];
