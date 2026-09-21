import hashlib
from datetime import datetime, timezone
from typing import Any, Dict, List, Set, Tuple
import networkx as nx
from dateutil import parser as date_parser


def generate_finding_id(pattern_type: str, entity_ids: List[str], record_indices: List[int]) -> str:
    """
    Generates a deterministic finding ID based on pattern_type, entity_ids, and record_indices.
    Example: FINDING_MULTIPLE_SENDERS_SAME_RECEIVER_A1B2C3D4E5F6
    """
    sorted_entities = ",".join(sorted(entity_ids))
    sorted_records = ",".join(map(str, sorted(record_indices)))
    seed = f"{pattern_type}:{sorted_entities}:{sorted_records}".encode("utf-8")
    hash_str = hashlib.sha256(seed).hexdigest()[:12].upper()
    return f"FINDING_{pattern_type.upper()}_{hash_str}"


def parse_timestamp(val: Any) -> float:
    """
    Parses a timestamp string/number into a UNIX epoch float. Returns -1.0 if unparseable.
    """
    if val is None or val == "":
        return -1.0
    if isinstance(val, (int, float)):
        return float(val)
    try:
        dt = date_parser.parse(str(val))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.timestamp()
    except (ValueError, TypeError, OverflowError):
        return -1.0


