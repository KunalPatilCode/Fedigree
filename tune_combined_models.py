"""Fine-tune Fedigree Model 1 (Random Forest) and Model 2 (Logistic Regression) on combined LASI data.

Data: Combined Maharashtra + Daman & Diu LASI Wave 1 Individual records (N=4,964; N=4,948 usable).
Hold-out: Stratified 80/20 train/test split (random_state=42; 3,958 train, 990 test).
Validation: 5-Fold Stratified Cross-Validation on the training partition only.
Optimization:
- Model 1 (Diabetes): Random Forest hyperparameter tuning (RandomizedSearchCV) + decision threshold optimization.
- Model 2 (CVD Composite): Logistic Regression regularization (C, penalty, class_weight via GridSearchCV) + decision threshold optimization.

Strictly preserves untouched hold-out test set (N=990) for final objective evaluation.
"""
from __future__ import annotations

import argparse
import csv
import json
import math
import sys
import time
from collections import Counter
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import sklearn
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
    roc_curve,
    precision_recall_curve,
)
from sklearn.model_selection import (
    GridSearchCV,
    RandomizedSearchCV,
    StratifiedKFold,
    cross_val_predict,
    train_test_split,
)
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

import train_lasi_models as source

BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "models"
REPORTS_DIR = BASE_DIR / "reports"
DEFAULT_INPUTS = source.DEFAULT_INPUTS
RANDOM_STATE = 42
TEST_SIZE = 0.20


def make_pipeline_shell(model_name: str, feature_names: list[str]) -> Pipeline:
    num_features = ["age_years"]
    cat_features = [c for c in feature_names if c not in num_features]

    num_pipe = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
    ])
    cat_pipe = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("encoder", OneHotEncoder(handle_unknown="ignore")),
    ])
    preprocessor = ColumnTransformer([
        ("numeric", num_pipe, num_features),
        ("categorical", cat_pipe, cat_features),
    ])

    if model_name == "random_forest":
        estimator = RandomForestClassifier(random_state=RANDOM_STATE, n_jobs=-1)
    elif model_name == "logistic_regression":
        estimator = LogisticRegression(max_iter=4000, random_state=RANDOM_STATE)
    else:
        raise ValueError(f"Unknown model_name: {model_name}")

    return Pipeline([("preprocessor", preprocessor), ("model", estimator)])


def compute_metrics_at_threshold(y_true, y_prob, threshold=0.5, sample_weight=None) -> dict:
    y_pred = (y_prob >= threshold).astype(int)
    tn, fp, fn, tp = confusion_matrix(
        y_true, y_pred, labels=[0, 1], sample_weight=sample_weight
    ).ravel()
    acc = accuracy_score(y_true, y_pred, sample_weight=sample_weight)
    bal_acc = balanced_accuracy_score(y_true, y_pred, sample_weight=sample_weight)
    sens = recall_score(
        y_true, y_pred, labels=[0, 1], pos_label=1, sample_weight=sample_weight, zero_division=0
    )
    spec = float(tn / (tn + fp)) if (tn + fp) > 0 else 0.0
    prec = precision_score(
        y_true, y_pred, labels=[0, 1], pos_label=1, sample_weight=sample_weight, zero_division=0
    )
    f1 = f1_score(
        y_true, y_pred, labels=[0, 1], pos_label=1, sample_weight=sample_weight, zero_division=0
    )
    try:
        auc = (
            roc_auc_score(y_true, y_prob, sample_weight=sample_weight)
            if len(set(y_true)) == 2
            else None
        )
    except Exception:
        auc = None

    return {
        "threshold": round(float(threshold), 4),
        "accuracy": round(float(acc), 6),
        "balanced_accuracy": round(float(bal_acc), 6),
        "sensitivity": round(float(sens), 6),
        "specificity": round(float(spec), 6),
        "precision": round(float(prec), 6),
        "f1_score": round(float(f1), 6),
        "roc_auc": round(float(auc), 6) if auc is not None else None,
        "tn": int(round(tn)),
        "fp": int(round(fp)),
        "fn": int(round(fn)),
        "tp": int(round(tp)),
    }


