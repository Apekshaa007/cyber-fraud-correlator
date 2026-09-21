from fastapi import APIRouter, File, HTTPException, UploadFile, status
from app.config import settings
from app.schemas.evidence import EvidenceUploadResponse
from app.services.ingestion import save_evidence_file, validate_file_type

router = APIRouter(tags=["Evidence"])


@router.post(
    "/cases/{case_id}/evidence",
    response_model=EvidenceUploadResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_evidence(case_id: str, file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No filename provided in uploaded file",
        )

    try:
        validate_file_type(file.filename)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    file_bytes = await file.read()

    try:
        metadata = save_evidence_file(
            file_bytes=file_bytes,
            filename=file.filename,
            case_id=case_id,
            storage_dir=settings.STORAGE_DIR,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process and store evidence file: {str(e)}",
        )

    return EvidenceUploadResponse(
        evidence_id=metadata["evidence_id"],
        case_id=metadata["case_id"],
        filename=metadata["filename"],
        file_type=metadata["file_type"],
        file_size=metadata["file_size"],
        sha256=metadata["sha256"],
        uploaded_at=metadata["uploaded_at"],
        status=metadata["status"],
    )
