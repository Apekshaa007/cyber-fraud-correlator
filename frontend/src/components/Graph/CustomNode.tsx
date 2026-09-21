import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps, Node } from '@xyflow/react';
import type { GraphNodeData, EntityType } from '../../types';

export const CustomFraudNode: React.FC<NodeProps<Node<GraphNodeData>>> = memo(({ data, selected }) => {
  const getIcon = (type: EntityType) => {
    switch (type) {
      case 'Account':
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="5" width="20" height="14" rx="2"></rect>
            <line x1="2" y1="10" x2="22" y2="10"></line>
          </svg>
        );
      case 'Phone':
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
            <line x1="12" y1="18" x2="12.01" y2="18"></line>
          </svg>
        );
      case 'IP':
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
            <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
            <line x1="6" y1="6" x2="6.01" y2="6"></line>
            <line x1="6" y1="18" x2="6.01" y2="18"></line>
          </svg>
        );
      case 'Device':
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
            <rect x="9" y="9" width="6" height="6"></rect>
            <line x1="9" y1="1" x2="9" y2="4"></line>
            <line x1="15" y1="1" x2="15" y2="4"></line>
            <line x1="9" y1="20" x2="9" y2="23"></line>
            <line x1="15" y1="20" x2="15" y2="23"></line>
          </svg>
        );
      case 'Transaction':
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        );
      default:
        return null;
    }
  };

  const getEntityClass = (type: EntityType) => {
    switch (type) {
      case 'Account':
        return 'node-account';
      case 'Phone':
        return 'node-phone';
      case 'IP':
        return 'node-ip';
      case 'Device':
        return 'node-device';
      case 'Transaction':
        return 'node-transaction';
      default:
        return 'node-default';
    }
  };

  const getRiskIndicatorClass = (risk: GraphNodeData['riskIndicator']) => {
    switch (risk) {
      case 'high':
        return 'risk-high';
      case 'medium':
        return 'risk-medium';
      case 'low':
        return 'risk-low';
      default:
        return 'risk-neutral';
    }
  };

  return (
    <div className={`fraud-graph-node ${getEntityClass(data.entityType)} ${selected ? 'is-selected' : ''}`}>
      {/* React Flow Connection Handles */}
      <Handle type="target" position={Position.Top} className="node-handle" />
      <Handle type="source" position={Position.Bottom} className="node-handle" />
      <Handle type="target" position={Position.Left} className="node-handle" />
      <Handle type="source" position={Position.Right} className="node-handle" />

      <div className="node-header">
        <span className="node-type-icon">{getIcon(data.entityType)}</span>
        <span className="node-type-label">{data.entityType}</span>
        <span
          className={`node-risk-dot ${getRiskIndicatorClass(data.riskIndicator)}`}
          title={`Correlation Priority: ${data.riskIndicator.toUpperCase()}`}
        />
      </div>

      <div className="node-body">
        <div className="node-identifier font-mono">{data.identifier}</div>
        <div className="node-title">{data.label}</div>
      </div>

      <div className="node-footer">
        <span className="node-conn-badge">{data.connectionsCount} links</span>
        <span className="node-demo-tag">DEMO</span>
      </div>
    </div>
  );
});

CustomFraudNode.displayName = 'CustomFraudNode';
