import hashlib
import io
import os
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

from app.config import settings
from app.main import app
from app.services.ingestion import calculate_sha256, validate_file_type, save_evidence_file

client = TestClient(app)


def test_sha256_calculation(tmp_path: Path):
    content = b"Sample cyber fraud evidence log content 12345"
    test_file = tmp_path / "sample.txt"
    test_file.write_bytes(content)

    expected_hash = hashlib.sha256(content).hexdigest()
    calculated_hash = calculate_sha256(test_file)

    assert calculated_hash == expected_hash


def test_supported_file_validation():
    assert validate_file_type("evidence.csv") == "csv"
    assert validate_file_type("logs.xlsx") == "xlsx"
    assert validate_file_type("data.json") == "json"
    assert validate_file_type("notes.txt") == "txt"
    # Case insensitivity check
    assert validate_file_type("REPORT.CSV") == "csv"
    assert validate_file_type("Dump.Json") == "json"


def test_unsupported_file_rejection():
    with pytest.raises(ValueError, match="Unsupported file type"):
        validate_file_type("malware.exe")

    with pytest.raises(ValueError, match="Unsupported file type"):
        validate_file_type("script.py")

    with pytest.raises(ValueError, match="Filename cannot be empty"):
        validate_file_type("")

    # API response verification for unsupported file type
    response = client.post(
        "/api/cases/CASE_100/evidence",
        files={"file": ("payload.exe", b"binary content", "application/octet-stream")},
    )
    assert response.status_code == 400
    assert "Unsupported file type" in response.json()["detail"]


def test_successful_evidence_upload_and_persistence(tmp_path: Path, monkeypatch):
    # Redirect storage directory to temporary path during test
    monkeypatch.setattr(settings, "STORAGE_DIR", tmp_path)

    file_content = b"timestamp,ip,action\n2026-09-21T20:00:00Z,192.168.1.50,login_failed\n"
    expected_sha256 = hashlib.sha256(file_content).hexdigest()
    file_size = len(file_content)

    response = client.post(
        "/api/cases/CASE_2026_001/evidence",
        files={"file": ("server_logs.csv", file_content, "text/csv")},
    )

    assert response.status_code == 201
    data = response.json()

    # 1. Check returned metadata fields
    assert data["case_id"] == "CASE_2026_001"
    assert data["filename"] == "server_logs.csv"
    assert data["file_type"] == "csv"
    assert data["file_size"] == file_size
    assert data["sha256"] == expected_sha256
    assert data["status"] == "uploaded"
    assert data["evidence_id"].startswith("evd_")
    assert "uploaded_at" in data

    # 2. Verify file actually exists on disk
    saved_file_dir = tmp_path / "CASE_2026_001"
    assert saved_file_dir.exists()
    matching_files = list(saved_file_dir.glob(f"{data['evidence_id']}_server_logs.csv"))
    assert len(matching_files) == 1

    saved_file_path = matching_files[0]
    assert saved_file_path.is_file()

    # 3. Verify saved file content and calculated SHA-256 match
    saved_content = saved_file_path.read_bytes()
    assert saved_content == file_content
    assert calculate_sha256(saved_file_path) == expected_sha256
