from fastapi import APIRouter
from app.schemas.common import HealthResponse
from app.core.config import settings
from app.services.ml_service import ml_service

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
def health_check():
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "models_loaded": {
            "diabetes_random_forest_tuned": ml_service.diabetes_artifact is not None,
            "cvd_composite_logistic_regression": ml_service.cvd_artifact is not None
        }
    }
