import copy
from app.services.entity_resolver import generate_canonical_id, resolve_entities


def test_same_account_identifier_resolves_to_one_canonical_entity():
    extracted = [
        {"entity_type": "account_id", "value": "ACC_101", "record_index": 12, "source_field": "account_id"},
        {"entity_type": "account_id", "value": "ACC_101", "record_index": 48, "source_field": "sender_account"},
    ]
    result = resolve_entities(extracted)
    assert len(result["entities"]) == 1
    entity = result["entities"][0]
    assert entity["canonical_value"] == "ACC_101"
    assert entity["entity_type"] == "account_id"
    assert len(entity["occurrences"]) == 2
    assert entity["occurrences"][0] == {"record_index": 12, "source_field": "account_id"}
    assert entity["occurrences"][1] == {"record_index": 48, "source_field": "sender_account"}


def test_same_phone_identifier_resolves_to_one_canonical_entity():
    extracted = [
        {"entity_type": "phone", "value": "+919876543210", "record_index": 1, "source_field": "mobile"},
        {"entity_type": "phone", "value": "+919876543210", "record_index": 5, "source_field": "contact_no"},
    ]
    result = resolve_entities(extracted)
    assert len(result["entities"]) == 1
    assert result["entities"][0]["canonical_value"] == "+919876543210"


def test_same_email_resolves_to_one_canonical_entity():
    extracted = [
        {"entity_type": "email", "value": "user@example.com", "record_index": 0, "source_field": "email"},
        {"entity_type": "email", "value": "user@example.com", "record_index": 2, "source_field": "email_address"},
    ]
    result = resolve_entities(extracted)
    assert len(result["entities"]) == 1
    assert result["entities"][0]["canonical_value"] == "user@example.com"


def test_different_identifiers_remain_separate():
    extracted = [
        {"entity_type": "account_id", "value": "ACC_101", "record_index": 0, "source_field": "account_id"},
        {"entity_type": "account_id", "value": "ACC_102", "record_index": 1, "source_field": "account_id"},
    ]
    result = resolve_entities(extracted)
    assert len(result["entities"]) == 2
    canonical_vals = {e["canonical_value"] for e in result["entities"]}
    assert canonical_vals == {"ACC_101", "ACC_102"}


def test_canonical_entity_ids_are_deterministic():
    id1 = generate_canonical_id("account_id", "ACC_101")
    id2 = generate_canonical_id("account_id", "ACC_101")
    id3 = generate_canonical_id("account_id", "ACC_102")

    assert id1 == id2
    assert id1 != id3
    assert id1.startswith("ENT_ACCOUNT_ID_")


def test_transaction_sender_receiver_relationship_and_record_index():
    extracted = [
        {"entity_type": "account_id", "value": "ACC_A", "record_index": 183, "source_field": "sender_account"},
        {"entity_type": "account_id", "value": "ACC_B", "record_index": 183, "source_field": "receiver_account"},
    ]
    result = resolve_entities(extracted)
    assert len(result["relationships"]) == 1

    rel = result["relationships"][0]
    sender_id = generate_canonical_id("account_id", "ACC_A")
    receiver_id = generate_canonical_id("account_id", "ACC_B")

    assert rel["source_entity_id"] == sender_id
    assert rel["target_entity_id"] == receiver_id
    assert rel["relationship_type"] == "transaction"
    assert rel["confidence"] == 1.0
    assert rel["record_indices"] == [183]
    assert "same transaction record" in rel["reason"]


def test_associated_phone_relationship():
    extracted = [
        {"entity_type": "account_id", "value": "ACC_101", "record_index": 10, "source_field": "account_id"},
        {"entity_type": "phone", "value": "+919876543210", "record_index": 10, "source_field": "phone_number"},
    ]
    result = resolve_entities(extracted)
    assert len(result["relationships"]) == 1
    rel = result["relationships"][0]
    assert rel["relationship_type"] == "associated_phone"
    assert rel["confidence"] == 1.0
    assert rel["record_indices"] == [10]
    assert "observed together" in rel["reason"]


def test_associated_email_relationship():
    extracted = [
        {"entity_type": "account_id", "value": "ACC_101", "record_index": 11, "source_field": "account_id"},
        {"entity_type": "email", "value": "alice@fraud.net", "record_index": 11, "source_field": "email"},
    ]
    result = resolve_entities(extracted)
    assert len(result["relationships"]) == 1
    rel = result["relationships"][0]
    assert rel["relationship_type"] == "associated_email"
    assert rel["confidence"] == 1.0


