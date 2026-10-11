"""Fedigree Model 1 inference adapter.

IMPORTANT:
- Current saved models are trained on synthetic labels only.
- This module is for engineering/pipeline testing, not clinical screening.
- Keep feature names and categories synchronized with the training pipeline.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any, Literal

import joblib
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "models"

MODEL_PATHS = {
    "logistic_regression": MODEL_DIR / "diabetes_logistic_synthetic.joblib",
    "random_forest": MODEL_DIR / "diabetes_random_forest_synthetic.joblib",
}

# The nine-feature contract used by compare_model.py.
NUMERIC_BOUNDS = {
    "age_years": (18, 120),
    "bmi_kg_m2": (10, 80),
    "waist_circumference_cm": (30, 250),
}
BINARY_FIELDS = {
    "family_history_diabetes",
    "hypertension_history",
    "tobacco_use",
}
CATEGORICAL_ALLOWED = {
    "sex": {"Male", "Female"},
    "physical_activity_level": {"Low", "Moderate", "High"},
    "diet_pattern": {"Balanced", "Mixed", "High_sugar_processed"},
}
FEATURE_ORDER = [
    "age_years",
    "bmi_kg_m2",
    "waist_circumference_cm",
    "family_history_diabetes",
    "hypertension_history",
    "tobacco_use",
    "sex",
    "physical_activity_level",
    "diet_pattern",
]
REQUIRED_FIELDS = set(FEATURE_ORDER)


class InputValidationError(ValueError):
    """Raised when the provided profile does not match the feature contract."""


def validate_profile(profile: dict[str, Any]) -> dict[str, Any]:
    if not isinstance(profile, dict):
        raise InputValidationError("Input must be a dictionary/object.")

    provided = set(profile.keys())
    missing = REQUIRED_FIELDS - provided
    extra = provided - REQUIRED_FIELDS
    if missing or extra:
        parts = []
        if missing:
            parts.append(f"Missing fields: {sorted(missing)}")
        if extra:
            parts.append(f"Unexpected fields: {sorted(extra)}")
        raise InputValidationError("; ".join(parts))

    cleaned: dict[str, Any] = {}

    for field, (minimum, maximum) in NUMERIC_BOUNDS.items():
        value = profile[field]
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise InputValidationError(f"{field} must be a number.")
        if not minimum <= value <= maximum:
            raise InputValidationError(
                f"{field} must be between {minimum} and {maximum}."
            )
        cleaned[field] = int(value) if field == "age_years" else float(value)
        if field == "age_years" and float(value) != int(value):
            raise InputValidationError("age_years must be a whole number.")

    for field in BINARY_FIELDS:
        value = profile[field]
        if isinstance(value, bool):
            value = int(value)
        if value not in (0, 1):
            raise InputValidationError(f"{field} must be 0 or 1.")
        cleaned[field] = int(value)

    for field, allowed in CATEGORICAL_ALLOWED.items():
        value = profile[field]
        if not isinstance(value, str) or value not in allowed:
            raise InputValidationError(
                f"{field} must be one of: {', '.join(sorted(allowed))}."
            )
        cleaned[field] = value

    # Preserve model training order even if caller sends keys in a different order.
    return {field: cleaned[field] for field in FEATURE_ORDER}


def predict_diabetes(
    profile: dict[str, Any],
    model_name: Literal["logistic_regression", "random_forest"] = "logistic_regression",
) -> dict[str, Any]:
    """Run a saved experimental model and return a clearly marked synthetic result."""
    if model_name not in MODEL_PATHS:
        raise ValueError(
            "model_name must be 'logistic_regression' or 'random_forest'."
        )

    model_path = MODEL_PATHS[model_name]
    if not model_path.exists():
        raise FileNotFoundError(
            f"Model not found: {model_path}. Copy the saved model artifact into {MODEL_DIR}."
        )

    validated = validate_profile(profile)
    pipeline = joblib.load(model_path)

    expected_features = list(getattr(pipeline, "feature_names_in_", FEATURE_ORDER))
    if expected_features != FEATURE_ORDER:
        raise RuntimeError(
            "Saved model feature schema does not match this inference contract. "
            "Check the training script and retrain/revise the contract together."
        )

    frame = pd.DataFrame([validated], columns=FEATURE_ORDER)
    predicted_label = int(pipeline.predict(frame)[0])

    classes = list(pipeline.classes_)
    if 1 not in classes:
        raise RuntimeError("Saved model does not contain positive class label 1.")
    positive_index = classes.index(1)
    positive_label_probability = float(
        pipeline.predict_proba(frame)[0][positive_index]
    )

    return {
        "model_name": model_name,
        "predicted_synthetic_label": predicted_label,
        "synthetic_positive_label_probability": round(
            positive_label_probability, 6
        ),
        "model_status": "experimental_synthetic_data_only",
        "notice": (
            "Synthetic-data pipeline test only. This is not a clinical diagnosis "
            "or a validated estimate of a person's diabetes risk."
        ),
    }


if __name__ == "__main__":
    example_profile = {
        "age_years": 45,
        "bmi_kg_m2": 27.0,
        "waist_circumference_cm": 90.0,
        "family_history_diabetes": 1,
        "hypertension_history": 0,
        "tobacco_use": 0,
        "sex": "Male",
        "physical_activity_level": "Low",
        "diet_pattern": "Mixed",
    }

    for selected_model in ("logistic_regression", "random_forest"):
        print(predict_diabetes(example_profile, selected_model))
