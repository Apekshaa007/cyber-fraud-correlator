import React, { useState, useMemo } from 'react';
import { FindingCard } from '../../components/Findings/FindingCard';
import { FindingFilters } from '../../components/Findings/FindingFilters';
import { MOCK_FINDINGS } from '../../mock/findingsData';
import type { FindingFilterState } from '../../types';
import './FindingsPage.css';

const DEFAULT_FILTERS: FindingFilterState = {
  searchQuery: '',
  selectedPriority: 'ALL',
  selectedStatus: 'ALL',
};

export const FindingsPage: React.FC = () => {
  const [filters, setFilters] = useState<FindingFilterState>(DEFAULT_FILTERS);

  const handleFilterChange = (updates: Partial<FindingFilterState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const filteredFindings = useMemo(() => {
    const query = filters.searchQuery.toLowerCase().trim();

    return MOCK_FINDINGS.filter((finding) => {
      // Priority filter
      if (filters.selectedPriority !== 'ALL' && finding.priority !== filters.selectedPriority) {
        return false;
      }

      // Verification Status filter
      if (filters.selectedStatus !== 'ALL' && finding.verificationStatus !== filters.selectedStatus) {
        return false;
      }

      // Search Query filter
      if (query) {
        const matchTitle = finding.title.toLowerCase().includes(query);
        const matchDesc = finding.description.toLowerCase().includes(query);
        const matchRule = finding.evidenceSource.auditRuleTriggered.toLowerCase().includes(query);
        const matchFile = finding.evidenceSource.sourceFilename.toLowerCase().includes(query);
        const matchEntity = finding.relatedEntities.some(
          (e) =>
            e.identifier.toLowerCase().includes(query) ||
            e.label.toLowerCase().includes(query)
        );

        if (!matchTitle && !matchDesc && !matchRule && !matchFile && !matchEntity) {
          return false;
        }
      }

      return true;
    });
  }, [filters]);

  const criticalCount = useMemo(
    () => MOCK_FINDINGS.filter((f) => f.priority === 'Critical').length,
    []
  );

  const highCount = useMemo(
    () => MOCK_FINDINGS.filter((f) => f.priority === 'High').length,
    []
  );

  const avgConfidence = useMemo(() => {
    const total = MOCK_FINDINGS.reduce((acc, f) => acc + f.confidence, 0);
    return ((total / MOCK_FINDINGS.length) * 100).toFixed(0);
  }, []);

  return (
    <div className="findings-page-container">
      {/* 1. Top Header Card */}
      <div className="findings-header-card">
        <div className="findings-header-main">
          <div className="findings-breadcrumb-strip">
            <span className="case-pill-bold font-mono">DEMO-CASE-001</span>
            <span>/</span>
            <span>Investigative Red Flags Dossier</span>
          </div>
          <h1 className="findings-main-title">
            Findings & Potential Red Flags
            <span className="findings-badge-demo">MOCK ANOMALIES</span>
          </h1>
          <p className="findings-subtitle">
            Correlated forensic indicators flagged by automated pattern rules. All anomalies represent investigative correlation and require verification.
          </p>
        </div>

        {/* Forensic Metrics Strip */}
        <div className="findings-metrics-strip">
          <div className="findings-metric-pill">
            <span className="metric-pill-num">{MOCK_FINDINGS.length}</span>
            <span className="metric-pill-text">Total Red Flags</span>
          </div>

          <div className="findings-metric-pill">
            <span className="metric-pill-num text-critical">{criticalCount}</span>
            <span className="metric-pill-text">Critical Priority</span>
          </div>

          <div className="findings-metric-pill">
            <span className="metric-pill-num text-high">{highCount}</span>
            <span className="metric-pill-text">High Priority</span>
          </div>

          <div className="findings-metric-pill">
            <span className="metric-pill-num">{avgConfidence}%</span>
            <span className="metric-pill-text">Avg Confidence</span>
          </div>
        </div>
      </div>

      {/* 2. Filter Bar */}
      <FindingFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        totalFindingsCount={MOCK_FINDINGS.length}
        filteredFindingsCount={filteredFindings.length}
      />

      {/* 3. Findings Cards List */}
      {filteredFindings.length === 0 ? (
        <div className="findings-empty-container">
          <div className="empty-icon-wrap">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <h3 className="empty-title">No Findings Match Active Filters</h3>
          <p className="empty-text">
            No investigative findings matched &quot;{filters.searchQuery}&quot; or the selected priority/status filters.
          </p>
          <button type="button" className="reset-finding-filters-btn" onClick={handleResetFilters}>
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="findings-list-grid">
          {filteredFindings.map((finding) => (
            <FindingCard key={finding.id} finding={finding} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FindingsPage;
