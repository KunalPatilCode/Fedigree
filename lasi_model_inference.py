"""Inference helper for locally trained LASI combined-dataset baseline models.

Supports loading and evaluating:
- diabetes_logistic_regression
- diabetes_random_forest
- cvd_composite_logistic_regression
- cvd_composite_random_forest

Also preserves paths to historical Daman & Diu-only baseline and tuned artifacts.
All inputs are strictly validated before prediction.
"""
from pathlib import Path
import sys

import joblib
import numpy as np
import pandas as pd
import sklearn

BASE_DIR = Path(__file__).resolve().parent

# Active combined-dataset baseline artifacts (Maharashtra + Daman & Diu)
COMBINED_BASELINE_PATHS = {
    "diabetes_logistic_regression": (
        BASE_DIR / "models" / "diabetes_logistic_regression_combined_baseline.joblib"
    ),
    "diabetes_random_forest": (
        BASE_DIR / "models" / "diabetes_random_forest_combined_baseline.joblib"
    ),
    "cvd_composite_logistic_regression": (
        BASE_DIR / "models" / "cvd_composite_logistic_regression_combined_baseline.joblib"
    ),
    "cvd_composite_random_forest": (
        BASE_DIR / "models" / "cvd_composite_random_forest_combined_baseline.joblib"
    ),
}

# Active combined-dataset fine-tuned artifacts (Maharashtra + Daman & Diu)
COMBINED_TUNED_PATHS = {
    "diabetes_random_forest_tuned": (
        BASE_DIR / "models" / "diabetes_random_forest_combined_tuned.joblib"
    ),
    "cvd_composite_logistic_regression_tuned": (
        BASE_DIR / "models" / "cvd_composite_logistic_regression_combined_tuned.joblib"
    ),
}

# Historical Daman & Diu-only models (preserved for audit and comparison)
HISTORICAL_DD_PATHS = {
    "historical_diabetes_logistic_regression_dd": (
        BASE_DIR / "models" / "diabetes_logistic_regression_lasi_dd.joblib"
    ),
    "historical_diabetes_random_forest_baseline_dd": (
        BASE_DIR / "models" / "diabetes_random_forest_lasi_dd.joblib"
    ),
    "historical_diabetes_random_forest_tuned_dd": (
        BASE_DIR / "models" / "diabetes_random_forest_tuned_lasi_dd.joblib"
    ),
    "historical_cvd_composite_logistic_regression_dd": (
        BASE_DIR / "models" / "cvd_composite_logistic_regression_lasi_dd.joblib"
    ),
    "historical_cvd_composite_random_forest_dd": (
        BASE_DIR / "models" / "cvd_composite_random_forest_lasi_dd.joblib"
    ),
}

# Complete model lookup dictionary
MODEL_PATHS = {
    **COMBINED_BASELINE_PATHS,
    **COMBINED_TUNED_PATHS,
    **HISTORICAL_DD_PATHS,
    # Explicit full aliases
    "diabetes_logistic_regression_combined_baseline": COMBINED_BASELINE_PATHS["diabetes_logistic_regression"],
    "diabetes_random_forest_combined_baseline": COMBINED_BASELINE_PATHS["diabetes_random_forest"],
    "cvd_composite_logistic_regression_combined_baseline": COMBINED_BASELINE_PATHS["cvd_composite_logistic_regression"],
    "cvd_composite_random_forest_combined_baseline": COMBINED_BASELINE_PATHS["cvd_composite_random_forest"],
    "diabetes_random_forest_combined_tuned": COMBINED_TUNED_PATHS["diabetes_random_forest_tuned"],
    "cvd_composite_logistic_regression_combined_tuned": COMBINED_TUNED_PATHS["cvd_composite_logistic_regression_tuned"],
}


def pipeline_expects_dataframe(pipeline) -> bool:
    """Detect whether preprocessing was fitted with named columns."""
    preprocessor = pipeline.named_steps.get("preprocessor")
    if preprocessor is None:
        return hasattr(pipeline, "feature_names_in_")

    if hasattr(preprocessor, "feature_names_in_"):
        return True

    has_named_columns = False
    has_positional_columns = False

    for _, transformer, columns in getattr(preprocessor, "transformers_", []):
        if isinstance(transformer, str) and transformer == "drop":
            continue

        if isinstance(columns, str):
            has_named_columns = True
        elif isinstance(columns, (list, tuple, np.ndarray, pd.Index)):
            selected = list(columns)
            if selected and all(isinstance(c, str) for c in selected):
                has_named_columns = True
            if selected and all(isinstance(c, (int, np.integer)) for c in selected):
                has_positional_columns = True

    if has_named_columns:
        return True
    if has_positional_columns:
        return False
    return hasattr(pipeline, "feature_names_in_")


