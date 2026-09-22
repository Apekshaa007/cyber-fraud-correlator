import React from 'react';
import type { FindingFilterState } from '../../types';

interface FindingFiltersProps {
  filters: FindingFilterState;
  onFilterChange: (newFilters: Partial<FindingFilterState>) => void;
  onResetFilters: () => void;
  totalFindingsCount: number;
  filteredFindingsCount: number;
}

export const FindingFilters: React.FC<FindingFiltersProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalFindingsCount,
  filteredFindingsCount,
}) => {
  const hasActiveFilters =
    filters.searchQuery.trim() !== '' ||
    filters.selectedPriority !== 'ALL' ||
    filters.selectedStatus !== 'ALL';

  return (
    <div className="finding-filters-bar">
      {/* Search Input */}
      <div className="finding-search-wrapper">
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
          className="finding-search-input"
          placeholder="Search findings by anomaly, entity identifier, rule, or artifact..."
          value={filters.searchQuery}
          onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
        />
        {filters.searchQuery && (
          <button
            type="button"
            className="clear-search-btn"
            onClick={() => onFilterChange({ searchQuery: '' })}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {/* Filter Controls Row */}
      <div className="finding-controls-row">
        {/* Priority Filter Pills */}
        <div className="priority-pill-group">
          <span className="group-label">Priority:</span>
          {['ALL', 'Critical', 'High', 'Medium', 'Low'].map((priority) => (
            <button
              key={priority}
              type="button"
              className={`priority-filter-btn ${filters.selectedPriority === priority ? 'active' : ''}`}
              onClick={() => onFilterChange({ selectedPriority: priority })}
            >
              {priority}
            </button>
          ))}
        </div>

        {/* Verification Status Dropdown */}
        <div className="status-dropdown-wrapper">
          <label htmlFor="filter-status" className="group-label">
            Status:
          </label>
          <select
            id="filter-status"
            className="finding-select"
            value={filters.selectedStatus}
            onChange={(e) => onFilterChange({ selectedStatus: e.target.value })}
          >
            <option value="ALL">All Verification Statuses</option>
            <option value="Requires Verification">Requires Verification</option>
            <option value="Under Review">Under Review</option>
            <option value="Corroborated by Secondary Artifact">Corroborated</option>
            <option value="Preserved Conflict">Preserved Conflict</option>
          </select>
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <button type="button" className="reset-finding-filters-btn" onClick={onResetFilters}>
            Reset Filters
          </button>
        )}
      </div>

      {/* Match Tally */}
      <div className="finding-tally-strip font-mono">
        Displaying {filteredFindingsCount} of {totalFindingsCount} potential investigative red flags
      </div>
    </div>
  );
};