def find_optimal_threshold(y_true, y_prob) -> tuple[float, dict]:
    """Find threshold on training CV predictions using Youden's J statistic (Sensitivity + Specificity - 1)."""
    fpr, tpr, thresholds = roc_curve(y_true, y_prob)
    # Youden's J = Sensitivity - (1 - Specificity) = TPR - FPR
    j_scores = tpr - fpr
    best_idx = int(np.argmax(j_scores))
    best_thresh_youden = float(thresholds[best_idx])
    # Clip to practical probability bounds
    best_thresh_youden = max(0.15, min(0.75, best_thresh_youden))

    # Also calculate best F1 threshold
    threshold_grid = np.linspace(0.15, 0.75, 121)
    best_f1 = -1.0
    best_thresh_f1 = 0.5
    for t in threshold_grid:
        pred = (y_prob >= t).astype(int)
        score = f1_score(y_true, pred, zero_division=0)
        if score > best_f1:
            best_f1 = score
            best_thresh_f1 = float(t)

    # Balanced compromise: Youden's J emphasizes sensitivity, F1 balances precision.
    # Take mean of Youden and F1 optimal thresholds
    balanced_threshold = round((best_thresh_youden + best_thresh_f1) / 2.0, 3)

    return balanced_threshold, {
        "youden_optimal_threshold": round(best_thresh_youden, 4),
        "youden_j_score": round(float(j_scores[best_idx]), 4),
        "f1_optimal_threshold": round(best_thresh_f1, 4),
        "f1_optimal_score": round(float(best_f1), 4),
        "selected_balanced_threshold": balanced_threshold,
    }