def test_associated_ip_relationship():
    extracted = [
        {"entity_type": "account_id", "value": "ACC_101", "record_index": 12, "source_field": "account_id"},
        {"entity_type": "ip_address", "value": "192.168.1.1", "record_index": 12, "source_field": "source_ip"},
    ]
    result = resolve_entities(extracted)
    assert len(result["relationships"]) == 1
    rel = result["relationships"][0]
    assert rel["relationship_type"] == "associated_ip"
    assert rel["confidence"] == 1.0


def test_associated_imei_relationship():
    extracted = [
        {"entity_type": "account_id", "value": "ACC_101", "record_index": 13, "source_field": "account_id"},
        {"entity_type": "imei", "value": "861234567890123", "record_index": 13, "source_field": "imei"},
    ]
    result = resolve_entities(extracted)
    assert len(result["relationships"]) == 1
    rel = result["relationships"][0]
    assert rel["relationship_type"] == "associated_imei"
    assert rel["confidence"] == 1.0


def test_shared_ip_does_not_merge_accounts():
    # Account A and Account B share the same IP in different or same records
    extracted = [
        {"entity_type": "account_id", "value": "ACC_A", "record_index": 1, "source_field": "account_id"},
        {"entity_type": "ip_address", "value": "192.168.1.100", "record_index": 1, "source_field": "ip"},
        {"entity_type": "account_id", "value": "ACC_B", "record_index": 2, "source_field": "account_id"},
        {"entity_type": "ip_address", "value": "192.168.1.100", "record_index": 2, "source_field": "ip"},
    ]
    result = resolve_entities(extracted)

    # ACC_A, ACC_B, and IP_192.168.1.100 must be 3 separate canonical entities!
    account_entities = [e for e in result["entities"] if e["entity_type"] == "account_id"]
    assert len(account_entities) == 2
    canonical_vals = {e["canonical_value"] for e in account_entities}
    assert canonical_vals == {"ACC_A", "ACC_B"}

    # Neither account is merged with the other
    direct_acc_rels = [
        r for r in result["relationships"]
        if r["relationship_type"] in ("same_as", "same_person", "identical")
    ]
    assert len(direct_acc_rels) == 0


def test_shared_imei_does_not_merge_accounts():
    extracted = [
        {"entity_type": "account_id", "value": "ACC_X", "record_index": 1, "source_field": "account_id"},
        {"entity_type": "imei", "value": "861234567890123", "record_index": 1, "source_field": "imei"},
        {"entity_type": "account_id", "value": "ACC_Y", "record_index": 2, "source_field": "account_id"},
        {"entity_type": "imei", "value": "861234567890123", "record_index": 2, "source_field": "imei"},
    ]
    result = resolve_entities(extracted)

    account_entities = [e for e in result["entities"] if e["entity_type"] == "account_id"]
    assert len(account_entities) == 2
    assert {e["canonical_value"] for e in account_entities} == {"ACC_X", "ACC_Y"}


def test_occurrences_preserve_provenance():
    extracted = [
        {"entity_type": "account_id", "value": "ACC_101", "record_index": 5, "source_field": "acc_no"},
        {"entity_type": "account_id", "value": "ACC_101", "record_index": 9, "source_field": "target_acc"},
    ]
    result = resolve_entities(extracted)
    occurrences = result["entities"][0]["occurrences"]
    assert len(occurrences) == 2
    assert occurrences[0] == {"record_index": 5, "source_field": "acc_no"}
    assert occurrences[1] == {"record_index": 9, "source_field": "target_acc"}


def test_empty_entity_input_handled_safely():
    result = resolve_entities([])
    assert result == {"entities": [], "relationships": []}


def test_input_immutability():
    extracted = [
        {"entity_type": "account_id", "value": "ACC_101", "record_index": 1, "source_field": "account_id"}
    ]
    original_copy = copy.deepcopy(extracted)

    resolve_entities(extracted)

    assert extracted == original_copy


def test_duplicate_relationships_aggregated():
    # Same transaction observed in 2 different records (e.g. record 1 and record 5)
    extracted = [
        {"entity_type": "account_id", "value": "ACC_A", "record_index": 1, "source_field": "sender_account"},
        {"entity_type": "account_id", "value": "ACC_B", "record_index": 1, "source_field": "receiver_account"},
        {"entity_type": "account_id", "value": "ACC_A", "record_index": 5, "source_field": "sender_account"},
        {"entity_type": "account_id", "value": "ACC_B", "record_index": 5, "source_field": "receiver_account"},
    ]
    result = resolve_entities(extracted)

    # Should only create 1 transaction relationship, but with record_indices: [1, 5]
    assert len(result["relationships"]) == 1
    rel = result["relationships"][0]
    assert rel["relationship_type"] == "transaction"
    assert rel["record_indices"] == [1, 5]
