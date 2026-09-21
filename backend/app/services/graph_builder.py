from typing import Any, Dict, List, Optional
import networkx as nx


def build_graph(resolved_data: Dict[str, Any]) -> nx.MultiDiGraph:
    """
    Constructs an in-memory NetworkX MultiDiGraph from entity resolution output.
    Does NOT infer missing nodes or unauthorized relationships.
    Input dictionary remains unmutated.
    """
    if not isinstance(resolved_data, dict):
        raise ValueError("Input resolved_data must be a dictionary")

    entities = resolved_data.get("entities", [])
    relationships = resolved_data.get("relationships", [])

    graph = nx.MultiDiGraph()

    # 1. Add nodes for all canonical entities
    for entity in entities:
        entity_id = entity.get("entity_id")
        if not entity_id:
            continue

        graph.add_node(
            entity_id,
            entity_id=entity_id,
            entity_type=entity.get("entity_type", ""),
            canonical_value=entity.get("canonical_value", ""),
            occurrences=entity.get("occurrences", []),
        )

    # 2. Add edges for resolved relationships
    for rel in relationships:
        src_id = rel.get("source_entity_id")
        tgt_id = rel.get("target_entity_id")

        if not src_id or src_id not in graph:
            raise ValueError(f"Relationship references missing source entity ID: '{src_id}'")
        if not tgt_id or tgt_id not in graph:
            raise ValueError(f"Relationship references missing target entity ID: '{tgt_id}'")

        graph.add_edge(
            src_id,
            tgt_id,
            relationship_type=rel.get("relationship_type", ""),
            confidence=float(rel.get("confidence", 1.0)),
            reason=rel.get("reason", ""),
            record_indices=rel.get("record_indices", []),
        )

    return graph


def get_node(graph: nx.MultiDiGraph, entity_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieves attributes for a specific entity node in the graph.
    Returns None if the entity node does not exist.
    """
    if not graph.has_node(entity_id):
        return None
    return dict(graph.nodes[entity_id])


def get_neighbors(graph: nx.MultiDiGraph, entity_id: str) -> List[Dict[str, Any]]:
    """
    Retrieves all directly connected neighbor entity nodes (both incoming and outgoing).
    """
    if not graph.has_node(entity_id):
        return []

    # Combine predecessors and successors for undirected neighbor discovery
    neighbor_ids = set(graph.predecessors(entity_id)).union(set(graph.successors(entity_id)))
    neighbors: List[Dict[str, Any]] = []

    for nid in neighbor_ids:
        neighbors.append(dict(graph.nodes[nid]))

    return neighbors


def get_graph_summary(graph: nx.MultiDiGraph) -> Dict[str, Any]:
    """
    Returns statistical summary of nodes, edges, entity types, and relationship types.
    """
    node_count = graph.number_of_nodes()
    edge_count = graph.number_of_edges()

    entity_types: Dict[str, int] = {}
    for _, node_data in graph.nodes(data=True):
        e_type = node_data.get("entity_type", "unknown")
        entity_types[e_type] = entity_types.get(e_type, 0) + 1

    relationship_types: Dict[str, int] = {}
    for _, _, edge_data in graph.edges(data=True):
        r_type = edge_data.get("relationship_type", "unknown")
        relationship_types[r_type] = relationship_types.get(r_type, 0) + 1

    return {
        "node_count": node_count,
        "edge_count": edge_count,
        "entity_types": entity_types,
        "relationship_types": relationship_types,
    }
