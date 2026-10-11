from pathlib import Path
import joblib
import pandas as pd


BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH =BASE_DIR / "models" / "diabetes_model.joblib"

if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"Model not found: {MODEL_PATH}. Run train_diabetes.py first."

    )
model = joblib.load(MODEL_PATH)

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

# Generate prediction and model probability
predicted_label = int(model.predict(input_df)[0])
positive_label_probability = float(
    model.predict_proba(input_df)[0, 1]
)

print(" PREDICTION TEST")
print("Notice: This is a synthetic-data pipeline test.")
print("Predicted synthetic label:", predicted_label)
print(
    "Synthetic positive-label probability:",
    round(positive_label_probability, 4),

)