def detect_patterns(graph: nx.MultiDiGraph) -> Dict[str, Any]:
    """
    Analyzes an investigation graph and detects explainable cyber-fraud investigation patterns.
    Does NOT infer guilt, criminality, or identity equivalence.
    Input graph remains unmutated.
    """
    if not isinstance(graph, nx.MultiDiGraph):
        raise ValueError("Input graph must be a NetworkX MultiDiGraph")

    findings_map: Dict[str, Dict[str, Any]] = {}

    # Priority rank mapping for deterministic sorting
    priority_weights = {"high": 1, "medium": 2, "low": 3}

    # Helper to add finding cleanly with deduplication
    def add_finding(
        pattern_type: str,
        priority: str,
        title: str,
        description: str,
        entity_ids: List[str],
        record_indices: List[int],
        evidence: List[Dict[str, Any]],
        reason: str,
    ):
        sorted_entities = sorted(list(set(entity_ids)))
        sorted_records = sorted(list(set(record_indices)))
        fid = generate_finding_id(pattern_type, sorted_entities, sorted_records)

        if fid not in findings_map:
            findings_map[fid] = {
                "finding_id": fid,
                "pattern_type": pattern_type,
                "priority": priority,
                "title": title,
                "description": description,
                "entity_ids": sorted_entities,
                "record_indices": sorted_records,
                "evidence": evidence,
                "reason": reason,
            }

    # -------------------------------------------------------------
    # 1. Multiple Senders -> Same Receiver
    # -------------------------------------------------------------
    for node_id, node_data in graph.nodes(data=True):
        if node_data.get("entity_type") != "account_id":
            continue

        receiver_val = node_data.get("canonical_value", node_id)
        sender_ids: Set[str] = set()
        txn_records: Set[int] = set()
        evidence_list: List[Dict[str, Any]] = []

        for pred_id in graph.predecessors(node_id):
            if graph.nodes[pred_id].get("entity_type") == "account_id":
                edge_dict = graph.get_edge_data(pred_id, node_id)
                for edata in edge_dict.values():
                    if edata.get("relationship_type") == "transaction":
                        sender_ids.add(pred_id)
                        recs = edata.get("record_indices", [])
                        txn_records.update(recs)
                        for r in recs:
                            ev_entry = {
                                "record_index": r,
                                "relationship_type": "transaction",
                                "reason": edata.get("reason", "Transaction record"),
                            }
                            if ev_entry not in evidence_list:
                                evidence_list.append(ev_entry)

        distinct_senders_count = len(sender_ids)
        if distinct_senders_count >= 2:
            priority = "high" if distinct_senders_count >= 3 else "medium"
            reason = f"{distinct_senders_count} distinct sender accounts transferred funds to the same receiver account."
            add_finding(
                pattern_type="multiple_senders_same_receiver",
                priority=priority,
                title="Multiple senders transferred funds to the same account",
                description=f"Receiver account '{receiver_val}' received transaction funds from {distinct_senders_count} distinct sender accounts.",
                entity_ids=[node_id] + list(sender_ids),
                record_indices=list(txn_records),
                evidence=evidence_list,
                reason=reason,
            )

    # -------------------------------------------------------------
    # 2. Onward Transfer (A -> B -> C)
    # -------------------------------------------------------------
    for b_id, b_data in graph.nodes(data=True):
        if b_data.get("entity_type") != "account_id":
            continue

        b_val = b_data.get("canonical_value", b_id)

        # Predecessors A -> B
        for a_id in graph.predecessors(b_id):
            if a_id == b_id or graph.nodes[a_id].get("entity_type") != "account_id":
                continue
            a_val = graph.nodes[a_id].get("canonical_value", a_id)

            a_b_edges = [
                e for e in graph.get_edge_data(a_id, b_id).values()
                if e.get("relationship_type") == "transaction"
            ]
            if not a_b_edges:
                continue

            # Successors B -> C
            for c_id in graph.successors(b_id):
                if c_id == b_id or c_id == a_id or graph.nodes[c_id].get("entity_type") != "account_id":
                    continue
                c_val = graph.nodes[c_id].get("canonical_value", c_id)

                b_c_edges = [
                    e for e in graph.get_edge_data(b_id, c_id).values()
                    if e.get("relationship_type") == "transaction"
                ]
                if not b_c_edges:
                    continue

                recs = set()
                evidence_list = []

                for e in a_b_edges:
                    recs.update(e.get("record_indices", []))
                    for r in e.get("record_indices", []):
                        evidence_list.append({
                            "record_index": r,
                            "relationship_type": "transaction",
                            "reason": e.get("reason", "Inbound transaction"),
                        })
                for e in b_c_edges:
                    recs.update(e.get("record_indices", []))
                    for r in e.get("record_indices", []):
                        evidence_list.append({
                            "record_index": r,
                            "relationship_type": "transaction",
                            "reason": e.get("reason", "Outbound transaction"),
                        })

                add_finding(
                    pattern_type="onward_transfer",
                    priority="medium",
                    title="Onward fund transfer detected",
                    description=f"Account '{b_val}' received funds from '{a_val}' and subsequently transferred funds to '{c_val}'.",
                    entity_ids=[b_id, a_id, c_id],
                    record_indices=list(recs),
                    evidence=evidence_list,
                    reason=f"Account '{b_val}' received funds from '{a_val}' and subsequently transferred funds to '{c_val}'.",
                )

    # -------------------------------------------------------------
    # 3. Multi-Hop Transaction Chain (A -> B -> C -> D)
    # -------------------------------------------------------------
    for a_id, a_data in graph.nodes(data=True):
        if a_data.get("entity_type") != "account_id":
            continue
        a_val = a_data.get("canonical_value", a_id)

        for b_id in graph.successors(a_id):
            if b_id == a_id or graph.nodes[b_id].get("entity_type") != "account_id":
                continue
            b_val = graph.nodes[b_id].get("canonical_value", b_id)
            ab_edges = [e for e in graph.get_edge_data(a_id, b_id).values() if e.get("relationship_type") == "transaction"]
            if not ab_edges:
                continue

            for c_id in graph.successors(b_id):
                if c_id in (a_id, b_id) or graph.nodes[c_id].get("entity_type") != "account_id":
                    continue
                c_val = graph.nodes[c_id].get("canonical_value", c_id)
                bc_edges = [e for e in graph.get_edge_data(b_id, c_id).values() if e.get("relationship_type") == "transaction"]
                if not bc_edges:
                    continue

                for d_id in graph.successors(c_id):
                    if d_id in (a_id, b_id, c_id) or graph.nodes[d_id].get("entity_type") != "account_id":
                        continue
                    d_val = graph.nodes[d_id].get("canonical_value", d_id)
                    cd_edges = [e for e in graph.get_edge_data(c_id, d_id).values() if e.get("relationship_type") == "transaction"]
                    if not cd_edges:
                        continue

                    recs = set()
                    evidence_list = []
                    for e_list in (ab_edges, bc_edges, cd_edges):
                        for e in e_list:
                            recs.update(e.get("record_indices", []))
                            for r in e.get("record_indices", []):
                                evidence_list.append({
                                    "record_index": r,
                                    "relationship_type": "transaction",
                                    "reason": e.get("reason", "Chain transaction"),
                                })

                    add_finding(
                        pattern_type="multi_hop_transaction_chain",
                        priority="high",
                        title="Multi-hop transaction chain detected",
                        description=f"Transaction chain of length 3 detected: {a_val} -> {b_val} -> {c_val} -> {d_val}.",
                        entity_ids=[a_id, b_id, c_id, d_id],
                        record_indices=list(recs),
                        evidence=evidence_list,
                        reason=f"Transaction chain of length 3 detected across accounts: {a_val} -> {b_val} -> {c_val} -> {d_val}.",
                    )

    # -------------------------------------------------------------
    # 4. High Transaction Velocity (3+ transactions within 10-minute window)
    # -------------------------------------------------------------
    for node_id, node_data in graph.nodes(data=True):
        if node_data.get("entity_type") != "account_id":
            continue

        acc_val = node_data.get("canonical_value", node_id)
        # Collect transaction timestamps attached to edges or neighbor timestamp nodes
        txn_events: List[Tuple[float, int, Dict[str, Any]]] = []

        # Check all incoming and outgoing transaction edges
        in_edges = graph.in_edges(node_id, data=True)
        out_edges = graph.out_edges(node_id, data=True)

        for _, _, edata in list(in_edges) + list(out_edges):
            if edata.get("relationship_type") == "transaction":
                # Look for explicit timestamp attribute in edge or associated timestamp
                ts_val = edata.get("timestamp")
                recs = edata.get("record_indices", [])

                if ts_val:
                    ts_epoch = parse_timestamp(ts_val)
                    if ts_epoch > 0:
                        for r in recs:
                            txn_events.append((ts_epoch, r, edata))

        # Check if 3+ transactions occur within a 10-minute (600 seconds) window
        if len(txn_events) >= 3:
            txn_events.sort(key=lambda x: x[0])
            for i in range(len(txn_events) - 2):
                window_start = txn_events[i][0]
                window_end = window_start + 600.0  # 10 minutes window

                matching_events = [e for e in txn_events if window_start <= e[0] <= window_end]
                if len(matching_events) >= 3:
                    recs = [e[1] for e in matching_events]
                    evidence_list = [
                        {
                            "record_index": e[1],
                            "relationship_type": "transaction",
                            "reason": e[2].get("reason", "Velocity transaction"),
                        }
                        for e in matching_events
                    ]
                    add_finding(
                        pattern_type="high_transaction_velocity",
                        priority="high",
                        title="High transaction velocity detected",
                        description=f"Account '{acc_val}' engaged in 3 or more transactions within a 10-minute window.",
                        entity_ids=[node_id],
                        record_indices=recs,
                        evidence=evidence_list,
                        reason=f"Account '{acc_val}' engaged in 3 or more transactions within a 10-minute window.",
                    )
                    break  # Avoid emitting multiple window findings for same account

    # -------------------------------------------------------------
    # 5. Shared Infrastructure Signal (Shared IP / IMEI)
    # -------------------------------------------------------------
    for node_id, node_data in graph.nodes(data=True):
        infra_type = node_data.get("entity_type")
        if infra_type not in ("ip_address", "imei"):
            continue

        infra_val = node_data.get("canonical_value", node_id)
        # Find all account nodes pointing to or connected with this infrastructure node
        connected_accounts: Set[str] = set()
        infra_records: Set[int] = set()
        evidence_list: List[Dict[str, Any]] = []

        # Look for predecessors or neighbors connected via associated_ip / associated_imei
        in_edges = graph.in_edges(node_id, data=True)
        for src, _, edata in in_edges:
            if edata.get("relationship_type") in ("associated_ip", "associated_imei"):
                if graph.nodes[src].get("entity_type") == "account_id":
                    connected_accounts.add(src)
                    recs = edata.get("record_indices", [])
                    infra_records.update(recs)
                    for r in recs:
                        ev_entry = {
                            "record_index": r,
                            "relationship_type": edata.get("relationship_type"),
                            "reason": edata.get("reason", "Shared infrastructure observation"),
                        }
                        if ev_entry not in evidence_list:
                            evidence_list.append(ev_entry)

        if len(connected_accounts) >= 2:
            item_label = "IP address" if infra_type == "ip_address" else "IMEI"
            title = f"Shared {item_label} infrastructure signal"
            reason = f"Multiple accounts reference the same {item_label}."
            description = f"Multiple distinct accounts ({len(connected_accounts)}) reference the same {item_label} '{infra_val}'."

            add_finding(
                pattern_type="shared_infrastructure",
                priority="low",
                title=title,
                description=description,
                entity_ids=[node_id] + list(connected_accounts),
                record_indices=list(infra_records),
                evidence=evidence_list,
                reason=reason,
            )

    # -------------------------------------------------------------
    # Deterministic Sorting of Findings
    # -------------------------------------------------------------
    findings_list = list(findings_map.values())
    findings_list.sort(
        key=lambda f: (
            priority_weights.get(f["priority"], 99),
            f["pattern_type"],
            f["finding_id"],
        )
    )

    return {"findings": findings_list}