def validate_input_profile(input_features: dict, expected_fields: list[str]) -> list:
    """Validate input features for completeness, types, and expected format."""
    if not isinstance(input_features, dict):
        raise TypeError(f"input_features must be a dictionary, got {type(input_features).__name__}.")

    missing = sorted(set(expected_fields) - set(input_features))
    extra = sorted(set(input_features) - set(expected_fields))

    if missing:
        raise ValueError(f"Missing required input fields: {missing}")
    if extra:
        raise ValueError(f"Unexpected input fields: {extra}")

    # Validate age_years
    age = input_features.get("age_years")
    if age is None:
        raise ValueError("age_years cannot be None.")
    try:
        age_val = float(age)
        if age_val <= 0 or age_val > 125:
            raise ValueError(f"age_years out of plausible range (0-125): {age_val}")
    except (ValueError, TypeError) as exc:
        raise ValueError(f"Invalid age_years value: {age!r}. Must be numeric.") from exc

    # Return ordered feature values
    return [input_features[name] for name in expected_fields]


def predict(model_key: str, input_features: dict) -> dict:
    """Predict a LASI diagnosis classification for one input profile.

    Validates schema, categories, extracts positive-class probability,
    and returns a structured prediction payload with limitations notice.
    """
    if model_key not in MODEL_PATHS:
        valid_keys = sorted(MODEL_PATHS.keys())
        raise ValueError(f"Unknown model_key '{model_key}'. Choose one of: {', '.join(valid_keys)}")

    path = MODEL_PATHS[model_key]
    if not path.exists():
        raise FileNotFoundError(f"Model artifact file not found: {path}")

    artifact = joblib.load(path)
    pipeline = artifact["pipeline"]
    expected_fields = list(artifact["feature_names"])

    # Validate and order features
    row = validate_input_profile(input_features, expected_fields)

    # Convert to appropriate input representation (DataFrame or 2D array)
    if pipeline_expects_dataframe(pipeline):
        model_input = pd.DataFrame([row], columns=expected_fields)
    else:
        model_input = np.asarray([row], dtype=object)

    classes = list(pipeline.classes_)
    if 1 not in classes:
        raise ValueError("Saved model classes do not contain positive class 1.")

    positive_index = classes.index(1)
    probability = float(pipeline.predict_proba(model_input)[0][positive_index])

    # Determine classification threshold (calibrated for tuned models, default 0.50 otherwise)
    threshold = 0.5
    tuning_info = artifact.get("tuning")
    if isinstance(tuning_info, dict) and "decision_threshold" in tuning_info:
        threshold = float(tuning_info["decision_threshold"])
    elif "threshold" in artifact:
        threshold = float(artifact["threshold"])

    pred = int(probability >= threshold)

    task_name = artifact.get("task_name", "unknown")
    if task_name == "diabetes":
        class_name = (
            "reported_diagnosed_diabetes"
            if pred == 1
            else "no_reported_diagnosed_diabetes"
        )
        task_notice = (
            "Predicts LASI self-reported diabetes diagnosis classification (HT003), "
            "NOT prospective future diabetes risk and NOT a clinical diagnostic test."
        )
    else:
        class_name = (
            "reported_cvd_composite"
            if pred == 1
            else "no_reported_cvd_composite"
        )
        task_notice = (
            "Predicts LASI-defined CVD condition composite (hypertension OR chronic heart disease "
            "OR stroke). It is NOT CAD-specific and NOT a future 10-year cardiovascular risk score."
        )

    scope = artifact.get("data_scope", "Combined Maharashtra + Daman & Diu survey sample")

    return {
        "model_key": model_key,
        "model_name": artifact.get("model_name"),
        "task_name": task_name,
        "predicted_class": pred,
        "predicted_class_meaning": class_name,
        "model_positive_class_probability": round(probability, 6),
        "classification_threshold": round(threshold, 4),
        "data_scope": scope,
        "model_status": artifact.get("status", "exploratory_baseline_not_clinically_validated"),
        "training_environment": {
            "sklearn_version": artifact.get("sklearn_version", sklearn.__version__),
            "current_sklearn": sklearn.__version__,
        },
        "notice": (
            task_notice
            + " Exploratory baseline model trained on LASI survey data. "
            "Not clinically validated. Do NOT deploy for medical decision-making, individual triage, or diagnosis."
        ),
    }


def diabetes_input_example() -> dict:
    """Fictional example for software testing only."""
    return {
        "age_years": 60,
        "sex_code": "1",
        "residence_code": "1",
        "mpce_quintile": "3",
        "education_level": "level_3",
        "family_history_diabetes": "0",
        "hypertension_history": "0",
        "high_cholesterol_history": "0",
        "tobacco_ever": "0",
        "vigorous_activity_frequency": "5",
        "moderate_activity_frequency": "2",
    }


def cvd_input_example() -> dict:
    """Fictional example for software testing only."""
    return {
        "age_years": 60,
        "sex_code": "1",
        "residence_code": "1",
        "mpce_quintile": "3",
        "education_level": "level_3",
        "family_history_hypertension": "0",
        "family_history_heart_disease": "0",
        "family_history_stroke": "0",
        "diabetes_reported": "0",
        "high_cholesterol_history": "0",
        "tobacco_ever": "0",
        "vigorous_activity_frequency": "5",
        "moderate_activity_frequency": "2",
    }
