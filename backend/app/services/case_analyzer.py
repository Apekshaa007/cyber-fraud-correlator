from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

from app.config import settings
from app.services.entity_extractor import extract_entities
from app.services.entity_resolver import resolve_entities
from app.services.fraud_detector import detect_patterns
from app.services.graph_builder import build_graph, get_graph_summary
from app.services.ingestion import calculate_sha256, validate_file_type
from app.services.normalizer import normalize_records
from app.services.parser import parse_evidence
from app.services.risk_scorer import calculate_case_score
from app.services.timeline_builder import build_timeline

# In-memory MVP case analysis store
CASE_ANALYSIS_STORE: Dict[str, Dict[str, Any]] = {}


def analyze_case(case_id: str, storage_dir: Optional[Path] = None) -> Dict[str, Any]:
    """
    Orchestrates the full evidence analysis pipeline for a case:
    Stored Evidence -> Parse -> Normalize -> Extract Entities -> Resolve Entities -> Build Graph -> Detect Patterns -> Priority Scoring -> Timeline.
    Result is cached in CASE_ANALYSIS_STORE.
    """
    if not case_id or not str(case_id).strip():
        raise ValueError("case_id is required")

    base_storage = storage_dir if storage_dir is not None else settings.STORAGE_DIR
    case_storage_dir = base_storage / case_id

    if not case_storage_dir.exists() or not case_storage_dir.is_dir():
        raise ValueError(f"No evidence directory found for case '{case_id}'")

    # Find all evidence files in case storage directory
    evidence_files = sorted([f for f in case_storage_dir.iterdir() if f.is_file() and not f.name.endswith(".pdf")])
    if not evidence_files:
        raise ValueError(f"No evidence files found for case '{case_id}'")

    all_evidence_metadata: List[Dict[str, Any]] = []
    all_normalized_records: List[Dict[str, Any]] = []
    all_extracted_entities: List[Dict[str, Any]] = []

    global_record_index = 0

    for filepath in evidence_files:
        # Determine original filename from stored path (format: {evidence_id}_{original_filename})
        name_parts = filepath.name.split("_", 1)
        evidence_id = name_parts[0] if len(name_parts) > 1 else f"evd_{filepath.name[:8]}"
        filename = name_parts[1] if len(name_parts) > 1 else filepath.name

        try:
            file_type = validate_file_type(filename)
        except ValueError:
            continue

        sha256_val = calculate_sha256(filepath)
        file_size = filepath.stat().st_size
        uploaded_at = datetime.fromtimestamp(filepath.stat().st_ctime, tz=timezone.utc).isoformat()

        all_evidence_metadata.append({
            "evidence_id": evidence_id,
            "case_id": case_id,
            "filename": filename,
            "file_type": file_type,
            "file_size": file_size,
            "sha256": sha256_val,
            "uploaded_at": uploaded_at,
            "status": "uploaded",
            "stored_path": str(filepath),
        })

        # 1. Parse
        parsed_data = parse_evidence(filepath, file_type)

        # 2. Normalize
        normalized_data = normalize_records(parsed_data)

        # 3. Extract Entities
        extracted = extract_entities(normalized_data)

        # Adjust record_index to be global across case evidence files
        file_records = normalized_data.get("records", [])
        for ent in extracted:
            local_idx = ent["record_index"]
            ent_copy = dict(ent)
            ent_copy["record_index"] = global_record_index + local_idx
            all_extracted_entities.append(ent_copy)

        for rec in file_records:
            all_normalized_records.append(rec)

        global_record_index += len(file_records)

    if not all_evidence_metadata:
        raise ValueError(f"No valid evidence files found for case '{case_id}'")

    # 4. Resolve Entities
    resolved_data = resolve_entities(all_extracted_entities)

    # 5. Build Graph
    graph = build_graph(resolved_data)
    graph_summary = get_graph_summary(graph)

    # 6. Detect Patterns
    findings_res = detect_patterns(graph)
    findings = findings_res.get("findings", [])

    # 7. Calculate Priority Score
    risk_summary = calculate_case_score(findings)

    # 8. Build Timeline
    timeline_events = build_timeline(
        records=all_normalized_records,
        entities=resolved_data.get("entities", []),
        relationships=resolved_data.get("relationships", []),
    )

    analysis_result = {
        "case_id": case_id,
        "status": "analyzed",
        "evidence": all_evidence_metadata,
        "entities": resolved_data.get("entities", []),
        "relationships": resolved_data.get("relationships", []),
        "graph": graph,
        "graph_summary": graph_summary,
        "findings": findings,
        "risk": risk_summary,
        "timeline": timeline_events,
        "entity_count": len(resolved_data.get("entities", [])),
        "relationship_count": len(resolved_data.get("relationships", [])),
        "finding_count": len(findings),
        "investigative_score": risk_summary.get("score", 0),
        "priority": risk_summary.get("priority", "low"),
        "timeline_event_count": len(timeline_events),
        "analyzed_at": datetime.now(timezone.utc).isoformat(),
    }

    # Store analysis result in MVP memory store
    CASE_ANALYSIS_STORE[case_id] = analysis_result

    return analysis_result


def get_case_analysis(case_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves cached analysis result for case_id from memory store."""
    return CASE_ANALYSIS_STORE.get(case_id)
