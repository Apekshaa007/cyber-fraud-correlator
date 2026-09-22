import React from 'react';
import type { InvestigationOverviewData } from '../../types';

interface InvestigationOverviewProps {
  overview: InvestigationOverviewData;
}

export const InvestigationOverview: React.FC<InvestigationOverviewProps> = ({ overview }) => {
  return (
    <div className="investigation-overview-section">
      <div className="overview-header">
        <div>
          <h2 className="section-heading">Investigation Overview</h2>
          <span className="section-subtext">
            Summary of correlation engines and automated pattern detectors
          </span>
        </div>
        <span className="demo-tag">SIMULATED OVERVIEW</span>
      </div>

      <div className="overview-cards-grid">
        {/* Evidence Processed */}
        <div className="overview-card">
          <div className="overview-card-top">
            <span className="overview-card-title">{overview.evidenceProcessed.label}</span>
            <span className="overview-badge-rate">{overview.evidenceProcessed.changeRate}</span>
          </div>
          <div className="overview-card-stat">{overview.evidenceProcessed.count} Artifacts</div>
          <p className="overview-card-details">{overview.evidenceProcessed.details}</p>
        </div>

        {/* Entities Discovered */}
        <div className="overview-card">
          <div className="overview-card-top">
            <span className="overview-card-title">{overview.entitiesDiscovered.label}</span>
            <span className="overview-badge-rate">{overview.entitiesDiscovered.changeRate}</span>
          </div>
          <div className="overview-card-stat">{overview.entitiesDiscovered.count} Extracted</div>
          <p className="overview-card-details">{overview.entitiesDiscovered.details}</p>
        </div>

        {/* Relationships Discovered */}
        <div className="overview-card">
          <div className="overview-card-top">
            <span className="overview-card-title">{overview.relationshipsDiscovered.label}</span>
            <span className="overview-badge-rate">{overview.relationshipsDiscovered.changeRate}</span>
          </div>
          <div className="overview-card-stat">{overview.relationshipsDiscovered.count} Correlated</div>
          <p className="overview-card-details">{overview.relationshipsDiscovered.details}</p>
        </div>

        {/* Red Flags Detected */}
        <div className="overview-card overview-card-warning">
          <div className="overview-card-top">
            <span className="overview-card-title">{overview.redFlagsDetected.label}</span>
            <span className="overview-badge-rate warning">{overview.redFlagsDetected.changeRate}</span>
          </div>
          <div className="overview-card-stat">{overview.redFlagsDetected.count} Anomalies</div>
          <p className="overview-card-details">{overview.redFlagsDetected.details}</p>
        </div>
      </div>

      {/* Forensic Disclaimers & Investigative Safeguards */}
      <div className="investigation-safeguards-box">
        <div className="safeguards-header">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span className="safeguards-title">Investigative Safeguards & Chain-of-Evidence Protocol</span>
        </div>
        <ul className="safeguards-list">
          {overview.investigativeNotes.map((note, idx) => (
            <li key={idx} className="safeguards-item">
              {note}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
