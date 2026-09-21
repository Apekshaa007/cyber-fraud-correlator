import React from 'react';
import type { TimelineEvent } from '../../types';

interface TimelineEventCardProps {
  event: TimelineEvent;
  isLast?: boolean;
}

export const TimelineEventCard: React.FC<TimelineEventCardProps> = ({ event, isLast = false }) => {
  const getEventBadgeStyle = (type: TimelineEvent['eventType']) => {
    switch (type) {
      case 'Evidence_Ingested':
        return { label: 'Evidence Ingested', className: 'badge-ingest' };
      case 'Authentication_Event':
        return { label: 'Auth Event', className: 'badge-auth' };
      case 'Transaction_Executed':
        return { label: 'Transaction Executed', className: 'badge-txn' };
      case 'Communication_Session':
        return { label: 'Communication Log', className: 'badge-comm' };
      case 'Red_Flag_Detected':
        return { label: 'Potential Red Flag', className: 'badge-flag' };
      case 'Entity_Identified':
        return { label: 'Entity Identified', className: 'badge-entity' };
      default:
        return { label: type, className: 'badge-default' };
    }
  };

  const badgeInfo = getEventBadgeStyle(event.eventType);

  return (
    <div className={`timeline-spine-item ${event.severity === 'flagged' ? 'item-flagged' : ''}`}>
      {/* Node Marker & Vertical Line */}
      <div className="spine-marker-column">
        <div className={`spine-node-dot dot-${event.severity}`} aria-hidden="true" />
        {!isLast && <div className="spine-connecting-line" />}
      </div>

      {/* Main Event Card */}
      <div className="timeline-event-card">
        {/* Card Header */}
        <div className="event-card-header">
          <div className="event-time-cluster">
            <span className="event-time-badge font-mono">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              {event.time} IST
            </span>
            <span className="event-date-text">{event.date}</span>
          </div>

          <div className="event-type-cluster">
            <span className={`event-type-pill ${badgeInfo.className}`}>
              {badgeInfo.label}
            </span>
            <span className="demo-tag-tiny">DEMO</span>
          </div>
        </div>

        {/* Event Title */}
        <h3 className="event-card-title">{event.eventLabel}</h3>

        {/* Entities Involved */}
        <div className="event-entities-strip">
          <div className="entity-chip primary-chip">
            <span className="entity-chip-type">{event.primaryEntity.type}</span>
            <span className="entity-chip-name font-mono">{event.primaryEntity.identifier}</span>
            <span className="entity-chip-label">({event.primaryEntity.label})</span>
          </div>

          {event.secondaryEntity && (
            <>
              <span className="entity-arrow-join">↔</span>
              <div className="entity-chip secondary-chip">
                <span className="entity-chip-type">{event.secondaryEntity.type}</span>
                <span className="entity-chip-name font-mono">{event.secondaryEntity.identifier}</span>
                <span className="entity-chip-label">({event.secondaryEntity.label})</span>
              </div>
            </>
          )}
        </div>

        {/* Description */}
        <p className="event-card-description">{event.description}</p>

        {/* Metadata Badges if any */}
        {event.metadata && Object.keys(event.metadata).length > 0 && (
          <div className="event-metadata-row">
            {Object.entries(event.metadata).map(([key, value]) => (
              <div key={key} className="meta-attribute-pill">
                <span className="attr-k">{key}:</span>
                <span className="attr-v font-mono">{value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Evidence Source Footer */}
        <div className="event-card-footer">
          <div className="evidence-cite-wrapper">
            <span className="evidence-icon">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
            </span>
            <span className="evidence-filename font-mono">{event.evidenceSource.filename}</span>
            <span className="evidence-ref font-mono">[{event.evidenceSource.reference}]</span>
          </div>

          <span className="evidence-integrity-tag font-mono">
            {event.evidenceSource.type} • MOCK HASH VERIFIED
          </span>
        </div>
      </div>
    </div>
  );
};
