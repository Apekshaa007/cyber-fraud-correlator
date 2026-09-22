import test from 'node:test';
import assert from 'node:assert/strict';

// 1. Existing API tests verification
import {
  getFileTypeFromExtension,
  generateMockDemoSha256,
  formatBytes,
  uploadEvidence,
  INITIAL_EVIDENCE_LIST,
} from './src/services/api.ts';

// 2. Mock data verification
import { MOCK_DASHBOARD_DATA } from './src/mock/dashboardData.ts';
import {
  INITIAL_GRAPH_NODES,
  INITIAL_GRAPH_EDGES,
  MOCK_ENTITY_DETAILS,
  MOCK_RELATIONSHIP_DETAILS,
} from './src/mock/graphData.ts';
import { MOCK_TIMELINE_EVENTS } from './src/mock/timelineData.ts';
import { MOCK_FINDINGS } from './src/mock/findingsData.ts';
import { MOCK_REPORT_DATA } from './src/mock/reportData.ts';

test('1. Preserved Existing Functionality: File upload service', async () => {
  assert.equal(formatBytes(1024), '1 KB');
  assert.equal(getFileTypeFromExtension('CDR.csv'), 'CSV');

  assert.equal(getFileTypeFromExtension('Bank_Transactions.xlsx'), 'XLSX');
  assert.equal(getFileTypeFromExtension('Device.json'), 'JSON');
  assert.equal(getFileTypeFromExtension('Email.txt'), 'TXT');
  assert.equal(getFileTypeFromExtension('malware.exe'), null);

  assert.deepEqual(INITIAL_EVIDENCE_LIST, []);
  assert.ok(generateMockDemoSha256('test.csv').startsWith('DEMO_MOCK_SHA256_'));

  const file = new File(['mock content'], 'test.csv', { type: 'text/csv' });
  const result = await uploadEvidence('DEMO-CASE-001', file);
  assert.equal(result.case_id, 'DEMO-CASE-001');
  assert.equal(result.filename, 'test.csv');
  assert.equal(result.status, 'Uploaded (Mock)');
  assert.equal(result.is_mock, true);
});

test('2. Screen: Dashboard Mock Data Integrity', () => {
  const d = MOCK_DASHBOARD_DATA;
  assert.equal(d.caseHeader.caseId, 'DEMO-CASE-001');
  assert.equal(d.caseHeader.caseTitle, 'Cyber Fraud Investigation');
  assert.equal(d.caseHeader.status, 'Analysis Ready');
  assert.equal(d.caseHeader.isDemo, true);

  assert.equal(d.stats.length, 5);
  const statLabels = d.stats.map((s) => s.label);
  assert.ok(statLabels.includes('Evidence Files'));
  assert.ok(statLabels.includes('Entities'));
  assert.ok(statLabels.includes('Relationships'));
  assert.ok(statLabels.includes('Red Flags'));
  assert.ok(statLabels.includes('High Priority Findings'));

  assert.equal(d.recentEvidence.length, 5);
  const filenames = d.recentEvidence.map((e) => e.filename);
  assert.ok(filenames.includes('CDR.csv'));
  assert.ok(filenames.includes('IPDR.csv'));
  assert.ok(filenames.includes('Bank_Transactions.xlsx'));
  assert.ok(filenames.includes('Device.json'));
  assert.ok(filenames.includes('Email.txt'));

  assert.equal(d.overview.evidenceProcessed.count, 5);
  assert.equal(d.overview.entitiesDiscovered.count, 28);
  assert.equal(d.overview.relationshipsDiscovered.count, 47);
  assert.equal(d.overview.redFlagsDetected.count, 8);
});

test('3. Screen: Fraud Relationship Graph & Nodes/Edges Integrity', () => {
  assert.equal(INITIAL_GRAPH_NODES.length, 7);
  assert.equal(INITIAL_GRAPH_EDGES.length, 7);

  const nodeTypes = new Set(INITIAL_GRAPH_NODES.map((n) => n.data.entityType));
  assert.ok(nodeTypes.has('Account'));
  assert.ok(nodeTypes.has('Phone'));
  assert.ok(nodeTypes.has('IP'));
  assert.ok(nodeTypes.has('Device'));
  assert.ok(nodeTypes.has('Transaction'));

  for (const node of INITIAL_GRAPH_NODES) {
    assert.ok(MOCK_ENTITY_DETAILS[node.id], `Node ${node.id} must exist in MOCK_ENTITY_DETAILS`);
    const detail = MOCK_ENTITY_DETAILS[node.id];
    assert.equal(detail.id, node.id);
    assert.ok(detail.identifier.length > 0);
    assert.ok(detail.evidenceSources.length > 0);
    assert.ok(detail.relatedEntities.length > 0);
  }

  for (const edge of INITIAL_GRAPH_EDGES) {
    assert.ok(MOCK_RELATIONSHIP_DETAILS[edge.id], `Edge ${edge.id} must exist in MOCK_RELATIONSHIP_DETAILS`);
    const rel = MOCK_RELATIONSHIP_DETAILS[edge.id];
    assert.equal(rel.sourceId, edge.source);
    assert.equal(rel.targetId, edge.target);
    assert.ok(rel.confidence >= 0 && rel.confidence <= 1);
    assert.ok(rel.whyConnected);
    assert.ok(rel.whyConnected.supportingBullets.length >= 2);
  }
});

