from pydantic import BaseModel
from typing import Optional, Dict, Any, List

class PredictionResponse(BaseModel):
    model_config = {"protected_namespaces": ()}
    
    model_name: str
    task_name: str
    predicted_class: int
    predicted_class_meaning: str
    probability: float
    model_status: str
    notice: str
    feature_contributions: Optional[Dict[str, Any]] = None

class HealthResponse(BaseModel):
    status: str
    project: str
    version: str
    models_loaded: Dict[str, bool]
