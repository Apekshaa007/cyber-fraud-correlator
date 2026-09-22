import React, { useState } from 'react';
import type { RecentEvidenceRecord } from '../../types';

interface RecentEvidenceProps {
  evidenceList: RecentEvidenceRecord[];
  onNavigateToUpload?: () => void;
}

export const RecentEvidence: React.FC<RecentEvidenceProps> = ({
  evidenceList,
  onNavigateToUpload,
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredEvidence = evidenceList.filter((item) => {
    if (filterType === 'ALL') return true;
    return item.fileType === filterType;
  });

  const getTypeBadgeClass = (fileType: string) => {
    switch (fileType) {
      case 'CSV':
        return 'type-badge-csv';
      case 'XLSX':
        return 'type-badge-xlsx';
      case 'JSON':
        return 'type-badge-json';
      case 'TXT':
        return 'type-badge-txt';
      default:
        return 'type-badge-default';
    }
  };

  return (
    <div className="recent-evidence-section">
      <div className="section-header-row">
        <div className="section-title-group">
          <h2 className="section-heading">Recent Evidence Activity</h2>
          <span className="section-subtext">
            Forensic artifacts ingested for DEMO-CASE-001 (Mock ledger records)
          </span>
        </div>

        <div className="section-actions-group">
          {/* File Type Filter */}
          <div className="type-filter-group">
            {['ALL', 'CSV', 'XLSX', 'JSON', 'TXT'].map((type) => (
              <button
                key={type}
                type="button"
                className={`filter-btn ${filterType === type ? 'active' : ''}`}
                onClick={() => setFilterType(type)}
              >
                {type}
              </button>
            ))}
          </div>

          {onNavigateToUpload && (
            <button
              type="button"
              className="btn-link-action"
              onClick={onNavigateToUpload}
            >
              + Ingest New Artifact
            </button>
          )}
        </div>
      </div>

      <div className="table-responsive-container">
        {filteredEvidence.length === 0 ? (
          <div className="empty-evidence-placeholder">
            <p>No evidence files match the selected filter.</p>
          </div>
        ) : (
          <table className="evidence-data-table">
            <thead>
              <tr>
                <th>Artifact Filename</th>
                <th>Type</th>
                <th>Uploaded Time</th>
                <th>Records Indexed</th>
                <th>Status</th>
                <th>Mock SHA-256 Checksum</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvidence.map((item) => (
                <tr key={item.id}>
                  <td className="cell-filename">
                    <div className="filename-wrapper">
                      <span className="file-icon" aria-hidden="true">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                        </svg>
                      </span>
                      <span className="file-name-text font-mono">{item.filename}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`file-type-pill ${getTypeBadgeClass(item.fileType)}`}>
                      {item.fileType}
                    </span>
                  </td>
                  <td className="cell-timestamp font-mono">{item.uploadedAt}</td>
                  <td className="cell-records">
                    <span className="records-count">{item.recordsCount.toLocaleString()} rows</span>
                    <span className="records-size font-mono">({item.fileSize})</span>
                  </td>
                  <td>
                    <span className="status-badge-mock">
                      <span className="status-dot"></span>
                      {item.status}
                    </span>
                  </td>
                  <td className="cell-hash font-mono" title={item.sha256}>
                    <span className="hash-preview">{item.sha256.substring(0, 24)}...</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="table-footer-notice">
        <span>Displaying {filteredEvidence.length} of {evidenceList.length} indexed forensic artifacts.</span>
        <span className="mock-notice-pill">ALL VALUES SIMULATED FOR MOCK TESTING</span>
      </div>
    </div>
  );
};
