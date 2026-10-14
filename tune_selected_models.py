"""Tune the selected Fedigree LASI models with CV on the training split only.

Selected candidates:
- Diabetes target: Random Forest
- CVD composite target: Logistic Regression

This is an exploratory model-development script. Metrics are unweighted and
must not be presented as clinical validation or individual medical risk.
Raw respondent rows and identifiers are not written to reports.
"""
from __future__ import annotations

import argparse
import json
import math
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
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
)
from sklearn.model_selection import (
    RandomizedSearchCV,
    GridSearchCV,
    StratifiedKFold,
    train_test_split,
)
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

import train_lasi_models as source

BASE_DIR = Path(__file__).resolve().parent
DEFAULT_INPUT = BASE_DIR / "data" / "Individual_Daman_and_Diu.xlsx"
MODELS_DIR = BASE_DIR / "models"
REPORTS_DIR = BASE_DIR / "reports"
RANDOM_STATE = 42
TEST_SIZE = 0.20

NUMERIC_FEATURES = ["age_years"]


def make_pipeline(model_name: str, feature_names: list[str]) -> Pipeline:
    categorical_features = [c for c in feature_names if c not in NUMERIC_FEATURES]
    numeric_pipe = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
    ])
    categorical_pipe = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("encoder", OneHotEncoder(handle_unknown="ignore")),
    ])
    preprocessor = ColumnTransformer([
        ("numeric", numeric_pipe, NUMERIC_FEATURES),
        ("categorical", categorical_pipe, categorical_features),
    ])

    if model_name == "random_forest":
        estimator = RandomForestClassifier(
            n_estimators=300,
            class_weight="balanced_subsample",
            random_state=RANDOM_STATE,
            min_samples_leaf=3,
            n_jobs=1,
        )
    elif model_name == "logistic_regression":
        estimator = LogisticRegression(
            max_iter=4000,
            class_weight="balanced",
            random_state=RANDOM_STATE,
        )
    else:
        raise ValueError(f"Unsupported model: {model_name}")

    return Pipeline([("preprocessor", preprocessor), ("model", estimator)])


def metrics_for(model: Pipeline, X_test: pd.DataFrame, y_test: pd.Series) -> dict:
    prediction = model.predict(X_test)
    classes = list(model.classes_)
    positive_index = classes.index(1)
    probability = model.predict_proba(X_test)[:, positive_index]
    tn, fp, fn, tp = confusion_matrix(y_test, prediction, labels=[0, 1]).ravel()
    return {
        "accuracy": float(accuracy_score(y_test, prediction)),
        "balanced_accuracy": float(balanced_accuracy_score(y_test, prediction)),
        "sensitivity": float(recall_score(y_test, prediction, zero_division=0)),
        "specificity": float(tn / (tn + fp)) if (tn + fp) else 0.0,
        "precision": float(precision_score(y_test, prediction, zero_division=0)),
        "f1_score": float(f1_score(y_test, prediction, zero_division=0)),
        "roc_auc": float(roc_auc_score(y_test, probability)) if len(set(y_test)) == 2 else None,
        "tn": int(tn), "fp": int(fp), "fn": int(fn), "tp": int(tp),
    }


