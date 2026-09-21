from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class CaseAnalyzeResponse(BaseModel):
    case_id: str
    status: str
    entity_count: int
    relationship_count: int
    finding_count: int
    investigative_score: int
    priority: str
    timeline_event_count: int


class NodeSchema(BaseModel):
    id: str
    entity_type: str
    canonical_value: str
    label: str


class EdgeSchema(BaseModel):
    source: str
    target: str
    relationship_type: str
    confidence: float
    reason: str
    record_indices: List[int]


class CaseGraphResponse(BaseModel):
    case_id: str
    nodes: List[NodeSchema]
    edges: List[EdgeSchema]


class CaseFindingsResponse(BaseModel):
    case_id: str
    risk: Dict[str, Any]
    findings: List[Dict[str, Any]]


class CaseTimelineResponse(BaseModel):
    case_id: str
    events: List[Dict[str, Any]]
