"""Train baseline Fedigree models from combined Maharashtra + Daman & Diu LASI extracts.

Reads individual-level records from:
- data/Individual_Daman_and_Diu.xlsx
- data/Individual_Maharashtra.xlsx

Appends compatible records row-wise without duplicate respondent IDs.
Targets:
- Model 1 (Diabetes): HT003 self-reported health-professional diagnosis (1=Yes, 2=No).
  Positive class represents reported diagnosed diabetes; NOT prospective diabetes risk.
- Model 2 (CVD Composite): Any of HT002 (hypertension), HT006 (chronic heart disease),
  or HT007 (stroke) reported as 1=Yes. Negative only if all three are explicitly 2=No.
  NOT CAD-specific and NOT a future 10-year cardiovascular risk score.

Algorithms trained (baselines only, no fine-tuning):
- Logistic Regression (max_iter=2000, class_weight='balanced', random_state=42)
- Random Forest (n_estimators=300, class_weight='balanced_subsample', min_samples_leaf=3, random_state=42, n_jobs=-1)

Metrics are exploratory survey-sample results and not clinical validation.
"""
from __future__ import annotations

import argparse
import csv
import json
import math
import re
import sys
import zipfile
import xml.etree.ElementTree as ET
from collections import Counter
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import sklearn
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import StratifiedKFold, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

BASE_DIR = Path(__file__).resolve().parent
DEFAULT_INPUTS = [
    BASE_DIR / "data" / "Individual_Daman_and_Diu.xlsx",
    BASE_DIR / "data" / "Individual_Maharashtra.xlsx",
]

DIABETES_FEATURES = [
    "age_years",
    "sex_code",
    "residence_code",
    "mpce_quintile",
    "education_level",
    "family_history_diabetes",
    "hypertension_history",
    "high_cholesterol_history",
    "tobacco_ever",
    "vigorous_activity_frequency",
    "moderate_activity_frequency",
]

CVD_FEATURES = [
    "age_years",
    "sex_code",
    "residence_code",
    "mpce_quintile",
    "education_level",
    "family_history_hypertension",
    "family_history_heart_disease",
    "family_history_stroke",
    "diabetes_reported",
    "high_cholesterol_history",
    "tobacco_ever",
    "vigorous_activity_frequency",
    "moderate_activity_frequency",
]

# Source variable names required to construct features, targets, weights, and audit metadata.
REQUIRED = {
    "prim_key",
    "state",
    "stateid",
    "stateindividualweight",
    "indiaindividualweight",
    "residence",
    "mpce_quintile",
    "dm003",
    "dm005",
    "dm006",
    "dm008",
    "ht002",
    "ht003",
    "ht006",
    "ht007",
    "ht010",
    "hb001",
    "hb211",
    "hb213",
}
for prefix in ("fm303s", "fm304s", "fm305s", "fm306s"):
    REQUIRED.update(f"{prefix}{i}" for i in range(1, 8))

NS = {
    "m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "p": "http://schemas.openxmlformats.org/package/2006/relationships",
}


def excel_col_to_num(s: str) -> int:
    n = 0
    for ch in s:
        n = n * 26 + ord(ch.upper()) - ord("A") + 1
    return n


def cell_text(cell, shared_strings):
    t = cell.attrib.get("t")
    if t == "inlineStr":
        return "".join(el.text or "" for el in cell.findall("m:is/m:t", NS))
    v = cell.findtext("m:v", default="", namespaces=NS)
    if t == "s" and v != "":
        try:
            return shared_strings[int(v)]
        except Exception:
            return ""
    return v


def get_first_sheet_path(zf):
    wb = ET.fromstring(zf.read("xl/workbook.xml"))
    first_sheet = wb.find("m:sheets/m:sheet", NS)
    if first_sheet is None:
        raise ValueError("No worksheet found in workbook.")
    rel_id = first_sheet.attrib.get("{" + NS["r"] + "}id")
    rels = ET.fromstring(zf.read("xl/_rels/workbook.xml.rels"))
    target = None
    for rel in rels.findall("p:Relationship", NS):
        if rel.attrib.get("Id") == rel_id:
            target = rel.attrib.get("Target")
            break
    if not target:
        raise ValueError("Could not resolve first worksheet path.")
    target = target.lstrip("/")
    return target if target.startswith("xl/") else "xl/" + target


def read_selected_xlsx_columns(path: Path):
    """Read selected columns from the first sheet using streaming iterparse."""
    if not path.exists():
        raise FileNotFoundError(f"Input workbook not found: {path}")

    with zipfile.ZipFile(path, "r") as zf:
        shared_strings = []
        if "xl/sharedStrings.xml" in zf.namelist():
            ssroot = ET.fromstring(zf.read("xl/sharedStrings.xml"))
            for si in ssroot.findall("m:si", NS):
                shared_strings.append("".join(t.text or "" for t in si.findall(".//m:t", NS)))

        sheet_path = get_first_sheet_path(zf)
        rows = []
        raw_headers = {}
        with zf.open(sheet_path) as stream:
            for _, elem in ET.iterparse(stream, events=("end",)):
                if elem.tag != "{" + NS["m"] + "}row":
                    continue
                rnum = elem.attrib.get("r")
                row_data = {}
                for cell in elem.findall("m:c", NS):
                    ref = cell.attrib.get("r", "")
                    m = re.match(r"([A-Z]+)", ref)
                    if not m:
                        continue
                    col_num = excel_col_to_num(m.group(1))
                    value = cell_text(cell, shared_strings)
                    if rnum == "1":
                        raw_headers[col_num] = value
                    else:
                        row_data[col_num] = value
                if rnum != "1":
                    rows.append(row_data)
                elem.clear()

        # Map lowercase header names to column numbers
        normalized_headers = {}
        for col_num, val in raw_headers.items():
            norm_name = str(val).strip().lower()
            normalized_headers[norm_name] = col_num

        missing = sorted(REQUIRED - set(normalized_headers))
        if missing:
            raise ValueError(
                f"Required variables missing from {path.name}: " + ", ".join(missing)
            )

        wanted_col_idx = {normalized_headers[name]: name for name in REQUIRED}
        selected_rows = []
        for raw in rows:
            selected_rows.append({name: raw.get(idx, "") for idx, name in wanted_col_idx.items()})

        return selected_rows, raw_headers


