import React from 'react';
import type { RelationshipDetail } from '../../types';

interface WhyConnectedPanelProps {
  relationship: RelationshipDetail | null;
}

export const WhyConnectedPanel: React.FC<WhyConnectedPanelProps> = ({ relationship }) => {
  if (!relationship) {
    return (
      <div className="why-connected-container empty-connected">
        <div className="why-connected-header">
          <div className="why-title-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <span>Why Connected?</span>
          </div>
          <span className="demo-badge-micro">CORE FORENSIC ENGINE</span>
        </div>

        <div className="empty-connected-body">
          <p>Select any connection line or relationship between two entities to view the evidentiary justification.</p>
        </div>
      </div>
    );
  }

  const { whyConnected } = relationship;

  return (
    <div className="why-connected-container">
      {/* Header */}
      <div className="why-connected-header">
        <div className="why-title-badge active-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <span>Why Connected?</span>
        </div>
        <span className="demo-badge-micro">EVIDENCE CHAIN</span>
      </div>

      <div className="why-connected-body">
        <div className="connection-heading-row">
          <span className="connected-entities-label">
            <strong>{relationship.sourceLabel}</strong> and <strong>{relationship.targetLabel}</strong>
          </span>
          <span className="confidence-pill font-mono">
            Confidence: {(relationship.confidence * 100).toFixed(0)}%
          </span>
        </div>

        {/* Step-by-Step Forensic Logic Flow: Evidence -> Relationship -> Reason -> Source */}
        <div className="forensic-flow-pipeline">
          {/* Step 1: Evidence */}
          <div className="flow-step">
            <div className="step-marker">
              <span className="step-number">1</span>
              <span className="step-type">Evidence</span>
            </div>
            <div className="step-content">
              <div className="step-text">{whyConnected.evidenceSummary}</div>
            </div>
          </div>

          <div className="flow-connector-line">
            <span className="down-arrow">↓</span>
          </div>

          {/* Step 2: Relationship */}
          <div className="flow-step">
            <div className="step-marker">
              <span className="step-number">2</span>
              <span className="step-type">Relationship</span>
            </div>
            <div className="step-content">
              <div className="step-text font-mono text-primary">{whyConnected.relationshipDescription}</div>
            </div>
          </div>

          <div className="flow-connector-line">
            <span className="down-arrow">↓</span>
          </div>

          {/* Step 3: Reason */}
          <div className="flow-step">
            <div className="step-marker">
              <span className="step-number">3</span>
              <span className="step-type">Reason</span>
            </div>
            <div className="step-content">
              <div className="step-text">{whyConnected.reason}</div>
              <ul className="step-bullet-list">
                {whyConnected.supportingBullets.map((bullet, idx) => (
                  <li key={idx}>{bullet}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flow-connector-line">
            <span className="down-arrow">↓</span>
          </div>

          {/* Step 4: Source */}
          <div className="flow-step step-source">
            <div className="step-marker">
              <span className="step-number">4</span>
              <span className="step-type">Source</span>
            </div>
            <div className="step-content">
              <div className="source-meta-grid font-mono">
                <div>
                  <span className="source-label">Artifact:</span>
                  <span className="source-val">{whyConnected.evidenceSource}</span>
                </div>
                <div>
                  <span className="source-label">Reference:</span>
                  <span className="source-val">{whyConnected.rowReference}</span>
                </div>
                <div>
                  <span className="source-label">Index Hash:</span>
                  <span className="source-val hash-trunc">DEMO_SHA256_VERIFIED</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Investigative Guardrail */}
        <div className="safeguard-reminder">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <span>Correlated link is evidentiary only. Verification by investigator required before establishing identity.</span>
        </div>
      </div>
    </div>
  );
};
