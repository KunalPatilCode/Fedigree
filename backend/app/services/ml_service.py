from pathlib import Path
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any
from app.core.config import settings

class MLService:
    def __init__(self):
        self.diabetes_artifact = None
        self.cvd_artifact = None
        self._load_artifacts()

    def _ensure_compatibility(self, pipeline):
        final_estimator = pipeline.steps[-1][1] if hasattr(pipeline, "steps") else pipeline
        if hasattr(final_estimator, "predict_proba") and not hasattr(final_estimator, "multi_class"):
            setattr(final_estimator, "multi_class", "auto")

    def _load_artifacts(self):
        if settings.DIABETES_MODEL_PATH.exists():
            try:
                self.diabetes_artifact = joblib.load(settings.DIABETES_MODEL_PATH)
                self._ensure_compatibility(self.diabetes_artifact["pipeline"])
            except Exception as e:
                print(f"[WARN] Could not load diabetes model: {e}")

        if settings.CVD_MODEL_PATH.exists():
            try:
                self.cvd_artifact = joblib.load(settings.CVD_MODEL_PATH)
                self._ensure_compatibility(self.cvd_artifact["pipeline"])
            except Exception as e:
                print(f"[WARN] Could not load CVD model: {e}")

    def predict_diabetes(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        if not self.diabetes_artifact:
            raise RuntimeError("Diabetes model artifact not loaded.")

        pipeline = self.diabetes_artifact["pipeline"]
        expected = list(self.diabetes_artifact["feature_names"])
        
        row = [input_data[name] for name in expected]
        df_input = pd.DataFrame([row], columns=expected)

        pred = int(pipeline.predict(df_input)[0])
        classes = list(pipeline.classes_)
        positive_idx = classes.index(1) if 1 in classes else 1
        prob = float(pipeline.predict_proba(df_input)[0][positive_idx])

        return {
            "model_name": "diabetes_random_forest_tuned_lasi_dd",
            "task_name": "diabetes_diagnosis_classification",
            "predicted_class": pred,
            "predicted_class_meaning": "reported_diagnosed_diabetes" if pred == 1 else "no_reported_diagnosed_diabetes",
            "probability": round(prob, 4),
            "model_status": "exploratory_lasi_survey_data_tuned",
            "notice": (
                "Predicts LASI self-reported diabetes diagnosis classification, not future diabetes risk "
                "or a clinical diagnosis. Exploratory survey-sample model; not clinically validated."
            ),
            "feature_contributions": {
                "age_years": input_data.get("age_years"),
                "family_history_diabetes": input_data.get("family_history_diabetes"),
                "hypertension_history": input_data.get("hypertension_history")
            }
        }

    def predict_cvd(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        if not self.cvd_artifact:
            raise RuntimeError("CVD model artifact not loaded.")

        pipeline = self.cvd_artifact["pipeline"]
        expected = list(self.cvd_artifact["feature_names"])

        row = [input_data[name] for name in expected]
        df_input = pd.DataFrame([row], columns=expected)

        pred = int(pipeline.predict(df_input)[0])
        classes = list(pipeline.classes_)
        positive_idx = classes.index(1) if 1 in classes else 1
        prob = float(pipeline.predict_proba(df_input)[0][positive_idx])

        return {
            "model_name": "cvd_composite_logistic_regression_lasi_dd",
            "task_name": "cvd_composite_classification",
            "predicted_class": pred,
            "predicted_class_meaning": "reported_cvd_composite" if pred == 1 else "no_reported_cvd_composite",
            "probability": round(prob, 4),
            "model_status": "exploratory_lasi_survey_data_baseline",
            "notice": (
                "CVD composite means reported hypertension OR chronic heart disease OR stroke. "
                "It is not CAD-specific or a future 10-year cardiovascular-risk prediction. "
                "Exploratory survey-sample model; not clinically validated."
            ),
            "feature_contributions": {
                "age_years": input_data.get("age_years"),
                "family_history_heart_disease": input_data.get("family_history_heart_disease"),
                "diabetes_reported": input_data.get("diabetes_reported")
            }
        }

ml_service = MLService()
