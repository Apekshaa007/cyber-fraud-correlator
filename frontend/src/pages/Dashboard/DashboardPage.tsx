import React from 'react';
import { CaseHeader } from '../../components/Dashboard/CaseHeader';
import { DashboardStats } from '../../components/Dashboard/DashboardStats';
import { RecentEvidence } from '../../components/Dashboard/RecentEvidence';
import { InvestigationOverview } from '../../components/Dashboard/InvestigationOverview';
import { QuickNavigation } from '../../components/Dashboard/QuickNavigation';
import { MOCK_DASHBOARD_DATA } from '../../mock/dashboardData';
import './DashboardPage.css';

interface DashboardPageProps {
  onNavigateToEvidence?: () => void;
  onNavigateToGraph?: () => void;
  onNavigateToTimeline?: () => void;
  onNavigateToFindings?: () => void;
  onNavigateToReport?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateToEvidence,
  onNavigateToGraph,
  onNavigateToTimeline,
  onNavigateToFindings,
  onNavigateToReport,
}) => {
  return (
    <div className="dashboard-page-container">
      {/* 1. Case Header with DEMO-CASE-001 */}
      <CaseHeader caseInfo={MOCK_DASHBOARD_DATA.caseHeader} />

      {/* 2. Key Forensic Statistics Cards */}
      <DashboardStats stats={MOCK_DASHBOARD_DATA.stats} />

      {/* 3. Recent Evidence Activity Table */}
      <RecentEvidence
        evidenceList={MOCK_DASHBOARD_DATA.recentEvidence}
        onNavigateToUpload={onNavigateToEvidence}
      />

      {/* 4. Investigation Overview */}
      <InvestigationOverview overview={MOCK_DASHBOARD_DATA.overview} />

      {/* 5. Quick Navigation Section */}
      <QuickNavigation
        onNavigateToEvidence={onNavigateToEvidence || (() => {})}
        onNavigateToGraph={onNavigateToGraph}
        onNavigateToTimeline={onNavigateToTimeline}
        onNavigateToFindings={onNavigateToFindings}
        onNavigateToReport={onNavigateToReport}
      />
    </div>
  );
};

export default DashboardPage;
