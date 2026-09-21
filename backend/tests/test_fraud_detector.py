import copy
import networkx as nx
from app.services.fraud_detector import detect_patterns, generate_finding_id


def build_test_graph(entities, relationships) -> nx.MultiDiGraph:
    graph = nx.MultiDiGraph()
    for e in entities:
        graph.add_node(
            e["entity_id"],
            entity_id=e["entity_id"],
            entity_type=e["entity_type"],
            canonical_value=e["canonical_value"],
            occurrences=e.get("occurrences", []),
        )
    for r in relationships:
        graph.add_edge(
            r["source_entity_id"],
            r["target_entity_id"],
            relationship_type=r["relationship_type"],
            confidence=r.get("confidence", 1.0),
            reason=r.get("reason", ""),
            record_indices=r.get("record_indices", []),
            timestamp=r.get("timestamp"),
        )
    return graph


def test_multiple_senders_same_receiver_with_2_senders():
    entities = [
        {"entity_id": "ACC_A", "entity_type": "account_id", "canonical_value": "ACC_A"},
        {"entity_id": "ACC_B", "entity_type": "account_id", "canonical_value": "ACC_B"},
        {"entity_id": "ACC_M", "entity_type": "account_id", "canonical_value": "ACC_M"},
    ]
    relationships = [
        {"source_entity_id": "ACC_A", "target_entity_id": "ACC_M", "relationship_type": "transaction", "record_indices": [10]},
        {"source_entity_id": "ACC_B", "target_entity_id": "ACC_M", "relationship_type": "transaction", "record_indices": [12]},
    ]
    graph = build_test_graph(entities, relationships)
    res = detect_patterns(graph)

    assert len(res["findings"]) == 1
    f = res["findings"][0]
    assert f["pattern_type"] == "multiple_senders_same_receiver"
    assert f["priority"] == "medium"
    assert "ACC_M" in f["entity_ids"]
    assert "ACC_A" in f["entity_ids"]
    assert "ACC_B" in f["entity_ids"]
    assert f["record_indices"] == [10, 12]
    assert "Two distinct sender accounts" in f["reason"] or "2 distinct sender accounts" in f["reason"]


def test_multiple_senders_same_receiver_with_3_plus_senders():
    entities = [
        {"entity_id": "ACC_A", "entity_type": "account_id", "canonical_value": "ACC_A"},
        {"entity_id": "ACC_B", "entity_type": "account_id", "canonical_value": "ACC_B"},
        {"entity_id": "ACC_C", "entity_type": "account_id", "canonical_value": "ACC_C"},
        {"entity_id": "ACC_M", "entity_type": "account_id", "canonical_value": "ACC_M"},
    ]
    relationships = [
        {"source_entity_id": "ACC_A", "target_entity_id": "ACC_M", "relationship_type": "transaction", "record_indices": [1]},
        {"source_entity_id": "ACC_B", "target_entity_id": "ACC_M", "relationship_type": "transaction", "record_indices": [2]},
        {"source_entity_id": "ACC_C", "target_entity_id": "ACC_M", "relationship_type": "transaction", "record_indices": [3]},
    ]
    graph = build_test_graph(entities, relationships)
    res = detect_patterns(graph)

    assert len(res["findings"]) == 1
    f = res["findings"][0]
    assert f["pattern_type"] == "multiple_senders_same_receiver"
    assert f["priority"] == "high"
    assert len(f["entity_ids"]) == 4


def test_onward_transfer():
    entities = [
        {"entity_id": "ACC_A", "entity_type": "account_id", "canonical_value": "ACC_A"},
        {"entity_id": "ACC_B", "entity_type": "account_id", "canonical_value": "ACC_B"},
        {"entity_id": "ACC_C", "entity_type": "account_id", "canonical_value": "ACC_C"},
    ]
    relationships = [
        {"source_entity_id": "ACC_A", "target_entity_id": "ACC_B", "relationship_type": "transaction", "record_indices": [101]},
        {"source_entity_id": "ACC_B", "target_entity_id": "ACC_C", "relationship_type": "transaction", "record_indices": [102]},
    ]
    graph = build_test_graph(entities, relationships)
    res = detect_patterns(graph)

    assert len(res["findings"]) == 1
    f = res["findings"][0]
    assert f["pattern_type"] == "onward_transfer"
    assert f["priority"] == "medium"
    assert set(f["entity_ids"]) == {"ACC_A", "ACC_B", "ACC_C"}
    assert f["record_indices"] == [101, 102]


