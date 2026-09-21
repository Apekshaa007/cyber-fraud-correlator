import React, { useState, useMemo } from 'react';
import { TimelineEventCard } from '../../components/Timeline/TimelineEventCard';
import { TimelineFilters } from '../../components/Timeline/TimelineFilters';
import { MOCK_TIMELINE_EVENTS } from '../../mock/timelineData';
import type { TimelineFilterState } from '../../types';
import './TimelinePage.css';

const DEFAULT_FILTERS: TimelineFilterState = {
  searchQuery: '',
  selectedEventType: 'ALL',
  selectedEntityType: 'ALL',
  sortOrder: 'asc', // Chronological by default
};

export const TimelinePage: React.FC = () => {
  const [filters, setFilters] = useState<TimelineFilterState>(DEFAULT_FILTERS);

  const handleFilterChange = (updates: Partial<TimelineFilterState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    const query = filters.searchQuery.toLowerCase().trim();

    const result = MOCK_TIMELINE_EVENTS.filter((evt) => {
      // Event Type filter
      if (filters.selectedEventType !== 'ALL' && evt.eventType !== filters.selectedEventType) {
        return false;
      }

      // Entity Type filter
      if (filters.selectedEntityType !== 'ALL') {
        const matchesPrimary = evt.primaryEntity.type === filters.selectedEntityType;
        const matchesSecondary = evt.secondaryEntity?.type === filters.selectedEntityType;
        if (!matchesPrimary && !matchesSecondary) return false;
      }

      // Search Query filter
      if (query) {
        const matchTitle = evt.eventLabel.toLowerCase().includes(query);
        const matchDesc = evt.description.toLowerCase().includes(query);
        const matchPrimaryId = evt.primaryEntity.identifier.toLowerCase().includes(query);
        const matchPrimaryLabel = evt.primaryEntity.label.toLowerCase().includes(query);
        const matchSecondary = evt.secondaryEntity
          ? evt.secondaryEntity.identifier.toLowerCase().includes(query) ||
            evt.secondaryEntity.label.toLowerCase().includes(query)
          : false;
        const matchEvidence =
          evt.evidenceSource.filename.toLowerCase().includes(query) ||
          evt.evidenceSource.reference.toLowerCase().includes(query);

        if (!matchTitle && !matchDesc && !matchPrimaryId && !matchPrimaryLabel && !matchSecondary && !matchEvidence) {
          return false;
        }
      }

      return true;
    });

    // Sort order
    return result.sort((a, b) => {
      if (filters.sortOrder === 'asc') {
        return a.timestamp.localeCompare(b.timestamp);
      }
      return b.timestamp.localeCompare(a.timestamp);
    });
  }, [filters]);

  const flaggedCount = useMemo(
    () => MOCK_TIMELINE_EVENTS.filter((e) => e.severity === 'flagged').length,
    []
  );

  return (
    <div className="timeline-page-container">
      {/* 1. Header Card */}
      <div className="timeline-header-card">
        <div className="timeline-header-main">
          <div className="timeline-breadcrumb-strip">
            <span className="case-pill-bold">DEMO-CASE-001</span>
            <span>/</span>
            <span>Forensic Audit Log</span>
          </div>
          <h1 className="timeline-main-title">
            Investigation Timeline
            <span className="timeline-badge-demo">MOCK SEQUENCE</span>
          </h1>
          <p className="timeline-subtitle">
            Chronological audit of digital artifact ingestion, user authentications, financial transactions, and anomaly flags.
          </p>
        </div>

        {/* Top Forensic Metrics */}
        <div className="timeline-metrics-strip">
          <div className="timeline-metric-pill">
            <span className="metric-pill-num">{MOCK_TIMELINE_EVENTS.length}</span>
            <span className="metric-pill-text">Indexed Events</span>
          </div>

          <div className="timeline-metric-pill">
            <span className="metric-pill-num text-accent">{flaggedCount}</span>
            <span className="metric-pill-text">Anomalies Flagged</span>
          </div>

          <div className="timeline-metric-pill">
            <span className="metric-pill-num">09:10 - 14:38</span>
            <span className="metric-pill-text">Recorded Span (IST)</span>
          </div>
        </div>
      </div>

      {/* 2. Filter & Search Controls */}
      <TimelineFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        totalEventsCount={MOCK_TIMELINE_EVENTS.length}
        filteredEventsCount={filteredEvents.length}
      />

      {/* 3. Chronological Spine */}
      {filteredEvents.length === 0 ? (
        <div className="timeline-empty-container">
          <div className="empty-icon-wrap">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h3 className="empty-title">No Events Match Your Filters</h3>
          <p className="empty-text">
            No chronological events matched the query &quot;{filters.searchQuery}&quot; or selected filters. Try broadening your criteria or clicking &quot;Reset Filters&quot;.
          </p>
          <button type="button" className="reset-filters-btn" onClick={handleResetFilters}>
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="timeline-chronological-spine">
          {filteredEvents.map((evt, idx) => (
            <TimelineEventCard
              key={evt.id}
              event={evt}
              isLast={idx === filteredEvents.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TimelinePage;
