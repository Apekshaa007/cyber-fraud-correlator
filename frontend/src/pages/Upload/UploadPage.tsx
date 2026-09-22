import React, { useState, useMemo } from 'react';
import { EvidenceUpload } from '../../components/EvidenceUpload/EvidenceUpload';
import { EvidenceList } from '../../components/EvidenceList/EvidenceList';
import type { EvidenceItem } from '../../types';
import { INITIAL_EVIDENCE_LIST, formatBytes } from '../../services/api';
import './UploadPage.css';

export const UploadPage: React.FC = () => {
  const [caseId, setCaseId] = useState<string>('DEMO-CASE-001');
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>(INITIAL_EVIDENCE_LIST);

  const handleEvidenceUploaded = (newEvidence: EvidenceItem) => {
    // Prepend newly ingested evidence artifact
    setEvidenceList((prev) => [newEvidence, ...prev]);
  };

  const totalBytes = useMemo(() => {
    return evidenceList.reduce((acc, curr) => acc + curr.file_size, 0);
  }, [evidenceList]);

  return (
    <div className="upload-page-container">
      {/* Top Investigator Context Header */}
      <div className="page-top-bar">
        <div className="page-title-group">
          <div className="case-badge-row">
            <span className="active-case-tag">
              <span className="case-pulse-dot" aria-hidden="true"></span>
              Active Case: {caseId.trim() || 'UNASSIGNED'}
            </span>
            <span className="mode-tag">Mock Testing Mode</span>
          </div>
          <h1 className="page-main-heading">Evidence Upload & Custody Ledger</h1>
          <p className="page-main-description">
            Ingest digital fraud artifacts (CSV, XLSX, JSON, TXT). Mock SHA-256 values are cataloged upon upload for UI analysis testing.
          </p>
        </div>

        {/* Quick Forensic Metrics */}
        <div className="metrics-strip">
          <div className="metric-pill">
            <span className="metric-label">Ingested Artifacts</span>
            <span className="metric-value">{evidenceList.length}</span>
          </div>
          <div className="metric-pill">
            <span className="metric-label">Total Indexed Size</span>
            <span className="metric-value">{formatBytes(totalBytes)}</span>
          </div>
        </div>
      </div>

      {/* Main Forensic Workspace Grid */}
      <div className="upload-grid">
        {/* Left: Evidence Upload Component */}
        <EvidenceUpload
          caseId={caseId}
          onCaseIdChange={setCaseId}
          onEvidenceUploaded={handleEvidenceUploaded}
        />

        {/* Right: Ingested Evidence Inventory Table */}
        <EvidenceList evidenceList={evidenceList} caseId={caseId} />
      </div>
    </div>
  );
};

export default UploadPage;
