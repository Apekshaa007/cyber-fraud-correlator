import copy
from app.services.entity_extractor import extract_entities


def test_phone_extraction():
    data = {
        "columns": ["mobile_number"],
        "records": [{"mobile_number": "+919876543210"}],
    }
    entities = extract_entities(data)
    assert len(entities) == 1
    assert entities[0] == {
        "entity_type": "phone",
        "value": "+919876543210",
        "record_index": 0,
        "source_field": "mobile_number",
    }


def test_email_extraction():
    data = {
        "columns": ["email_address"],
        "records": [{"email_address": "suspect@fraud.net"}],
    }
    entities = extract_entities(data)
    assert len(entities) == 1
    assert entities[0] == {
        "entity_type": "email",
        "value": "suspect@fraud.net",
        "record_index": 0,
        "source_field": "email_address",
    }


def test_ip_extraction():
    data = {
        "columns": ["source_ip", "destination_ip"],
        "records": [{"source_ip": "192.168.1.50", "destination_ip": "10.0.0.1"}],
    }
    entities = extract_entities(data)
    assert len(entities) == 2
    assert entities[0] == {
        "entity_type": "ip_address",
        "value": "192.168.1.50",
        "record_index": 0,
        "source_field": "source_ip",
    }
    assert entities[1] == {
        "entity_type": "ip_address",
        "value": "10.0.0.1",
        "record_index": 0,
        "source_field": "destination_ip",
    }


def test_imei_extraction():
    data = {
        "columns": ["imei"],
        "records": [{"imei": "861234567890123"}],
    }
    entities = extract_entities(data)
    assert len(entities) == 1
    assert entities[0] == {
        "entity_type": "imei",
        "value": "861234567890123",
        "record_index": 0,
        "source_field": "imei",
    }


def test_account_extraction():
    data = {
        "columns": ["bank_account"],
        "records": [{"bank_account": "ACC998877"}],
    }
    entities = extract_entities(data)
    assert len(entities) == 1
    assert entities[0] == {
        "entity_type": "account_id",
        "value": "ACC998877",
        "record_index": 0,
        "source_field": "bank_account",
    }


def test_transaction_extraction():
    data = {
        "columns": ["transaction_id"],
        "records": [{"transaction_id": "TXN_100200"}],
    }
    entities = extract_entities(data)
    assert len(entities) == 1
    assert entities[0] == {
        "entity_type": "transaction_id",
        "value": "TXN_100200",
        "record_index": 0,
        "source_field": "transaction_id",
    }


def test_amount_extraction():
    data = {
        "columns": ["transaction_amount"],
        "records": [{"transaction_amount": 1500.5}],
    }
    entities = extract_entities(data)
    assert len(entities) == 1
    assert entities[0] == {
        "entity_type": "amount",
        "value": 1500.5,
        "record_index": 0,
        "source_field": "transaction_amount",
    }


def test_timestamp_extraction():
    data = {
        "columns": ["created_at"],
        "records": [{"created_at": "2026-09-21T20:00:00Z"}],
    }
    entities = extract_entities(data)
    assert len(entities) == 1
    assert entities[0] == {
        "entity_type": "timestamp",
        "value": "2026-09-21T20:00:00Z",
        "record_index": 0,
        "source_field": "created_at",
    }


def test_multiple_entities_in_one_record_and_provenance():
    data = {
        "columns": ["transaction_id", "phone_number", "amount", "source_ip"],
        "records": [
            {
                "transaction_id": "TXN_1",
                "phone_number": "+15550192834",
                "amount": 250,
                "source_ip": "172.16.0.1",
            },
            {
                "transaction_id": "TXN_2",
                "phone_number": "+15550199999",
                "amount": 500,
                "source_ip": "172.16.0.2",
            },
        ],
    }
    entities = extract_entities(data)
    assert len(entities) == 8

    # Record 0 checks
    rec0_entities = [e for e in entities if e["record_index"] == 0]
    assert len(rec0_entities) == 4
    assert any(e["entity_type"] == "transaction_id" and e["value"] == "TXN_1" for e in rec0_entities)
    assert any(e["entity_type"] == "phone" and e["value"] == "+15550192834" for e in rec0_entities)
    assert any(e["entity_type"] == "amount" and e["value"] == 250 for e in rec0_entities)
    assert any(e["entity_type"] == "ip_address" and e["value"] == "172.16.0.1" for e in rec0_entities)

    # Record 1 checks
    rec1_entities = [e for e in entities if e["record_index"] == 1]
    assert len(rec1_entities) == 4
    assert any(e["entity_type"] == "transaction_id" and e["value"] == "TXN_2" for e in rec1_entities)


def test_unknown_fields_and_invalid_values():
    data = {
        "columns": ["unknown_custom_header", "email_address", "source_ip", "phone_number"],
        "records": [
            {
                "unknown_custom_header": "some_random_value",
                "email_address": "invalid_email_string",  # Fails format validation
                "source_ip": "999.999.999.999",            # Fails IP validation
                "phone_number": None,                      # Null value
            }
        ],
    }
    entities = extract_entities(data)
    # None of these should be extracted as valid entities
    assert len(entities) == 0


def test_input_immutability():
    data = {
        "columns": ["phone_number", "email_address"],
        "records": [
            {"phone_number": "+15551234567", "email_address": "user@example.com"}
        ],
    }
    original_copy = copy.deepcopy(data)

    extract_entities(data)

    assert data == original_copy