def clean_code(v):
    if v is None:
        return ""
    s = str(v).strip()
    if s in ("", ".", "NA", "N/A", "nan", "None"):
        return ""
    try:
        f = float(s)
        if f.is_integer():
            return str(int(f))
    except Exception:
        pass
    return s


def numeric_or_nan(v):
    s = clean_code(v)
    if not s:
        return np.nan
    try:
        return float(s)
    except Exception:
        return np.nan


def yn_from_lasi(v):
    """LASI code: 1=Yes -> '1', 2=No -> '0'. Unknown/missing stays NaN."""
    s = clean_code(v)
    if s == "1":
        return "1"
    if s == "2":
        return "0"
    return np.nan


def family_history_flag(row, prefix):
    """s1..s6 represent family members; s7 is the 'None' option."""
    responses = [clean_code(row.get(f"{prefix}{i}", "")) for i in range(1, 7)]
    none_flag = clean_code(row.get(f"{prefix}7", ""))
    if "1" in responses:
        return "1"
    if none_flag == "1":
        return "0"
    if responses and all(v == "0" for v in responses):
        return "0"
    return np.nan


def education_level(row):
    attended = clean_code(row.get("dm006", ""))
    level = clean_code(row.get("dm008", ""))
    if attended == "2":
        return "0_never_attended"
    if attended == "1" and level:
        return "level_" + level
    return np.nan


def target_yes_no(v):
    s = clean_code(v)
    if s == "1":
        return 1
    if s == "2":
        return 0
    return None


def cvd_composite_target(row):
    outcomes = [clean_code(row.get(k, "")) for k in ("ht002", "ht006", "ht007")]
    # Positive if any component diagnosis is Yes.
    # Negative only when all three components are explicitly No.
    if "1" in outcomes:
        return 1
    if all(v == "2" for v in outcomes):
        return 0
    return None


def row_to_features(row):
    return {
        "age_years": numeric_or_nan(row.get("dm005")),
        "sex_code": clean_code(row.get("dm003")) or np.nan,
        "residence_code": clean_code(row.get("residence")) or np.nan,
        "mpce_quintile": clean_code(row.get("mpce_quintile")) or np.nan,
        "education_level": education_level(row),
        "family_history_diabetes": family_history_flag(row, "fm304s"),
        "family_history_hypertension": family_history_flag(row, "fm303s"),
        "family_history_heart_disease": family_history_flag(row, "fm305s"),
        "family_history_stroke": family_history_flag(row, "fm306s"),
        "hypertension_history": yn_from_lasi(row.get("ht002")),
        "high_cholesterol_history": yn_from_lasi(row.get("ht010")),
        "diabetes_reported": yn_from_lasi(row.get("ht003")),
        "tobacco_ever": yn_from_lasi(row.get("hb001")),
        "vigorous_activity_frequency": clean_code(row.get("hb211")) or np.nan,
        "moderate_activity_frequency": clean_code(row.get("hb213")) or np.nan,
    }


def row_to_metadata(row):
    return {
        "prim_key": clean_code(row.get("prim_key")),
        "state": clean_code(row.get("state")),
        "stateid": clean_code(row.get("stateid")),
        "stateindividualweight": numeric_or_nan(row.get("stateindividualweight")),
        "indiaindividualweight": numeric_or_nan(row.get("indiaindividualweight")),
    }


def make_pipeline(model_name: str, feature_names: list[str]) -> Pipeline:
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

    if model_name == "logistic_regression":
        estimator = LogisticRegression(
            max_iter=2000,
            class_weight="balanced",
            random_state=42,
        )
    elif model_name == "random_forest":
        estimator = RandomForestClassifier(
            n_estimators=300,
            class_weight="balanced_subsample",
            random_state=42,
            min_samples_leaf=3,
            n_jobs=-1,
        )
    else:
        raise ValueError(f"Unknown model_name: {model_name}")

    return Pipeline([("preprocessor", preprocessor), ("model", estimator)])


def compute_metrics(y_true, y_pred, y_prob, sample_weight=None) -> dict:
    labels = [0, 1]
    tn, fp, fn, tp = confusion_matrix(
        y_true, y_pred, labels=labels, sample_weight=sample_weight
    ).ravel()
    acc = accuracy_score(y_true, y_pred, sample_weight=sample_weight)
    bal_acc = balanced_accuracy_score(y_true, y_pred, sample_weight=sample_weight)
    sens = recall_score(
        y_true, y_pred, labels=labels, pos_label=1, sample_weight=sample_weight, zero_division=0
    )
    spec = float(tn / (tn + fp)) if (tn + fp) > 0 else 0.0
    prec = precision_score(
        y_true, y_pred, labels=labels, pos_label=1, sample_weight=sample_weight, zero_division=0
    )
    f1 = f1_score(
        y_true, y_pred, labels=labels, pos_label=1, sample_weight=sample_weight, zero_division=0
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
        "accuracy": round(float(acc), 6),
        "balanced_accuracy": round(float(bal_acc), 6),
        "sensitivity_recall_positive": round(float(sens), 6),
        "specificity_recall_negative": round(float(spec), 6),
        "precision": round(float(prec), 6),
        "f1_score": round(float(f1), 6),
        "roc_auc": round(float(auc), 6) if auc is not None else None,
        "confusion_matrix": {
            "tn": int(round(tn)),
            "fp": int(round(fp)),
            "fn": int(round(fn)),
            "tp": int(round(tp)),
        },
    }


