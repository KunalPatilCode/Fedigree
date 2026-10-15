
from pathlib import Path
import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "data" / "fedigree_diabetes_synthetic_500.csv"
MODEL_DIR = BASE_DIR / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)
REPORT_DIR = BASE_DIR / "reports"
REPORT_DIR.mkdir(exist_ok=True)

TARGET = "diabetes_status_synthetic"

NUMERIC = [
    "age_years",
    "bmi_kg_m2",
    "waist_circumference_cm",
    "family_history_diabetes",
    "hypertension_history",
    "tobacco_use",
]

CATEGORICAL = [
    "sex",
    "physical_activity_level",
    "diet_pattern",
]


def make_preprocessor():
    numeric_pipe = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
    ])

    categorical_pipe = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("encoder", OneHotEncoder(handle_unknown="ignore")),
    ])

    return ColumnTransformer([
        ("numeric", numeric_pipe, NUMERIC),
        ("categorical", categorical_pipe, CATEGORICAL),
    ])


def safe_divide(numerator, denominator):
    return numerator / denominator if denominator else 0.0


df = pd.read_csv(DATA_PATH)

required_columns = NUMERIC + CATEGORICAL + [TARGET]
missing_columns = set(required_columns) - set(df.columns)

if missing_columns:
    raise ValueError(f"Missing CSV columns: {sorted(missing_columns)}")

if df[TARGET].isna().any():
    raise ValueError("Target column contains missing labels.")

X = df[NUMERIC + CATEGORICAL]
y = df[TARGET].astype(int)

if set(y.unique()) != {0, 1}:
    raise ValueError("Expected binary target labels 0 and 1.")

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y,
)

models = {
    "Logistic Regression": LogisticRegression(max_iter=2000),
    "Random Forest": RandomForestClassifier(
        n_estimators=300,
        random_state=42,
    ),
}

results = []

for name, estimator in models.items():
    pipeline = Pipeline([
        ("preprocessor", make_preprocessor()),
        ("model", estimator),
    ])

    pipeline.fit(X_train, y_train)

    if name == "Logistic Regression":
        artifact_name = "diabetes_logistic_synthetic.joblib"
    else:
        artifact_name = "diabetes_random_forest_synthetic.joblib"

    artifact_path = MODEL_DIR / artifact_name
    joblib.dump(pipeline, artifact_path)

    print(f"Saved experimental model: {artifact_path}")

    predictions = pipeline.predict(X_test)
    probabilities = pipeline.predict_proba(X_test)[:, 1]

    tn, fp, fn, tp = confusion_matrix(
        y_test, predictions, labels=[0, 1]
    ).ravel()

    results.append({
        "model": name,
        "accuracy": accuracy_score(y_test, predictions),
        "sensitivity": recall_score(
            y_test, predictions, zero_division=0
        ),
        "specificity": safe_divide(tn, tn + fp),
        "precision": precision_score(
            y_test, predictions, zero_division=0
        ),
        "f1_score": f1_score(
            y_test, predictions, zero_division=0
        ),
        "roc_auc": roc_auc_score(y_test, probabilities),
        "tn": int(tn),
        "fp": int(fp),
        "fn": int(fn),
        "tp": int(tp),
    })

report = pd.DataFrame(results)
output_path = REPORT_DIR / "synthetic_model_comparison.csv"
report.to_csv(output_path, index=False)

print("=== SYNTHETIC MODEL COMPARISON ===")
print("Warning: These are NOT clinical results.")
print(report.to_string(index=False))
print(f"\nReport saved to: {output_path}")