def test_multi_hop_transaction_chain():
    entities = [
        {"entity_id": "ACC_A", "entity_type": "account_id", "canonical_value": "ACC_A"},
        {"entity_id": "ACC_B", "entity_type": "account_id", "canonical_value": "ACC_B"},
        {"entity_id": "ACC_C", "entity_type": "account_id", "canonical_value": "ACC_C"},
        {"entity_id": "ACC_D", "entity_type": "account_id", "canonical_value": "ACC_D"},
    ]
    relationships = [
        {"source_entity_id": "ACC_A", "target_entity_id": "ACC_B", "relationship_type": "transaction", "record_indices": [1]},
        {"source_entity_id": "ACC_B", "target_entity_id": "ACC_C", "relationship_type": "transaction", "record_indices": [2]},
        {"source_entity_id": "ACC_C", "target_entity_id": "ACC_D", "relationship_type": "transaction", "record_indices": [3]},
    ]
    graph = build_test_graph(entities, relationships)
    res = detect_patterns(graph)

    # Contains both multi_hop_transaction_chain and onward_transfers (A->B->C, B->C->D)
    multi_hop_findings = [f for f in res["findings"] if f["pattern_type"] == "multi_hop_transaction_chain"]
    assert len(multi_hop_findings) == 1
    f = multi_hop_findings[0]
    assert f["priority"] == "high"
    assert f["entity_ids"] == ["ACC_A", "ACC_B", "ACC_C", "ACC_D"]


def test_shared_ip_and_imei_detection_and_guardrails():
    entities = [
        {"entity_id": "ACC_A", "entity_type": "account_id", "canonical_value": "ACC_A"},
        {"entity_id": "ACC_B", "entity_type": "account_id", "canonical_value": "ACC_B"},
        {"entity_id": "IP_1", "entity_type": "ip_address", "canonical_value": "192.168.1.1"},
        {"entity_id": "IMEI_1", "entity_type": "imei", "canonical_value": "861234567890123"},
    ]
    relationships = [
        {"source_entity_id": "ACC_A", "target_entity_id": "IP_1", "relationship_type": "associated_ip", "record_indices": [1]},
        {"source_entity_id": "ACC_B", "target_entity_id": "IP_1", "relationship_type": "associated_ip", "record_indices": [2]},
        {"source_entity_id": "ACC_A", "target_entity_id": "IMEI_1", "relationship_type": "associated_imei", "record_indices": [1]},
        {"source_entity_id": "ACC_B", "target_entity_id": "IMEI_1", "relationship_type": "associated_imei", "record_indices": [2]},
    ]
    graph = build_test_graph(entities, relationships)
    res = detect_patterns(graph)

    assert len(res["findings"]) == 2
    ip_finding = next(f for f in res["findings"] if "IP" in f["title"])
    imei_finding = next(f for f in res["findings"] if "IMEI" in f["title"])

    assert ip_finding["priority"] == "low"
    assert imei_finding["priority"] == "low"

    # Guardrail verification: No claims of guilt or identity
    for f in (ip_finding, imei_finding):
        for forbidden in ["fraudster", "guilty", "criminal", "same person", "confirmed fraud"]:
            assert forbidden not in f["description"].lower()
            assert forbidden not in f["reason"].lower()