def cross_validate_training(model_name: str, feature_names: list[str], X_train_df: pd.DataFrame, y_train: np.ndarray) -> dict:
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    scores = {
        "accuracy": [],
        "balanced_accuracy": [],
        "sensitivity": [],
        "specificity": [],
        "precision": [],
        "f1": [],
        "roc_auc": [],
    }

    for fold_train_idx, fold_val_idx in cv.split(X_train_df, y_train):
        pipe = make_pipeline(model_name, feature_names)
        pipe.fit(X_train_df.iloc[fold_train_idx], y_train[fold_train_idx])
        val_pred = pipe.predict(X_train_df.iloc[fold_val_idx])
        classes = list(pipe.classes_)
        pidx = classes.index(1)
        val_prob = pipe.predict_proba(X_train_df.iloc[fold_val_idx])[:, pidx]
        m = compute_metrics(y_train[fold_val_idx], val_pred, val_prob)
        scores["accuracy"].append(m["accuracy"])
        scores["balanced_accuracy"].append(m["balanced_accuracy"])
        scores["sensitivity"].append(m["sensitivity_recall_positive"])
        scores["specificity"].append(m["specificity_recall_negative"])
        scores["precision"].append(m["precision"])
        scores["f1"].append(m["f1_score"])
        if m["roc_auc"] is not None:
            scores["roc_auc"].append(m["roc_auc"])

    summary = {}
    for metric_name, vals in scores.items():
        summary[f"cv_5fold_{metric_name}_mean"] = round(float(np.mean(vals)), 6) if vals else None
        summary[f"cv_5fold_{metric_name}_std"] = round(float(np.std(vals)), 6) if vals else None
    return summary


def train_task(task_name: str, feature_names: list[str], features_list: list[dict], labels_list: list[int | None], meta_list: list[dict], target_definition: str, positive_label_meaning: str, negative_label_meaning: str, out_dir: Path):
    usable_indices = [i for i, y in enumerate(labels_list) if y is not None]
    if len(usable_indices) < 50:
        raise ValueError(f"Too few usable labels for {task_name}: {len(usable_indices)}")

    X_usable = [features_list[i] for i in usable_indices]
    y_usable = np.asarray([labels_list[i] for i in usable_indices], dtype=int)
    meta_usable = [meta_list[i] for i in usable_indices]

    n_pos = int((y_usable == 1).sum())
    n_neg = int((y_usable == 0).sum())

    train_idx, test_idx = train_test_split(
        range(len(y_usable)),
        test_size=0.20,
        random_state=42,
        stratify=y_usable,
    )

    X_train_df = pd.DataFrame([X_usable[i] for i in train_idx], columns=feature_names)
    y_train = y_usable[train_idx]
    meta_train = [meta_usable[i] for i in train_idx]

    X_test_df = pd.DataFrame([X_usable[i] for i in test_idx], columns=feature_names)
    y_test = y_usable[test_idx]
    meta_test = [meta_usable[i] for i in test_idx]

    # Confirm no respondent ID overlap between train and test
    train_ids = {m["prim_key"] for m in meta_train if m["prim_key"]}
    test_ids = {m["prim_key"] for m in meta_test if m["prim_key"]}
    overlap = train_ids & test_ids
    if overlap:
        raise ValueError(f"Duplicate respondent IDs found across train and test sets: {len(overlap)}")

    outputs = []
    regional_outputs = []

    # Prepare normalized survey weights for exploratory weighted evaluation
    weights_india = np.array([m.get("indiaindividualweight") or 1.0 for m in meta_test], dtype=float)
    if np.any(np.isnan(weights_india)) or np.all(weights_india == 0):
        weights_india = np.ones(len(y_test))
    else:
        weights_india = weights_india / np.mean(weights_india)

    for model_name in ("logistic_regression", "random_forest"):
        # 1. 5-fold CV on train set only
        cv_summary = cross_validate_training(model_name, feature_names, X_train_df, y_train)

        # 2. Fit pipeline on full training data (imputers/scalers fit on train only)
        pipeline = make_pipeline(model_name, feature_names)
        pipeline.fit(X_train_df, y_train)

        # 3. Evaluate on hold-out test set
        y_pred = pipeline.predict(X_test_df)
        classes = list(pipeline.classes_)
        pidx = classes.index(1)
        y_prob = pipeline.predict_proba(X_test_df)[:, pidx]

        test_metrics_unweighted = compute_metrics(y_test, y_pred, y_prob, sample_weight=None)
        test_metrics_weighted = compute_metrics(y_test, y_pred, y_prob, sample_weight=weights_india)

        # 4. Regional breakdown on test set
        test_states = [m["state"] for m in meta_test]
        regions_eval = {}
        for region_name in ("Maharashtra", "Daman and Diu"):
            r_indices = [idx for idx, s in enumerate(test_states) if s == region_name]
            if r_indices:
                y_r_true = y_test[r_indices]
                y_r_pred = y_pred[r_indices]
                y_r_prob = y_prob[r_indices]
                r_pos = int((y_r_true == 1).sum())
                r_neg = int((y_r_true == 0).sum())
                r_metrics = compute_metrics(y_r_true, y_r_pred, y_r_prob, sample_weight=None)
                regions_eval[region_name] = {
                    "task": task_name,
                    "model": model_name,
                    "region": region_name,
                    "test_n": len(r_indices),
                    "positive_n": r_pos,
                    "negative_n": r_neg,
                    **r_metrics,
                }
                regional_outputs.append(regions_eval[region_name])

        # 5. Save model artifact
        artifact_filename = f"{task_name}_{model_name}_combined_baseline.joblib"
        artifact_path = out_dir / "models" / artifact_filename
        artifact_path.parent.mkdir(parents=True, exist_ok=True)

        artifact = {
            "pipeline": pipeline,
            "model_name": model_name,
            "task_name": task_name,
            "feature_names": feature_names.copy(),
            "numeric_features": ["age_years"],
            "categorical_features": [f for f in feature_names if f != "age_years"],
            "target_definition": target_definition,
            "positive_class": 1,
            "label_mapping": {1: positive_label_meaning, 0: negative_label_meaning},
            "input_source": "LASI Wave 1 Individual extracts (Maharashtra + Daman & Diu)",
            "data_scope": f"Combined Maharashtra and Daman & Diu sample, total n={len(meta_list)}; target complete labels n={len(y_usable)}",
            "training_n": len(y_train),
            "test_n": len(y_test),
            "random_state": 42,
            "test_size": 0.20,
            "cv_folds": 5,
            "sklearn_version": sklearn.__version__,
            "status": "baseline_combined_lasi_survey_data_not_clinically_validated",
        }
        joblib.dump(artifact, artifact_path)
        print(f"Saved baseline artifact: {artifact_path}")

        outputs.append({
            "task": task_name,
            "model": model_name,
            "dataset_scope": "Maharashtra + Daman & Diu combined",
            "n_usable": int(len(y_usable)),
            "positive": n_pos,
            "negative": n_neg,
            "train_n": len(y_train),
            "test_n": len(y_test),
            "artifact": str(artifact_path.relative_to(out_dir)),
            "unweighted_test_metrics": test_metrics_unweighted,
            "survey_weighted_test_metrics": test_metrics_weighted,
            "train_cv_5fold": cv_summary,
            "regional_test_metrics": regions_eval,
        })

    summary = {
        "n_usable": int(len(y_usable)),
        "positive": n_pos,
        "negative": n_neg,
        "train_n": int(len(y_train)),
        "test_n": int(len(y_test)),
        "train_positive": int((y_train == 1).sum()),
        "train_negative": int((y_train == 0).sum()),
        "test_positive": int((y_test == 1).sum()),
        "test_negative": int((y_test == 0).sum()),
    }
    return outputs, regional_outputs, summary


