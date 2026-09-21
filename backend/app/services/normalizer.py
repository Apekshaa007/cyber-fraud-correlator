import copy
import re
from typing import Any, Dict, List, Optional


def normalize_column_name(col: str) -> str:
    """
    Normalizes column names:
    - strips leading/trailing whitespace
    - converts to lowercase
    - replaces spaces, hyphens, and repeated whitespace with underscores
    Examples:
      ' Mobile Number ' -> 'mobile_number'
      'Transaction ID' -> 'transaction_id'
      'IP-Address' -> 'ip_address'
    """
    if not col:
        return ""
    col_str = str(col).strip().lower()
    # Replace spaces, hyphens, and whitespace runs with single underscore
    col_str = re.sub(r"[\s\-]+", "_", col_str)
    return col_str


def normalize_phone(val: Any) -> Any:
    """
    Normalizes phone/mobile numbers:
    - removes spaces, hyphens, parentheses
    - preserves leading + prefix
    - does NOT guess country code
    """
    if val is None or not isinstance(val, str):
        return val
    s = val.strip()
    if not s:
        return s

    has_plus = s.startswith("+")
    # Remove spaces, hyphens, parentheses
    cleaned = re.sub(r"[\s\-\(\)]+", "", s)
    if has_plus and not cleaned.startswith("+"):
        cleaned = "+" + cleaned
    return cleaned


def normalize_email(val: Any) -> Any:
    """
    Normalizes email addresses:
    - strips surrounding whitespace
    - converts to lowercase
    """
    if val is None or not isinstance(val, str):
        return val
    return val.strip().lower()


def normalize_ip(val: Any) -> Any:
    """
    Normalizes IP addresses:
    - strips surrounding whitespace only
    """
    if val is None or not isinstance(val, str):
        return val
    return val.strip()


def normalize_imei(val: Any) -> Any:
    """
    Normalizes IMEI numbers:
    - strips spaces and hyphens only
    """
    if val is None or not isinstance(val, str):
        return val
    s = val.strip()
    return re.sub(r"[\s\-]+", "", s)


def normalize_id(val: Any) -> Any:
    """
    Normalizes account IDs / transaction IDs:
    - strips surrounding whitespace only without further mutation
    """
    if val is None or not isinstance(val, str):
        return val
    return val.strip()


def normalize_amount(val: Any) -> Any:
    """
    Normalizes financial amount fields:
    - removes currency symbols and thousands separators
    - converts numeric-looking strings to int/float
    - preserves empty/null/non-numeric as-is without guessing currency
    """
    if val is None or val == "":
        return val
    if isinstance(val, (int, float)):
        return val

    s = str(val).strip()
    if not s:
        return s

    # Remove currency symbols ($, €, £, ₹, ¥) and currency code words (USD, EUR, INR, etc.)
    cleaned = re.sub(r"[\$\€\£\₹\¥]", "", s)
    cleaned = re.sub(r"\b(USD|EUR|INR|GBP|JPY|AUD|CAD)\b", "", cleaned, flags=re.IGNORECASE).strip()
    # Remove thousands separator commas
    cleaned = cleaned.replace(",", "")

    # Try numeric conversion
    try:
        if "." in cleaned:
            return float(cleaned)
        return int(cleaned)
    except ValueError:
        try:
            return float(cleaned)
        except ValueError:
            return s


def normalize_value_by_column(col_name: str, val: Any) -> Any:
    """
    Applies targeted normalization based on column name classification and value characteristics.
    """
    if val is None:
        return None

    col = col_name.lower()

    # Match phone/mobile
    if any(k in col for k in ["phone", "mobile", "msisdn", "contact", "tel"]):
        return normalize_phone(val)

    # Match email
    if any(k in col for k in ["email", "mail"]):
        return normalize_email(val)

    # Match IP address
    if any(k in col for k in ["ip", "ip_address", "ipaddress"]):
        return normalize_ip(val)

    # Match IMEI
    if "imei" in col:
        return normalize_imei(val)

    # Match account / transaction ID
    if any(k in col for k in ["account", "transaction", "txn", "tx_id", "acc_no", "reference_id"]):
        return normalize_id(val)

    # Match amount / price / balance
    if any(k in col for k in ["amount", "amt", "price", "balance", "sum", "total"]):
        return normalize_amount(val)

    # General string value cleanup (strip surrounding whitespace)
    if isinstance(val, str):
        return val.strip()

    return val


def normalize_records(parsed_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Main normalization entry point:
    Accepts parsed evidence dict: {"columns": [...], "records": [...]}
    Returns normalized evidence dict with normalized column names and value representations.
    Original input dictionary is preserved without side effects.
    """
    if not isinstance(parsed_data, dict):
        raise ValueError("Input parsed_data must be a dictionary")

    original_columns = parsed_data.get("columns", [])
    original_records = parsed_data.get("records", [])

    # Map original column names to normalized column names
    col_mapping = {}
    normalized_columns: List[str] = []
    for col in original_columns:
        norm_col = normalize_column_name(col)
        col_mapping[col] = norm_col
        if norm_col not in normalized_columns:
            normalized_columns.append(norm_col)

    normalized_records: List[Dict[str, Any]] = []
    for rec in original_records:
        norm_rec: Dict[str, Any] = {}
        for orig_col, val in rec.items():
            norm_col = col_mapping.get(orig_col, normalize_column_name(orig_col))
            norm_val = normalize_value_by_column(norm_col, val)
            norm_rec[norm_col] = norm_val
        normalized_records.append(norm_rec)

    return {
        "columns": normalized_columns,
        "records": normalized_records,
    }
