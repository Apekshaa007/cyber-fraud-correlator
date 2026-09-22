import React from 'react';
import type { RelationshipDetail } from '../../types';

interface RelationshipDetailsPanelProps {
  relationship: RelationshipDetail | null;
  onClose?: () => void;
}

export const RelationshipDetailsPanel: React.FC<RelationshipDetailsPanelProps> = ({
  relationship,
  onClose,
}) => {
  if (!relationship) {
    return (
      <div className="inspector-panel empty-inspector">
        <div className="empty-panel-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="12" r="3"></circle>
            <line x1="9" y1="12" x2="15" y2="12"></line>
          </svg>
        </div>
        <h3 className="empty-panel-title">No Relationship Selected</h3>
        <p className="empty-panel-text">
          Select an edge or connection line between entities on the graph to view forensic relationship properties, timestamps, and evidentiary confidence.
        </p>
      </div>
    );
  }

  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 0.9) return { label: 'HIGH CONFIDENCE', class: 'conf-high' };
    if (confidence >= 0.75) return { label: 'MODERATE CONFIDENCE', class: 'conf-med' };
    return { label: 'LOW CONFIDENCE / AMBIGUOUS', class: 'conf-low' };
  };

  const confInfo = getConfidenceLevel(relationship.confidence);

  return (
    <div className="inspector-panel">
      {/* Header */}
      <div className="panel-header">
        <div className="panel-header-left">
          <span className="panel-type-badge badge-edge">RELATIONSHIP</span>
          <span className="demo-badge-small">DEMO DATA</span>
        </div>
        {onClose && (
          <button type="button" className="panel-close-btn" onClick={onClose} aria-label="Close panel">
            ×
          </button>
        )}
      </div>

      <div className="panel-title-block">
        <h3 className="panel-entity-title">{relationship.relationshipType}</h3>
        <div className="relationship-vector font-mono">
          <span>{relationship.sourceLabel}</span>
          <span className="vector-arrow">→</span>
          <span>{relationship.targetLabel}</span>
        </div>
      </div>

      {/* Confidence Gauge */}
      <div className="confidence-meter-card">
        <div className="conf-header">
          <span className="conf-label">Evidentiary Confidence</span>
          <span className={`conf-badge-pill ${confInfo.class}`}>{confInfo.label}</span>
        </div>
        <div className="conf-score-row">
          <span className="conf-numeric font-mono">{(relationship.confidence * 100).toFixed(0)}%</span>
          <span className="conf-raw-val font-mono">Score: {relationship.confidence.toFixed(2)} / 1.00</span>
        </div>
        <div className="conf-bar-track">
          <div
            className={`conf-bar-fill ${confInfo.class}`}
            style={{ width: `${relationship.confidence * 100}%` }}
          />
        </div>
      </div>

      {/* Primary Attributes Table */}
      <div className="panel-section">
        <span className="section-label">FORENSIC ATTRIBUTES</span>
        <div className="attributes-grid">
          <div className="attr-row">
            <span className="attr-name">Source Entity:</span>
            <span className="attr-value">{relationship.sourceLabel} ({relationship.sourceType})</span>
          </div>

          <div className="attr-row">
            <span className="attr-name">Target Entity:</span>
            <span className="attr-value">{relationship.targetLabel} ({relationship.targetType})</span>
          </div>

          <div className="attr-row">
            <span className="attr-name">Relationship Type:</span>
            <span className="attr-value font-mono">{relationship.relationshipType}</span>
          </div>

          {relationship.amount && (
            <div className="attr-row highlight-row">
              <span className="attr-name">Disputed Value:</span>
              <span className="attr-value font-mono font-bold text-accent">{relationship.amount}</span>
            </div>
          )}

          <div className="attr-row">
            <span className="attr-name">Timestamp (IST):</span>
            <span className="attr-value font-mono">{relationship.timestamp}</span>
          </div>

          <div className="attr-row">
            <span className="attr-name">Source Evidence:</span>
            <span className="attr-value font-mono text-primary">{relationship.evidenceSource}</span>
          </div>

          <div className="attr-row">
            <span className="attr-name">Row / Reference:</span>
            <span className="attr-value font-mono">{relationship.rowReference}</span>
          </div>
        </div>
      </div>

      <div className="panel-footer-disclaimer">
        <span>Investigation Safety: Co-occurrence or transaction links do not establish intentional complicity.</span>
      </div>
    </div>
  );
};
