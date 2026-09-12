

from pydantic import BaseModel, Field
from typing import List

class PredictionResponse(BaseModel):
    predicted_digit: int = Field(..., ge=0, le=9, description="Predicted digit (0-9)")
    confidence: float = Field(..., ge=0.0, le=100.0, description="Confidence %")
    all_probabilities: List[float] = Field(..., description="Probability per digit 0-9")
    filename: str = Field(..., description="Original uploaded filename")

class ErrorResponse(BaseModel):
    detail: str

class HealthResponse(BaseModel):
    status: str
    message: str