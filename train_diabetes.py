"""Train a baseline pipeline for Fedigree Model 1.

IMPORTANT: This script uses a fully synthetic demonstration dataset and synthetic
labels. Its metrics test the ML workflow only; they are NOT medical performance
metrics and must not be used for patient decisions.
"""
from __future__ import annotations

import json
from pathlib import Path

import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
    classification_report,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

ROOT = Path(__file__).resolve().parent
DATA_PATH = ROOT / "data" / "fedigree_diabetes_synthetic_500.csv"
MODEL_DIR = ROOT / "models"
REPORT_DIR = ROOT / "reports"
MODEL_PATH = MODEL_DIR / "diabetes_model.joblib"
METRICS_PATH = REPORT_DIR / "synthetic_evaluation.json"

TARGET = "diabetes_status_synthetic"
# These are available non-ID/non-location features in this prototype CSV.
# The synthetic target was generated from an artificial rule using these inputs.
NUMERIC_FEATURES = [
    "age_years",
    "bmi_kg_m2",
    "waist_circumference_cm",
    "family_history_diabetes",
    "hypertension_history",
    "tobacco_use",
]
CATEGORICAL_FEATURES = [
    "sex",
    "physical_activity_level",
    "diet_pattern",
]
FEATURES = NUMERIC_FEATURES + CATEGORICAL_FEATURES


def main() -> None:
    if not DATA_PATH.exists():
        raise FileNotFoundError(
            f"CSV not found: {DATA_PATH}\n"
            "Put the CSV in the data folder or update DATA_PATH in this script."
        )

    df = pd.read_csv(DATA_PATH)
    required = set(FEATURES + [TARGET])
    missing_columns = sorted(required - set(df.columns))
    if missing_columns:
        raise ValueError(f"Required CSV columns are missing: {missing_columns}")
    if df.empty:
        raise ValueError("Dataset is empty.")

    # Target is used only as y. Remove rows with unknown target because labels
    # cannot be imputed. Feature missing values are handled inside the pipeline.
    df = df.loc[df[TARGET].notna()].copy()
    observed_targets = set(pd.to_numeric(df[TARGET], errors="raise").unique())
    if not observed_targets.issubset({0, 1}):
        raise ValueError(f"Expected binary target labels 0/1; got {observed_targets}")

    X = df[FEATURES].copy()
    y = df[TARGET].astype(int)
    class_counts = y.value_counts().to_dict()
    if len(class_counts) != 2 or min(class_counts.values()) < 2:
        raise ValueError("Need at least two examples from each target class to split the data.")

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y,
    )

    numeric_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ]
    )
    categorical_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("onehot", OneHotEncoder(handle_unknown="ignore")),
        ]
    )
    preprocess = ColumnTransformer(
        transformers=[
            ("numeric", numeric_pipeline, NUMERIC_FEATURES),
            ("categorical", categorical_pipeline, CATEGORICAL_FEATURES),
        ]
    )
    model = Pipeline(
        steps=[
            ("preprocess", preprocess),
            ("classifier", LogisticRegression(max_iter=2000, random_state=42)),
        ]
    )

    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    # Binary confusion matrix with labels fixed to [0, 1].
    tn, fp, fn, tp = confusion_matrix(y_test, y_pred, labels=[0, 1]).ravel()
    specificity = float(tn / (tn + fp)) if (tn + fp) else None
    sensitivity = float(tp / (tp + fn)) if (tp + fn) else None
    roc_auc = float(roc_auc_score(y_test, y_prob)) if y_test.nunique() == 2 else None

    metrics = {
        "dataset_notice": "SYNTHETIC DATA ONLY; not clinical validation or real Daman/Diu data",
        "rows_used": int(len(df)),
        "train_rows": int(len(X_train)),
        "test_rows": int(len(X_test)),
        "target_counts_full_dataset": {str(k): int(v) for k, v in class_counts.items()},
        "features": FEATURES,
        "target": TARGET,
        "model": "LogisticRegression in a preprocessing Pipeline",
        "test_metrics_synthetic_only": {
            "accuracy": float(accuracy_score(y_test, y_pred)),
            "sensitivity_recall_positive": sensitivity,
            "specificity_recall_negative": specificity,
            "precision": float(precision_score(y_test, y_pred, zero_division=0)),
            "f1_score": float(f1_score(y_test, y_pred, zero_division=0)),
            "roc_auc": roc_auc,
            "confusion_matrix_tn_fp_fn_tp": {
                "tn": int(tn), "fp": int(fp), "fn": int(fn), "tp": int(tp)
            },
        },
        "classification_report_synthetic_only": classification_report(
            y_test, y_pred, output_dict=True, zero_division=0
        ),
    }

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    METRICS_PATH.write_text(json.dumps(metrics, indent=2), encoding="utf-8")

    print("\n=== FEDIGREE MODEL 1: PIPELINE TEST ===")
    print("WARNING: Synthetic labels only. These are NOT clinical performance results.\n")
    print(f"Rows: {len(df)} | Train: {len(X_train)} | Test: {len(X_test)}")
    print(f"Features: {', '.join(FEATURES)}")
    for key, value in metrics["test_metrics_synthetic_only"].items():
        print(f"{key}: {value}")
    print(f"\nSaved model pipeline: {MODEL_PATH}")
    print(f"Saved metrics report: {METRICS_PATH}")


if __name__ == "__main__":
    main()
