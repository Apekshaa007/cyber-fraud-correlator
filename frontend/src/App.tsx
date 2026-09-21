import React from 'react';
import { UploadPage } from './pages/Upload/UploadPage';

export const App: React.FC = () => {
  return (
    <div className="app-shell">
      {/* Forensic Workstation Top Navigation */}
      <header className="app-navbar">
        <div className="navbar-content">
          <div className="brand-section">
            <div className="brand-shield-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <div className="brand-text">
              <div className="brand-title">
                Cyber Fraud Correlator
                <span className="brand-version-badge">v0.1.0</span>
              </div>
              <span className="brand-subtitle">
                Digital Artifact Analysis & Correlation System
              </span>
            </div>
          </div>

          <div className="navbar-actions">
            <div className="connection-status">
              <span className="pulse-indicator"></span>
              <span>Standalone / Mock Mode</span>
            </div>

            <div className="investigator-badge">
              <span className="user-avatar">INV</span>
              <span>Lead Analyst</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Area */}
      <main className="app-main">
        <UploadPage />
      </main>

      {/* Forensic Workstation Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <span>Cyber Fraud Digital Forensics & Artifact Correlation Workbench</span>
          <span className="footer-security-notice">
            CHAIN-OF-CUSTODY AUDIT LEVEL 2 • SHA-256 INTEGRITY VERIFIED
          </span>
        </div>
      </footer>
    </div>
  );
};

export default App;
