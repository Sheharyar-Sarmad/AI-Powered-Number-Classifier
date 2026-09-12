

from fastapi import APIRouter, File, UploadFile
from app.schemas import PredictionResponse, ErrorResponse
from app.services.predictor import PredictorService

router = APIRouter(prefix="/predict", tags=["Prediction"])

@router.post(
    "",
    response_model=PredictionResponse,
    responses={
        400: {"model": ErrorResponse},
        413: {"model": ErrorResponse},
        415: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
async def predict(file: UploadFile = File(..., description="Handwritten digit image")):
    result = await PredictorService.run(file)
    return PredictionResponse(**result)