from pydantic import BaseModel, Field

class CVDInputSchema(BaseModel):
    age_years: float = Field(..., ge=18, le=120, description="Age in completed years")
    sex_code: int = Field(..., description="1 for Male, 2 for Female")
    residence_code: int = Field(..., description="1 for Urban, 2 for Rural")
    mpce_quintile: int = Field(..., ge=1, le=5, description="Monthly Per Capita Consumption Expenditure quintile (1-5)")
    education_level: str = Field(..., description="e.g. 0_never_attended, level_1, level_2, level_3, etc.")
    family_history_hypertension: int = Field(..., ge=0, le=1, description="1 if positive family history of hypertension, 0 otherwise")
    family_history_heart_disease: int = Field(..., ge=0, le=1, description="1 if positive family history of heart disease, 0 otherwise")
    family_history_stroke: int = Field(..., ge=0, le=1, description="1 if positive family history of stroke, 0 otherwise")
    diabetes_reported: int = Field(..., ge=0, le=1, description="1 if diagnosed with diabetes, 0 otherwise")
    high_cholesterol_history: int = Field(..., ge=0, le=1, description="1 if diagnosed with high cholesterol, 0 otherwise")
    tobacco_ever: int = Field(..., ge=0, le=1, description="1 if ever consumed tobacco, 0 otherwise")
    vigorous_activity_frequency: int = Field(..., description="LASI activity code (1-4)")
    moderate_activity_frequency: int = Field(..., description="LASI activity code (1-4)")

    class Config:
        json_schema_extra = {
            "example": {
                "age_years": 58.0,
                "sex_code": 1,
                "residence_code": 1,
                "mpce_quintile": 4,
                "education_level": "level_2",
                "family_history_hypertension": 1,
                "family_history_heart_disease": 1,
                "family_history_stroke": 0,
                "diabetes_reported": 1,
                "high_cholesterol_history": 1,
                "tobacco_ever": 1,
                "vigorous_activity_frequency": 4,
                "moderate_activity_frequency": 3
            }
        }
