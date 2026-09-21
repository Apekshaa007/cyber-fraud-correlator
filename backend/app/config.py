from pathlib import Path
from pydantic import BaseModel


class Settings(BaseModel):
    PROJECT_NAME: str = "Cyber Fraud Analysis & Digital Artifact Correlator"
    VERSION: str = "0.1.0"
    API_PREFIX: str = "/api"
    DEBUG: bool = False
    STORAGE_DIR: Path = Path("storage/evidence")


settings = Settings()