test('4. Screen: Why Connected & Forensic Chain Integrity', () => {
  const edge = MOCK_RELATIONSHIP_DETAILS['edge-accA-txnA'];
  assert.ok(edge);
  assert.equal(edge.amount, '₹42,000');
  assert.equal(edge.evidenceSource, 'Bank_Transactions.xlsx');
  assert.equal(edge.rowReference, 'Row 183');
  assert.ok(edge.confidence >= 0.95);

  const why = edge.whyConnected;
  assert.ok(why.evidenceSummary.length > 0);
  assert.ok(why.relationshipDescription.length > 0);
  assert.ok(why.reason.length > 0);
  assert.ok(why.supportingBullets.length >= 3);
  assert.equal(why.evidenceSource, 'Bank_Transactions.xlsx');
});

test('5. Screen: Timeline Chronological Integrity', () => {
  assert.equal(MOCK_TIMELINE_EVENTS.length, 12);

  for (let i = 0; i < MOCK_TIMELINE_EVENTS.length; i++) {
    const evt = MOCK_TIMELINE_EVENTS[i];
    assert.ok(evt.id);
    assert.ok(evt.timestamp);
    assert.ok(evt.eventLabel);
    assert.ok(evt.primaryEntity);
    assert.ok(evt.evidenceSource.filename);
    assert.equal(evt.isDemo, true);

    if (i > 0) {
      const prev = MOCK_TIMELINE_EVENTS[i - 1];
      assert.ok(
        evt.timestamp >= prev.timestamp,
        `Events should be in chronological order: ${prev.timestamp} <= ${evt.timestamp}`
      );
    }
  }
});

test('6. Screen: Findings & Red Flags Integrity', () => {
  assert.equal(MOCK_FINDINGS.length, 6);

  const priorities = new Set(MOCK_FINDINGS.map((f) => f.priority));
  assert.ok(priorities.has('Critical'));
  assert.ok(priorities.has('High'));
  assert.ok(priorities.has('Medium'));
  assert.ok(priorities.has('Low'));

  for (const finding of MOCK_FINDINGS) {
    assert.ok(finding.title.length > 0);
    assert.ok(finding.description.length > 0);
    assert.ok(finding.relatedEntities.length > 0);
    assert.ok(finding.evidenceSource.sourceFilename.length > 0);
    assert.ok(finding.evidenceSource.auditRuleTriggered.length > 0);
    assert.ok(finding.evidenceSource.sha256.startsWith('DEMO_MOCK_SHA256_'));
    assert.ok(finding.confidence > 0 && finding.confidence <= 1);
    assert.equal(finding.isDemo, true);
  }
});

test('7. Screen: Investigation Report Dossier Integrity', () => {
  const r = MOCK_REPORT_DATA;
  assert.equal(r.caseInfo.caseId, 'DEMO-CASE-001');
  assert.equal(r.reportMetadata.reportId, 'REP-2026-001-DEMO');
  assert.equal(r.reportMetadata.isDemo, true);

  assert.ok(r.executiveSummary.overviewText.length >= 3);
  assert.ok(r.executiveSummary.keyTakeaways.length >= 4);
  assert.ok(r.executiveSummary.investigativeCautionNotice.includes('SAFEGUARD'));

  assert.equal(r.evidenceSummary.totalArtifacts, 5);
  assert.equal(r.evidenceSummary.artifacts.length, 5);

  assert.equal(r.entitySummary.totalEntities, 28);
  assert.ok(r.entitySummary.categories.length >= 4);

  assert.equal(r.relationshipSummary.totalRelationships, 47);

  assert.ok(r.provenanceChain.steps.length >= 4);
  assert.ok(r.investigatorSignoff.analystName);
});

test('8. Rule 15 Compliance: Neutral Investigative Wording', () => {
  const allText = JSON.stringify({
    dashboard: MOCK_DASHBOARD_DATA,
    graphEntities: MOCK_ENTITY_DETAILS,
    graphRels: MOCK_RELATIONSHIP_DETAILS,
    timeline: MOCK_TIMELINE_EVENTS,
    findings: MOCK_FINDINGS,
    report: MOCK_REPORT_DATA,
  }).toLowerCase();

  const forbiddenTerms = [
    'confirmed criminal',
    'guilty',
    'definitely fraudulent',
    'criminal account',
  ];

  for (const term of forbiddenTerms) {
    assert.ok(!allText.includes(term), `Mock data must not include forbidden biased phrase: "${term}"`);
  }
});
