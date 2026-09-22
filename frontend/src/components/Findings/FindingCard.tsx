import React, { useState } from 'react';
import type { FindingItem } from '../../types';

interface FindingCardProps {
  finding: FindingItem;
}

export const FindingCard: React.FC<FindingCardProps> = ({ finding }) => {
  const [isProvenanceExpanded, setIsProvenanceExpanded] = useState<boolean>(false);

  const getPriorityStyle = (priority: FindingItem['priority']) => {
    switch (priority) {
      case 'Critical':
        return { label: 'CRITICAL PRIORITY', className: 'priority-critical' };
      case 'High':
        return { label: 'HIGH PRIORITY', className: 'priority-high' };
      case 'Medium':
        return { label: 'MEDIUM PRIORITY', className: 'priority-medium' };
      case 'Low':
        return { label: 'LOW PRIORITY', className: 'priority-low' };
      default:
        return { label: priority, className: 'priority-default' };
    }
  };

  const getStatusStyle = (status: FindingItem['verificationStatus']) => {
    switch (status) {
      case 'Requires Verification':
        return 'status-requires-verification';
      case 'Under Review':
        return 'status-under-review';
      case 'Corroborated by Secondary Artifact':
        return 'status-corroborated';
      case 'Preserved Conflict':
        return 'status-conflict';
      default:
        return 'status-default';
    }
  };

  const priorityInfo = getPriorityStyle(finding.priority);

  return (
    <div className={`finding-card-item card-${finding.priority.toLowerCase()}`}>
      {/* Top Card Header */}
      <div className="finding-card-header">
        <div className="finding-meta-left">
          <span className={`finding-priority-pill ${priorityInfo.className}`}>
            <span className="priority-bullet" aria-hidden="true" />
            {priorityInfo.label}
          </span>
          <span className={`finding-status-pill ${getStatusStyle(finding.verificationStatus)}`}>
            {finding.verificationStatus}
          </span>
        </div>

        <div className="finding-meta-right">
          <span className="finding-time font-mono">{finding.timestamp}</span>
          <span className="demo-tag-tiny">DEMO DATA</span>
        </div>
      </div>

      {/* Finding Title */}
      <h3 className="finding-card-title">{finding.title}</h3>

      {/* Description */}
      <p className="finding-card-description">{finding.description}</p>

      {/* Related Entities Strip */}
      <div className="finding-entities-section">
        <span className="entities-section-label">CORRELATED ENTITIES:</span>
        <div className="finding-entities-list">
          {finding.relatedEntities.map((ent) => (
            <div key={ent.id} className="finding-entity-chip">
              <span className="entity-badge-type">{ent.type}</span>
              <span className="entity-badge-id font-mono">{ent.identifier}</span>
              <span className="entity-badge-label">({ent.label})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Confidence Meter */}
      <div className="finding-confidence-strip">
        <div className="confidence-label-row">
          <span className="confidence-title">Evidentiary Confidence</span>
          <span className="confidence-percentage font-mono">
            {(finding.confidence * 100).toFixed(0)}% ({finding.confidence.toFixed(2)}/1.00)
          </span>
        </div>
        <div className="confidence-bar-bg">
          <div
            className={`confidence-bar-fill fill-${finding.priority.toLowerCase()}`}
            style={{ width: `${finding.confidence * 100}%` }}
          />
        </div>
      </div>

      {/* Expandable Evidence Provenance & Audit Trail */}
      <div className="provenance-accordion-wrapper">
        <button
          type="button"
          className="provenance-toggle-btn"
          onClick={() => setIsProvenanceExpanded((prev) => !prev)}
          aria-expanded={isProvenanceExpanded}
        >
          <div className="provenance-toggle-left">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            <span>Evidence Provenance & Verification Audit Trail</span>
          </div>
          <span className="provenance-chevron font-mono">
            {isProvenanceExpanded ? '▲ Hide Details' : '▼ View Provenance'}
          </span>
        </button>

        {isProvenanceExpanded && (
          <div className="provenance-drawer-content">
            <div className="provenance-grid">
              <div className="prov-row">
                <span className="prov-label">Source Artifact:</span>
                <span className="prov-val font-mono text-primary">
                  {finding.evidenceSource.sourceFilename} ({finding.evidenceSource.fileType})
                </span>
              </div>

              <div className="prov-row">
                <span className="prov-label">Artifact Reference:</span>
                <span className="prov-val font-mono">{finding.evidenceSource.reference}</span>
              </div>

              <div className="prov-row">
                <span className="prov-label">Audit Engine Rule:</span>
                <span className="prov-val font-mono">{finding.evidenceSource.auditRuleTriggered}</span>
              </div>

              <div className="prov-row">
                <span className="prov-label">Mock Checksum:</span>
                <span className="prov-val font-mono text-hash" title={finding.evidenceSource.sha256}>
                  {finding.evidenceSource.sha256}
                </span>
              </div>
            </div>

            {finding.evidenceSource.rawRecordExcerpt && (
              <div className="raw-excerpt-box">
                <div className="raw-excerpt-label">RAW LEDGER EXCERPT:</div>
                <pre className="raw-excerpt-code font-mono">
                  {finding.evidenceSource.rawRecordExcerpt}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Forensic Safeguard Notice */}
      <div className="finding-guidance-footer">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span>{finding.investigativeGuidance}</span>
      </div>
    </div>
  );
};
