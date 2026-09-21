import hashlib
from typing import Any, Dict, List, Set, Tuple


def generate_canonical_id(entity_type: str, canonical_value: str) -> str:
    """
    Generates a deterministic canonical ID for an entity based on its type and value.
    Example: ENT_ACCOUNT_ID_A1B2C3D4E5F6
    """
    type_prefix = entity_type.upper()
    seed = f"{entity_type}:{canonical_value}".encode("utf-8")
    hash_str = hashlib.sha256(seed).hexdigest()[:12].upper()
    return f"ENT_{type_prefix}_{hash_str}"


def resolve_entities(extracted_entities: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Resolves extracted entities into canonical entities and builds evidence-backed relationships.
    Does NOT merge distinct identifiers or guess identity equivalence.
    Input list remains unmutated.
    """
    if not isinstance(extracted_entities, list):
        raise ValueError("Input extracted_entities must be a list")

    # 1. Group extracted entities by (entity_type, canonical_value)
    entities_map: Dict[Tuple[str, str], Dict[str, Any]] = {}
    records_group: Dict[int, List[Dict[str, Any]]] = {}

    for item in extracted_entities:
        e_type = item.get("entity_type")
        e_val = str(item.get("value", ""))
        rec_idx = item.get("record_index")
        src_field = item.get("source_field")

        if not e_type or not e_val:
            continue

        key = (e_type, e_val)
        if key not in entities_map:
            canonical_id = generate_canonical_id(e_type, e_val)
            entities_map[key] = {
                "entity_id": canonical_id,
                "entity_type": e_type,
                "canonical_value": e_val,
                "occurrences": [],
            }

        # Avoid duplicate occurrence entries for the exact same record_index and source_field
        occurrence = {"record_index": rec_idx, "source_field": src_field}
        if occurrence not in entities_map[key]["occurrences"]:
            entities_map[key]["occurrences"].append(occurrence)

        # Group entities by record_index for relationship resolution
        if rec_idx is not None:
            if rec_idx not in records_group:
                records_group[rec_idx] = []
            records_group[rec_idx].append(item)

    canonical_entities = list(entities_map.values())

    # 2. Build relationships from record co-occurrences
    relationships_map: Dict[Tuple[str, str, str], Dict[str, Any]] = {}

    for rec_idx, rec_entities in records_group.items():
        # A. Check for transaction relationships (sender -> receiver accounts)
        accounts = [e for e in rec_entities if e.get("entity_type") == "account_id"]
        if len(accounts) >= 2:
            sender = None
            receiver = None
            for acc in accounts:
                src_field = str(acc.get("source_field", "")).lower()
                if any(k in src_field for k in ["sender", "from", "src", "source", "origin"]):
                    sender = acc
                elif any(k in src_field for k in ["receiver", "recipient", "to", "dest", "destination"]):
                    receiver = acc

            # Fallback if specific sender/receiver fields aren't named explicitly
            if not sender or not receiver:
                sender = accounts[0]
                receiver = accounts[1]

            if sender and receiver and sender["value"] != receiver["value"]:
                src_id = generate_canonical_id("account_id", str(sender["value"]))
                tgt_id = generate_canonical_id("account_id", str(receiver["value"]))
                rel_key = (src_id, tgt_id, "transaction")

                if rel_key not in relationships_map:
                    relationships_map[rel_key] = {
                        "source_entity_id": src_id,
                        "target_entity_id": tgt_id,
                        "relationship_type": "transaction",
                        "confidence": 1.0,
                        "reason": "Sender and receiver accounts were present in the same transaction record.",
                        "record_indices": [rec_idx],
                    }
                else:
                    if rec_idx not in relationships_map[rel_key]["record_indices"]:
                        relationships_map[rel_key]["record_indices"].append(rec_idx)

        # B. Check for associated identifiers within the record (account -> phone, email, ip, imei)
        for acc in accounts:
            acc_id = generate_canonical_id("account_id", str(acc["value"]))
            for other in rec_entities:
                o_type = other.get("entity_type")
                if o_type in ("phone", "email", "ip_address", "imei"):
                    o_id = generate_canonical_id(o_type, str(other["value"]))
                    rel_type = f"associated_{'ip' if o_type == 'ip_address' else o_type}"

                    rel_reason_type_map = {
                        "phone": "phone identifier",
                        "email": "email identifier",
                        "ip_address": "IP address",
                        "imei": "IMEI identifier",
                    }
                    reason = f"Account and {rel_reason_type_map[o_type]} were observed together in the same evidence record."

                    rel_key = (acc_id, o_id, rel_type)
                    if rel_key not in relationships_map:
                        relationships_map[rel_key] = {
                            "source_entity_id": acc_id,
                            "target_entity_id": o_id,
                            "relationship_type": rel_type,
                            "confidence": 1.0,
                            "reason": reason,
                            "record_indices": [rec_idx],
                        }
                    else:
                        if rec_idx not in relationships_map[rel_key]["record_indices"]:
                            relationships_map[rel_key]["record_indices"].append(rec_idx)

    # Sort record_indices for clean deterministic outputs
    relationships = list(relationships_map.values())
    for rel in relationships:
        rel["record_indices"].sort()

    return {
        "entities": canonical_entities,
        "relationships": relationships,
    }
