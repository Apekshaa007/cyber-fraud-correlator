import hashlib
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any

SUPPORTED_EXTENSIONS = {
    ".csv": "csv",
    ".xlsx": "xlsx",
    ".json": "json",
    ".txt": "txt",
}


def calculate_sha256(file_path: Path) -> str:
    """
    Safely calculates the SHA-256 hexadecimal hash of a file by reading in chunks.
    """
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            sha256_hash.update(chunk)
    return sha256_hash.hexdigest()


def validate_file_type(filename: str) -> str:
    """
    Validates file extension and returns the normalized file type.
    Raises ValueError if the file extension is missing or unsupported.
    """
    if not filename:
        raise ValueError("Filename cannot be empty")

    ext = Path(filename).suffix.lower()
    if ext not in SUPPORTED_EXTENSIONS:
        supported_str = ", ".join(sorted(SUPPORTED_EXTENSIONS.keys()))
        raise ValueError(
            f"Unsupported file type '{ext or 'unknown'}'. Supported types: {supported_str}"
        )

    return SUPPORTED_EXTENSIONS[ext]


def save_evidence_file(
    file_bytes: bytes, filename: str, case_id: str, storage_dir: Path
) -> Dict[str, Any]:
    """
    Saves evidence file to disk, calculates SHA-256, and returns metadata.
    """
    file_type = validate_file_type(filename)
    evidence_id = f"evd_{uuid.uuid4().hex[:12]}"

    case_storage_dir = storage_dir / case_id
    case_storage_dir.mkdir(parents=True, exist_ok=True)

    # Clean filename for storage while preserving original filename in metadata
    safe_filename = Path(filename).name
    stored_filepath = case_storage_dir / f"{evidence_id}_{safe_filename}"

    with open(stored_filepath, "wb") as f:
        f.write(file_bytes)

    sha256_val = calculate_sha256(stored_filepath)
    file_size = stored_filepath.stat().st_size
    uploaded_at = datetime.now(timezone.utc).isoformat()

    return {
        "evidence_id": evidence_id,
        "case_id": case_id,
        "filename": filename,
        "file_type": file_type,
        "file_size": file_size,
        "sha256": sha256_val,
        "uploaded_at": uploaded_at,
        "status": "uploaded",
        "stored_path": str(stored_filepath),
    }