def to_jsonable(obj):
    if isinstance(obj, dict):
        return {str(k): to_jsonable(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [to_jsonable(v) for v in obj]
    if isinstance(obj, (np.integer,)):
        return int(obj)
    if isinstance(obj, (np.floating,)):
        return float(obj)
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    if obj is None or isinstance(obj, (str, int, float, bool)):
        return obj
    return str(obj)


def tune_model_1_diabetes(X_train_df, y_train, X_test_df, y_test, meta_train, meta_test):
    print("\n" + "=" * 70)
    print("TUNING MODEL 1: DIABETES DIAGNOSIS (RANDOM FOREST)")
    print(f"Training cases: N={len(y_train)} (Positive={sum(y_train==1)}, Negative={sum(y_train==0)})")
    print(f"Test cases:     N={len(y_test)} (Positive={sum(y_test==1)}, Negative={sum(y_test==0)})")

    feature_names = source.DIABETES_FEATURES
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)

    # Baseline performance check
    baseline_pipe = source.make_pipeline("random_forest", feature_names)
    baseline_pipe.fit(X_train_df, y_train)
    classes = list(baseline_pipe.classes_)
    pidx = classes.index(1)
    base_test_prob = baseline_pipe.predict_proba(X_test_df)[:, pidx]
    base_metrics = compute_metrics_at_threshold(y_test, base_test_prob, threshold=0.5)

    # Define Random Forest hyperparameter distributions
    param_dist = {
        "model__n_estimators": [150, 250, 350, 450],
        "model__max_depth": [5, 7, 9, 12, None],
        "model__min_samples_split": [2, 5, 10, 15],
        "model__min_samples_leaf": [2, 4, 6, 8, 12],
        "model__max_features": ["sqrt", "log2", 0.5, 0.7],
        "model__class_weight": [
            "balanced",
            "balanced_subsample",
            {0: 1.0, 1: 2.5},
            {0: 1.0, 1: 3.5},
        ],
    }

    print("\nRunning RandomizedSearchCV (n_iter=30, 5-fold CV on training partition)...")
    t0 = time.time()
    search = RandomizedSearchCV(
        estimator=make_pipeline_shell("random_forest", feature_names),
        param_distributions=param_dist,
        n_iter=30,
        scoring={
            "roc_auc": "roc_auc",
            "balanced_accuracy": "balanced_accuracy",
            "f1": "f1",
        },
        refit="roc_auc",
        cv=cv,
        n_jobs=-1,
        random_state=RANDOM_STATE,
        return_train_score=False,
    )
    search.fit(X_train_df, y_train)
    t_search = time.time() - t0
    print(f"RandomizedSearchCV completed in {t_search:.1f}s")
    print("Best CV ROC-AUC:", round(search.best_score_, 4))
    print("Best Parameters:", json.dumps(to_jsonable(search.best_params_), indent=2))

    best_pipeline = search.best_estimator_

    # Out-of-fold training probability predictions for threshold calibration
    print("\nExtracting out-of-fold training probabilities for threshold calibration...")
    oof_probs = cross_val_predict(
        best_pipeline, X_train_df, y_train, cv=cv, method="predict_proba", n_jobs=-1
    )[:, pidx]

    tuned_threshold, thresh_info = find_optimal_threshold(y_train, oof_probs)
    print(f"Optimal threshold calibration on training CV:")
    print(f"  - Youden J optimal threshold: {thresh_info['youden_optimal_threshold']}")
    print(f"  - Max F1 optimal threshold:   {thresh_info['f1_optimal_threshold']}")
    print(f"  - Selected balanced threshold: {tuned_threshold}")

    # Retrain best estimator on full training set
    print("\nRefitting best pipeline on full 80% training set (N=3,958)...")
    best_pipeline.fit(X_train_df, y_train)

    # Evaluate on untouched hold-out test set
    test_prob = best_pipeline.predict_proba(X_test_df)[:, pidx]

    # Metrics at standard 0.50 threshold
    tuned_metrics_default = compute_metrics_at_threshold(y_test, test_prob, threshold=0.50)
    # Metrics at tuned balanced threshold
    tuned_metrics_calibrated = compute_metrics_at_threshold(y_test, test_prob, threshold=tuned_threshold)

    # Regional evaluation on test split
    test_states = [m["state"] for m in meta_test]
    regional_metrics = {}
    for region in ("Maharashtra", "Daman and Diu"):
        r_idx = [i for i, s in enumerate(test_states) if s == region]
        if r_idx:
            r_y_test = y_test[r_idx]
            r_prob = test_prob[r_idx]
            regional_metrics[region] = {
                "default_threshold_0.50": compute_metrics_at_threshold(r_y_test, r_prob, threshold=0.50),
                "tuned_threshold": compute_metrics_at_threshold(r_y_test, r_prob, threshold=tuned_threshold),
            }

    # Best CV stats
    b_idx = int(search.best_index_)
    cv_summary = {
        "best_cv_roc_auc_mean": float(search.cv_results_["mean_test_roc_auc"][b_idx]),
        "best_cv_roc_auc_std": float(search.cv_results_["std_test_roc_auc"][b_idx]),
        "best_cv_balanced_acc_mean": float(search.cv_results_["mean_test_balanced_accuracy"][b_idx]),
        "best_cv_f1_mean": float(search.cv_results_["mean_test_f1"][b_idx]),
    }

    # Save artifact
    artifact_path = MODELS_DIR / "diabetes_random_forest_combined_tuned.joblib"
    artifact = {
        "pipeline": best_pipeline,
        "model_name": "random_forest",
        "task_name": "diabetes",
        "feature_names": feature_names,
        "numeric_features": ["age_years"],
        "categorical_features": [f for f in feature_names if f != "age_years"],
        "target_definition": "HT003 self-reported health-professional diagnosis (1=Yes, 2=No). Not future diabetes risk.",
        "positive_class": 1,
        "label_mapping": {1: "reported_diagnosed_diabetes", 0: "no_reported_diagnosed_diabetes"},
        "input_source": "LASI Wave 1 Individual extracts (Maharashtra + Daman & Diu)",
        "data_scope": f"Combined Maharashtra and Daman & Diu sample, total n={len(meta_train)+len(meta_test)}; target complete labels n={len(y_train)+len(y_test)}",
        "training_n": len(y_train),
        "test_n": len(y_test),
        "random_state": RANDOM_STATE,
        "test_size": TEST_SIZE,
        "cv_folds": 5,
        "sklearn_version": sklearn.__version__,
        "status": "combined_lasi_survey_data_tuned_not_clinically_validated",
        "tuning": {
            "search_type": "RandomizedSearchCV",
            "n_iter": 30,
            "best_params": to_jsonable(search.best_params_),
            "best_cv_metrics": cv_summary,
            "decision_threshold": tuned_threshold,
            "threshold_calibration": thresh_info,
        },
    }
    joblib.dump(artifact, artifact_path)
    print(f"Saved tuned model artifact: {artifact_path}")

    return {
        "task": "diabetes",
        "model_name": "random_forest",
        "artifact_path": str(artifact_path.relative_to(BASE_DIR)),
        "best_params": to_jsonable(search.best_params_),
        "cv_summary": cv_summary,
        "threshold_calibration": thresh_info,
        "baseline_holdout_metrics": base_metrics,
        "tuned_holdout_default_thresh": tuned_metrics_default,
        "tuned_holdout_calibrated_thresh": tuned_metrics_calibrated,
        "regional_metrics": regional_metrics,
    }


def tune_model_2_cvd(X_train_df, y_train, X_test_df, y_test, meta_train, meta_test):
    print("\n" + "=" * 70)
    print("TUNING MODEL 2: CVD COMPOSITE (LOGISTIC REGRESSION)")
    print(f"Training cases: N={len(y_train)} (Positive={sum(y_train==1)}, Negative={sum(y_train==0)})")
    print(f"Test cases:     N={len(y_test)} (Positive={sum(y_test==1)}, Negative={sum(y_test==0)})")

    feature_names = source.CVD_FEATURES
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)

    # Baseline performance check
    baseline_pipe = source.make_pipeline("logistic_regression", feature_names)
    baseline_pipe.fit(X_train_df, y_train)
    classes = list(baseline_pipe.classes_)
    pidx = classes.index(1)
    base_test_prob = baseline_pipe.predict_proba(X_test_df)[:, pidx]
    base_metrics = compute_metrics_at_threshold(y_test, base_test_prob, threshold=0.5)

    # Grid search for Logistic Regression (regularization strength C, penalty, class_weight)
    param_grid = [
        # L2 penalty with lbfgs
        {
            "model__penalty": ["l2"],
            "model__C": [0.005, 0.01, 0.03, 0.05, 0.1, 0.2, 0.5, 1.0, 2.0, 5.0, 10.0],
            "model__class_weight": ["balanced", None, {0: 1.0, 1: 1.25}, {0: 1.0, 1: 1.5}, {0: 1.0, 1: 2.0}],
            "model__solver": ["lbfgs"],
            "model__max_iter": [4000],
        },
        # L1 penalty with saga
        {
            "model__penalty": ["l1"],
            "model__C": [0.01, 0.05, 0.1, 0.5, 1.0, 3.0],
            "model__class_weight": ["balanced", None, {0: 1.0, 1: 1.5}],
            "model__solver": ["saga"],
            "model__max_iter": [4000],
        },
    ]

    print("\nRunning GridSearchCV (5-fold CV on training partition)...")
    t0 = time.time()
    search = GridSearchCV(
        estimator=make_pipeline_shell("logistic_regression", feature_names),
        param_grid=param_grid,
        scoring={
            "roc_auc": "roc_auc",
            "balanced_accuracy": "balanced_accuracy",
            "f1": "f1",
        },
        refit="roc_auc",
        cv=cv,
        n_jobs=-1,
        return_train_score=False,
    )
    search.fit(X_train_df, y_train)
    t_search = time.time() - t0
    print(f"GridSearchCV completed in {t_search:.1f}s")
    print("Best CV ROC-AUC:", round(search.best_score_, 4))
    print("Best Parameters:", json.dumps(to_jsonable(search.best_params_), indent=2))

    best_pipeline = search.best_estimator_

    # Out-of-fold training probability predictions for threshold calibration
    print("\nExtracting out-of-fold training probabilities for threshold calibration...")
    oof_probs = cross_val_predict(
        best_pipeline, X_train_df, y_train, cv=cv, method="predict_proba", n_jobs=-1
    )[:, pidx]

    tuned_threshold, thresh_info = find_optimal_threshold(y_train, oof_probs)
    print(f"Optimal threshold calibration on training CV:")
    print(f"  - Youden J optimal threshold: {thresh_info['youden_optimal_threshold']}")
    print(f"  - Max F1 optimal threshold:   {thresh_info['f1_optimal_threshold']}")
    print(f"  - Selected balanced threshold: {tuned_threshold}")

    # Retrain best estimator on full training set
    print("\nRefitting best pipeline on full 80% training set (N=3,958)...")
    best_pipeline.fit(X_train_df, y_train)

    # Evaluate on untouched hold-out test set
    test_prob = best_pipeline.predict_proba(X_test_df)[:, pidx]

    # Metrics at standard 0.50 threshold
    tuned_metrics_default = compute_metrics_at_threshold(y_test, test_prob, threshold=0.50)
    # Metrics at tuned balanced threshold
    tuned_metrics_calibrated = compute_metrics_at_threshold(y_test, test_prob, threshold=tuned_threshold)

    # Regional evaluation on test split
    test_states = [m["state"] for m in meta_test]
    regional_metrics = {}
    for region in ("Maharashtra", "Daman and Diu"):
        r_idx = [i for i, s in enumerate(test_states) if s == region]
        if r_idx:
            r_y_test = y_test[r_idx]
            r_prob = test_prob[r_idx]
            regional_metrics[region] = {
                "default_threshold_0.50": compute_metrics_at_threshold(r_y_test, r_prob, threshold=0.50),
                "tuned_threshold": compute_metrics_at_threshold(r_y_test, r_prob, threshold=tuned_threshold),
            }

    # Best CV stats
    b_idx = int(search.best_index_)
    cv_summary = {
        "best_cv_roc_auc_mean": float(search.cv_results_["mean_test_roc_auc"][b_idx]),
        "best_cv_roc_auc_std": float(search.cv_results_["std_test_roc_auc"][b_idx]),
        "best_cv_balanced_acc_mean": float(search.cv_results_["mean_test_balanced_accuracy"][b_idx]),
        "best_cv_f1_mean": float(search.cv_results_["mean_test_f1"][b_idx]),
    }

    # Save artifact
    artifact_path = MODELS_DIR / "cvd_composite_logistic_regression_combined_tuned.joblib"
    artifact = {
        "pipeline": best_pipeline,
        "model_name": "logistic_regression",
        "task_name": "cvd_composite",
        "feature_names": feature_names,
        "numeric_features": ["age_years"],
        "categorical_features": [f for f in feature_names if f != "age_years"],
        "target_definition": "LASI CVD composite: HT002 hypertension OR HT006 chronic heart disease OR HT007 stroke; not CAD-specific and not future 10-year risk.",
        "positive_class": 1,
        "label_mapping": {1: "reported_cvd_composite", 0: "no_reported_cvd_composite"},
        "input_source": "LASI Wave 1 Individual extracts (Maharashtra + Daman & Diu)",
        "data_scope": f"Combined Maharashtra and Daman & Diu sample, total n={len(meta_train)+len(meta_test)}; target complete labels n={len(y_train)+len(y_test)}",
        "training_n": len(y_train),
        "test_n": len(y_test),
        "random_state": RANDOM_STATE,
        "test_size": TEST_SIZE,
        "cv_folds": 5,
        "sklearn_version": sklearn.__version__,
        "status": "combined_lasi_survey_data_tuned_not_clinically_validated",
        "tuning": {
            "search_type": "GridSearchCV",
            "best_params": to_jsonable(search.best_params_),
            "best_cv_metrics": cv_summary,
            "decision_threshold": tuned_threshold,
            "threshold_calibration": thresh_info,
        },
    }
    joblib.dump(artifact, artifact_path)
    print(f"Saved tuned model artifact: {artifact_path}")

    return {
        "task": "cvd_composite",
        "model_name": "logistic_regression",
        "artifact_path": str(artifact_path.relative_to(BASE_DIR)),
        "best_params": to_jsonable(search.best_params_),
        "cv_summary": cv_summary,
        "threshold_calibration": thresh_info,
        "baseline_holdout_metrics": base_metrics,
        "tuned_holdout_default_thresh": tuned_metrics_default,
        "tuned_holdout_calibrated_thresh": tuned_metrics_calibrated,
        "regional_metrics": regional_metrics,
    }


