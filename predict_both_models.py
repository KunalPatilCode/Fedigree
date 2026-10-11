
from pathlib import Path

import joblib
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "models"

MODEL_FILES = {
    "Logistic Regression": MODEL_DIR / "diabetes_logistic_synthetic.joblib",
    "Random Forest": MODEL_DIR / "diabetes_random_forest_synthetic.joblib",
}

sample_input = {
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

input_df = pd.DataFrame([sample_input])

print("=== FEDIGREE: TWO-MODEL PREDICTION TEST ===")
print("WARNING: Synthetic-data experiment, NOT clinical advice.\n")

for model_name, model_path in MODEL_FILES.items():
    if not model_path.exists():
        raise FileNotFoundError(f"Model file not found: {model_path}")

    model = joblib.load(model_path)

    expected_features = list(model.feature_names_in_)
    missing = set(expected_features) - set(input_df.columns)

    if missing:
        raise ValueError(f"Missing input features: {sorted(missing)}")

    model_input = input_df[expected_features]

    predicted_label = int(model.predict(model_input)[0])
    classes = list(model.classes_)
    positive_index = classes.index(1)

    positive_probability = float(
        model.predict_proba(model_input)[0][positive_index]
    )

    print(f"Model: {model_name}")
    print(f"Predicted synthetic label: {predicted_label}")
    print(
        "Synthetic positive-label probability:",
        f"{positive_probability:.4f}",
    )
    print("-" * 45)
