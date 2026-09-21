import React, { useState } from 'react';
import { MOCK_REPORT_DATA } from '../../mock/reportData';
import './ReportPage.css';

interface ReportPageProps {
  onNavigateToDashboard?: () => void;
}

export const ReportPage: React.FC<ReportPageProps> = ({ onNavigateToDashboard }) => {
  const [copiedToast, setCopiedToast] = useState<boolean>(false);
  const data = MOCK_REPORT_DATA;

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const summaryText = `[DEMO MOCK DOSSIER] ${data.caseInfo.caseId} - ${data.caseInfo.caseTitle}
Classification: ${data.caseInfo.classification}
Status: ${data.caseInfo.status}
Evidence Artifacts Ingested: ${data.evidenceSummary.totalArtifacts} (${data.evidenceSummary.totalIndexedRecords} rows)
Entities Mapped: ${data.entitySummary.totalEntities}
Relationships Detected: ${data.relationshipSummary.totalRelationships}
Red Flags Flagged: ${data.findingsSummary.totalFindings} (Critical: ${data.findingsSummary.criticalCount}, High: ${data.findingsSummary.highCount})
Lead Examiner: ${data.caseInfo.leadAnalyst}
Chain-of-Custody: Verified Level 2 SHA-256 (Mock)`;

    navigator.clipboard.writeText(summaryText);
    setCopiedToast(true);
    setTimeout(() => {
      setCopiedToast(false);
    }, 3000);
  };

  return (
    <div className="report-page-container">
      {/* 1. Action Toolbar (Hidden in Print View) */}
      <div className="report-action-toolbar">
        <div className="toolbar-status-badge">
          <span className="report-ready-dot" />
          <span>Forensic Report Dossier Compiled • Analysis Ready</span>
        </div>

        <div className="toolbar-buttons-group">
          {onNavigateToDashboard && (
            <button
              type="button"
              className="btn-report-action btn-secondary"
              onClick={onNavigateToDashboard}
            >
              ← Back to Dashboard
            </button>
          )}

          <button
            type="button"
            className="btn-report-action btn-secondary"
            onClick={handleCopySummary}
          >
            📋 Copy Dossier Summary
          </button>

          <button
            type="button"
            className="btn-report-action btn-primary-export"
            onClick={handlePrint}
            title="Open browser print dialog to print or save as PDF"
          >
            🖨️ Download PDF / Print Report
          </button>
        </div>
      </div>

      {copiedToast && (
        <div className="report-copy-toast">
          ✓ Summary copied to clipboard! (Simulated Dossier Data)
        </div>
      )}

      {/* 2. Main Forensic Document Sheet */}
      <article className="report-document-sheet" id="printable-report">
        {/* Top Watermark */}
        <div className="report-watermark-strip">
          *** CONFIDENTIAL FORENSIC INVESTIGATION REPORT — SIMULATED DEMO WORKBENCH DATA ***
        </div>

        {/* Document Header Block */}
        <header className="report-doc-header">
          <div className="header-agency-row">
            <div className="agency-seal-group">
              <div className="agency-seal-icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <div>
                <div className="agency-name-title">Cyber Fraud Digital Artifact Correlation Unit</div>
                <div className="agency-division-text">Division of Digital Forensics & Topological Analysis</div>
              </div>
            </div>

            <div className="header-meta-dossier">
              <span className="dossier-id">REPORT #{data.reportMetadata.reportId}</span>
              <span className="dossier-date">Generated: {data.reportMetadata.generatedAt}</span>
              <span className="dossier-classification font-mono">
                {data.reportMetadata.classificationLevel}
              </span>
            </div>
          </div>

          <div className="doc-main-titles">
            <h1 className="doc-h1">Digital Evidence & Artifact Correlation Dossier</h1>
            <p className="doc-h2-sub">
              Official forensic examination summary for Case Reference: <strong>{data.caseInfo.caseId}</strong>
            </p>
          </div>
        </header>

        {/* SECTION I: EXECUTIVE INVESTIGATION SUMMARY */}
        <section className="report-section">
          <h2 className="section-doc-title">
            <span className="section-roman">I.</span> Executive Investigation Summary
          </h2>

          <div className="exec-summary-card">
            {data.executiveSummary.overviewText.map((p, idx) => (
              <p key={idx} className="exec-paragraph">
                {p}
              </p>
            ))}

            <div className="exec-takeaways-block">
              <div className="takeaways-title">Key Correlation Takeaways:</div>
              <ul className="takeaways-list">
                {data.executiveSummary.keyTakeaways.map((takeaway, idx) => (
                  <li key={idx}>{takeaway}</li>
                ))}
              </ul>
            </div>

            <div className="exec-caution-alert">
              <svg className="caution-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <span>{data.executiveSummary.investigativeCautionNotice}</span>
            </div>
          </div>
        </section>

        {/* SECTION II: CASE INFORMATION & CUSTODY LEDGER */}
        <section className="report-section">
          <h2 className="section-doc-title">
            <span className="section-roman">II.</span> Case Information & Custody Ledger
          </h2>

          <div className="case-info-grid">
            <div className="info-item">
              <span className="info-label">Case Identifier</span>
              <span className="info-value font-mono">{data.caseInfo.caseId}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Case Title</span>
              <span className="info-value">{data.caseInfo.caseTitle}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Security Classification</span>
              <span className="info-value">{data.caseInfo.classification}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Investigative Status</span>
              <span className="info-value text-primary">{data.caseInfo.status}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Lead Forensic Analyst</span>
              <span className="info-value">{data.caseInfo.leadAnalyst}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Audit Baseline</span>
              <span className="info-value font-mono">Chain-of-Custody Level 2 (SHA-256 Verified)</span>
            </div>
          </div>
        </section>

        {/* SECTION III: EVIDENCE INGESTION & CHECKSUM REGISTER */}
        <section className="report-section">
          <h2 className="section-doc-title">
            <span className="section-roman">III.</span> Evidence Summary & Checksum Register
          </h2>

          <div className="report-table-container">
            <table className="report-doc-table">
              <thead>
                <tr>
                  <th>Artifact Filename</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>Indexed Records</th>
                  <th>Ingested Timestamp</th>
                  <th>Cryptographic Checksum (SHA-256)</th>
                  <th>Integrity</th>
                </tr>
              </thead>
              <tbody>
                {data.evidenceSummary.artifacts.map((ev, idx) => (
                  <tr key={idx}>
                    <td className="font-bold">{ev.filename}</td>
                    <td>
                      <span className="font-mono">{ev.type}</span>
                    </td>
                    <td>{ev.size}</td>
                    <td className="font-mono">{ev.recordsIndexed.toLocaleString()}</td>
                    <td className="font-mono">{ev.ingestTimestamp}</td>
                    <td className="font-mono text-hash" title={ev.sha256}>
                      {ev.sha256.substring(0, 24)}...
                    </td>
                    <td>
                      <span className="status-badge-mock">{ev.verificationStatus}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION IV: ENTITY & RELATIONSHIP CORRELATION ANALYSIS */}
        <section className="report-section">
          <h2 className="section-doc-title">
            <span className="section-roman">IV.</span> Entity & Relationship Correlation Analysis
          </h2>

          <div className="entity-categories-grid">
            {data.entitySummary.categories.map((cat, idx) => (
              <div key={idx} className="entity-cat-card">
                <div className="entity-cat-header">
                  <span className="entity-cat-name">{cat.category}</span>
                  <span className="entity-cat-count">{cat.count} mapped</span>
                </div>
                <p className="entity-cat-desc">{cat.description}</p>
                <div className="entity-cat-key-ids font-mono">
                  Primary: {cat.keyIdentifiers.join(' • ')}
                </div>
              </div>
            ))}
          </div>

          <div className="rel-summary-box">
            <div className="rel-metric-row">
              <div className="rel-stat-pill">
                <span className="rel-stat-num">{data.relationshipSummary.totalRelationships}</span>
                <span className="rel-stat-label">Total Links</span>
              </div>
              <div className="rel-stat-pill">
                <span className="rel-stat-num">{data.relationshipSummary.financialTransactionsCount}</span>
                <span className="rel-stat-label">Transactions</span>
              </div>
              <div className="rel-stat-pill">
                <span className="rel-stat-num">{data.relationshipSummary.cellularAssociationsCount}</span>
                <span className="rel-stat-label">Cellular Sessions</span>
              </div>
              <div className="rel-stat-pill">
                <span className="rel-stat-num">{data.relationshipSummary.networkGatewayMatchesCount}</span>
                <span className="rel-stat-label">Gateway Overlaps</span>
              </div>
            </div>
            <p className="rel-summary-narrative">{data.relationshipSummary.summaryText}</p>
          </div>
        </section>

        {/* SECTION V: CHRONOLOGICAL TIMELINE AUDIT SUMMARY */}
        <section className="report-section">
          <h2 className="section-doc-title">
            <span className="section-roman">V.</span> Chronological Timeline Audit Summary
          </h2>

          <div className="report-table-container">
            <table className="report-doc-table">
              <thead>
                <tr>
                  <th>Timestamp (IST)</th>
                  <th>Event Type</th>
                  <th>Primary Entity</th>
                  <th>Description</th>
                  <th>Evidence Source</th>
                </tr>
              </thead>
              <tbody>
                {data.timelineSummary.keyMilestones.map((milestone) => (
                  <tr key={milestone.id}>
                    <td className="font-mono">{milestone.timestamp}</td>
                    <td>
                      <span className="font-mono">{milestone.eventLabel}</span>
                    </td>
                    <td className="font-mono font-bold">{milestone.primaryEntity.label}</td>
                    <td>{milestone.description}</td>
                    <td className="font-mono text-primary">{milestone.evidenceSource.filename}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION VI: RED FLAGS & FINDINGS SUMMARY */}
        <section className="report-section">
          <h2 className="section-doc-title">
            <span className="section-roman">VI.</span> Red Flags & Risk Findings Summary
          </h2>

          <div className="report-findings-stack">
            {data.findingsSummary.findingsList.map((finding) => (
              <div
                key={finding.id}
                className={`report-finding-entry entry-${finding.priority.toLowerCase()}`}
              >
                <div className="finding-entry-top">
                  <span className="finding-entry-title">{finding.title}</span>
                  <div className="finding-entry-meta">
                    <span className="font-mono font-bold">[{finding.priority.toUpperCase()}]</span>
                    <span>Status: {finding.verificationStatus}</span>
                    <span className="font-mono">Confidence: {(finding.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>
                <p className="finding-entry-desc">{finding.description}</p>
                <div className="finding-entry-cite">
                  <span>Source: <strong className="font-mono">{finding.evidenceSource.sourceFilename}</strong> [{finding.evidenceSource.reference}]</span>
                  <span>•</span>
                  <span>Rule: <strong className="font-mono">{finding.evidenceSource.auditRuleTriggered}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION VII: EVIDENCE PROVENANCE & CHAIN-OF-CUSTODY REGISTER */}
        <section className="report-section">
          <h2 className="section-doc-title">
            <span className="section-roman">VII.</span> Evidence Provenance & Verification Audit Trail
          </h2>

          <div className="provenance-cert-card">
            <p className="provenance-statement">{data.provenanceChain.certificationStatement}</p>

            <div className="report-table-container">
              <table className="report-doc-table">
                <thead>
                  <tr>
                    <th>Step</th>
                    <th>Forensic Stage</th>
                    <th>Audit Rule Name</th>
                    <th>Artifact Citation</th>
                    <th>Verification Engine</th>
                    <th>Audit Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.provenanceChain.steps.map((step) => (
                    <tr key={step.stepNumber}>
                      <td className="font-mono font-bold">#{step.stepNumber}</td>
                      <td>{step.stage}</td>
                      <td className="font-mono">{step.ruleName}</td>
                      <td className="font-mono">{step.artifactCitation}</td>
                      <td>{step.verificationMethod}</td>
                      <td>
                        <span className="status-badge-mock">{step.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* SECTION VIII: FORENSIC SIGNOFF & ATTESTATION BLOCK */}
        <section className="report-section">
          <h2 className="section-doc-title">
            <span className="section-roman">VIII.</span> Forensic Sign-off & Attestation
          </h2>

          <div className="report-signoff-block">
            <div className="signoff-analyst-details">
              <span className="analyst-name">{data.investigatorSignoff.analystName}</span>
              <span className="analyst-role">{data.investigatorSignoff.role}</span>
              <span className="analyst-org">{data.investigatorSignoff.organization}</span>
              <span className="font-mono text-muted">Signed: {data.investigatorSignoff.signoffTimestamp}</span>
            </div>

            <div className="signoff-seal-badge">
              <div className="signoff-stamp font-mono">{data.investigatorSignoff.auditStatus}</div>
              <span>SIMULATED DEMO ENVIRONMENT • SHA-256 AUDIT PASS</span>
            </div>
          </div>
        </section>
      </article>
    </div>
  );
};

export default ReportPage;