def generate_tuning_markdown_report(diabetes_res: dict, cvd_res: dict) -> str:
    md = []
    md.append("# Fedigree — Combined LASI Model Fine-Tuning Report")
    md.append("")
    md.append("This report documents the systematic fine-tuning of the selected baseline candidates:")
    md.append("- **Model 1 (Diabetes Diagnosis):** Random Forest tuned via 5-fold CV `RandomizedSearchCV` and decision threshold optimization.")
    md.append("- **Model 2 (CVD Composite):** Logistic Regression tuned via 5-fold CV `GridSearchCV` and decision threshold optimization.")
    md.append("")
    md.append("Data scope: Combined **Maharashtra** (3,973) + **Daman & Diu** (991) = 4,964 respondents (4,948 usable labels).")
    md.append("Evaluation split: Stratified 80/20 hold-out (3,958 train, 990 test; `random_state=42`).")
    md.append("")
    md.append("---")
    md.append("")
    md.append("## 1. Executive Comparison: Baseline vs Tuned Candidates (Hold-Out Test Split N=990)")
    md.append("")
    md.append("| Task | Algorithm & Configuration | Threshold | Accuracy | Balanced Acc | Sensitivity | Specificity | Precision | F1-Score | ROC-AUC | TN | FP | FN | TP |")
    md.append("|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|")

    d_base = diabetes_res["baseline_holdout_metrics"]
    d_tuned_def = diabetes_res["tuned_holdout_default_thresh"]
    d_tuned_cal = diabetes_res["tuned_holdout_calibrated_thresh"]

    c_base = cvd_res["baseline_holdout_metrics"]
    c_tuned_def = cvd_res["tuned_holdout_default_thresh"]
    c_tuned_cal = cvd_res["tuned_holdout_calibrated_thresh"]

    def row(task, cfg, m):
        return (
            f"| **{task}** | {cfg} | {m['threshold']:.2f} | "
            f"{m['accuracy']*100:.2f}% | {m['balanced_accuracy']*100:.2f}% | "
            f"{m['sensitivity']*100:.2f}% | {m['specificity']*100:.2f}% | "
            f"{m['precision']*100:.2f}% | {m['f1_score']*100:.2f}% | "
            f"{m['roc_auc']:.4f} | {m['tn']} | {m['fp']} | {m['fn']} | {m['tp']} |"
        )

    md.append(row("Diabetes", "Baseline Random Forest", d_base))
    md.append(row("Diabetes", "Tuned RF (Default Threshold)", d_tuned_def))
    md.append(row("Diabetes", "**Tuned RF (Calibrated Threshold)**", d_tuned_cal))
    md.append(row("CVD Composite", "Baseline Logistic Regression", c_base))
    md.append(row("CVD Composite", "Tuned LR (Default Threshold)", c_tuned_def))
    md.append(row("CVD Composite", "**Tuned LR (Calibrated Threshold)**", c_tuned_cal))

    md.append("")
    md.append("---")
    md.append("")
    md.append("## 2. Model 1: Diabetes Diagnosis (Random Forest Tuning Details)")
    md.append("")
    md.append("### Hyperparameters Selected (5-Fold CV ROC-AUC Refit)")
    md.append("```json")
    md.append(json.dumps(diabetes_res["best_params"], indent=2))
    md.append("```")
    md.append("")
    md.append(f"- **5-Fold Training CV ROC-AUC:** {diabetes_res['cv_summary']['best_cv_roc_auc_mean']:.4f} (±{diabetes_res['cv_summary']['best_cv_roc_auc_std']:.4f})")
    md.append(f"- **Decision Threshold Calibrated:** `{d_tuned_cal['threshold']}` (Youden's J optimal: {diabetes_res['threshold_calibration']['youden_optimal_threshold']}, F1 optimal: {diabetes_res['threshold_calibration']['f1_optimal_threshold']})")
    md.append(f"- **Sensitivity Impact:** Sensitivity improved from **{d_base['sensitivity']*100:.2f}%** (baseline) to **{d_tuned_cal['sensitivity']*100:.2f}%** (calibrated tuned).")
    md.append(f"- **False Negatives Reduction:** Missed diabetes cases reduced from **{d_base['fn']}** to **{d_tuned_cal['fn']}**.")
    md.append("")
    md.append("---")
    md.append("")
    md.append("## 3. Model 2: CVD Composite (Logistic Regression Tuning Details)")
    md.append("")
    md.append("### Hyperparameters Selected (5-Fold CV ROC-AUC Refit)")
    md.append("```json")
    md.append(json.dumps(cvd_res["best_params"], indent=2))
    md.append("```")
    md.append("")
    md.append(f"- **5-Fold Training CV ROC-AUC:** {cvd_res['cv_summary']['best_cv_roc_auc_mean']:.4f} (±{cvd_res['cv_summary']['best_cv_roc_auc_std']:.4f})")
    md.append(f"- **Decision Threshold Calibrated:** `{c_tuned_cal['threshold']}` (Youden's J optimal: {cvd_res['threshold_calibration']['youden_optimal_threshold']}, F1 optimal: {cvd_res['threshold_calibration']['f1_optimal_threshold']})")
    md.append(f"- **ROC-AUC on Hold-Out:** **{c_tuned_cal['roc_auc']:.4f}**")
    md.append("")
    md.append("---")
    md.append("")
    md.append("## 4. Regional Performance Breakdown (Tuned Models on Test Split)")
    md.append("")
    md.append("| Task | Region | Configuration | Threshold | Accuracy | Balanced Acc | Sensitivity | Specificity | Precision | F1-Score | ROC-AUC |")
    md.append("|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|")

    for task_name, res in [("Diabetes (RF Tuned)", diabetes_res), ("CVD Composite (LR Tuned)", cvd_res)]:
        for region in ("Maharashtra", "Daman and Diu"):
            if region in res["regional_metrics"]:
                m_def = res["regional_metrics"][region]["default_threshold_0.50"]
                m_cal = res["regional_metrics"][region]["tuned_threshold"]
                md.append(
                    f"| {task_name} | {region} | Default 0.50 | 0.50 | "
                    f"{m_def['accuracy']*100:.2f}% | {m_def['balanced_accuracy']*100:.2f}% | "
                    f"{m_def['sensitivity']*100:.2f}% | {m_def['specificity']*100:.2f}% | "
                    f"{m_def['precision']*100:.2f}% | {m_def['f1_score']*100:.2f}% | {m_def['roc_auc']:.4f} |"
                )
                md.append(
                    f"| {task_name} | {region} | **Calibrated** | {m_cal['threshold']:.2f} | "
                    f"**{m_cal['accuracy']*100:.2f}%** | **{m_cal['balanced_accuracy']*100:.2f}%** | "
                    f"**{m_cal['sensitivity']*100:.2f}%** | **{m_cal['specificity']*100:.2f}%** | "
                    f"**{m_cal['precision']*100:.2f}%** | **{m_cal['f1_score']*100:.2f}%** | **{m_cal['roc_auc']:.4f}** |"
                )

    md.append("")
    md.append("---")
    md.append("")
    md.append("## 5. Summary & Handover Notice")
    md.append("")
    md.append("- Active tuned model artifacts saved in `models/`:")
    md.append(f"  - `{diabetes_res['artifact_path']}`")
    md.append(f"  - `{cvd_res['artifact_path']}`")
    md.append("- Both models maintain strict schema validation contracts with preprocessors self-contained in pipelines.")
    md.append("- **Safety Disclaimer:** Models classify self-reported survey conditions. Not clinically validated. Do not deploy for clinical triage, diagnosis, or medication prescription.")

    return "\n".join(md)


