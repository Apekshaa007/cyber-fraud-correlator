import copy
import pytest
from app.services.risk_scorer import (
    calculate_case_score,
    calculate_finding_score,
    determine_case_priority,
)


def test_supported_pattern_points():
    f1 = {"finding_id": "F1", "pattern_type": "multiple_senders_same_receiver"}
    f2 = {"finding_id": "F2", "pattern_type": "onward_transfer"}
    f3 = {"finding_id": "F3", "pattern_type": "multi_hop_transaction_chain"}
    f4 = {"finding_id": "F4", "pattern_type": "high_transaction_velocity"}
    f5 = {"finding_id": "F5", "pattern_type": "shared_infrastructure"}

    assert calculate_finding_score(f1)["points"] == 25
    assert calculate_finding_score(f2)["points"] == 20
    assert calculate_finding_score(f3)["points"] == 15
    assert calculate_finding_score(f4)["points"] == 15
    assert calculate_finding_score(f5)["points"] == 5


def test_unknown_and_missing_pattern_type_gets_zero_points():
    f_unknown = {"finding_id": "F_UNK", "pattern_type": "unknown_custom_pattern"}
    f_missing = {"finding_id": "F_MIS"}

    res_unk = calculate_finding_score(f_unknown)
    res_mis = calculate_finding_score(f_missing)

    assert res_unk["points"] == 0
    assert "Unknown pattern type" in res_unk["scoring_reason"]

    assert res_mis["points"] == 0
    assert "Unknown pattern type" in res_mis["scoring_reason"]


def test_invalid_input_structure_raises_value_error():
    with pytest.raises(ValueError, match="Input finding must be a dictionary"):
        calculate_finding_score("invalid_finding")

    with pytest.raises(ValueError, match="Input findings must be a list"):
        calculate_case_score({"not": "a_list"})


def test_priority_thresholds():
    assert determine_case_priority(0) == "low"
    assert determine_case_priority(29) == "low"
    assert determine_case_priority(30) == "medium"
    assert determine_case_priority(59) == "medium"
    assert determine_case_priority(60) == "high"
    assert determine_case_priority(100) == "high"


def test_case_score_calculation_and_priority_levels():
    # Low priority case (points: 5 + 20 = 25)
    low_findings = [
        {"finding_id": "F1", "pattern_type": "shared_infrastructure"},
        {"finding_id": "F2", "pattern_type": "onward_transfer"},
    ]
    low_res = calculate_case_score(low_findings)
    assert low_res["score"] == 25
    assert low_res["priority"] == "low"

    # Medium priority case (points: 25 + 20 = 45)
    med_findings = [
        {"finding_id": "F1", "pattern_type": "multiple_senders_same_receiver"},
        {"finding_id": "F2", "pattern_type": "onward_transfer"},
    ]
    med_res = calculate_case_score(med_findings)
    assert med_res["score"] == 45
    assert med_res["priority"] == "medium"

    # High priority case (points: 25 + 20 + 15 + 15 = 75)
    high_findings = [
        {"finding_id": "F1", "pattern_type": "multiple_senders_same_receiver"},
        {"finding_id": "F2", "pattern_type": "onward_transfer"},
        {"finding_id": "F3", "pattern_type": "multi_hop_transaction_chain"},
        {"finding_id": "F4", "pattern_type": "high_transaction_velocity"},
    ]
    high_res = calculate_case_score(high_findings)
    assert high_res["score"] == 75
    assert high_res["priority"] == "high"


def test_score_capped_at_100():
    # Sum = 25 + 25 + 25 + 25 + 25 = 125 -> capped at 100
    findings = [
        {"finding_id": "F1", "pattern_type": "multiple_senders_same_receiver"},
        {"finding_id": "F2", "pattern_type": "multiple_senders_same_receiver"},
        {"finding_id": "F3", "pattern_type": "multiple_senders_same_receiver"},
        {"finding_id": "F4", "pattern_type": "multiple_senders_same_receiver"},
        {"finding_id": "F5", "pattern_type": "multiple_senders_same_receiver"},
    ]
    res = calculate_case_score(findings)
    assert res["score"] == 100
    assert res["priority"] == "high"


def test_duplicate_finding_ids_are_not_double_counted():
    findings = [
        {"finding_id": "DUP_1", "pattern_type": "multiple_senders_same_receiver"},  # +25
        {"finding_id": "DUP_1", "pattern_type": "multiple_senders_same_receiver"},  # Ignored duplicate
        {"finding_id": "F2", "pattern_type": "onward_transfer"},                    # +20
    ]
    res = calculate_case_score(findings)
    assert len(res["signals"]) == 2
    assert res["score"] == 45


def test_missing_finding_id_handled_correctly():
    findings = [
        {"pattern_type": "shared_infrastructure"},
        {"pattern_type": "onward_transfer"},
    ]
    res = calculate_case_score(findings)
    assert len(res["signals"]) == 2
    assert res["score"] == 25


def test_evidence_fields_and_traceability_preserved():
    findings = [
        {
            "finding_id": "F_TEST",
            "pattern_type": "onward_transfer",
            "entity_ids": ["ACC_A", "ACC_B", "ACC_C"],
            "record_indices": [10, 11],
            "reason": "Account B received funds from A and sent to C",
            "evidence": [{"record_index": 10, "relationship_type": "transaction"}],
        }
    ]
    res = calculate_case_score(findings)
    assert len(res["signals"]) == 1
    sig = res["signals"][0]

    assert sig["finding_id"] == "F_TEST"
    assert sig["pattern_type"] == "onward_transfer"
    assert sig["points"] == 20
    assert sig["record_indices"] == [10, 11]
    assert sig["entity_ids"] == ["ACC_A", "ACC_B", "ACC_C"]
    assert len(sig["evidence"]) == 1
    assert "onward transfer" in sig["scoring_reason"].lower()


def test_empty_findings_returns_zero_score_and_low_priority():
    res = calculate_case_score([])
    assert res["score"] == 0
    assert res["priority"] == "low"
    assert res["signals"] == []


def test_input_immutability():
    findings = [
        {"finding_id": "F1", "pattern_type": "onward_transfer"}
    ]
    original_copy = copy.deepcopy(findings)

    calculate_case_score(findings)

    assert findings == original_copy


def test_deterministic_output():
    findings = [
        {"finding_id": "F2", "pattern_type": "shared_infrastructure"},
        {"finding_id": "F1", "pattern_type": "multiple_senders_same_receiver"},
    ]
    res1 = calculate_case_score(findings)
    res2 = calculate_case_score(findings)

    assert res1 == res2
    # Check deterministic signals sorting (higher points first)
    assert res1["signals"][0]["finding_id"] == "F1"
    assert res1["signals"][1]["finding_id"] == "F2"