def to_jsonable(value):
    if isinstance(value, dict):
        return {str(k): to_jsonable(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [to_jsonable(v) for v in value]
    if isinstance(value, (np.integer,)):
        return int(value)
    if isinstance(value, (np.floating,)):
        return float(value)
    if isinstance(value, np.ndarray):
        return value.tolist()
    if value is None or isinstance(value, (str, int, float, bool)):
        return value
    return str(value)


def build_task_data(source_rows, task_name: str):
    features_by_row = [source.row_to_features(r) for r in source_rows]
    if task_name == "diabetes":
        feature_names = source.DIABETES_FEATURES
        labels = [source.target_yes_no(r.get("ht003")) for r in source_rows]
        target_definition = "HT003 self-reported diagnosis of diabetes/high blood sugar (1=Yes, 2=No). Not future diabetes risk."
        model_name = "random_forest"
    elif task_name == "cvd_composite":
        feature_names = source.CVD_FEATURES
        labels = [source.cvd_composite_target(r) for r in source_rows]
        target_definition = "LASI CVD composite: HT002 hypertension OR HT006 chronic heart disease OR HT007 stroke; not CAD-specific and not future 10-year risk."
        model_name = "logistic_regression"
    else:
        raise ValueError(task_name)

    valid_indices = [i for i, y in enumerate(labels) if y is not None]
    X = pd.DataFrame(
        [{name: features_by_row[i][name] for name in feature_names} for i in valid_indices],
        columns=feature_names,
    )
    X["age_years"] = pd.to_numeric(X["age_years"], errors="coerce")
    y = pd.Series([int(labels[i]) for i in valid_indices], name="target", dtype=int)
    return X, y, feature_names, target_definition, model_name


def tune_task(X, y, task_name, feature_names, target_definition, model_name):
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y
    )
    baseline = make_pipeline(model_name, feature_names)
    baseline.fit(X_train, y_train)
    baseline_metrics = metrics_for(baseline, X_test, y_test)

    cv = StratifiedKFold(n_splits=3, shuffle=True, random_state=2026)
    if model_name == "random_forest":
        search = RandomizedSearchCV(
            estimator=make_pipeline(model_name, feature_names),
            param_distributions={
                "model__n_estimators": [100, 200, 300],
                "model__max_depth": [None, 4, 6, 8, 12],
                "model__min_samples_split": [2, 5, 10, 15],
                "model__min_samples_leaf": [2, 3, 5, 8, 10],
                "model__max_features": ["sqrt", 0.7, 1.0],
                "model__class_weight": ["balanced_subsample", "balanced"],
            },
            n_iter=8,
            scoring={"roc_auc": "roc_auc", "balanced_accuracy": "balanced_accuracy", "f1": "f1"},
            refit="roc_auc",
            cv=cv,
            n_jobs=1,
            random_state=RANDOM_STATE,
            return_train_score=False,
            error_score="raise",
        )
    else:
        search = GridSearchCV(
            estimator=make_pipeline(model_name, feature_names),
            param_grid={
                "model__C": [0.03, 0.1, 0.3, 1.0, 3.0, 10.0],
                "model__class_weight": ["balanced", None],
                "model__solver": ["lbfgs"],
            },
            scoring={"roc_auc": "roc_auc", "balanced_accuracy": "balanced_accuracy", "f1": "f1"},
            refit="roc_auc",
            cv=cv,
            n_jobs=1,
            return_train_score=False,
            error_score="raise",
        )

    print(f"\nTuning {task_name} / {model_name} using 3-fold CV on training split only ...")
    search.fit(X_train, y_train)
    best_model = search.best_estimator_
    tuned_metrics = metrics_for(best_model, X_test, y_test)
    best_index = int(search.best_index_)
    best_cv = {
        "roc_auc_mean": float(search.cv_results_["mean_test_roc_auc"][best_index]),
        "roc_auc_std": float(search.cv_results_["std_test_roc_auc"][best_index]),
        "balanced_accuracy_mean": float(search.cv_results_["mean_test_balanced_accuracy"][best_index]),
        "f1_mean": float(search.cv_results_["mean_test_f1"][best_index]),
    }

    artifact_path = MODELS_DIR / f"{task_name}_{model_name}_tuned_lasi_dd.joblib"
    artifact = {
        "pipeline": best_model,
        "model_name": model_name,
        "task_name": task_name,
        "feature_names": list(feature_names),
        "target_definition": target_definition,
        "positive_class": 1,
        "input_source": "LASI Wave 1 Daman and Diu Individual file",
        "data_scope": f"Daman and Diu filtered sample, n={len(y)}; target-usable records",
        "status": "exploratory_lasi_survey_data_not_clinically_validated_tuned",
        "tuning": {
            "selection_metric": "mean 3-fold training-CV ROC-AUC",
            "cross_validation_folds": 3,
            "best_params": to_jsonable(search.best_params_),
            "best_cv": best_cv,
            "threshold": 0.5,
        },
    }
    joblib.dump(artifact, artifact_path)

    result = {
        "task": task_name,
        "algorithm": model_name,
        "n_usable": int(len(y)),
        "train_n": int(len(X_train)),
        "test_n": int(len(X_test)),
        "baseline_test_metrics": baseline_metrics,
        "tuned_test_metrics": tuned_metrics,
        "best_cv_metrics_on_training_split": best_cv,
        "best_params": to_jsonable(search.best_params_),
        "artifact": str(artifact_path.relative_to(BASE_DIR)),
        "selection_note": "Hyperparameters selected by 3-fold CV ROC-AUC on the training split. Test metrics are one exploratory hold-out evaluation and not clinical validation.",
    }
    print("Baseline hold-out metrics:", json.dumps(baseline_metrics, indent=2))
    print("Best CV metrics:", json.dumps(best_cv, indent=2))
    print("Best parameters:", json.dumps(to_jsonable(search.best_params_), indent=2))
    print("Tuned hold-out metrics:", json.dumps(tuned_metrics, indent=2))
    print("Saved tuned model:", artifact_path)
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT, help="Authorized Individual_Daman_and_Diu.xlsx path")
    args = parser.parse_args()
    if not args.input.exists():
        raise FileNotFoundError(f"Input XLSX not found: {args.input}")
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)

    print("Reading selected variables from:", args.input)
    rows, headers = source.read_selected_xlsx_columns(args.input)
    states = {str(r.get("state", "")) for r in rows}
    print("Rows read:", len(rows), "State values:", {s: sum(str(r.get('state','')) == s for r in rows) for s in states})
    if len(states) != 1 or "Daman and Diu" not in states:
        raise ValueError("Expected only Daman and Diu records. Stop and inspect the source workbook before tuning.")

    results = []
    for task in ("diabetes",):
        X, y, features, target_definition, model_name = build_task_data(rows, task)
        counts = {"usable": int(len(y)), "positive": int((y == 1).sum()), "negative": int((y == 0).sum())}
        print(f"\n{task} target audit:", counts)
        results.append(tune_task(X, y, task, features, target_definition, model_name))

    payload = {
        "project": "Fedigree selected-model tuning on LASI Daman & Diu",
        "input_file_name": args.input.name,
        "method": {
            "outer_split": "stratified 80/20, random_state=42; consistent with previous baseline split",
            "tuning_cv": "StratifiedKFold(n_splits=3, shuffle=True, random_state=2026) on the training split only",
            "refit_metric": "ROC-AUC",
            "operating_threshold": 0.5,
            "preprocessing": "median imputation + scaling for age; most-frequent imputation + one-hot encoding for categorical inputs; fitted inside the pipeline",
            "survey_weights": "not applied",
        },
        "warning": "Exploratory unweighted model development on a small regional survey subset. Tuning does not establish clinical validity, causality, calibrated individual risk, or generalizability. The hold-out split has been examined previously, so this should not be treated as independent external validation.",
        "results": results,
    }
    json_path = REPORTS_DIR / "lasi_daman_diu_selected_model_tuning.json"
    json_path.write_text(json.dumps(to_jsonable(payload), indent=2), encoding="utf-8")

    flat = []
    for result in results:
        for phase in ("baseline_test_metrics", "tuned_test_metrics"):
            row = {"task": result["task"], "algorithm": result["algorithm"], "version": phase.replace("_test_metrics", "")}
            row.update(result[phase])
            flat.append(row)
        cvrow = {"task": result["task"], "algorithm": result["algorithm"], "version": "best_cv_training"}
        cvrow.update(result["best_cv_metrics_on_training_split"])
        flat.append(cvrow)
    csv_path = REPORTS_DIR / "lasi_daman_diu_selected_model_tuning.csv"
    pd.DataFrame(flat).to_csv(csv_path, index=False)

    lines = [
        "# Fedigree Selected Model Tuning Report",
        "",
        "**Status:** exploratory tuning; unweighted; not clinically validated.",
        "",
        "Selected algorithms: Diabetes = Random Forest; CVD composite = Logistic Regression.",
        "Tuning selection was based on 3-fold training-split CV ROC-AUC. The held-out test split was not used in hyperparameter search, but it has been examined in earlier work and is not independent external validation.",
        "",
    ]
    for result in results:
        lines += [f"## {result['task']} — {result['algorithm']}", "", "### Best parameters", "", "```json", json.dumps(result["best_params"], indent=2), "```", "", "### Cross-validation performance (training split)", "", "| Metric | Mean | Std (ROC-AUC only) |", "|---|---:|---:|", f"| ROC-AUC | {result['best_cv_metrics_on_training_split']['roc_auc_mean']:.4f} | {result['best_cv_metrics_on_training_split']['roc_auc_std']:.4f} |", f"| Balanced accuracy | {result['best_cv_metrics_on_training_split']['balanced_accuracy_mean']:.4f} | — |", f"| F1-score | {result['best_cv_metrics_on_training_split']['f1_mean']:.4f} | — |", "", "### Hold-out metrics (baseline vs tuned)", "", "| Metric | Baseline | Tuned |", "|---|---:|---:|"]
        for metric in ("accuracy", "balanced_accuracy", "sensitivity", "specificity", "precision", "f1_score", "roc_auc"):
            b = result["baseline_test_metrics"][metric]
            t = result["tuned_test_metrics"][metric]
            lines.append(f"| {metric.replace('_',' ').title()} | {b:.4f} | {t:.4f} |")
        lines += ["", f"Confusion matrix baseline: TN={result['baseline_test_metrics']['tn']}, FP={result['baseline_test_metrics']['fp']}, FN={result['baseline_test_metrics']['fn']}, TP={result['baseline_test_metrics']['tp']}", f"Confusion matrix tuned: TN={result['tuned_test_metrics']['tn']}, FP={result['tuned_test_metrics']['fp']}, FN={result['tuned_test_metrics']['fn']}, TP={result['tuned_test_metrics']['tp']}", "", f"Tuned model artifact: `{result['artifact']}`", ""]
    lines += ["## Limitations", "", "- Diabetes is self-reported diagnosed status, not future diabetes risk.", "- CVD composite is report-defined: hypertension OR chronic heart disease OR stroke; not CAD-specific or a 10-year risk score.", "- Metrics are unweighted and from one small regional sample.", "- The held-out split has been examined previously. Do not claim independent validation.", "- No tuning outcome guarantees improved clinical performance.", ""]
    md_path = REPORTS_DIR / "lasi_daman_diu_selected_model_tuning.md"
    md_path.write_text("\n".join(lines), encoding="utf-8")
    print("\nTuning report saved:", csv_path, json_path, md_path, sep="\n")

if __name__ == "__main__":
    main()
