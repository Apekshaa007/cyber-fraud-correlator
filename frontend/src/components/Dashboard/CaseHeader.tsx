import React from 'react';
import type { CaseInfo } from '../../types';

interface CaseHeaderProps {
  caseInfo: CaseInfo;
}

export const CaseHeader: React.FC<CaseHeaderProps> = ({ caseInfo }) => {
  return (
    <div className="case-header-card">
      <div className="case-header-main">
        <div className="case-header-top">
          <div className="case-id-badge">
            <span className="case-badge-label">CASE ID:</span>
            <span className="case-badge-id">{caseInfo.caseId}</span>
          </div>

          <div className="case-status-cluster">
            <span className="status-pill status-ready">
              <span className="pulse-dot" aria-hidden="true"></span>
              {caseInfo.status}
            </span>
            <span className="demo-indicator-badge" title="This environment is populated with local mock data">
              DEMO / MOCK MODE
            </span>
          </div>
        </div>

        <h1 className="case-header-title">{caseInfo.caseTitle}</h1>
        <p className="case-header-subtitle">
          Digital artifact correlation workspace. Review discovered relationships, communication chains, and anomalous cross-evidence markers.
        </p>

        <div className="case-meta-row">
          <div className="meta-item">
            <span className="meta-label">Classification:</span>
            <span className="meta-value">{caseInfo.classification}</span>
          </div>
          <span className="meta-divider">•</span>
          <div className="meta-item">
            <span className="meta-label">Lead Investigator:</span>
            <span className="meta-value">{caseInfo.leadAnalyst}</span>
          </div>
          <span className="meta-divider">•</span>
          <div className="meta-item">
            <span className="meta-label">Last Ingest:</span>
            <span className="meta-value font-mono">{caseInfo.lastUpdated}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