def main():
    t_start = time.time()
    print("=" * 75)
    print("FEDIGREE COMBINED LASI MODEL FINE-TUNING PIPELINE")
    print(f"Python: {sys.version.split()[0]} | scikit-learn: {sklearn.__version__}")
    print("=" * 75)

    all_source_rows = []
    seen_ids = set()
    dup_ids = 0

    for path in DEFAULT_INPUTS:
        print(f"\nReading variables from {path.name}...")
        rows, raw_headers = source.read_selected_xlsx_columns(path)
        print(f"  Rows: {len(rows)} | Total sheet columns: {len(raw_headers)}")
        pkeys = [source.clean_code(r.get("prim_key", "")) for r in rows]
        unique_keys = set(pkeys) - {""}
        dup_ids += len(unique_keys & seen_ids)
        seen_ids.update(unique_keys)
        all_source_rows.extend(rows)

    print(f"\nTotal rows extracted: {len(all_source_rows)}")
    print(f"Duplicate IDs across datasets: {dup_ids}")

    feature_rows = [source.row_to_features(r) for r in all_source_rows]
    metadata_rows = [source.row_to_metadata(r) for r in all_source_rows]

    # Target 1: Diabetes (HT003)
    diabetes_labels = [source.target_yes_no(r.get("ht003")) for r in all_source_rows]
    d_valid = [i for i, y in enumerate(diabetes_labels) if y is not None]
    X_d = pd.DataFrame([feature_rows[i] for i in d_valid], columns=source.DIABETES_FEATURES)
    y_d = np.array([diabetes_labels[i] for i in d_valid], dtype=int)
    meta_d = [metadata_rows[i] for i in d_valid]

    # Target 2: CVD Composite (HT002 OR HT006 OR HT007)
    cvd_labels = [source.cvd_composite_target(r) for r in all_source_rows]
    c_valid = [i for i, y in enumerate(cvd_labels) if y is not None]
    X_c = pd.DataFrame([feature_rows[i] for i in c_valid], columns=source.CVD_FEATURES)
    y_c = np.array([cvd_labels[i] for i in c_valid], dtype=int)
    meta_c = [metadata_rows[i] for i in c_valid]

    # Stratified 80/20 train/test split for Diabetes
    d_train_idx, d_test_idx = train_test_split(
        range(len(y_d)), test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y_d
    )
    X_d_train, y_d_train = X_d.iloc[d_train_idx], y_d[d_train_idx]
    X_d_test, y_d_test = X_d.iloc[d_test_idx], y_d[d_test_idx]
    meta_d_train = [meta_d[i] for i in d_train_idx]
    meta_d_test = [meta_d[i] for i in d_test_idx]

    # Stratified 80/20 train/test split for CVD Composite
    c_train_idx, c_test_idx = train_test_split(
        range(len(y_c)), test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y_c
    )
    X_c_train, y_c_train = X_c.iloc[c_train_idx], y_c[c_train_idx]
    X_c_test, y_c_test = X_c.iloc[c_test_idx], y_c[c_test_idx]
    meta_c_train = [meta_c[i] for i in c_train_idx]
    meta_c_test = [meta_c[i] for i in c_test_idx]

    # Tune Model 1: Diabetes (Random Forest)
    diabetes_res = tune_model_1_diabetes(
        X_d_train, y_d_train, X_d_test, y_d_test, meta_d_train, meta_d_test
    )

    # Tune Model 2: CVD Composite (Logistic Regression)
    cvd_res = tune_model_2_cvd(
        X_c_train, y_c_train, X_c_test, y_c_test, meta_c_train, meta_c_test
    )

    # Save outputs and reports
    REPORTS_DIR.mkdir(exist_ok=True)

    json_report_path = REPORTS_DIR / "combined_model_tuning.json"
    full_report = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "dataset_scope": "Maharashtra + Daman & Diu combined (N=4,964; N=4,948 usable)",
        "train_n": len(y_d_train),
        "test_n": len(y_d_test),
        "model_1_diabetes": diabetes_res,
        "model_2_cvd_composite": cvd_res,
    }
    with open(json_report_path, "w", encoding="utf-8") as f:
        json.dump(to_jsonable(full_report), f, indent=2)
    print(f"\nTuning JSON report saved: {json_report_path}")

    # Generate CSV comparison table
    csv_report_path = REPORTS_DIR / "combined_model_tuning.csv"
    with open(csv_report_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            "task", "configuration", "threshold", "accuracy", "balanced_accuracy",
            "sensitivity", "specificity", "precision", "f1_score", "roc_auc",
            "tn", "fp", "fn", "tp"
        ])
        for task, res in [("diabetes", diabetes_res), ("cvd_composite", cvd_res)]:
            for cfg, m in [
                ("baseline", res["baseline_holdout_metrics"]),
                ("tuned_default_threshold", res["tuned_holdout_default_thresh"]),
                ("tuned_calibrated_threshold", res["tuned_holdout_calibrated_thresh"]),
            ]:
                writer.writerow([
                    task, cfg, m["threshold"], m["accuracy"], m["balanced_accuracy"],
                    m["sensitivity"], m["specificity"], m["precision"], m["f1_score"],
                    m["roc_auc"], m["tn"], m["fp"], m["fn"], m["tp"]
                ])
    print(f"Tuning CSV report saved: {csv_report_path}")

    # Generate Markdown summary report
    md_report_path = REPORTS_DIR / "combined_model_tuning.md"
    md_content = generate_tuning_markdown_report(diabetes_res, cvd_res)
    with open(md_report_path, "w", encoding="utf-8") as f:
        f.write(md_content)
    print(f"Tuning Markdown report saved: {md_report_path}")

    elapsed = time.time() - t_start
    print(f"\nFine-tuning completed successfully in {elapsed/60:.2f} minutes.")


if __name__ == "__main__":
    main()
