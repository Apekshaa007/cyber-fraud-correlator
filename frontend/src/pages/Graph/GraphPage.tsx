import React, { useState, useCallback } from 'react';
import { FraudGraph } from '../../components/Graph/FraudGraph';
import { EntityDetailsPanel } from '../../components/Graph/EntityDetailsPanel';
import { RelationshipDetailsPanel } from '../../components/Graph/RelationshipDetailsPanel';
import { WhyConnectedPanel } from '../../components/Graph/WhyConnectedPanel';
import {
  INITIAL_GRAPH_NODES,
  INITIAL_GRAPH_EDGES,
  MOCK_ENTITY_DETAILS,
  MOCK_RELATIONSHIP_DETAILS,
} from '../../mock/graphData';
import type { EntityType } from '../../types';
import './GraphPage.css';

type SidebarTab = 'entity' | 'relationship' | 'why_connected';

export const GraphPage: React.FC = () => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('node-acc-a');
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<SidebarTab>('entity');
  const [entityTypeFilter, setEntityTypeFilter] = useState<EntityType | 'ALL'>('ALL');

  const handleSelectNode = useCallback((nodeId: string | null) => {
    setSelectedNodeId(nodeId);
    if (nodeId) {
      setSelectedEdgeId(null);
      setActiveTab('entity');
    }
  }, []);

  const handleSelectEdge = useCallback((edgeId: string | null) => {
    setSelectedEdgeId(edgeId);
    if (edgeId) {
      setSelectedNodeId(null);
      // Automatically switch to Why Connected tab for instant evidentiary explanation
      setActiveTab('why_connected');
    }
  }, []);

  const handleClearSelection = () => {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  };

  const selectedEntity = selectedNodeId ? MOCK_ENTITY_DETAILS[selectedNodeId] || null : null;
  const selectedRelationship = selectedEdgeId ? MOCK_RELATIONSHIP_DETAILS[selectedEdgeId] || null : null;

  // Fallback: If on relationship/why_connected tab but no edge is selected, check if selected node has an edge
  const effectiveRelationship =
    selectedRelationship ||
    (selectedNodeId === 'node-acc-a' ? MOCK_RELATIONSHIP_DETAILS['edge-accA-txnA'] : null);

  return (
    <div className="graph-page-container">
      {/* Top Header */}
      <div className="graph-top-header">
        <div className="graph-title-group">
          <div className="graph-breadcrumb">
            <span>Case DEMO-CASE-001</span>
            <span>/</span>
            <span>Fraud Correlation Canvas</span>
          </div>
          <h1 className="graph-main-title">
            Fraud Relationship Graph
            <span className="graph-badge-demo">MOCK WORKBENCH</span>
          </h1>
        </div>

        <div className="graph-top-metrics">
          <div className="metric-pill-graph">
            <span className="pill-label">Indexed Entities:</span>
            <span className="pill-count">{INITIAL_GRAPH_NODES.length}</span>
          </div>
          <div className="metric-pill-graph">
            <span className="pill-label">Detected Relationships:</span>
            <span className="pill-count">{INITIAL_GRAPH_EDGES.length}</span>
          </div>
          <div className="metric-pill-graph">
            <span className="pill-label">Active Mode:</span>
            <span className="pill-count text-primary">Interactive Topology</span>
          </div>
        </div>
      </div>

      {/* Filter & Control Toolbar */}
      <div className="graph-toolbar">
        <div className="toolbar-left">
          <span className="toolbar-label">Filter Entity Type:</span>
          <div className="entity-filter-buttons">
            {(['ALL', 'Account', 'Phone', 'IP', 'Device', 'Transaction'] as const).map((type) => (
              <button
                key={type}
                type="button"
                className={`filter-chip-btn ${entityTypeFilter === type ? 'active' : ''}`}
                onClick={() => setEntityTypeFilter(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="toolbar-right">
          {(selectedNodeId || selectedEdgeId) && (
            <div className="selection-indicator">
              <span>
                {selectedNodeId
                  ? `Selected: ${selectedEntity?.label || selectedNodeId}`
                  : `Selected: ${selectedRelationship?.relationshipType || selectedEdgeId}`}
              </span>
              <button
                type="button"
                className="clear-selection-btn"
                onClick={handleClearSelection}
                title="Clear current selection"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Workspace: Graph Canvas (Left) + Inspector Sidebar (Right) */}
      <div className="graph-workspace-layout">
        {/* Left Column: Interactive Graph */}
        <div className="graph-canvas-card">
          <FraudGraph
            initialNodes={INITIAL_GRAPH_NODES}
            initialEdges={INITIAL_GRAPH_EDGES}
            selectedNodeId={selectedNodeId}
            selectedEdgeId={selectedEdgeId}
            onSelectNode={handleSelectNode}
            onSelectEdge={handleSelectEdge}
            entityTypeFilter={entityTypeFilter}
          />

          {/* Bottom Graph Legend */}
          <div className="graph-canvas-legend">
            <div className="legend-items-group">
              <div className="legend-item">
                <span className="legend-color-dot" style={{ backgroundColor: '#3b82f6' }}></span>
                <span>Account</span>
              </div>
              <div className="legend-item">
                <span className="legend-color-dot" style={{ backgroundColor: '#10b981' }}></span>
                <span>Phone</span>
              </div>
              <div className="legend-item">
                <span className="legend-color-dot" style={{ backgroundColor: '#f59e0b' }}></span>
                <span>IP Address</span>
              </div>
              <div className="legend-item">
                <span className="legend-color-dot" style={{ backgroundColor: '#8b5cf6' }}></span>
                <span>Device</span>
              </div>
              <div className="legend-item">
                <span className="legend-color-dot" style={{ backgroundColor: '#ef4444' }}></span>
                <span>Transaction</span>
              </div>
            </div>

            <div className="legend-notice">
              <span>Click node for Entity Details • Click edge for Why Connected</span>
            </div>
          </div>
        </div>

        {/* Right Column: Forensic Inspector with Tabbed Views */}
        <div className="graph-inspection-sidebar">
          {/* Tab Navigation */}
          <div className="sidebar-tab-switcher" role="tablist">
            <button
              type="button"
              className={`sidebar-tab-btn ${activeTab === 'entity' ? 'active' : ''}`}
              onClick={() => setActiveTab('entity')}
              role="tab"
              aria-selected={activeTab === 'entity'}
            >
              Entity Details
            </button>
            <button
              type="button"
              className={`sidebar-tab-btn ${activeTab === 'relationship' ? 'active' : ''}`}
              onClick={() => setActiveTab('relationship')}
              role="tab"
              aria-selected={activeTab === 'relationship'}
            >
              Relationship
            </button>
            <button
              type="button"
              className={`sidebar-tab-btn ${activeTab === 'why_connected' ? 'active' : ''}`}
              onClick={() => setActiveTab('why_connected')}
              role="tab"
              aria-selected={activeTab === 'why_connected'}
            >
              Why Connected?
            </button>
          </div>

          {/* Active Tab Panel */}
          {activeTab === 'entity' && (
            <EntityDetailsPanel
              entity={selectedEntity}
              onSelectRelatedEntity={(id) => handleSelectNode(id)}
              onClose={() => setSelectedNodeId(null)}
            />
          )}

          {activeTab === 'relationship' && (
            <RelationshipDetailsPanel
              relationship={selectedRelationship}
              onClose={() => setSelectedEdgeId(null)}
            />
          )}

          {activeTab === 'why_connected' && (
            <WhyConnectedPanel relationship={effectiveRelationship} />
          )}
        </div>
      </div>
    </div>
  );
};

export default GraphPage;
