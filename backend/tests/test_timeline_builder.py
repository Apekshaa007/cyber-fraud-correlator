import copy
import pytest
from app.services.timeline_builder import (
    build_timeline,
    parse_and_normalize_timestamp,
)


def test_timestamp_parsing_and_normalization():
    iso_str, epoch = parse_and_normalize_timestamp("2026-09-21T10:15:00Z")
    assert iso_str is not None
    assert "2026-09-21T10:15:00" in iso_str
    assert epoch > 0

    iso_str_invalid, epoch_invalid = parse_and_normalize_timestamp("not_a_date")
    assert iso_str_invalid is None
    assert epoch_invalid == -1.0


def test_chronological_ordering():
    records = [
        {"timestamp": "2026-09-21T12:00:00Z", "note": "Later event"},
        {"timestamp": "2026-09-21T08:00:00Z", "note": "Earlier event"},
        {"timestamp": "2026-09-21T10:00:00Z", "note": "Middle event"},
    ]
    timeline = build_timeline(records)

    assert len(timeline) == 3
    assert timeline[0]["record_index"] == 1
    assert timeline[1]["record_index"] == 2
    assert timeline[2]["record_index"] == 0


def test_transaction_event_creation_and_entity_id_preservation():
    records = [
        {
            "transaction_time": "2026-09-21T10:15:00Z",
            "sender_account": "ACC_A",
            "receiver_account": "ACC_B",
            "amount": 5000,
        }
    ]
    entities = [
        {
            "entity_id": "ENT_ACC_A",
            "entity_type": "account_id",
            "canonical_value": "ACC_A",
            "occurrences": [{"record_index": 0, "source_field": "sender_account"}],
        },
        {
            "entity_id": "ENT_ACC_B",
            "entity_type": "account_id",
            "canonical_value": "ACC_B",
            "occurrences": [{"record_index": 0, "source_field": "receiver_account"}],
        },
    ]

    timeline = build_timeline(records, entities=entities)

    assert len(timeline) == 1
    ev = timeline[0]
    assert ev["event_type"] == "transaction"
    assert ev["record_index"] == 0
    assert ev["entity_ids"] == ["ENT_ACC_A", "ENT_ACC_B"]
    assert "ACC_A" in ev["description"]
    assert "ACC_B" in ev["description"]
    assert ev["source_field"] == "transaction_time"


def test_entity_relationship_events():
    records = [
        {
            "created_at": "2026-09-21T11:00:00Z",
            "account_id": "ACC_101",
            "ip_address": "192.168.1.1",
        }
    ]
    entities = [
        {"entity_id": "ENT_ACC_101", "entity_type": "account_id", "canonical_value": "ACC_101", "occurrences": [{"record_index": 0, "source_field": "account_id"}]},
        {"entity_id": "ENT_IP_1", "entity_type": "ip_address", "canonical_value": "192.168.1.1", "occurrences": [{"record_index": 0, "source_field": "ip_address"}]},
    ]
    relationships = [
        {
            "source_entity_id": "ENT_ACC_101",
            "target_entity_id": "ENT_IP_1",
            "relationship_type": "associated_ip",
            "reason": "Account and IP address observed together",
            "record_indices": [0],
        }
    ]

    timeline = build_timeline(records, entities=entities, relationships=relationships)

    assert len(timeline) == 1
    ev = timeline[0]
    assert ev["event_type"] == "associated_ip"
    assert ev["entity_ids"] == ["ENT_ACC_101", "ENT_IP_1"]
    assert ev["record_index"] == 0


def test_same_timestamp_deterministic_ordering():
    # Same timestamp, different record_index
    records = [
        {"timestamp": "2026-09-21T10:00:00Z", "event": "First in list"},
        {"timestamp": "2026-09-21T10:00:00Z", "event": "Second in list"},
    ]

    timeline1 = build_timeline(records)
    timeline2 = build_timeline(records)

    assert timeline1 == timeline2
    assert timeline1[0]["record_index"] == 0
    assert timeline1[1]["record_index"] == 1


def test_malformed_and_missing_timestamps():
    records = [
        {"timestamp": "2026-09-21T10:00:00Z", "valid": True},
        {"timestamp": "invalid_date_string", "valid": False},
        {"no_timestamp_col": "some_data"},
    ]

    timeline = build_timeline(records)

    # Only 1 valid record with timestamp included
    assert len(timeline) == 1
    assert timeline[0]["record_index"] == 0


def test_empty_input_handled_safely():
    assert build_timeline([]) == []


def test_invalid_input_structure_raises_value_error():
    with pytest.raises(ValueError, match="Input records must be a list"):
        build_timeline("not_a_list")


def test_input_immutability():
    records = [
        {"timestamp": "2026-09-21T10:00:00Z", "sender_account": "ACC_A"}
    ]
    records_copy = copy.deepcopy(records)

    build_timeline(records)

    assert records == records_copy
