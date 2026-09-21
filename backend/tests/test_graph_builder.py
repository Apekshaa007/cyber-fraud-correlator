import copy
import networkx as nx
import pytest
from app.services.graph_builder import (
    build_graph,
    get_graph_summary,
    get_neighbors,
    get_node,
)


def test_graph_is_networkx_multidigraph_and_nodes_created():
    resolved = {
        "entities": [
            {
                "entity_id": "ENT_ACCOUNT_ID_ACC_A",
                "entity_type": "account_id",
                "canonical_value": "ACC_A",
                "occurrences": [{"record_index": 1, "source_field": "sender_account"}],
            },
            {
                "entity_id": "ENT_ACCOUNT_ID_ACC_B",
                "entity_type": "account_id",
                "canonical_value": "ACC_B",
                "occurrences": [{"record_index": 1, "source_field": "receiver_account"}],
            },
        ],
        "relationships": [],
    }

    graph = build_graph(resolved)

    assert isinstance(graph, nx.MultiDiGraph)
    assert graph.number_of_nodes() == 2
    assert "ENT_ACCOUNT_ID_ACC_A" in graph
    assert "ENT_ACCOUNT_ID_ACC_B" in graph


def test_node_attributes_preserved():
    resolved = {
        "entities": [
            {
                "entity_id": "ENT_PHONE_12345",
                "entity_type": "phone",
                "canonical_value": "+919876543210",
                "occurrences": [{"record_index": 0, "source_field": "mobile"}],
            }
        ],
        "relationships": [],
    }

    graph = build_graph(resolved)
    node_data = graph.nodes["ENT_PHONE_12345"]

    assert node_data["entity_id"] == "ENT_PHONE_12345"
    assert node_data["entity_type"] == "phone"
    assert node_data["canonical_value"] == "+919876543210"
    assert node_data["occurrences"] == [{"record_index": 0, "source_field": "mobile"}]


def test_transaction_relationship_becomes_directed_edge_with_attributes():
    resolved = {
        "entities": [
            {
                "entity_id": "ENT_ACCOUNT_ID_ACC_A",
                "entity_type": "account_id",
                "canonical_value": "ACC_A",
                "occurrences": [{"record_index": 10, "source_field": "sender"}],
            },
            {
                "entity_id": "ENT_ACCOUNT_ID_ACC_B",
                "entity_type": "account_id",
                "canonical_value": "ACC_B",
                "occurrences": [{"record_index": 10, "source_field": "receiver"}],
            },
        ],
        "relationships": [
            {
                "source_entity_id": "ENT_ACCOUNT_ID_ACC_A",
                "target_entity_id": "ENT_ACCOUNT_ID_ACC_B",
                "relationship_type": "transaction",
                "confidence": 1.0,
                "reason": "Sender and receiver accounts were present in the same transaction record.",
                "record_indices": [10, 15],
            }
        ],
    }

    graph = build_graph(resolved)

    assert graph.number_of_edges() == 1
    assert graph.has_edge("ENT_ACCOUNT_ID_ACC_A", "ENT_ACCOUNT_ID_ACC_B")

    # Access edge data
    edge_data = graph.get_edge_data("ENT_ACCOUNT_ID_ACC_A", "ENT_ACCOUNT_ID_ACC_B")[0]
    assert edge_data["relationship_type"] == "transaction"
    assert edge_data["confidence"] == 1.0
    assert edge_data["reason"] == "Sender and receiver accounts were present in the same transaction record."
    assert edge_data["record_indices"] == [10, 15]


def test_multiple_relationships_between_same_entities():
    resolved = {
        "entities": [
            {
                "entity_id": "ENT_ACCOUNT_ID_ACC_A",
                "entity_type": "account_id",
                "canonical_value": "ACC_A",
                "occurrences": [],
            },
            {
                "entity_id": "ENT_ACCOUNT_ID_ACC_B",
                "entity_type": "account_id",
                "canonical_value": "ACC_B",
                "occurrences": [],
            },
        ],
        "relationships": [
            {
                "source_entity_id": "ENT_ACCOUNT_ID_ACC_A",
                "target_entity_id": "ENT_ACCOUNT_ID_ACC_B",
                "relationship_type": "transaction",
                "confidence": 1.0,
                "reason": "Transaction record",
                "record_indices": [1],
            },
            {
                "source_entity_id": "ENT_ACCOUNT_ID_ACC_A",
                "target_entity_id": "ENT_ACCOUNT_ID_ACC_B",
                "relationship_type": "associated_email",
                "confidence": 1.0,
                "reason": "Co-occurred in log",
                "record_indices": [2],
            },
        ],
    }

    graph = build_graph(resolved)

    assert graph.number_of_edges() == 2
    edges_dict = graph.get_edge_data("ENT_ACCOUNT_ID_ACC_A", "ENT_ACCOUNT_ID_ACC_B")
    rel_types = {e["relationship_type"] for e in edges_dict.values()}
    assert rel_types == {"transaction", "associated_email"}


