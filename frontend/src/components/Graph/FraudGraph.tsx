import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
} from '@xyflow/react';
import type { Node, Edge, OnNodesChange, OnEdgesChange } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { CustomFraudNode } from './CustomNode';
import type { GraphNodeData, GraphEdgeData, EntityType } from '../../types';

interface FraudGraphProps {
  initialNodes: Node<GraphNodeData>[];
  initialEdges: Edge<GraphEdgeData>[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  onSelectEdge: (edgeId: string | null) => void;
  entityTypeFilter: EntityType | 'ALL';
}

const nodeTypes = {
  fraudNode: CustomFraudNode,
};

export const FraudGraph: React.FC<FraudGraphProps> = ({
  initialNodes,
  initialEdges,
  selectedNodeId,
  selectedEdgeId,
  onSelectNode,
  onSelectEdge,
  entityTypeFilter,
}) => {
  const [nodes, , onNodesChange] = useNodesState<Node<GraphNodeData>>(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState<Edge<GraphEdgeData>>(initialEdges);

  // Sync selection and filtering
  const displayNodes = useMemo(() => {
    return nodes.map((node) => {
      const isFilteredOut = entityTypeFilter !== 'ALL' && node.data.entityType !== entityTypeFilter;
      return {
        ...node,
        selected: node.id === selectedNodeId,
        style: {
          ...node.style,
          opacity: isFilteredOut ? 0.25 : 1,
          pointerEvents: isFilteredOut ? ('none' as const) : ('all' as const),
        },
      };
    });
  }, [nodes, selectedNodeId, entityTypeFilter]);

  const displayEdges = useMemo(() => {
    return edges.map((edge) => {
      const isSelected = edge.id === selectedEdgeId;
      return {
        ...edge,
        selected: isSelected,
        style: {
          ...edge.style,
          stroke: isSelected ? '#38bdf8' : (edge.style?.stroke || '#3b82f6'),
          strokeWidth: isSelected ? 3.5 : (edge.style?.strokeWidth || 2),
        },
      };
    });
  }, [edges, selectedEdgeId]);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node<GraphNodeData>) => {
      onSelectNode(node.id);
      onSelectEdge(null);
    },
    [onSelectNode, onSelectEdge]
  );

  const handleEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge<GraphEdgeData>) => {
      onSelectEdge(edge.id);
      onSelectNode(null);
    },
    [onSelectNode, onSelectEdge]
  );

  const handlePaneClick = useCallback(() => {
    onSelectNode(null);
    onSelectEdge(null);
  }, [onSelectNode, onSelectEdge]);

  return (
    <div className="fraud-graph-canvas-container">
      <ReactFlow
        nodes={displayNodes}
        edges={displayEdges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange as OnNodesChange<Node<GraphNodeData>>}
        onEdgesChange={onEdgesChange as OnEdgesChange<Edge<GraphEdgeData>>}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        onPaneClick={handlePaneClick}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.4}
        maxZoom={2.0}
        attributionPosition="bottom-left"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1.2}
          color="#1e293b"
        />
        <Controls className="graph-controls-custom" showInteractive={false} />
        <MiniMap
          className="graph-minimap-custom"
          nodeColor={(n) => {
            const data = n.data as GraphNodeData | undefined;
            switch (data?.entityType) {
              case 'Account':
                return '#3b82f6';
              case 'Phone':
                return '#10b981';
              case 'IP':
                return '#f59e0b';
              case 'Device':
                return '#8b5cf6';
              case 'Transaction':
                return '#ef4444';
              default:
                return '#64748b';
            }
          }}
          maskColor="rgba(11, 15, 25, 0.75)"
        />
      </ReactFlow>
    </div>
  );
};
