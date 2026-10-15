from fastapi import APIRouter, HTTPException
from app.schemas.cvd_schema import CVDInputSchema
from app.schemas.common import PredictionResponse
from app.services.ml_service import ml_service

router = APIRouter()

@router.post("/predict-ml", response_model=PredictionResponse)
def predict_cvd_ml(payload: CVDInputSchema):
    try:
        result = ml_service.predict_cvd(payload.model_dump())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
