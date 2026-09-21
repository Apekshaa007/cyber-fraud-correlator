import copy
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple
from dateutil import parser as date_parser

TIMESTAMP_COLUMNS = [
    "timestamp",
    "datetime",
    "date_time",
    "transaction_time",
    "event_time",
    "created_at",
    "date",
    "time",
]


def parse_and_normalize_timestamp(val: Any) -> Tuple[Optional[str], float]:
    """
    Parses a timestamp value and returns (normalized_iso_string, epoch_float).
    Returns (None, -1.0) if timestamp is missing or unparseable.
    """
    if val is None or val == "":
        return None, -1.0

    if isinstance(val, (int, float)):
        # Treat numeric timestamp as UNIX epoch
        try:
            dt = datetime.fromtimestamp(float(val), tz=timezone.utc)
            return dt.isoformat(), dt.timestamp()
        except (ValueError, OverflowError, OSError):
            return None, -1.0

    s = str(val).strip()
    if not s:
        return None, -1.0

    try:
        dt = date_parser.parse(s)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.isoformat(), dt.timestamp()
    except (ValueError, TypeError, OverflowError):
        return None, -1.0


def extract_record_timestamp(record: Dict[str, Any]) -> Tuple[Optional[str], Optional[str], float]:
    """
    Inspects a record for recognized timestamp columns.
    Returns (normalized_iso_str, source_column_name, epoch_float).
    """
    for col, val in record.items():
        col_lower = str(col).lower().strip()
        if any(ts_col in col_lower for ts_col in TIMESTAMP_COLUMNS):
            iso_str, epoch = parse_and_normalize_timestamp(val)
            if iso_str is not None:
                return iso_str, col, epoch

    return None, None, -1.0


def build_timeline(
    records: List[Dict[str, Any]],
    entities: Optional[List[Dict[str, Any]]] = None,
    relationships: Optional[List[Dict[str, Any]]] = None,
) -> List[Dict[str, Any]]:
    """
    Builds a deterministic chronological timeline from evidence records and resolved entities/relationships.
    Only includes events with valid timestamps.
    Input lists and dictionaries remain unmutated.
    """
    if not isinstance(records, list):
        raise ValueError("Input records must be a list")

    # Index entities by record_index for fast lookup
    entities_by_record: Dict[int, List[Dict[str, Any]]] = {}
    if entities and isinstance(entities, list):
        for ent in entities:
            e_id = ent.get("entity_id")
            for occ in ent.get("occurrences", []):
                r_idx = occ.get("record_index")
                if r_idx is not None:
                    if r_idx not in entities_by_record:
                        entities_by_record[r_idx] = []
                    if e_id and e_id not in [e.get("entity_id") for e in entities_by_record[r_idx]]:
                        entities_by_record[r_idx].append(ent)

    # Index relationships by record_index
    relationships_by_record: Dict[int, List[Dict[str, Any]]] = {}
    if relationships and isinstance(relationships, list):
        for rel in relationships:
            for r_idx in rel.get("record_indices", []):
                if r_idx not in relationships_by_record:
                    relationships_by_record[r_idx] = []
                relationships_by_record[r_idx].append(rel)

    timeline_events: List[Dict[str, Any]] = []
    seen_event_keys = set()

    for idx, record in enumerate(records):
        if not isinstance(record, dict):
            continue

        iso_str, ts_col, epoch = extract_record_timestamp(record)
        if iso_str is None:
            # Skip untimestamped records
            continue

        # Determine entity IDs for this record index
        rec_entities = entities_by_record.get(idx, [])
        entity_ids = sorted([e["entity_id"] for e in rec_entities if "entity_id" in e])

        # Identify transaction details from record
        sender_val = None
        receiver_val = None
        sender_id = None
        receiver_id = None
        amount_val = None

        for col, val in record.items():
            c = col.lower()
            if any(k in c for k in ["sender", "from", "src", "source"]):
                sender_val = str(val)
            elif any(k in c for k in ["receiver", "recipient", "to", "dest"]):
                receiver_val = str(val)
            elif any(k in c for k in ["amount", "amt"]):
                amount_val = val

        # Match entity IDs for sender/receiver if entities are present
        for ent in rec_entities:
            c_val = ent.get("canonical_value")
            e_id = ent.get("entity_id")
            if c_val:
                if sender_val and c_val in sender_val:
                    sender_id = e_id
                if receiver_val and c_val in receiver_val:
                    receiver_id = e_id

        # Determine event_type and description
        rec_rels = relationships_by_record.get(idx, [])
        txn_rels = [r for r in rec_rels if r.get("relationship_type") == "transaction"]

        if txn_rels or (sender_val and receiver_val):
            event_type = "transaction"
            amt_str = f" of {amount_val}" if amount_val is not None else ""
            s_name = sender_val or "account"
            r_name = receiver_val or "account"
            description = f"Account {s_name} transferred funds{amt_str} to account {r_name}."
        elif rec_rels:
            event_type = rec_rels[0].get("relationship_type", "observation")
            description = rec_rels[0].get("reason", f"Event recorded involving fields in record #{idx}.")
        else:
            event_type = "observation"
            description = f"Evidence record observed with timestamp {iso_str}."

        # Deduplication key for events on the same record
        dedup_key = (iso_str, idx, event_type, tuple(entity_ids))
        if dedup_key in seen_event_keys:
            continue
        seen_event_keys.add(dedup_key)

        event = {
            "timestamp": iso_str,
            "event_type": event_type,
            "description": description,
            "entity_ids": entity_ids,
            "record_index": idx,
            "source_field": ts_col,
            "evidence": {
                "record_index": idx,
                "source_field": ts_col,
                "raw_record": copy.deepcopy(record),
            },
            "_epoch": epoch,
        }
        timeline_events.append(event)

    # Deterministic sorting:
    # 1. timestamp epoch (chronological)
    # 2. record_index
    # 3. event_type
    # 4. entity_ids tuple
    timeline_events.sort(
        key=lambda e: (
            e["_epoch"],
            e["record_index"],
            e["event_type"],
            tuple(e["entity_ids"]),
        )
    )

    # Remove internal _epoch key before returning
    clean_events = []
    for ev in timeline_events:
        ev_copy = dict(ev)
        ev_copy.pop("_epoch", None)
        clean_events.append(ev_copy)

    return clean_events
