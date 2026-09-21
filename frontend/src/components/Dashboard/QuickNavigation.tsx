import React from 'react';

interface QuickNavigationProps {
  onNavigateToEvidence: () => void;
  onNavigateToGraph?: () => void;
  onNavigateToTimeline?: () => void;
  onNavigateToFindings?: () => void;
  onNavigateToReport?: () => void;
}

interface NavItem {
  id: string;
  name: string;
  description: string;
  isAvailable: boolean;
  tag: string;
  icon: React.ReactNode;
}

export const QuickNavigation: React.FC<QuickNavigationProps> = ({
  onNavigateToEvidence,
  onNavigateToGraph,
  onNavigateToTimeline,
  onNavigateToFindings,
  onNavigateToReport,
}) => {
  const navItems: NavItem[] = [
    {
      id: 'evidence',
      name: 'Evidence',
      description: 'Ingest & inspect digital artifacts, hashes, and chain of custody',
      isAvailable: true,
      tag: 'ACTIVE MODULE',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="12" y1="18" x2="12" y2="12"></line>
          <line x1="9" y1="15" x2="15" y2="15"></line>
        </svg>
      ),
    },
    {
      id: 'graph',
      name: 'Fraud Graph',
      description: 'Interactive node graph connecting accounts, phones, and transactions',
      isAvailable: true,
      tag: 'ACTIVE MODULE',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="18" cy="5" r="3"></circle>
          <circle cx="6" cy="12" r="3"></circle>
          <circle cx="18" cy="19" r="3"></circle>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
        </svg>
      ),
    },
    {
      id: 'timeline',
      name: 'Timeline',
      description: 'Chronological sequence of transactions, calls, and session logs',
      isAvailable: true,
      tag: 'ACTIVE MODULE',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      ),
    },
    {
      id: 'findings',
      name: 'Findings / Red Flags',
      description: 'Anomalous co-occurrences, rapid transfers, and flagged entities',
      isAvailable: true,
      tag: 'ACTIVE MODULE',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      ),
    },
    {
      id: 'report',
      name: 'Investigation Report',
      description: 'Audited forensic findings dossier with evidentiary attachments',
      isAvailable: true,
      tag: 'ACTIVE MODULE',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
        </svg>
      ),
    },
  ];

  const handleItemClick = (item: NavItem) => {
    if (item.id === 'evidence') {
      onNavigateToEvidence();
    } else if (item.id === 'graph' && onNavigateToGraph) {
      onNavigateToGraph();
    } else if (item.id === 'timeline' && onNavigateToTimeline) {
      onNavigateToTimeline();
    } else if (item.id === 'findings' && onNavigateToFindings) {
      onNavigateToFindings();
    } else if (item.id === 'report' && onNavigateToReport) {
      onNavigateToReport();
    }
  };

  return (
    <div className="quick-navigation-section">
      <div className="section-title-group">
        <h2 className="section-heading">Quick Navigation</h2>
        <span className="section-subtext">
          Access all forensic investigation workspaces and dossiers
        </span>
      </div>

      <div className="quick-nav-grid">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className="quick-nav-card card-available"
            onClick={() => handleItemClick(item)}
            title={`Navigate to ${item.name}`}
          >
            <div className="nav-card-header">
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-tag nav-tag-active">{item.tag}</span>
            </div>

            <div className="nav-card-body">
              <div className="nav-name">
                {item.name}
                <span className="nav-arrow">→</span>
              </div>
              <p className="nav-desc">{item.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
