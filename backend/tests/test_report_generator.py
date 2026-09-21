import base64
import copy
from pathlib import Path
import re
import zlib
import pytest
from app.services.report_generator import generate_investigation_report


def extract_pdf_text(pdf_path: Path) -> str:
    """Extracts raw text content from ReportLab PDF streams."""
    content = pdf_path.read_bytes()
    extracted_texts = []
    idx = 0
    while True:
        start = content.find(b"stream\n", idx)
        if start == -1:
            start = content.find(b"stream\r\n", idx)
            if start == -1:
                break
            s_offset = start + 8
        else:
            s_offset = start + 7
        end = content.find(b"endstream", s_offset)
        if end == -1:
            break
        stream_bytes = content[s_offset:end].strip()
        idx = end + 9
        try:
            data = base64.a85decode(stream_bytes, adobe=True)
            decomp = zlib.decompress(data)
            extracted_texts.append(decomp.decode("latin1", errors="ignore"))
        except Exception:
            pass
    return " ".join(extracted_texts)


def test_basic_pdf_generation(tmp_path: Path):
    output_pdf = tmp_path / "report.pdf"
    case_id = "CASE_2026_001"
    evidence = [
        {
            "evidence_id": "evd_100",
            "filename": "server_logs.csv",
            "file_type": "csv",
            "file_size": 1024,
            "sha256": "4b3240c5f2081d683a45c3d25686001d9f8e5f8f533a1e948c2b793ecf482d85",
            "uploaded_at": "2026-09-21T20:00:00Z",
            "status": "uploaded",
        }
    ]
    findings = [
        {
            "finding_id": "F_001",
            "pattern_type": "multiple_senders_same_receiver",
            "priority": "high",
            "title": "Multiple senders transferred funds to the same account",
            "reason": "3 distinct senders sent funds to ACC_M",
            "entity_ids": ["ENT_ACC_M", "ENT_ACC_A"],
            "record_indices": [0, 1],
        }
    ]
    risk_summary = {
        "score": 75,
        "priority": "high",
        "signals": [
            {
                "finding_id": "F_001",
                "pattern_type": "multiple_senders_same_receiver",
                "points": 25,
                "scoring_reason": "Multiple senders (+25 pts)",
            }
        ],
    }
    timeline = [
        {
            "timestamp": "2026-09-21T10:15:00+00:00",
            "event_type": "transaction",
            "description": "Account ACC_A transferred funds to ACC_M.",
            "entity_ids": ["ENT_ACC_A", "ENT_ACC_M"],
            "record_index": 0,
            "source_field": "timestamp",
        }
    ]

    res_path = generate_investigation_report(
        case_id=case_id,
        evidence=evidence,
        findings=findings,
        risk_summary=risk_summary,
        timeline=timeline,
        output_path=output_pdf,
    )

    assert res_path.exists()
    assert res_path.stat().st_size > 0

    pdf_text = extract_pdf_text(res_path)
    assert "Cyber Fraud Investigation Brief" in pdf_text
    assert "CASE_2026_001" in pdf_text
    assert "server_logs.csv" in pdf_text
    assert "4b3240c5f2081d" in pdf_text
    assert "F_001" in pdf_text
    assert "HIGH" in pdf_text
    assert "ACC_A transferred funds" in pdf_text


def test_empty_findings_timeline_evidence_handled(tmp_path: Path):
    output_pdf = tmp_path / "empty_report.pdf"

    res_path = generate_investigation_report(
        case_id="CASE_EMPTY",
        evidence=[],
        findings=[],
        risk_summary={"score": 0, "priority": "low", "signals": []},
        timeline=[],
        output_path=output_pdf,
    )

    assert res_path.exists()
    assert res_path.stat().st_size > 0

    pdf_text = extract_pdf_text(res_path)
    assert "No evidence files recorded" in pdf_text
    assert "No investigative findings detected" in pdf_text
    assert "No chronological timeline events available" in pdf_text


def test_missing_required_input_raises_value_error(tmp_path: Path):
    output_pdf = tmp_path / "error.pdf"

    with pytest.raises(ValueError, match="case_id is required"):
        generate_investigation_report(
            case_id="",
            evidence=[],
            findings=[],
            risk_summary={},
            timeline=[],
            output_path=output_pdf,
        )

    with pytest.raises(ValueError, match="evidence must be a list"):
        generate_investigation_report(
            case_id="C1",
            evidence=None,
            findings=[],
            risk_summary={},
            timeline=[],
            output_path=output_pdf,
        )


def test_input_objects_are_not_mutated(tmp_path: Path):
    output_pdf = tmp_path / "immutable.pdf"
    case_id = "CASE_IMMUTABLE"
    evidence = [{"filename": "log.csv", "sha256": "12345"}]
    findings = [{"finding_id": "F1"}]
    risk_summary = {"score": 25, "priority": "low", "signals": []}
    timeline = [{"timestamp": "2026-09-21T10:00:00Z"}]

    c_evidence = copy.deepcopy(evidence)
    c_findings = copy.deepcopy(findings)
    c_risk = copy.deepcopy(risk_summary)
    c_timeline = copy.deepcopy(timeline)

    generate_investigation_report(
        case_id=case_id,
        evidence=evidence,
        findings=findings,
        risk_summary=risk_summary,
        timeline=timeline,
        output_path=output_pdf,
    )

    assert evidence == c_evidence
    assert findings == c_findings
    assert risk_summary == c_risk
    assert timeline == c_timeline


def test_multi_page_pdf_generation(tmp_path: Path):
    output_pdf = tmp_path / "multipage_report.pdf"
    findings = [
        {
            "finding_id": f"F_{i:03d}",
            "pattern_type": "onward_transfer",
            "title": f"Investigation Finding #{i}",
            "priority": "medium",
            "reason": f"Detailed investigative pattern observation #{i}",
            "entity_ids": [f"ENT_{i}_A", f"ENT_{i}_B"],
            "record_indices": [i],
        }
        for i in range(25)
    ]
    timeline = [
        {
            "timestamp": f"2026-09-21T10:{i:02d}:00Z",
            "event_type": "transaction",
            "description": f"Transaction event sequence #{i}",
            "entity_ids": [f"ENT_{i}_A", f"ENT_{i}_B"],
            "record_index": i,
        }
        for i in range(25)
    ]

    res_path = generate_investigation_report(
        case_id="CASE_LARGE",
        evidence=[],
        findings=findings,
        risk_summary={"score": 60, "priority": "high", "signals": []},
        timeline=timeline,
        output_path=output_pdf,
    )

    assert res_path.exists()
    assert res_path.stat().st_size > 5000
