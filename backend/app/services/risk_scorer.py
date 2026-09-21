import copy
from typing import Any, Dict, List

# Investigative priority point mapping per pattern type
PATTERN_POINTS: Dict[str, int] = {
    "multiple_senders_same_receiver": 25,
    "onward_transfer": 20,
    "multi_hop_transaction_chain": 15,
    "high_transaction_velocity": 15,
    "shared_infrastructure": 5,
}

PATTERN_SCORING_REASONS: Dict[str, str] = {
    "multiple_senders_same_receiver": "Multiple senders transferred funds to the same receiver account (+25 priority points).",
    "onward_transfer": "Onward transfer pattern detected between linked accounts (+20 priority points).",
    "multi_hop_transaction_chain": "Multi-hop transaction chain detected across accounts (+15 priority points).",
    "high_transaction_velocity": "High transaction velocity detected within a short time window (+15 priority points).",
    "shared_infrastructure": "Accounts reference shared network or device infrastructure (+5 priority points).",
}


def calculate_finding_score(finding: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculates investigative priority points for an individual finding.
    Does NOT infer guilt or probability of fraud.
    Input finding dictionary remains unmutated.
    """
    if not isinstance(finding, dict):
        raise ValueError("Input finding must be a dictionary")

    finding_copy = copy.deepcopy(finding)
    pattern_type = finding_copy.get("pattern_type")

    points = PATTERN_POINTS.get(pattern_type, 0)
    reason = PATTERN_SCORING_REASONS.get(
        pattern_type,
        f"Unknown pattern type '{pattern_type}' assigned 0 priority points.",
    )

    finding_copy["points"] = points
    finding_copy["scoring_reason"] = reason

    return finding_copy


def determine_case_priority(score: int) -> str:
    """
    Determines investigative priority level from capped score (0-100).
    - 0–29   -> low
    - 30–59  -> medium
    - 60–100 -> high
    """
    if score >= 60:
        return "high"
    elif score >= 30:
        return "medium"
    return "low"


def calculate_case_score(findings: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Calculates aggregate case investigative priority score from detected findings.
    Caps total score at 100.
    Deduplicates findings by finding_id to prevent double counting.
    Input findings list remains unmutated.
    """
    if not isinstance(findings, list):
        raise ValueError("Input findings must be a list")

    seen_ids = set()
    scored_signals: List[Dict[str, Any]] = []
    total_raw_points = 0

    for item in findings:
        if not isinstance(item, dict):
            continue

        fid = item.get("finding_id")
        if fid:
            if fid in seen_ids:
                continue
            seen_ids.add(fid)

        scored_item = calculate_finding_score(item)
        total_raw_points += scored_item["points"]

        signal = {
            "finding_id": scored_item.get("finding_id", ""),
            "pattern_type": scored_item.get("pattern_type", ""),
            "points": scored_item["points"],
            "scoring_reason": scored_item["scoring_reason"],
            "reason": scored_item.get("reason", ""),
            "record_indices": scored_item.get("record_indices", []),
            "entity_ids": scored_item.get("entity_ids", []),
            "evidence": scored_item.get("evidence", []),
        }
        scored_signals.append(signal)

    # Sort signals deterministically by points descending, pattern_type, then finding_id
    scored_signals.sort(
        key=lambda s: (-s["points"], str(s["pattern_type"]), str(s["finding_id"]))
    )

    capped_score = min(total_raw_points, 100)
    priority = determine_case_priority(capped_score)

    return {
        "score": capped_score,
        "priority": priority,
        "signals": scored_signals,
    }
