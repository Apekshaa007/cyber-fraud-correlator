import React, { useState, useEffect } from 'react';
import { UploadPage } from './pages/Upload/UploadPage';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { GraphPage } from './pages/Graph/GraphPage';
import { TimelinePage } from './pages/Timeline/TimelinePage';
import { FindingsPage } from './pages/Findings/FindingsPage';
import { ReportPage } from './pages/Report/ReportPage';

type ActiveView = 'dashboard' | 'graph' | 'timeline' | 'findings' | 'report' | 'upload';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ActiveView>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#upload' || window.location.pathname === '/upload') {
        return 'upload';
      }
      if (hash === '#graph' || window.location.pathname === '/graph') {
        return 'graph';
      }
      if (hash === '#timeline' || window.location.pathname === '/timeline') {
        return 'timeline';
      }
      if (hash === '#findings' || window.location.pathname === '/findings') {
        return 'findings';
      }
      if (hash === '#report' || window.location.pathname === '/report') {
        return 'report';
      }
    }
    return 'dashboard';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#upload') {
        setCurrentView('upload');
      } else if (hash === '#graph') {
        setCurrentView('graph');
      } else if (hash === '#timeline') {
        setCurrentView('timeline');
      } else if (hash === '#findings') {
        setCurrentView('findings');
      } else if (hash === '#report') {
        setCurrentView('report');
      } else if (hash === '#dashboard') {
        setCurrentView('dashboard');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (view: ActiveView) => {
    setCurrentView(view);
    if (typeof window !== 'undefined') {
      window.location.hash = view;
    }
  };

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

          {/* Primary Forensic Workspaces Navigation */}
          <nav className="navbar-nav" aria-label="Workstation Navigation">
            <button
              type="button"
              className={`nav-tab-btn ${currentView === 'dashboard' ? 'active' : ''}`}
              onClick={() => navigateTo('dashboard')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              className={`nav-tab-btn ${currentView === 'graph' ? 'active' : ''}`}
              onClick={() => navigateTo('graph')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
              <span>Fraud Graph</span>
            </button>

            <button
              type="button"
              className={`nav-tab-btn ${currentView === 'timeline' ? 'active' : ''}`}
              onClick={() => navigateTo('timeline')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>Timeline</span>
            </button>

            <button
              type="button"
              className={`nav-tab-btn ${currentView === 'findings' ? 'active' : ''}`}
              onClick={() => navigateTo('findings')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <span>Findings</span>
            </button>

            <button
              type="button"
              className={`nav-tab-btn ${currentView === 'report' ? 'active' : ''}`}
              onClick={() => navigateTo('report')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <span>Report</span>
            </button>

            <button
              type="button"
              className={`nav-tab-btn ${currentView === 'upload' ? 'active' : ''}`}
              onClick={() => navigateTo('upload')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="12" y1="18" x2="12" y2="12"></line>
                <line x1="9" y1="15" x2="15" y2="15"></line>
              </svg>
              <span>Evidence Ingest</span>
            </button>
          </nav>

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
        {currentView === 'dashboard' && (
          <DashboardPage
            onNavigateToEvidence={() => navigateTo('upload')}
            onNavigateToGraph={() => navigateTo('graph')}
            onNavigateToTimeline={() => navigateTo('timeline')}
            onNavigateToFindings={() => navigateTo('findings')}
            onNavigateToReport={() => navigateTo('report')}
          />
        )}
        {currentView === 'graph' && <GraphPage />}
        {currentView === 'timeline' && <TimelinePage />}
        {currentView === 'findings' && <FindingsPage />}
        {currentView === 'report' && (
          <ReportPage onNavigateToDashboard={() => navigateTo('dashboard')} />
        )}
        {currentView === 'upload' && <UploadPage />}
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
