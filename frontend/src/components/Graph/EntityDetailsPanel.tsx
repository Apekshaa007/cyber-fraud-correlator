import React from 'react';
import type { EntityDetail } from '../../types';

interface EntityDetailsPanelProps {
  entity: EntityDetail | null;
  onSelectRelatedEntity?: (entityId: string) => void;
  onClose?: () => void;
}

export const EntityDetailsPanel: React.FC<EntityDetailsPanelProps> = ({
  entity,
  onSelectRelatedEntity,
  onClose,
}) => {
  if (!entity) {
    return (
      <div className="inspector-panel empty-inspector">
        <div className="empty-panel-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="11" y1="8" x2="11" y2="14"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
        </div>
        <h3 className="empty-panel-title">No Entity Selected</h3>
        <p className="empty-panel-text">
          Select an entity node on the graph canvas to inspect its forensic properties, cross-correlations, and evidence sources.
        </p>
      </div>
    );
  }

  const getRiskBadgeClass = (risk: EntityDetail['riskIndicator']) => {
    switch (risk) {
      case 'high':
        return 'risk-badge-high';
      case 'medium':
        return 'risk-badge-medium';
      case 'low':
        return 'risk-badge-low';
      default:
        return 'risk-badge-neutral';
    }
  };

  return (
    <div className="inspector-panel">
      {/* Header */}
      <div className="panel-header">
        <div className="panel-header-left">
          <span className="panel-type-badge">{entity.entityType}</span>
          <span className="demo-badge-small">DEMO DATA</span>
        </div>
        {onClose && (
          <button type="button" className="panel-close-btn" onClick={onClose} aria-label="Close panel">
            ×
          </button>
        )}
      </div>

      <div className="panel-title-block">
        <h3 className="panel-entity-title">{entity.label}</h3>
        <div className="panel-identifier font-mono">{entity.identifier}</div>
      </div>

      {/* Quick Meta Strip */}
      <div className="panel-meta-strip">
        <div className="meta-block">
          <span className="meta-label">Total Connections</span>
          <span className="meta-value-highlight">{entity.totalConnections}</span>
        </div>
        <div className="meta-block">
          <span className="meta-label">Correlation Risk</span>
          <span className={`risk-badge-pill ${getRiskBadgeClass(entity.riskIndicator)}`}>
            {entity.riskIndicator.toUpperCase()}
          </span>
        </div>
        <div className="meta-block">
          <span className="meta-label">Entity ID</span>
          <span className="meta-value font-mono">{entity.id}</span>
        </div>
      </div>

      {/* Status Notice */}
      <div className="panel-section">
        <span className="section-label">INVESTIGATIVE STATUS</span>
        <div className="status-box">
          <span className="status-dot-pulse"></span>
          <span className="status-text">{entity.status}</span>
        </div>
      </div>

      {/* Supporting Evidence Sources */}
      <div className="panel-section">
        <span className="section-label">EVIDENCE SOURCES ({entity.evidenceSources.length})</span>
        <div className="evidence-sources-list">
          {entity.evidenceSources.map((ev, idx) => (
            <div key={idx} className="evidence-source-item">
              <div className="evidence-icon-col">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
              </div>
              <div className="evidence-info-col">
                <div className="evidence-filename font-mono">{ev.filename}</div>
                <div className="evidence-ref">{ev.reference}</div>
              </div>
              <span className="evidence-tag">{ev.type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Related Entities */}
      <div className="panel-section">
        <span className="section-label">CONNECTED ENTITIES ({entity.relatedEntities.length})</span>
        <div className="related-entities-list">
          {entity.relatedEntities.map((rel) => (
            <div
              key={rel.id}
              className="related-entity-item"
              onClick={() => onSelectRelatedEntity && onSelectRelatedEntity(rel.id)}
              role="button"
              tabIndex={0}
              title={`Click to focus ${rel.label}`}
            >
              <div className="related-entity-main">
                <span className="related-type-tag">{rel.type}</span>
                <span className="related-label">{rel.label}</span>
              </div>
              <div className="related-relationship">{rel.relationship}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Forensic Notes & Caution */}
      {entity.notes && (
        <div className="panel-section">
          <span className="section-label">ANALYST NOTES</span>
          <p className="panel-notes-text">{entity.notes}</p>
        </div>
      )}

      <div className="panel-footer-disclaimer">
        <span>Forensic Standard: Presence of connection does NOT establish verified culpability.</span>
      </div>
    </div>
  );
};
