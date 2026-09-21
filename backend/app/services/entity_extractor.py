import ipaddress
import re
from typing import Any, Dict, List, Optional
from dateutil import parser as date_parser


def classify_column(col_name: str) -> Optional[str]:
    """
    Classifies a normalized column name into a target entity type.
    Returns None if the column name is not recognized.
    """
    col = col_name.lower().strip()

    # Transaction ID (check before general transaction / amount)
    if any(k in col for k in ["transaction_id", "txn_id", "tx_id", "reference_id"]):
        return "transaction_id"

    # Account ID
    if any(k in col for k in ["account_id", "bank_account", "acc_no", "account_number", "account"]):
        return "account_id"

    # IP Address
    if any(k in col for k in ["ip_address", "source_ip", "destination_ip", "src_ip", "dst_ip", "client_ip", "server_ip", "ipaddress"]) or col == "ip":
        return "ip_address"

    # Phone / Mobile
    if any(k in col for k in ["mobile_number", "phone_number", "mobile", "phone", "msisdn", "contact", "tel"]):
        return "phone"

    # Email
    if any(k in col for k in ["email_address", "email", "mail"]):
        return "email"

    # IMEI
    if "imei" in col:
        return "imei"

    # Amount
    if any(k in col for k in ["transaction_amount", "amount", "value", "amt", "price", "balance"]):
        return "amount"

    # Timestamp
    if any(k in col for k in ["transaction_time", "timestamp", "datetime", "date_time", "created_at", "time", "date"]):
        return "timestamp"

    return None


def validate_entity_value(entity_type: str, val: Any) -> bool:
    """
    Validates that a value matches the expected format for its entity type.
    """
    if val is None or val == "":
        return False

    s_val = str(val).strip()

    if entity_type == "phone":
        # Must be non-empty and contain 7 to 15 digits (optional leading +)
        return bool(re.match(r"^\+?\d{7,15}$", s_val))

    if entity_type == "email":
        return bool(re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", s_val))

    if entity_type == "ip_address":
        try:
            ipaddress.ip_address(s_val)
            return True
        except ValueError:
            return False

    if entity_type == "imei":
        return bool(re.match(r"^\d{14,17}$", s_val))

    if entity_type in ("account_id", "transaction_id"):
        return len(s_val) > 0

    if entity_type == "amount":
        if isinstance(val, (int, float)):
            return True
        try:
            float(s_val)
            return True
        except ValueError:
            return False

    if entity_type == "timestamp":
        if isinstance(val, (int, float)):
            return True
        try:
            date_parser.parse(s_val)
            return True
        except (ValueError, TypeError, OverflowError):
            return False

    return False


def extract_entities(normalized_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Extracts structured entity objects from normalized evidence records.
    Does NOT perform entity resolution or cross-record linking.
    Input dictionary remains unmutated.
    """
    if not isinstance(normalized_data, dict):
        raise ValueError("Input normalized_data must be a dictionary")

    records = normalized_data.get("records", [])
    extracted_entities: List[Dict[str, Any]] = []

    for record_idx, record in enumerate(records):
        for col_name, val in record.items():
            entity_type = classify_column(col_name)

            if entity_type is None:
                continue

            if validate_entity_value(entity_type, val):
                # Ensure value is cleanly formatted/typed
                formatted_val = val
                if entity_type == "amount" and isinstance(val, str):
                    try:
                        formatted_val = float(val) if "." in val else int(val)
                    except ValueError:
                        formatted_val = val

                extracted_entities.append({
                    "entity_type": entity_type,
                    "value": str(formatted_val) if entity_type not in ("amount",) else formatted_val,
                    "record_index": record_idx,
                    "source_field": col_name,
                })

    return extracted_entities
