from pathlib import Path
import pytest
from fastapi.testclient import TestClient

from app.config import settings
from app.main import app

client = TestClient(app)


def test_analyze_case_with_single_and_multiple_evidence_files(tmp_path: Path, monkeypatch):
    monkeypatch.setattr(settings, "STORAGE_DIR", tmp_path)
    case_id = "CASE_API_TEST_001"

    # 1. Upload evidence file 1
    f1_content = b"transaction_time,sender_account,receiver_account,amount\n2026-09-21T10:00:00Z,ACC_A,ACC_B,5000\n2026-09-21T10:05:00Z,ACC_C,ACC_B,2500\n"
    res1 = client.post(
        f"/api/cases/{case_id}/evidence",
        files={"file": ("txns_1.csv", f1_content, "text/csv")},
    )
    assert res1.status_code == 201

    # 2. Upload evidence file 2
    f2_content = b"timestamp,account_id,ip_address\n2026-09-21T10:10:00Z,ACC_B,192.168.1.50\n"
    res2 = client.post(
        f"/api/cases/{case_id}/evidence",
        files={"file": ("logs_2.csv", f2_content, "text/csv")},
    )
    assert res2.status_code == 201

    # 3. Analyze case endpoint
    analyze_res = client.post(f"/api/cases/{case_id}/analyze")
    assert analyze_res.status_code == 200
    data = analyze_res.json()

    assert data["case_id"] == case_id
    assert data["status"] == "analyzed"
    assert data["entity_count"] > 0
    assert data["relationship_count"] > 0
    assert data["finding_count"] >= 1
    assert data["investigative_score"] >= 25
    assert data["priority"] in ("low", "medium", "high")
    assert data["timeline_event_count"] >= 2


def test_get_graph_after_analysis(tmp_path: Path, monkeypatch):
    monkeypatch.setattr(settings, "STORAGE_DIR", tmp_path)
    case_id = "CASE_GRAPH_001"

    f_content = b"sender_account,receiver_account\nACC_1,ACC_2\n"
    client.post(f"/api/cases/{case_id}/evidence", files={"file": ("data.csv", f_content, "text/csv")})
    client.post(f"/api/cases/{case_id}/analyze")

    res = client.get(f"/api/cases/{case_id}/graph")
    assert res.status_code == 200
    graph_data = res.json()

    assert graph_data["case_id"] == case_id
    assert len(graph_data["nodes"]) >= 2
    assert len(graph_data["edges"]) >= 1

    # Check edge provenance
    edge = graph_data["edges"][0]
    assert "source" in edge
    assert "target" in edge
    assert "relationship_type" in edge
    assert "record_indices" in edge
    assert "reason" in edge


def test_get_findings_after_analysis(tmp_path: Path, monkeypatch):
    monkeypatch.setattr(settings, "STORAGE_DIR", tmp_path)
    case_id = "CASE_FINDINGS_001"

    f_content = b"sender_account,receiver_account\nACC_A,ACC_M\nACC_B,ACC_M\n"
    client.post(f"/api/cases/{case_id}/evidence", files={"file": ("txns.csv", f_content, "text/csv")})
    client.post(f"/api/cases/{case_id}/analyze")

    res = client.get(f"/api/cases/{case_id}/findings")
    assert res.status_code == 200
    findings_data = res.json()

    assert findings_data["case_id"] == case_id
    assert "risk" in findings_data
    assert "findings" in findings_data
    assert findings_data["risk"]["score"] >= 25
    assert len(findings_data["findings"]) >= 1

    f = findings_data["findings"][0]
    assert "finding_id" in f
    assert "pattern_type" in f
    assert "record_indices" in f


def test_get_timeline_after_analysis(tmp_path: Path, monkeypatch):
    monkeypatch.setattr(settings, "STORAGE_DIR", tmp_path)
    case_id = "CASE_TIMELINE_001"

    f_content = b"timestamp,sender,receiver\n2026-09-21T10:00:00Z,ACC_A,ACC_B\n"
    client.post(f"/api/cases/{case_id}/evidence", files={"file": ("txns.csv", f_content, "text/csv")})
    client.post(f"/api/cases/{case_id}/analyze")

    res = client.get(f"/api/cases/{case_id}/timeline")
    assert res.status_code == 200
    tl_data = res.json()

    assert tl_data["case_id"] == case_id
    assert len(tl_data["events"]) == 1
    ev = tl_data["events"][0]
    assert ev["timestamp"] == "2026-09-21T10:00:00+00:00"
    assert ev["record_index"] == 0


def test_get_report_pdf_after_analysis(tmp_path: Path, monkeypatch):
    monkeypatch.setattr(settings, "STORAGE_DIR", tmp_path)
    case_id = "CASE_REPORT_001"

    f_content = b"timestamp,sender,receiver\n2026-09-21T10:00:00Z,ACC_A,ACC_B\n"
    client.post(f"/api/cases/{case_id}/evidence", files={"file": ("txns.csv", f_content, "text/csv")})
    client.post(f"/api/cases/{case_id}/analyze")

    res = client.get(f"/api/cases/{case_id}/report")
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/pdf"
    assert res.content.startswith(b"%PDF")


def test_case_with_no_evidence_returns_http_400():
    res = client.post("/api/cases/CASE_NO_EVIDENCE/analyze")
    assert res.status_code == 400
    assert "No evidence" in res.json()["detail"]


def test_unanalyzed_case_returns_http_404():
    for endpoint in ["graph", "findings", "timeline", "report"]:
        res = client.get(f"/api/cases/UNANALYZED_CASE/{endpoint}")
        assert res.status_code == 404
        assert "has not been analyzed yet" in res.json()["detail"]
