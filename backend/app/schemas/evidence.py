from pydantic import BaseModel


class EvidenceUploadResponse(BaseModel):
    evidence_id: str
    case_id: str
    filename: str
    file_type: str
    file_size: int
    sha256: str
    uploaded_at: str
    status: str
