import React from 'react';
import type { TimelineFilterState } from '../../types';

interface TimelineFiltersProps {
  filters: TimelineFilterState;
  onFilterChange: (newFilters: Partial<TimelineFilterState>) => void;
  onResetFilters: () => void;
  totalEventsCount: number;
  filteredEventsCount: number;
}

export const TimelineFilters: React.FC<TimelineFiltersProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalEventsCount,
  filteredEventsCount,
}) => {
  const hasActiveFilters =
    filters.searchQuery.trim() !== '' ||
    filters.selectedEventType !== 'ALL' ||
    filters.selectedEntityType !== 'ALL';

  return (
    <div className="timeline-filters-bar">
      {/* Search Input */}
      <div className="filter-search-wrapper">
        <svg
          className="search-icon"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          type="text"
          className="timeline-search-input"
          placeholder="Search by keyword, entity, reference or evidence..."
          value={filters.searchQuery}
          onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
        />
        {filters.searchQuery && (
          <button
            type="button"
            className="clear-search-btn"
            onClick={() => onFilterChange({ searchQuery: '' })}
            aria-label="Clear search input"
          >
            ×
          </button>
        )}
      </div>

      {/* Dropdown Filters */}
      <div className="filter-controls-group">
        {/* Event Type Filter */}
        <div className="filter-select-wrapper">
          <label htmlFor="filter-event-type" className="filter-label">
            Event Type:
          </label>
          <select
            id="filter-event-type"
            className="timeline-select"
            value={filters.selectedEventType}
            onChange={(e) => onFilterChange({ selectedEventType: e.target.value })}
          >
            <option value="ALL">All Event Types</option>
            <option value="Evidence_Ingested">Evidence Ingested</option>
            <option value="Entity_Identified">Entity Identified</option>
            <option value="Authentication_Event">Authentication</option>
            <option value="Transaction_Executed">Transactions</option>
            <option value="Communication_Session">Communications</option>
            <option value="Red_Flag_Detected">Red Flags</option>
          </select>
        </div>

        {/* Entity Type Filter */}
        <div className="filter-select-wrapper">
          <label htmlFor="filter-entity-type" className="filter-label">
            Entity:
          </label>
          <select
            id="filter-entity-type"
            className="timeline-select"
            value={filters.selectedEntityType}
            onChange={(e) => onFilterChange({ selectedEntityType: e.target.value })}
          >
            <option value="ALL">All Entities</option>
            <option value="Account">Bank Accounts</option>
            <option value="Phone">Phone / MSISDN</option>
            <option value="IP">IP Addresses</option>
            <option value="Device">Devices / Hardware</option>
            <option value="Transaction">Transactions</option>
          </select>
        </div>

        {/* Sort Order Toggle */}
        <button
          type="button"
          className="sort-toggle-btn"
          onClick={() =>
            onFilterChange({ sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })
          }
          title="Toggle chronological sort order"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          <span>{filters.sortOrder === 'asc' ? 'Oldest First (Chronological)' : 'Newest First'}</span>
        </button>

        {/* Reset Button */}
        {hasActiveFilters && (
          <button type="button" className="reset-filters-btn" onClick={onResetFilters}>
            Reset Filters
          </button>
        )}
      </div>

      {/* Match Count */}
      <div className="filter-result-tally font-mono">
        Showing {filteredEventsCount} of {totalEventsCount} forensic log entries
      </div>
    </div>
  );
};
