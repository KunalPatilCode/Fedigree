from fastapi import APIRouter, HTTPException
from app.schemas.diabetes_schema import DiabetesInputSchema, IDRSInputSchema, IDRSResponse
from app.schemas.common import PredictionResponse
from app.services.ml_service import ml_service
from app.services.idrs_service import calculate_idrs

router = APIRouter()

@router.post("/predict-ml", response_model=PredictionResponse)
def predict_diabetes_ml(payload: DiabetesInputSchema):
    try:
        result = ml_service.predict_diabetes(payload.model_dump())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/idrs", response_model=IDRSResponse)
def compute_idrs(payload: IDRSInputSchema):
    try:
        result = calculate_idrs(
            age=payload.age_years,
            gender=payload.gender,
            waist_cm=payload.waist_circumference_cm,
            activity=payload.physical_activity,
            family_history=payload.family_history_diabetes
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
