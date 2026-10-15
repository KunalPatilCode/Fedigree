from pydantic import BaseModel, Field
from typing import Literal, Union

class DiabetesInputSchema(BaseModel):
    age_years: float = Field(..., ge=18, le=120, description="Age in completed years")
    sex_code: int = Field(..., description="1 for Male, 2 for Female")
    residence_code: int = Field(..., description="1 for Urban, 2 for Rural")
    mpce_quintile: int = Field(..., ge=1, le=5, description="Monthly Per Capita Consumption Expenditure quintile (1-5)")
    education_level: str = Field(..., description="e.g. 0_never_attended, level_1, level_2, level_3, etc.")
    family_history_diabetes: int = Field(..., ge=0, le=1, description="1 if positive parental/sibling family history, 0 otherwise")
    hypertension_history: int = Field(..., ge=0, le=1, description="1 if ever diagnosed with hypertension, 0 otherwise")
    high_cholesterol_history: int = Field(..., ge=0, le=1, description="1 if ever diagnosed with high cholesterol, 0 otherwise")
    tobacco_ever: int = Field(..., ge=0, le=1, description="1 if ever consumed tobacco/bidi/gutka/cigarette, 0 otherwise")
    vigorous_activity_frequency: int = Field(..., description="LASI activity category code (1=daily, 2=>once a week, 3=1-3 times a month, 4=hardly ever/never)")
    moderate_activity_frequency: int = Field(..., description="LASI activity category code (1=daily, 2=>once a week, 3=1-3 times a month, 4=hardly ever/never)")

    class Config:
        json_schema_extra = {
            "example": {
                "age_years": 52.0,
                "sex_code": 1,
                "residence_code": 1,
                "mpce_quintile": 3,
                "education_level": "level_2",
                "family_history_diabetes": 1,
                "hypertension_history": 1,
                "high_cholesterol_history": 0,
                "tobacco_ever": 0,
                "vigorous_activity_frequency": 3,
                "moderate_activity_frequency": 2
            }
        }

class IDRSInputSchema(BaseModel):
    age_years: float = Field(..., ge=18, le=120)
    gender: Literal["male", "female"]
    waist_circumference_cm: float = Field(..., ge=40, le=200)
    physical_activity: Literal["vigorous", "moderate", "sedentary"]
    family_history_diabetes: Literal["none", "one_parent", "both_parents"]

class IDRSResponse(BaseModel):
    score: int
    risk_level: Literal["Low", "Moderate", "High"]
    recommendation: str
    breakdown: dict
