from pathlib import Path
from typing import Any, Dict
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import FileResponse

from app.config import settings
from app.schemas.case import (
    CaseAnalyzeResponse,
    CaseFindingsResponse,
    CaseGraphResponse,
    CaseTimelineResponse,
    EdgeSchema,
    NodeSchema,
)
from app.services.case_analyzer import analyze_case, get_case_analysis
from app.services.report_generator import generate_investigation_report

router = APIRouter(prefix="/cases", tags=["Cases"])


@router.post(
    "/{case_id}/analyze",
    response_model=CaseAnalyzeResponse,
    status_code=status.HTTP_200_OK,
)
def analyze_case_endpoint(case_id: str):
    """
    Runs full orchestration analysis pipeline for all evidence files belonging to case_id.
    """
    try:
        analysis = analyze_case(case_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis pipeline error for case '{case_id}': {str(e)}",
        )

    return CaseAnalyzeResponse(
        case_id=analysis["case_id"],
        status=analysis["status"],
        entity_count=analysis["entity_count"],
        relationship_count=analysis["relationship_count"],
        finding_count=analysis["finding_count"],
        investigative_score=analysis["investigative_score"],
        priority=analysis["priority"],
        timeline_event_count=analysis["timeline_event_count"],
    )


@router.get(
    "/{case_id}/graph",
    response_model=CaseGraphResponse,
    status_code=status.HTTP_200_OK,
)
def get_case_graph(case_id: str):
    """
    Returns the analyzed evidence graph in a clean, frontend-friendly node/edge structure.
    """
    analysis = get_case_analysis(case_id)
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case '{case_id}' has not been analyzed yet. Please run POST /api/cases/{case_id}/analyze first.",
        )

    graph = analysis["graph"]
    nodes = []
    for nid, ndata in graph.nodes(data=True):
        e_type = ndata.get("entity_type", "unknown")
        c_val = ndata.get("canonical_value", nid)
        nodes.append(
            NodeSchema(
                id=nid,
                entity_type=e_type,
                canonical_value=c_val,
                label=f"{e_type}: {c_val}",
            )
        )

    edges = []
    for u, v, edata in graph.edges(data=True):
        edges.append(
            EdgeSchema(
                source=u,
                target=v,
                relationship_type=edata.get("relationship_type", ""),
                confidence=edata.get("confidence", 1.0),
                reason=edata.get("reason", ""),
                record_indices=edata.get("record_indices", []),
            )
        )

    return CaseGraphResponse(
        case_id=case_id,
        nodes=nodes,
        edges=edges,
    )


@router.get(
    "/{case_id}/findings",
    response_model=CaseFindingsResponse,
    status_code=status.HTTP_200_OK,
)
def get_case_findings(case_id: str):
    """
    Returns detected investigative findings and risk priority signals.
    """
    analysis = get_case_analysis(case_id)
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case '{case_id}' has not been analyzed yet. Please run POST /api/cases/{case_id}/analyze first.",
        )

    return CaseFindingsResponse(
        case_id=case_id,
        risk=analysis["risk"],
        findings=analysis["findings"],
    )


@router.get(
    "/{case_id}/timeline",
    response_model=CaseTimelineResponse,
    status_code=status.HTTP_200_OK,
)
def get_case_timeline(case_id: str):
    """
    Returns chronological timeline events generated for the case.
    """
    analysis = get_case_analysis(case_id)
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case '{case_id}' has not been analyzed yet. Please run POST /api/cases/{case_id}/analyze first.",
        )

    return CaseTimelineResponse(
        case_id=case_id,
        events=analysis["timeline"],
    )


@router.get(
    "/{case_id}/report",
    status_code=status.HTTP_200_OK,
)
def get_case_report(case_id: str):
    """
    Generates and returns an evidence-linked PDF investigation brief for the analyzed case.
    """
    analysis = get_case_analysis(case_id)
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case '{case_id}' has not been analyzed yet. Please run POST /api/cases/{case_id}/analyze first.",
        )

    report_path = settings.STORAGE_DIR / case_id / f"{case_id}_investigation_brief.pdf"

    generate_investigation_report(
        case_id=case_id,
        evidence=analysis["evidence"],
        findings=analysis["findings"],
        risk_summary=analysis["risk"],
        timeline=analysis["timeline"],
        output_path=report_path,
    )

    return FileResponse(
        path=report_path,
        filename=f"{case_id}_investigation_brief.pdf",
        media_type="application/pdf",
    )
