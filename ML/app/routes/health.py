

from fastapi import APIRouter
from app.schemas import HealthResponse

router = APIRouter(tags=["Health"])

@router.get("/", response_model=HealthResponse)
def health_check():
    return {"status": "ok", "message": "Digit Recognizer API is running."}