import test from 'node:test';
import assert from 'node:assert/strict';


import {
  getFileTypeFromExtension,
  generateMockDemoSha256,
  formatBytes,
  uploadEvidence,
  INITIAL_EVIDENCE_LIST
} from './src/services/api.ts';

test('1. Supported file type detection: accepts CSV, XLSX, JSON, TXT (case-insensitive)', () => {
  assert.equal(getFileTypeFromExtension('evidence.csv'), 'CSV');
  assert.equal(getFileTypeFromExtension('data.CSV'), 'CSV');
  assert.equal(getFileTypeFromExtension('accounts.xlsx'), 'XLSX');
  assert.equal(getFileTypeFromExtension('TELEMETRY.XLSX'), 'XLSX');
  assert.equal(getFileTypeFromExtension('payload.json'), 'JSON');
  assert.equal(getFileTypeFromExtension('CONFIG.JSON'), 'JSON');
  assert.equal(getFileTypeFromExtension('notes.txt'), 'TXT');
  assert.equal(getFileTypeFromExtension('README.TXT'), 'TXT');
});

test('2. Unsupported file types are rejected', () => {
  assert.equal(getFileTypeFromExtension('malware.exe'), null);
  assert.equal(getFileTypeFromExtension('report.pdf'), null);
  assert.equal(getFileTypeFromExtension('script.py'), null);
  assert.equal(getFileTypeFromExtension('image.png'), null);
  assert.equal(getFileTypeFromExtension('no_extension'), null);
  assert.equal(getFileTypeFromExtension(''), null);
});

test('3. Byte formatting converts bytes to human-readable units', () => {
  assert.equal(formatBytes(0), '0 B');
  assert.equal(formatBytes(512), '512 B');
  assert.equal(formatBytes(1024), '1 KB');
  assert.equal(formatBytes(1024 * 1024), '1 MB');
  assert.equal(formatBytes(1572864), '1.5 MB');
});

test('4. Initial evidence list starts completely empty (zero invented fake evidence)', () => {
  assert.deepEqual(INITIAL_EVIDENCE_LIST, []);
});

test('5. Mock/demo SHA-256 is clearly labeled and not presented as a real calculated hash', () => {
  const mockHash = generateMockDemoSha256('test_evidence.csv');
  assert.ok(mockHash.startsWith('DEMO_MOCK_SHA256_'), `Hash should start with DEMO_MOCK_SHA256_, got ${mockHash}`);
  assert.ok(!mockHash.match(/^[a-f0-9]{64}$/), 'Hash must not look like a raw genuine 64-char hex hash');
});

test('6. Mock upload rejects empty or blank case ID', async () => {
  const fakeFile = new File(['content'], 'test.csv', { type: 'text/csv' });
  await assert.rejects(
    () => uploadEvidence('   ', fakeFile),
    /Case ID is required/
  );
});

test('7. Mock upload rejects unsupported file extension', async () => {
  const fakeFile = new File(['bad content'], 'malware.exe', { type: 'application/octet-stream' });
  await assert.rejects(
    () => uploadEvidence('CASE_001', fakeFile),
    /Unsupported file type/
  );
});

test('8. Mock upload simulates progression (Ready -> Uploading -> Uploaded) and returns mock artifact', async () => {
  const fakeFile = new File(['col1,col2\nval1,val2'], 'transactions.csv', { type: 'text/csv' });
  const progressReports = [];

  const result = await uploadEvidence('CASE_2026_TEST', fakeFile, (percent) => {
    progressReports.push(percent);
  });

  // Verify progress reports
  assert.ok(progressReports.length >= 3, 'Should report progress steps');
  assert.equal(progressReports[progressReports.length - 1], 100, 'Final progress should be 100%');

  // Verify mock evidence record structure
  assert.ok(result.evidence_id.startsWith('mock_evd_'));
  assert.equal(result.case_id, 'CASE_2026_TEST');
  assert.equal(result.filename, 'transactions.csv');
  assert.equal(result.file_type, 'CSV');
  assert.equal(result.file_size, fakeFile.size);
  assert.ok(result.sha256.startsWith('DEMO_MOCK_SHA256_'));
  assert.equal(result.status, 'Uploaded (Mock)');
  assert.equal(result.is_mock, true);
  assert.ok(result.uploaded_at);
});
