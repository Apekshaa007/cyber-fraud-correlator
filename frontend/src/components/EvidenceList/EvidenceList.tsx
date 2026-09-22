import React, { useState } from 'react';
import type { EvidenceItem } from '../../types';
import { formatBytes } from '../../services/api';
import './EvidenceList.css';

interface EvidenceListProps {
  evidenceList: EvidenceItem[];
  caseId: string;
}

export const EvidenceList: React.FC<EvidenceListProps> = ({
  evidenceList,
  caseId,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const handleCopyHash = (sha256: string) => {
    navigator.clipboard.writeText(sha256).then(() => {
      setCopiedHash(sha256);
      setTimeout(() => setCopiedHash(null), 2000);
    });
  };

  const filteredList = evidenceList.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.filename.toLowerCase().includes(q) ||
      item.sha256.toLowerCase().includes(q) ||
      item.evidence_id.toLowerCase().includes(q);

    const matchesType =
      typeFilter === 'ALL' || item.file_type.toUpperCase() === typeFilter;

    return matchesSearch && matchesType;
  });

  const truncateHash = (hash: string) => {
    if (hash.length <= 20) return hash;
    return `${hash.substring(0, 14)}...${hash.substring(hash.length - 6)}`;
  };

  return (
    <div className="evidence-list-card">
      <div className="evidence-header">
        <div className="evidence-title-area">
          <h2 className="evidence-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
            Evidence Inventory
          </h2>
          <span className="artifact-counter">
            {filteredList.length} of {evidenceList.length} Artifacts
          </span>
        </div>

        {/* Search & Filter Controls */}
        <div className="evidence-controls">
          <div className="search-wrapper">
            <span className="search-icon" aria-hidden="true">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search filename or SHA-256..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search evidence artifacts"
            />
          </div>

          <div className="filter-pills" role="group" aria-label="Filter by file type">
            {(['ALL', 'CSV', 'XLSX', 'JSON', 'TXT'] as const).map((type) => (
              <button
                key={type}
                type="button"
                className={`filter-btn ${typeFilter === type ? 'active' : ''}`}
                onClick={() => setTypeFilter(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 7. Evidence Table */}
      <div className="table-responsive">
        <table className="evidence-table">
          <thead>
            <tr>
              <th scope="col" style={{ minWidth: '220px' }}>Filename</th>
              <th scope="col" style={{ width: '90px' }}>File Type</th>
              <th scope="col" style={{ width: '100px' }}>File Size</th>
              <th scope="col" style={{ minWidth: '230px' }}>
                SHA-256 <span className="mock-th-badge">(Mock / Demo)</span>
              </th>
              <th scope="col" style={{ width: '130px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-evidence-row">
                  <div className="empty-state-content">
                    <span className="empty-icon" aria-hidden="true">📁</span>
                    <strong>No evidence artifacts cataloged</strong>
                    <span className="empty-subtext">
                      {evidenceList.length === 0
                        ? `Submit digital artifacts for Case ${caseId || 'unassigned'} using the ingestion panel.`
                        : 'No evidence artifacts match the current filter or search criteria.'}
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredList.map((item) => {
                const upperType = item.file_type.toUpperCase();
                return (
                  <tr key={item.evidence_id}>
                    {/* Filename */}
                    <td>
                      <div className="file-cell">
                        <div className={`file-icon-badge ${upperType.toLowerCase()}`}>
                          📄
                        </div>
                        <div className="file-info">
                          <span className="file-name-text" title={item.filename}>
                            {item.filename}
                          </span>
                          <span className="file-subtext">
                            ID: {item.evidence_id} • Case: {item.case_id || caseId}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* File Type */}
                    <td>
                      <span className={`type-badge ${upperType}`}>
                        {upperType}
                      </span>
                    </td>

                    {/* File Size */}
                    <td className="size-cell">{formatBytes(item.file_size)}</td>

                    {/* SHA-256 (Explicitly marked as Mock / Demo) */}
                    <td>
                      <div className="hash-cell">
                        <span className="demo-hash-tag" title="Demo mock hash for local testing; not a real cryptographic hash">
                          MOCK
                        </span>
                        <code
                          className="hash-code"
                          title={`[DEMO / MOCK VALUE] Not a real cryptographic hash:\n${item.sha256}`}
                        >
                          {truncateHash(item.sha256)}
                        </code>
                        <button
                          type="button"
                          className={`copy-hash-btn ${copiedHash === item.sha256 ? 'copied' : ''}`}
                          onClick={() => handleCopyHash(item.sha256)}
                          title={copiedHash === item.sha256 ? 'Hash Copied!' : 'Copy mock SHA-256 string'}
                          aria-label={`Copy mock SHA-256 hash for ${item.filename}`}
                        >
                          {copiedHash === item.sha256 ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Status */}
                    <td>
                      <span className={`status-badge ${item.status.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>
                        <span className="status-dot-sm"></span>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
