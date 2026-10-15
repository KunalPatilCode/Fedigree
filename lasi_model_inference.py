
"""Inference helper for locally trained LASI Daman & Diu experimental models."""

from pathlib import Path

import joblib
import numpy as np
import pandas as pd


BASE_DIR = Path(__file__).resolve().parent

MODEL_PATHS = {
    "diabetes_logistic_regression": (
        BASE_DIR / "models" /
        "diabetes_logistic_regression_lasi_dd.joblib"
    ),
    "diabetes_random_forest": (
        BASE_DIR / "models" /
        "diabetes_random_forest_tuned_lasi_dd.joblib"
    ),
    "cvd_composite_logistic_regression": (
        BASE_DIR / "models" /
        "cvd_composite_logistic_regression_lasi_dd.joblib"
    ),
    "cvd_composite_random_forest": (
        BASE_DIR / "models" /
        "cvd_composite_random_forest_lasi_dd.joblib"
    ),
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

    for _, transformer, columns in getattr(
        preprocessor, "transformers_", []
    ):
        if isinstance(transformer, str) and transformer == "drop":
            continue

        if isinstance(columns, str):
            has_named_columns = True
        elif isinstance(
            columns, (list, tuple, np.ndarray, pd.Index)
        ):
            selected = list(columns)

            if selected and all(isinstance(c, str) for c in selected):
                has_named_columns = True

            if selected and all(
                isinstance(c, (int, np.integer)) for c in selected
            ):
                has_positional_columns = True

    if has_named_columns:
        return True

    if has_positional_columns:
        return False

    return hasattr(pipeline, "feature_names_in_")


def predict(model_key: str, input_features: dict) -> dict:
    """Predict a LASI diagnosis classification for one input profile."""

    if model_key not in MODEL_PATHS:
        raise ValueError(
            f"Unknown model_key. Choose one of: {', '.join(MODEL_PATHS)}"
        )

    if not isinstance(input_features, dict):
        raise TypeError("input_features must be a dictionary.")

    path = MODEL_PATHS[model_key]

    if not path.exists():
        raise FileNotFoundError(
            f"Model file not found: {path}"
        )

    artifact = joblib.load(path)
    pipeline = artifact["pipeline"]
    expected = list(artifact["feature_names"])

    missing = sorted(set(expected) - set(input_features))
    extra = sorted(set(input_features) - set(expected))

    if missing:
        raise ValueError(f"Missing required input fields: {missing}")

    if extra:
        raise ValueError(f"Unexpected input fields: {extra}")

    # Preserve the exact feature order used when training.
    row = [input_features[name] for name in expected]

    if pipeline_expects_dataframe(pipeline):
        model_input = pd.DataFrame([row], columns=expected)
    else:
        model_input = np.asarray([row], dtype=object)

    pred = int(pipeline.predict(model_input)[0])

    classes = list(pipeline.classes_)
    if 1 not in classes:
        raise ValueError("The saved model does not contain positive class 1.")

    positive_index = classes.index(1)
    probability = float(
        pipeline.predict_proba(model_input)[0][positive_index]
    )

    if artifact["task_name"] == "diabetes":
        class_name = (
            "reported_diagnosed_diabetes"
            if pred == 1
            else "no_reported_diagnosed_diabetes"
        )
        task_notice = (
            "Predicts LASI self-reported diabetes diagnosis classification, "
            "not future diabetes risk or a clinical diagnosis."
        )
    else:
        class_name = (
            "reported_cvd_composite"
            if pred == 1
            else "no_reported_cvd_composite"
        )
        task_notice = (
            "CVD composite means reported hypertension OR chronic heart "
            "disease OR stroke. It is not CAD-specific or a future "
            "10-year cardiovascular-risk prediction."
        )

    return {
        "model_name": artifact["model_name"],
        "task_name": artifact["task_name"],
        "predicted_class": pred,
        "predicted_class_meaning": class_name,
        "model_positive_class_probability": round(probability, 6),
        "model_status": artifact["status"],
        "notice": (
            task_notice
            + " Exploratory, unweighted Daman & Diu survey-sample model; "
            "not clinically validated. Do not use for medical decisions."
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
