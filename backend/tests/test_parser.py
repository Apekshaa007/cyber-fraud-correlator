import hashlib
from pathlib import Path
import openpyxl
import pytest
from app.services.parser import (
    parse_csv,
    parse_evidence,
    parse_json,
    parse_txt,
    parse_xlsx,
)


def test_parse_csv(tmp_path: Path):
    csv_file = tmp_path / "sample.csv"
    csv_file.write_text("id,name,amount\n1,A,500\n2,B,700\n", encoding="utf-8")

    result = parse_evidence(csv_file, "csv")

    assert result["columns"] == ["id", "name", "amount"]
    assert len(result["records"]) == 2
    assert result["records"][0] == {"id": "1", "name": "A", "amount": "500"}
    assert result["records"][1] == {"id": "2", "name": "B", "amount": "700"}


def test_parse_xlsx(tmp_path: Path):
    xlsx_file = tmp_path / "sample.xlsx"
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.append(["transaction_id", "sender", "receiver"])
    ws.append(["TX1001", "AccountA", "AccountB"])
    ws.append(["TX1002", "AccountC", "AccountD"])
    wb.save(xlsx_file)
    wb.close()

    result = parse_evidence(xlsx_file, "xlsx")

    assert result["columns"] == ["transaction_id", "sender", "receiver"]
    assert len(result["records"]) == 2
    assert result["records"][0] == {
        "transaction_id": "TX1001",
        "sender": "AccountA",
        "receiver": "AccountB",
    }
    assert result["records"][1] == {
        "transaction_id": "TX1002",
        "sender": "AccountC",
        "receiver": "AccountD",
    }


def test_parse_json_list(tmp_path: Path):
    json_file = tmp_path / "sample_list.json"
    json_file.write_text(
        '[{"ip": "192.168.1.1", "user": "alice"}, {"ip": "10.0.0.1", "user": "bob"}]',
        encoding="utf-8",
    )

    result = parse_evidence(json_file, "json")

    assert result["columns"] == ["ip", "user"]
    assert len(result["records"]) == 2
    assert result["records"][0] == {"ip": "192.168.1.1", "user": "alice"}
    assert result["records"][1] == {"ip": "10.0.0.1", "user": "bob"}


def test_parse_json_object_with_records(tmp_path: Path):
    json_file = tmp_path / "sample_obj.json"
    json_file.write_text(
        '{"meta": "log_export", "records": [{"imei": "861234567890123", "status": "active"}]}',
        encoding="utf-8",
    )

    result = parse_evidence(json_file, "json")

    assert result["columns"] == ["imei", "status"]
    assert len(result["records"]) == 1
    assert result["records"][0] == {
        "imei": "861234567890123",
        "status": "active",
    }


def test_parse_txt(tmp_path: Path):
    txt_file = tmp_path / "evidence_notes.txt"
    raw_text = "Suspect contacted victim via WhatsApp on 2026-09-20.\nClaimed bank authorization error."
    txt_file.write_text(raw_text, encoding="utf-8")

    result = parse_evidence(txt_file, "txt")

    assert result["columns"] == ["text"]
    assert len(result["records"]) == 1
    assert result["records"][0] == {"text": raw_text}


def test_unsupported_json_structure(tmp_path: Path):
    # Primitive key-value dict without a list of records
    json_file = tmp_path / "single_obj.json"
    json_file.write_text('{"config_key": "config_value"}', encoding="utf-8")

    with pytest.raises(ValueError, match="Unsupported JSON structure"):
        parse_evidence(json_file, "json")

    # List of non-dict primitives
    json_file_list = tmp_path / "primitive_list.json"
    json_file_list.write_text('["ip1", "ip2", "ip3"]', encoding="utf-8")

    with pytest.raises(ValueError, match="Unsupported JSON structure"):
        parse_evidence(json_file_list, "json")


def test_malformed_input_handling(tmp_path: Path):
    # Syntax error in JSON
    malformed_json = tmp_path / "bad.json"
    malformed_json.write_text('{"invalid_json": ', encoding="utf-8")

    with pytest.raises(ValueError, match="Failed to parse JSON file"):
        parse_evidence(malformed_json, "json")

    # Non-existent file
    non_existent = tmp_path / "missing.csv"
    with pytest.raises(ValueError, match="Failed to parse CSV file"):
        parse_evidence(non_existent, "csv")

    # Unsupported format dispatch
    with pytest.raises(ValueError, match="Unsupported evidence file type for parsing"):
        parse_evidence(tmp_path / "test.txt", "pdf")


def test_parsing_preserves_original_file(tmp_path: Path):
    csv_file = tmp_path / "original_evidence.csv"
    original_content = b"col1,col2\nval1,val2\n"
    csv_file.write_bytes(original_content)

    initial_hash = hashlib.sha256(original_content).hexdigest()

    # Perform parsing
    parse_evidence(csv_file, "csv")

    # Verify original file content and hash are unchanged
    after_content = csv_file.read_bytes()
    after_hash = hashlib.sha256(after_content).hexdigest()

    assert after_content == original_content
    assert after_hash == initial_hash