def test_correct_investigative_priority_and_ordering():
    entities = [
        {"entity_id": "ACC_A", "entity_type": "account_id", "canonical_value": "ACC_A"},
        {"entity_id": "ACC_B", "entity_type": "account_id", "canonical_value": "ACC_B"},
        {"entity_id": "ACC_C", "entity_type": "account_id", "canonical_value": "ACC_C"},
        {"entity_id": "ACC_M", "entity_type": "account_id", "canonical_value": "ACC_M"},
        {"entity_id": "IP_1", "entity_type": "ip_address", "canonical_value": "10.0.0.1"},
    ]
    relationships = [
        {"source_entity_id": "ACC_A", "target_entity_id": "ACC_M", "relationship_type": "transaction", "record_indices": [1]},
        {"source_entity_id": "ACC_B", "target_entity_id": "ACC_M", "relationship_type": "transaction", "record_indices": [2]},
        {"source_entity_id": "ACC_C", "target_entity_id": "ACC_M", "relationship_type": "transaction", "record_indices": [3]},
        {"source_entity_id": "ACC_A", "target_entity_id": "IP_1", "relationship_type": "associated_ip", "record_indices": [1]},
        {"source_entity_id": "ACC_B", "target_entity_id": "IP_1", "relationship_type": "associated_ip", "record_indices": [2]},
    ]
    graph = build_test_graph(entities, relationships)
    res = detect_patterns(graph)

    assert len(res["findings"]) == 2
    # First finding must be HIGH priority, second LOW priority
    assert res["findings"][0]["priority"] == "high"
    assert res["findings"][1]["priority"] == "low"


test_high_velocity_when_timestamp_exists_and_skips_when_absent = None


def test_high_velocity_detection_when_timestamp_exists():
    entities = [
        {"entity_id": "ACC_A", "entity_type": "account_id", "canonical_value": "ACC_A"},
        {"entity_id": "ACC_B", "entity_type": "account_id", "canonical_value": "ACC_B"},
    ]
    relationships = [
        {"source_entity_id": "ACC_A", "target_entity_id": "ACC_B", "relationship_type": "transaction", "record_indices": [1], "timestamp": "2026-09-21T20:00:00Z"},
        {"source_entity_id": "ACC_A", "target_entity_id": "ACC_B", "relationship_type": "transaction", "record_indices": [2], "timestamp": "2026-09-21T20:03:00Z"},
        {"source_entity_id": "ACC_A", "target_entity_id": "ACC_B", "relationship_type": "transaction", "record_indices": [3], "timestamp": "2026-09-21T20:05:00Z"},
    ]
    graph = build_test_graph(entities, relationships)
    res = detect_patterns(graph)

    vel_findings = [f for f in res["findings"] if f["pattern_type"] == "high_transaction_velocity"]
    assert len(vel_findings) == 2
    acc_ids = {f["entity_ids"][0] for f in vel_findings}
    assert acc_ids == {"ACC_A", "ACC_B"}
    assert all(f["priority"] == "high" for f in vel_findings)


def test_high_velocity_skips_safely_when_timestamp_absent():
    entities = [
        {"entity_id": "ACC_A", "entity_type": "account_id", "canonical_value": "ACC_A"},
        {"entity_id": "ACC_B", "entity_type": "account_id", "canonical_value": "ACC_B"},
    ]
    # No timestamps provided
    relationships = [
        {"source_entity_id": "ACC_A", "target_entity_id": "ACC_B", "relationship_type": "transaction", "record_indices": [1]},
        {"source_entity_id": "ACC_A", "target_entity_id": "ACC_B", "relationship_type": "transaction", "record_indices": [2]},
        {"source_entity_id": "ACC_A", "target_entity_id": "ACC_B", "relationship_type": "transaction", "record_indices": [3]},
    ]
    graph = build_test_graph(entities, relationships)
    res = detect_patterns(graph)

    vel_findings = [f for f in res["findings"] if f["pattern_type"] == "high_transaction_velocity"]
    assert len(vel_findings) == 0


def test_empty_graph_handled_safely():
    graph = nx.MultiDiGraph()
    res = detect_patterns(graph)
    assert res == {"findings": []}


def test_input_graph_immutability():
    entities = [{"entity_id": "ACC_A", "entity_type": "account_id", "canonical_value": "ACC_A"}]
    graph = build_test_graph(entities, [])
    nodes_before = list(graph.nodes(data=True))

    detect_patterns(graph)

    assert list(graph.nodes(data=True)) == nodes_before