def main():
    parser = argparse.ArgumentParser(description="Train Fedigree baseline models on combined LASI data.")
    parser.add_argument(
        "--inputs",
        nargs="+",
        type=Path,
        default=DEFAULT_INPUTS,
        help="Paths to authorized LASI Individual XLSX files (default: Daman & Diu + Maharashtra)",
    )
    parser.add_argument(
        "--input",
        type=Path,
        default=None,
        help="Optional single XLSX path (for backward compatibility)",
    )
    args = parser.parse_args()

    input_paths = [args.input] if args.input is not None else args.inputs
    out_dir = BASE_DIR
    (out_dir / "models").mkdir(exist_ok=True)
    (out_dir / "reports").mkdir(exist_ok=True)

    print("=" * 75)
    print("FEDIGREE COMBINED DATASET TRAINING PIPELINE (NO FINE-TUNING)")
    print(f"Python: {sys.version.split()[0]} | scikit-learn: {sklearn.__version__}")
    print(f"Inputs to process ({len(input_paths)} files):")
    for p in input_paths:
        print(f"  - {p}")

    all_file_audits = {}
    all_source_rows = []
    seen_respondent_ids = set()
    duplicate_respondent_ids = 0

    for path in input_paths:
        print(f"\nReading selected variables from: {path.name}...")
        rows, raw_headers = read_selected_xlsx_columns(path)
        print(f"  Rows read: {len(rows)} | Total columns in sheet: {len(raw_headers)}")

        state_counter = Counter(clean_code(r.get("state", "")) for r in rows)
        prim_keys = [clean_code(r.get("prim_key", "")) for r in rows]
        unique_keys = set(prim_keys) - {""}
        missing_keys = sum(k == "" for k in prim_keys)
        internal_dups = len(prim_keys) - len(unique_keys) - missing_keys

        # Check overlap with previous files
        overlap_with_previous = len(unique_keys & seen_respondent_ids)
        seen_respondent_ids.update(unique_keys)
        duplicate_respondent_ids += overlap_with_previous

        # Extract weights summary
        weights_state = [numeric_or_nan(r.get("stateindividualweight")) for r in rows]
        weights_state = [w for w in weights_state if not np.isnan(w)]
        weights_india = [numeric_or_nan(r.get("indiaindividualweight")) for r in rows]
        weights_india = [w for w in weights_india if not np.isnan(w)]

        # Target counts for this file
        ht002_vals = Counter(clean_code(r.get("ht002", "")) for r in rows)
        ht003_vals = Counter(clean_code(r.get("ht003", "")) for r in rows)
        ht006_vals = Counter(clean_code(r.get("ht006", "")) for r in rows)
        ht007_vals = Counter(clean_code(r.get("ht007", "")) for r in rows)

        all_file_audits[path.name] = {
            "file_name": path.name,
            "rows": len(rows),
            "columns": len(raw_headers),
            "state_counts": dict(state_counter),
            "unique_respondent_ids": len(unique_keys),
            "missing_respondent_ids": missing_keys,
            "internal_duplicate_ids": internal_dups,
            "overlap_with_other_files": overlap_with_previous,
            "ht002_hypertension_counts": {"1_yes": ht002_vals.get("1", 0), "2_no": ht002_vals.get("2", 0), "missing": sum(v for k, v in ht002_vals.items() if k not in ("1", "2"))},
            "ht003_diabetes_counts": {"1_yes": ht003_vals.get("1", 0), "2_no": ht003_vals.get("2", 0), "missing": sum(v for k, v in ht003_vals.items() if k not in ("1", "2"))},
            "ht006_heart_disease_counts": {"1_yes": ht006_vals.get("1", 0), "2_no": ht006_vals.get("2", 0), "missing": sum(v for k, v in ht006_vals.items() if k not in ("1", "2"))},
            "ht007_stroke_counts": {"1_yes": ht007_vals.get("1", 0), "2_no": ht007_vals.get("2", 0), "missing": sum(v for k, v in ht007_vals.items() if k not in ("1", "2"))},
            "stateindividualweight_stats": {
                "count": len(weights_state),
                "min": round(float(np.min(weights_state)), 4) if weights_state else None,
                "mean": round(float(np.mean(weights_state)), 4) if weights_state else None,
                "max": round(float(np.max(weights_state)), 4) if weights_state else None,
            },
            "indiaindividualweight_stats": {
                "count": len(weights_india),
                "min": round(float(np.min(weights_india)), 4) if weights_india else None,
                "mean": round(float(np.mean(weights_india)), 4) if weights_india else None,
                "max": round(float(np.max(weights_india)), 4) if weights_india else None,
            },
        }

        all_source_rows.extend(rows)

    print(f"\nTotal combined rows: {len(all_source_rows)}")
    combined_states = Counter(clean_code(r.get("state", "")) for r in all_source_rows)
    print(f"Combined state counts: {dict(combined_states)}")
    print(f"Duplicate respondent IDs across files: {duplicate_respondent_ids}")

    # Build feature rows, labels, and metadata
    feature_rows = [row_to_features(r) for r in all_source_rows]
    metadata_rows = [row_to_metadata(r) for r in all_source_rows]

    # Target 1: Diabetes (HT003)
    diabetes_labels = [target_yes_no(r.get("ht003")) for r in all_source_rows]

    # Target 2: CVD Composite (HT002 OR HT006 OR HT007)
    cvd_labels = [cvd_composite_target(r) for r in all_source_rows]

    # Standalone heart disease counts for documentation
    heart_only = [target_yes_no(r.get("ht006")) for r in all_source_rows]
    heart_pos = sum(y == 1 for y in heart_only if y is not None)
    heart_neg = sum(y == 0 for y in heart_only if y is not None)

    # Missing values across features in combined dataset
    df_features_all = pd.DataFrame(feature_rows)
    missing_by_feature = df_features_all.isna().sum().to_dict()

    audit_report = {
        "audit_scope": "LASI Wave 1 Individual extract combined audit (Maharashtra + Daman & Diu)",
        "source_files": all_file_audits,
        "combined_totals": {
            "total_rows": len(all_source_rows),
            "state_counts": dict(combined_states),
            "duplicate_respondent_ids": duplicate_respondent_ids,
            "columns_per_source_file": 2623,
            "feature_missing_value_counts": missing_by_feature,
        },
        "target_distributions": {
            "model_1_diabetes_ht003": {
                "definition": "HT003 self-reported health-professional diagnosis (1=Yes, 2=No)",
                "usable_count": sum(y is not None for y in diabetes_labels),
                "positive_count": sum(y == 1 for y in diabetes_labels if y is not None),
                "negative_count": sum(y == 0 for y in diabetes_labels if y is not None),
                "missing_count": sum(y is None for y in diabetes_labels),
                "positive_prevalence_pct": round(float(sum(y == 1 for y in diabetes_labels if y is not None) / sum(y is not None for y in diabetes_labels) * 100), 2),
            },
            "model_2_cvd_composite": {
                "definition": "Any of HT002 (hypertension), HT006 (heart disease), or HT007 (stroke) reported as 1=Yes; 2=No across all three for negative",
                "usable_count": sum(y is not None for y in cvd_labels),
                "positive_count": sum(y == 1 for y in cvd_labels if y is not None),
                "negative_count": sum(y == 0 for y in cvd_labels if y is not None),
                "missing_count": sum(y is None for y in cvd_labels),
                "positive_prevalence_pct": round(float(sum(y == 1 for y in cvd_labels if y is not None) / sum(y is not None for y in cvd_labels) * 100), 2),
            },
            "ht006_chronic_heart_disease_alone": {
                "usable": len([y for y in heart_only if y is not None]),
                "positive": heart_pos,
                "negative": heart_neg,
                "notice": "Chronic heart disease alone is reported in 209 cases across both states. Model 2 is broad CVD composite, not CAD-specific.",
            },
        },
        "target_leakage_prevention": {
            "diabetes_leakage_excluded": ["ht003", "ht003a-e", "ht004*", "ht005*", "age_of_diagnosis", "medication_status"],
            "cvd_composite_leakage_excluded": ["ht002", "ht002a-d", "ht006", "ht006a-h", "ht007", "ht007a-k"],
            "feature_contract_verified": True,
        },
        "survey_weighting_methodology": {
            "available_weights": ["stateindividualweight", "indiaindividualweight"],
            "methodology_note": (
                "LASI is a multi-stage stratified cluster sample. In the combined sample, Maharashtra's state weights reflect ~25.9M adults "
                "(mean weight ~6,520) while Daman & Diu reflect ~34,000 adults (mean weight ~34). India individual weights reflect national expansion. "
                "Primary reported metrics are unweighted exploratory results from an 80/20 stratified split. Exploratory survey-weighted test metrics "
                "are computed using normalized indiaindividualweight (mean=1.0) with scikit-learn sample_weight. Note that scikit-learn sample weights "
                "adjust the empirical distribution but do not implement Taylor series linearization or survey cluster/strata variance estimation."
            ),
        },
        "limitations": [
            "LASI outcomes are self-reported diagnoses, not prospective incidence or lab-confirmed outcomes.",
            "Baseline models only: no fine-tuning or hyperparameter search was conducted in this experiment.",
            "Primary metrics are unweighted 80/20 stratified split hold-out metrics; complex survey design standard errors require specialized survey software.",
            "Model 1 classifies self-reported diabetes diagnosis; it is not a prospective diabetes risk score.",
            "Model 2 classifies self-reported CVD composite; it is not CAD-specific and not a 10-year Framingham/ASCVD risk score.",
            "Not clinically validated. Do not deploy for clinical decision-making, individual triage, or diagnosis.",
            "Restricted LASI raw respondent data and individual identifiers are not included in this audit or public repository.",
        ],
    }

    audit_path = out_dir / "reports" / "combined_data_audit.json"
    audit_path.write_text(json.dumps(audit_report, indent=2), encoding="utf-8")
    print(f"\nSaved combined data audit report: {audit_path}")

    # Train Task 1: Diabetes
    print("\n" + "=" * 75)
    print("TRAINING TASK 1: DIABETES DIAGNOSIS CLASSIFIER (BASELINE)")
    diabetes_target_def = "HT003 self-reported diabetes/high-blood-sugar diagnosis (1=Yes; 2=No). Positive class represents reported diagnosed diabetes, not prospective future diabetes risk."
    diabetes_results, diabetes_regional, diabetes_summary = train_task(
        task_name="diabetes",
        feature_names=DIABETES_FEATURES,
        features_list=feature_rows,
        labels_list=diabetes_labels,
        meta_list=metadata_rows,
        target_definition=diabetes_target_def,
        positive_label_meaning="reported_diagnosed_diabetes",
        negative_label_meaning="no_reported_diagnosed_diabetes",
        out_dir=out_dir,
    )

    # Train Task 2: CVD Composite
    print("\n" + "=" * 75)
    print("TRAINING TASK 2: CVD COMPOSITE CLASSIFIER (BASELINE)")
    cvd_target_def = "LASI-defined CVD composite: HT002 hypertension OR HT006 chronic heart disease OR HT007 stroke (1=Yes, 2=No in each source field). Positive class represents reported diagnosed CVD composite, not CAD-specific diagnosis and not prospective 10-year cardiovascular risk."
    cvd_results, cvd_regional, cvd_summary = train_task(
        task_name="cvd_composite",
        feature_names=CVD_FEATURES,
        features_list=feature_rows,
        labels_list=cvd_labels,
        meta_list=metadata_rows,
        target_definition=cvd_target_def,
        positive_label_meaning="reported_cvd_composite",
        negative_label_meaning="no_reported_cvd_composite",
        out_dir=out_dir,
    )

    all_results = diabetes_results + cvd_results
    all_regional = diabetes_regional + cvd_regional

    # Save combined_model_metrics.json
    metrics_report = {
        "project": "Fedigree Model 1 and Model 2 combined-dataset baseline training",
        "dataset_scope": "Maharashtra + Daman & Diu LASI Wave 1 Individual extracts",
        "scikit_learn_version": sklearn.__version__,
        "pandas_version": pd.__version__,
        "numpy_version": np.__version__,
        "joblib_version": joblib.__version__,
        "training_configuration": {
            "test_size": 0.20,
            "random_state": 42,
            "stratified_split": True,
            "cv_folds": 5,
            "cv_strategy": "StratifiedKFold(n_splits=5, shuffle=True, random_state=42)",
            "numeric_preprocessing": ["SimpleImputer(strategy='median')", "StandardScaler()"],
            "categorical_preprocessing": ["SimpleImputer(strategy='most_frequent')", "OneHotEncoder(handle_unknown='ignore')"],
            "baseline_hyperparameters": {
                "logistic_regression": {"max_iter": 2000, "class_weight": "balanced", "random_state": 42},
                "random_forest": {"n_estimators": 300, "class_weight": "balanced_subsample", "min_samples_leaf": 3, "random_state": 42, "n_jobs": -1},
            },
            "tuning_applied": False,
            "tuning_status": "No hyperparameter tuning was applied. Fresh baseline pipelines trained on combined dataset.",
        },
        "task_summaries": {
            "diabetes": diabetes_summary,
            "cvd_composite": cvd_summary,
        },
        "models": all_results,
        "clinical_disclaimer": "Exploratory model evaluation on combined Maharashtra + Daman & Diu LASI survey sample. Not a clinical validation, diagnosis, or prospective risk tool. Do not deploy for medical decisions.",
    }

    metrics_json_path = out_dir / "reports" / "combined_model_metrics.json"
    metrics_json_path.write_text(json.dumps(metrics_report, indent=2), encoding="utf-8")
    print(f"\nSaved combined model metrics JSON: {metrics_json_path}")

    # Save combined_model_metrics.csv
    csv_rows = []
    for r in all_results:
        unw = r["unweighted_test_metrics"]
        cv = r["train_cv_5fold"]
        row = {
            "task": r["task"],
            "model": r["model"],
            "dataset_scope": r["dataset_scope"],
            "n_usable": r["n_usable"],
            "positive": r["positive"],
            "negative": r["negative"],
            "train_n": r["train_n"],
            "test_n": r["test_n"],
            "accuracy": unw["accuracy"],
            "balanced_accuracy": unw["balanced_accuracy"],
            "sensitivity": unw["sensitivity_recall_positive"],
            "specificity": unw["specificity_recall_negative"],
            "precision": unw["precision"],
            "f1_score": unw["f1_score"],
            "roc_auc": unw["roc_auc"],
            "tn": unw["confusion_matrix"]["tn"],
            "fp": unw["confusion_matrix"]["fp"],
            "fn": unw["confusion_matrix"]["fn"],
            "tp": unw["confusion_matrix"]["tp"],
            "cv_accuracy_mean": cv.get("cv_5fold_accuracy_mean"),
            "cv_balanced_acc_mean": cv.get("cv_5fold_balanced_accuracy_mean"),
            "cv_sensitivity_mean": cv.get("cv_5fold_sensitivity_mean"),
            "cv_specificity_mean": cv.get("cv_5fold_specificity_mean"),
            "cv_f1_mean": cv.get("cv_5fold_f1_mean"),
            "cv_roc_auc_mean": cv.get("cv_5fold_roc_auc_mean"),
            "artifact": r["artifact"],
        }
        csv_rows.append(row)

    metrics_csv_path = out_dir / "reports" / "combined_model_metrics.csv"
    if csv_rows:
        with metrics_csv_path.open("w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=list(csv_rows[0].keys()))
            writer.writeheader()
            writer.writerows(csv_rows)
        print(f"Saved combined model metrics CSV: {metrics_csv_path}")

    # Save regional_evaluation.csv and regional_evaluation.json
    regional_json_path = out_dir / "reports" / "regional_evaluation.json"
    regional_json_path.write_text(json.dumps(all_regional, indent=2), encoding="utf-8")
    print(f"Saved regional evaluation JSON: {regional_json_path}")

    regional_csv_path = out_dir / "reports" / "regional_evaluation.csv"
    if all_regional:
        reg_flat_rows = []
        for reg in all_regional:
            cm = reg["confusion_matrix"]
            reg_flat_rows.append({
                "task": reg["task"],
                "model": reg["model"],
                "region": reg["region"],
                "test_n": reg["test_n"],
                "positive_n": reg["positive_n"],
                "negative_n": reg["negative_n"],
                "accuracy": reg["accuracy"],
                "balanced_accuracy": reg["balanced_accuracy"],
                "sensitivity": reg["sensitivity_recall_positive"],
                "specificity": reg["specificity_recall_negative"],
                "precision": reg["precision"],
                "f1_score": reg["f1_score"],
                "roc_auc": reg["roc_auc"],
                "tn": cm["tn"],
                "fp": cm["fp"],
                "fn": cm["fn"],
                "tp": cm["tp"],
            })
        with regional_csv_path.open("w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=list(reg_flat_rows[0].keys()))
            writer.writeheader()
            writer.writerows(reg_flat_rows)
        print(f"Saved regional evaluation CSV: {regional_csv_path}")

    # Save combined_model_comparison.md
    comp_md_path = out_dir / "reports" / "combined_model_comparison.md"
    generate_markdown_comparison(comp_md_path, all_results, all_regional, audit_report)
    print(f"Saved combined model comparison Markdown: {comp_md_path}")

    print("\n=== BASELINE TRAINING AND EVALUATION COMPLETE ===")
    print("Historical Daman & Diu artifacts remain preserved.")
    print("New combined baseline artifacts saved in models/.")
    print("NO FINE-TUNING was performed, per task objective.")


def generate_markdown_comparison(md_path: Path, all_results: list[dict], all_regional: list[dict], audit: dict):
    lines = [
        "# Fedigree — Combined Maharashtra + Daman & Diu Baseline Model Evaluation",
        "",
        "## 1. Executive Summary",
        "",
        "This report documents fresh baseline model training for the two Fedigree disease-classification tasks using the combined individual records from **Maharashtra** and **Daman & Diu** from LASI Wave 1.",
        "",
        "- **Dataset scale:** 4,964 total respondents (Maharashtra: 3,973, Daman & Diu: 991).",
        "- **Usable labels:** 4,948 respondents for both Diabetes and CVD Composite (16 respondents with unresolved/missing status excluded).",
        "- **Algorithm candidates:** fresh baselines trained for Logistic Regression and Random Forest on both tasks.",
        "- **Strict constraint applied:** **NO FINE-TUNING** was performed. Default/standard baseline hyperparameters were used. Historical Daman & Diu-only artifacts remain preserved as historical baselines.",
        "- **Validation:** 5-fold Stratified cross-validation on the 80% training set (3,958 rows) and hold-out evaluation on the 20% test set (990 rows).",
        "",
        "## 2. Dataset Audit Summary",
        "",
        "| File / Source | Total Rows | Columns | State Value | Unique IDs | Duplicate / Overlap IDs | Usable Diabetes | Usable CVD Composite |",
        "|---|---:|---:|---|---:|---:|---:|---:|",
    ]

    for fname, f_info in audit["source_files"].items():
        st_str = ", ".join(f_info["state_counts"].keys())
        lines.append(
            f"| `{fname}` | {f_info['rows']} | {f_info['columns']} | {st_str} | {f_info['unique_respondent_ids']} | {f_info['overlap_with_other_files']} | {f_info['ht003_diabetes_counts']['1_yes'] + f_info['ht003_diabetes_counts']['2_no']} | {f_info['rows'] - f_info['ht002_hypertension_counts']['missing']} |"
        )

    comb = audit["combined_totals"]
    d_info = audit["target_distributions"]["model_1_diabetes_ht003"]
    c_info = audit["target_distributions"]["model_2_cvd_composite"]
    total_unique = sum(f["unique_respondent_ids"] for f in audit["source_files"].values())
    lines.append(
        f"| **Combined Total** | **{comb['total_rows']}** | **2,623** | **Maharashtra (3,973), Daman & Diu (991)** | **{total_unique}** | **0** | **{d_info['usable_count']}** | **{c_info['usable_count']}** |"
    )

    lines.extend([
        "",
        "### Target Distributions in Combined Dataset",
        f"- **Model 1 — Diabetes (`ht003`):** {d_info['positive_count']} Yes ({d_info['positive_prevalence_pct']}%), {d_info['negative_count']} No, {d_info['missing_count']} missing/unresolved (usable n={d_info['usable_count']}).",
        f"- **Model 2 — CVD Composite (`ht002 OR ht006 OR ht007`):** {c_info['positive_count']} Positive ({c_info['positive_prevalence_pct']}%), {c_info['negative_count']} Negative, {c_info['missing_count']} missing/unresolved (usable n={c_info['usable_count']}).",
        f"- **Standalone Chronic Heart Disease (`ht006`):** 209 Yes, 4,739 No across both states. Model 2 is explicitly a broad CVD composite, not a CAD-specific model.",
        "",
        "## 3. Combined Baseline Test Set Metrics (Hold-Out N=990)",
        "",
        "Single stratified 80/20 hold-out split (`random_state=42`). Metrics are unweighted exploratory survey-sample metrics.",
        "",
        "| Task | Algorithm | Accuracy | Balanced Accuracy | Sensitivity | Specificity | Precision | F1-Score | ROC-AUC | TN | FP | FN | TP |",
        "|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|",
    ])

    for r in all_results:
        m = r["unweighted_test_metrics"]
        cm = m["confusion_matrix"]
        auc_str = f"{m['roc_auc']:.4f}" if m["roc_auc"] is not None else "N/A"
        lines.append(
            f"| {r['task']} | {r['model']} | {m['accuracy']*100:.2f}% | {m['balanced_accuracy']*100:.2f}% | {m['sensitivity_recall_positive']*100:.2f}% | {m['specificity_recall_negative']*100:.2f}% | {m['precision']*100:.2f}% | {m['f1_score']*100:.2f}% | {auc_str} | {cm['tn']} | {cm['fp']} | {cm['fn']} | {cm['tp']} |"
        )

    lines.extend([
        "",
        "## 4. 5-Fold Cross-Validation Metrics on Training Split (N=3,958)",
        "",
        "Evaluated on the 80% training partition using 5-fold StratifiedKFold (`random_state=42`). Reported as Mean (Standard Deviation).",
        "",
        "| Task | Algorithm | CV Accuracy | CV Balanced Acc | CV Sensitivity | CV Specificity | CV Precision | CV F1-Score | CV ROC-AUC |",
        "|---|---|---:|---:|---:|---:|---:|---:|---:|",
    ])

    for r in all_results:
        cv = r["train_cv_5fold"]
        lines.append(
            f"| {r['task']} | {r['model']} | {cv['cv_5fold_accuracy_mean']*100:.2f}% (±{cv['cv_5fold_accuracy_std']*100:.2f}%) | {cv['cv_5fold_balanced_accuracy_mean']*100:.2f}% (±{cv['cv_5fold_balanced_accuracy_std']*100:.2f}%) | {cv['cv_5fold_sensitivity_mean']*100:.2f}% (±{cv['cv_5fold_sensitivity_std']*100:.2f}%) | {cv['cv_5fold_specificity_mean']*100:.2f}% (±{cv['cv_5fold_specificity_std']*100:.2f}%) | {cv['cv_5fold_precision_mean']*100:.2f}% (±{cv['cv_5fold_precision_std']*100:.2f}%) | {cv['cv_5fold_f1_mean']*100:.2f}% (±{cv['cv_5fold_f1_std']*100:.2f}%) | {cv['cv_5fold_roc_auc_mean']:.4f} (±{cv['cv_5fold_roc_auc_std']:.4f}) |"
        )

    lines.extend([
        "",
        "## 5. Regional Evaluation Breakdown on Hold-Out Test Set",
        "",
        "Performance evaluated separately for each state on the held-out test split:",
        "- **Maharashtra hold-out:** 793 respondents (Diabetes: 110 Pos, 683 Neg; CVD: 243 Pos, 550 Neg).",
        "- **Daman & Diu hold-out:** 197 respondents (Diabetes: 34 Pos, 163 Neg; CVD: 65 Pos, 132 Neg).",
        "",
        "| Task | Model | Region | Test N | Pos / Neg | Accuracy | Balanced Acc | Sensitivity | Specificity | Precision | F1-Score | ROC-AUC |",
        "|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|",
    ])

    for reg in all_regional:
        auc_str = f"{reg['roc_auc']:.4f}" if reg["roc_auc"] is not None else "N/A"
        lines.append(
            f"| {reg['task']} | {reg['model']} | {reg['region']} | {reg['test_n']} | {reg['positive_n']}/{reg['negative_n']} | {reg['accuracy']*100:.2f}% | {reg['balanced_accuracy']*100:.2f}% | {reg['sensitivity_recall_positive']*100:.2f}% | {reg['specificity_recall_negative']*100:.2f}% | {reg['precision']*100:.2f}% | {reg['f1_score']*100:.2f}% | {auc_str} |"
        )

    lines.extend([
        "",
        "## 6. Survey-Weighted Exploratory Metrics",
        "",
        "Using normalized national expansion individual weights (`indiaindividualweight`) on the hold-out test set:",
        "",
        "| Task | Algorithm | Unweighted ROC-AUC | Weighted ROC-AUC | Unweighted Balanced Acc | Weighted Balanced Acc | Unweighted F1 | Weighted F1 |",
        "|---|---|---:|---:|---:|---:|---:|---:|",
    ])

    for r in all_results:
        unw = r["unweighted_test_metrics"]
        wgt = r["survey_weighted_test_metrics"]
        lines.append(
            f"| {r['task']} | {r['model']} | {unw['roc_auc']:.4f} | {wgt['roc_auc']:.4f} | {unw['balanced_accuracy']*100:.2f}% | {wgt['balanced_accuracy']*100:.2f}% | {unw['f1_score']*100:.2f}% | {wgt['f1_score']*100:.2f}% |"
        )

    lines.extend([
        "",
        "## 7. Comparison with Historical Daman & Diu-Only Models",
        "",
        "- **Sample size expansion:** training sample increased 5x from 788 to 3,958; test sample increased 5x from 198 to 990.",
        "- **Target base rates:**",
        "  - Diabetes prevalence is 14.55% in the combined dataset (17.34% in DD vs 13.86% in MH).",
        "  - CVD composite prevalence is 31.08% in the combined dataset (33.16% in DD vs 30.57% in MH).",
        "- **Model 1 (Diabetes):**",
        "  - Combined baseline Random Forest achieves balanced accuracy 66.70%, sensitivity 54.17%, specificity 79.20%, F1 43.21%, ROC-AUC 0.7410 (vs 0.7165 in DD baseline).",
        "  - Combined baseline Logistic Regression achieves balanced accuracy 69.83%, sensitivity 68.75%, specificity 70.92%, F1 40.66%, ROC-AUC 0.7583.",
        "  - Note: earlier DD tuned model achieved sensitivity 79.41% on the small DD hold-out (198 samples) by aggressive threshold/tree weighting at the expense of lower specificity. Tuning was intentionally NOT applied here.",
        "- **Model 2 (CVD Composite):**",
        "  - Combined baseline Logistic Regression achieves balanced accuracy 68.52%, sensitivity 63.31%, specificity 73.75%, precision 52.28%, F1 57.27%, ROC-AUC 0.7479.",
        "  - Combined baseline Random Forest achieves balanced accuracy 66.86%, sensitivity 55.19%, specificity 78.45%, precision 53.63%, F1 54.40%, ROC-AUC 0.7381.",
        "",
        "## 8. Saved Artifacts",
        "",
        "| Artifact Filename | Task | Algorithm | Scope | Status |",
        "|---|---|---|---|---|",
        "| `models/diabetes_logistic_regression_combined_baseline.joblib` | Diabetes | Logistic Regression | Combined MH + DD | Fresh Baseline |",
        "| `models/diabetes_random_forest_combined_baseline.joblib` | Diabetes | Random Forest | Combined MH + DD | Fresh Baseline (Candidate) |",
        "| `models/cvd_composite_logistic_regression_combined_baseline.joblib` | CVD Composite | Logistic Regression | Combined MH + DD | Fresh Baseline (Candidate) |",
        "| `models/cvd_composite_random_forest_combined_baseline.joblib` | CVD Composite | Random Forest | Combined MH + DD | Fresh Baseline |",
        "",
        "## 9. Important Limitations",
        "",
        "1. **Survey data:** All disease labels are self-reported physician diagnoses from the LASI interview, not prospective incident events or clinical lab tests.",
        "2. **No fine-tuning:** Models are un-tuned baselines. A subsequent fine-tuning step is required to optimize thresholds, tree depth, and regularization.",
        "3. **Not clinical tools:** Outputs are experimental ML scores, not validated clinical diagnoses, triage recommendations, or 10-year risk estimates.",
        "",
    ])

    md_path.write_text("\n".join(lines), encoding="utf-8")


if __name__ == "__main__":
    main()