def test_shared_ip_does_not_create_direct_account_to_account_edge():
    resolved = {
        "entities": [
            {"entity_id": "ENT_ACC_A", "entity_type": "account_id", "canonical_value": "ACC_A", "occurrences": []},
            {"entity_id": "ENT_ACC_B", "entity_type": "account_id", "canonical_value": "ACC_B", "occurrences": []},
            {"entity_id": "ENT_IP_1", "entity_type": "ip_address", "canonical_value": "192.168.1.1", "occurrences": []},
        ],
        "relationships": [
            {
                "source_entity_id": "ENT_ACC_A",
                "target_entity_id": "ENT_IP_1",
                "relationship_type": "associated_ip",
                "confidence": 1.0,
                "reason": "Co-observed",
                "record_indices": [1],
            },
            {
                "source_entity_id": "ENT_ACC_B",
                "target_entity_id": "ENT_IP_1",
                "relationship_type": "associated_ip",
                "confidence": 1.0,
                "reason": "Co-observed",
                "record_indices": [2],
            },
        ],
    }

    graph = build_graph(resolved)

    assert graph.has_edge("ENT_ACC_A", "ENT_IP_1")
    assert graph.has_edge("ENT_ACC_B", "ENT_IP_1")
    # Crucial guardrail: No direct edge between ACC_A and ACC_B!
    assert not graph.has_edge("ENT_ACC_A", "ENT_ACC_B")
    assert not graph.has_edge("ENT_ACC_B", "ENT_ACC_A")


def test_shared_imei_does_not_create_direct_account_to_account_edge():
    resolved = {
        "entities": [
            {"entity_id": "ENT_ACC_X", "entity_type": "account_id", "canonical_value": "ACC_X", "occurrences": []},
            {"entity_id": "ENT_ACC_Y", "entity_type": "account_id", "canonical_value": "ACC_Y", "occurrences": []},
            {"entity_id": "ENT_IMEI_1", "entity_type": "imei", "canonical_value": "861234567890123", "occurrences": []},
        ],
        "relationships": [
            {
                "source_entity_id": "ENT_ACC_X",
                "target_entity_id": "ENT_IMEI_1",
                "relationship_type": "associated_imei",
                "confidence": 1.0,
                "reason": "Co-observed",
                "record_indices": [1],
            },
            {
                "source_entity_id": "ENT_ACC_Y",
                "target_entity_id": "ENT_IMEI_1",
                "relationship_type": "associated_imei",
                "confidence": 1.0,
                "reason": "Co-observed",
                "record_indices": [2],
            },
        ],
    }

    graph = build_graph(resolved)

    assert not graph.has_edge("ENT_ACC_X", "ENT_ACC_Y")
    assert not graph.has_edge("ENT_ACC_Y", "ENT_ACC_X")


def test_get_node_and_get_neighbors():
    resolved = {
        "entities": [
            {"entity_id": "E1", "entity_type": "account_id", "canonical_value": "ACC_1", "occurrences": []},
            {"entity_id": "E2", "entity_type": "phone", "canonical_value": "+15550001111", "occurrences": []},
        ],
        "relationships": [
            {
                "source_entity_id": "E1",
                "target_entity_id": "E2",
                "relationship_type": "associated_phone",
                "confidence": 1.0,
                "reason": "Co-observed",
                "record_indices": [1],
            }
        ],
    }

    graph = build_graph(resolved)

    # Test get_node
    node1 = get_node(graph, "E1")
    assert node1 is not None
    assert node1["canonical_value"] == "ACC_1"
    assert get_node(graph, "NON_EXISTENT") is None

    # Test get_neighbors
    neighbors = get_neighbors(graph, "E1")
    assert len(neighbors) == 1
    assert neighbors[0]["entity_id"] == "E2"
    assert neighbors[0]["canonical_value"] == "+15550001111"

    assert get_neighbors(graph, "NON_EXISTENT") == []


def test_get_graph_summary():
    resolved = {
        "entities": [
            {"entity_id": "E1", "entity_type": "account_id", "canonical_value": "ACC_1", "occurrences": []},
            {"entity_id": "E2", "entity_type": "account_id", "canonical_value": "ACC_2", "occurrences": []},
            {"entity_id": "E3", "entity_type": "ip_address", "canonical_value": "10.0.0.1", "occurrences": []},
        ],
        "relationships": [
            {
                "source_entity_id": "E1",
                "target_entity_id": "E2",
                "relationship_type": "transaction",
                "confidence": 1.0,
                "reason": "Txn",
                "record_indices": [1],
            },
            {
                "source_entity_id": "E1",
                "target_entity_id": "E3",
                "relationship_type": "associated_ip",
                "confidence": 1.0,
                "reason": "IP assoc",
                "record_indices": [1],
            },
        ],
    }

    graph = build_graph(resolved)
    summary = get_graph_summary(graph)

    assert summary["node_count"] == 3
    assert summary["edge_count"] == 2
    assert summary["entity_types"] == {"account_id": 2, "ip_address": 1}
    assert summary["relationship_types"] == {"transaction": 1, "associated_ip": 1}


def test_empty_graph_input_handled_safely():
    graph = build_graph({"entities": [], "relationships": []})
    assert graph.number_of_nodes() == 0
    assert graph.number_of_edges() == 0

    summary = get_graph_summary(graph)
    assert summary["node_count"] == 0
    assert summary["edge_count"] == 0


def test_missing_entity_referenced_by_relationship_raises_value_error():
    resolved = {
        "entities": [
            {"entity_id": "E1", "entity_type": "account_id", "canonical_value": "ACC_1", "occurrences": []}
        ],
        "relationships": [
            {
                "source_entity_id": "E1",
                "target_entity_id": "MISSING_E2",
                "relationship_type": "transaction",
                "confidence": 1.0,
                "reason": "Txn",
                "record_indices": [1],
            }
        ],
    }

    with pytest.raises(ValueError, match="Relationship references missing target entity ID: 'MISSING_E2'"):
        build_graph(resolved)


def test_input_immutability():
    resolved = {
        "entities": [
            {"entity_id": "E1", "entity_type": "account_id", "canonical_value": "ACC_1", "occurrences": []}
        ],
        "relationships": [],
    }
    original_copy = copy.deepcopy(resolved)

    build_graph(resolved)

    assert resolved == original_copy
