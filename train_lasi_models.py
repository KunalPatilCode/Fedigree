"""Train exploratory Fedigree models from LASI Daman & Diu Individual XLSX.

Reads only selected variables from the supplied XLSX using Python's standard
zip/XML libraries. Does NOT export raw respondent-level records.

Targets:
- Diabetes: HT003 self-reported health-professional diagnosis (1=Yes, 2=No)
- CVD composite: any of HT002 (hypertension), HT006 (chronic heart disease),
  HT007 (stroke) self-reported diagnosis, consistent with LASI's report-level
  composite. This is NOT CAD-specific and NOT future cardiovascular risk.

Metrics are unweighted exploratory hold-out metrics on one small regional sample.
They are not clinical validation results.
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
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, confusion_matrix, precision_score, recall_score,
    f1_score, roc_auc_score, balanced_accuracy_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

BASE_DIR = Path(__file__).resolve().parent
DEFAULT_INPUT = BASE_DIR / "data" / "Individual_Daman_and_Diu.xlsx"

DIABETES_FEATURES = [
    "age_years", "sex_code", "residence_code", "mpce_quintile", "education_level",
    "family_history_diabetes", "hypertension_history", "high_cholesterol_history",
    "tobacco_ever", "vigorous_activity_frequency", "moderate_activity_frequency",
]
CVD_FEATURES = [
    "age_years", "sex_code", "residence_code", "mpce_quintile", "education_level",
    "family_history_hypertension", "family_history_heart_disease", "family_history_stroke",
    "diabetes_reported", "high_cholesterol_history", "tobacco_ever",
    "vigorous_activity_frequency", "moderate_activity_frequency",
]

# Source variable names required to construct features and outcomes.
REQUIRED = {
    "prim_key", "state", "stateid", "residence", "mpce_quintile", "dm003", "dm005",
    "dm006", "dm008", "ht002", "ht003", "ht006", "ht007", "ht010", "hb001",
    "hb211", "hb213",
}
for prefix in ("fm303s", "fm304s", "fm305s", "fm306s"):
    REQUIRED.update(f"{prefix}{i}" for i in range(1, 8))

NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
      "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
      "p": "http://schemas.openxmlformats.org/package/2006/relationships"}


def excel_col_to_num(s: str) -> int:
    n = 0
    for ch in s:
        n = n * 26 + ord(ch.upper()) - ord("A") + 1
    return n


def num_to_excel_col(n: int) -> str:
    out = ""
    while n:
        n, rem = divmod(n - 1, 26)
        out = chr(65 + rem) + out
    return out


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
    """Resolve the first worksheet path instead of assuming sheet1.xml."""
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
    """Read only selected columns from the first sheet. Returns row dicts and headers."""
    if not path.exists():
        raise FileNotFoundError(
            f"Input workbook not found: {path}\n"
            "Place the authorized Individual_Daman_and_Diu.xlsx file in the data folder "
            "or pass its path with --input."
        )
    with zipfile.ZipFile(path, "r") as zf:
        shared_strings = []
        if "xl/sharedStrings.xml" in zf.namelist():
            ssroot = ET.fromstring(zf.read("xl/sharedStrings.xml"))
            for si in ssroot.findall("m:si", NS):
                shared_strings.append("".join(t.text or "" for t in si.findall(".//m:t", NS)))
        sheet_path = get_first_sheet_path(zf)
        rows = []
        headers = {}
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
                        headers[value] = col_num
                    else:
                        row_data[col_num] = value
                if rnum != "1":
                    rows.append(row_data)
                elem.clear()
        missing = sorted(REQUIRED - set(headers))
        if missing:
            raise ValueError("Required variables missing from first worksheet: " + ", ".join(missing))
        wanted_col_idx = {headers[name]: name for name in REQUIRED}
        selected_rows = []
        for raw in rows:
            selected_rows.append({name: raw.get(idx, "") for idx, name in wanted_col_idx.items()})
        return selected_rows, headers


def clean_code(v):
    if v is None:
        return ""
    s = str(v).strip()
    if s in ("", ".", "NA", "N/A", "nan", "None"):
        return ""
    # Excel numeric values may serialize as e.g. '1.0'; normalize integer codes.
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
    """LASI HT/HB style code: 1=Yes, 2=No. Unknown/missing stays NaN."""
    s = clean_code(v)
    if s == "1": return "1"
    if s == "2": return "0"
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
    if s == "1": return 1
    if s == "2": return 0
    return None


def cvd_composite_target(row):
    outcomes = [clean_code(row.get(k, "")) for k in ("ht002", "ht006", "ht007")]
    # If any component is positive, the composite is positive. A negative is
    # assigned only when all three components are explicitly No.
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


def make_pipeline(model_name, num_indices, cat_indices):
    num_pipe = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
    ])
    cat_pipe = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("encoder", OneHotEncoder(handle_unknown="ignore")),
    ])
    preprocessor = ColumnTransformer([
        ("numeric", num_pipe, num_indices),
        ("categorical", cat_pipe, cat_indices),
    ])
    if model_name == "logistic_regression":
        estimator = LogisticRegression(max_iter=2000, class_weight="balanced", random_state=42)
    else:
        estimator = RandomForestClassifier(
            n_estimators=300, class_weight="balanced_subsample", random_state=42,
            min_samples_leaf=3, n_jobs=-1,
        )
    return Pipeline([("preprocessor", preprocessor), ("model", estimator)])


def evaluate(y_true, y_pred, y_prob):
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred, labels=[0, 1]).ravel()
    return {
        "accuracy": round(float(accuracy_score(y_true, y_pred)), 6),
        "balanced_accuracy": round(float(balanced_accuracy_score(y_true, y_pred)), 6),
        "sensitivity_recall_positive": round(float(recall_score(y_true, y_pred, zero_division=0)), 6),
        "specificity_recall_negative": round(float(tn / (tn + fp)) if tn + fp else 0.0, 6),
        "precision": round(float(precision_score(y_true, y_pred, zero_division=0)), 6),
        "f1_score": round(float(f1_score(y_true, y_pred, zero_division=0)), 6),
        "roc_auc": round(float(roc_auc_score(y_true, y_prob)), 6) if len(set(y_true)) == 2 else None,
        "confusion_matrix": {"tn": int(tn), "fp": int(fp), "fn": int(fn), "tp": int(tp)},
    }


def train_task(task_name, features, labels, usable_indices, rows, out_dir):
    selected = [i for i, y in enumerate(labels) if y is not None]
    X_all = [[features[i][name] for name in features_names] for i in selected]
    y_all = np.asarray([labels[i] for i in selected], dtype=int)
    n_pos = int((y_all == 1).sum())
    n_neg = int((y_all == 0).sum())
    if n_pos < 10 or n_neg < 10:
        raise ValueError(f"Not enough examples for {task_name}: positive={n_pos}, negative={n_neg}")
    X_train, X_test, y_train, y_test = train_test_split(
        X_all, y_all, test_size=0.20, random_state=42, stratify=y_all
    )
    num_indices = [0]  # age_years
    cat_indices = list(range(1, len(features_names)))
    outputs = []
    for model_name in ("logistic_regression", "random_forest"):
        pipeline = make_pipeline(model_name, num_indices, cat_indices)
        pipeline.fit(X_train, y_train)
        y_pred = pipeline.predict(X_test)
        classes = list(pipeline.classes_)
        pidx = classes.index(1)
        y_prob = pipeline.predict_proba(X_test)[:, pidx]
        metrics = evaluate(y_test, y_pred, y_prob)
        artifact_name = f"{task_name}_{model_name}_lasi_dd.joblib"
        artifact_path = out_dir / "models" / artifact_name
        artifact_path.parent.mkdir(parents=True, exist_ok=True)
        artifact = {
            "pipeline": pipeline,
            "model_name": model_name,
            "task_name": task_name,
            "feature_names": features_names.copy(),
            "target_definition": target_definition,
            "positive_class": 1,
            "input_source": "LASI Wave 1 Daman and Diu Individual file",
            "data_scope": "Daman and Diu filtered sample, n=991; target-specific complete labels n=" + str(len(y_all)),
            "status": "exploratory_lasi_survey_data_not_clinically_validated",
        }
        joblib.dump(artifact, artifact_path)
        print(f"Saved: {artifact_path}")
        outputs.append({
            "task": task_name,
            "model": model_name,
            "n_usable": int(len(y_all)),
            "positive": n_pos,
            "negative": n_neg,
            "train_n": len(y_train),
            "test_n": len(y_test),
            **metrics,
            "artifact": str(artifact_path.relative_to(out_dir)),
        })
    return outputs, {"n_usable": int(len(y_all)), "positive": n_pos, "negative": n_neg,
            "train_n": int(len(y_train)), "test_n": int(len(y_test))}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT,
                        help="Path to authorized Individual_Daman_and_Diu.xlsx")
    args = parser.parse_args()
    out_dir = BASE_DIR
    (out_dir / "models").mkdir(exist_ok=True)
    (out_dir / "reports").mkdir(exist_ok=True)
    print(f"Reading selected variables from: {args.input}")
    source_rows, headers = read_selected_xlsx_columns(args.input)
    if not source_rows:
        raise ValueError("No data rows found in workbook.")
    states = Counter(clean_code(r.get("state", "")) for r in source_rows)
    print("Rows read:", len(source_rows))
    print("State values:", dict(states))
    if len(states) != 1 or "Daman and Diu" not in states:
        print("WARNING: Workbook does not contain only the expected Daman and Diu sample.", file=sys.stderr)

    feature_rows = [row_to_features(r) for r in source_rows]
    # Diabetes: HT003 (1=Yes, 2=No), target is a prior professional diagnosis.
    diabetes_labels = [target_yes_no(r.get("ht003")) for r in source_rows]
    # CVD composite: HT002 hypertension OR HT006 chronic heart disease OR HT007 stroke.
    cvd_labels = [cvd_composite_target(r) for r in source_rows]

    # Count standalone chronic heart-disease target to document why this is not
    # presented as a CAD-specific classifier.
    heart_only_valid = [target_yes_no(r.get("ht006")) for r in source_rows]
    heart_only_valid = [y for y in heart_only_valid if y is not None]
    heart_only_positive = sum(heart_only_valid)
    audit = {
        "source_workbook": args.input.name,
        "source_rows": len(source_rows),
        "source_columns": len(headers),
        "state_counts": dict(states),
        "target_definitions": {
            "diabetes": "HT003 self-reported professional diagnosis; 1=Yes, 2=No",
            "cvd_composite": "Any of HT002 hypertension, HT006 chronic heart disease, or HT007 stroke; 1=Yes, 2=No in each source field",
            "not_cad_specific": True,
        },
        "diabetes_target": {
            "usable": sum(y is not None for y in diabetes_labels),
            "positive": sum(y == 1 for y in diabetes_labels if y is not None),
            "negative": sum(y == 0 for y in diabetes_labels if y is not None),
            "missing": sum(y is None for y in diabetes_labels),
        },
        "cvd_composite_target": {
            "usable": sum(y is not None for y in cvd_labels),
            "positive": sum(y == 1 for y in cvd_labels if y is not None),
            "negative": sum(y == 0 for y in cvd_labels if y is not None),
            "missing": sum(y is None for y in cvd_labels),
        },
        "heart_disease_ht006_only": {
            "usable": len(heart_only_valid),
            "positive": int(heart_only_positive),
            "negative": int(len(heart_only_valid) - heart_only_positive),
            "warning": "Only 27 positive records in this Daman and Diu sample; not enough for a robust CAD-specific model evaluation.",
        },
        "limitations": [
            "LASI target labels are self-reported diagnoses, not all lab-confirmed outcomes.",
            "Daman and Diu subsample is small and from a survey designed for population inference; these models are exploratory.",
            "Metrics are from an unweighted 80/20 stratified split; survey weights and cluster design were not applied.",
            "CVD composite is prevalent diagnosis classification, not future/10-year CVD risk and not CAD-specific.",
            "No raw respondent-level data or IDs are written into the reports.",
        ],
    }
    (out_dir / "reports" / "lasi_daman_diu_data_audit.json").write_text(json.dumps(audit, indent=2), encoding="utf-8")

    all_results = []
    summaries = {}
    global features_names, target_definition
    features_names = DIABETES_FEATURES
    target_definition = "HT003 self-reported diabetes/high-blood-sugar diagnosis (1=Yes; 2=No). Positive class means reported diagnosed diabetes, not future diabetes risk."
    results, summary = train_task("diabetes", feature_rows, diabetes_labels, [], source_rows, out_dir)
    all_results.extend(results); summaries["diabetes"] = summary

    features_names = CVD_FEATURES
    target_definition = "LASI-defined CVD composite: HT002 hypertension OR HT006 chronic heart disease OR HT007 stroke. Positive class is current/ever self-reported diagnosed CVD composite, not future 10-year CVD risk and not CAD-specific."
    results, summary = train_task("cvd_composite", feature_rows, cvd_labels, [], source_rows, out_dir)
    all_results.extend(results); summaries["cvd_composite"] = summary

    report = {
        "project": "Fedigree Model 1 and Model 2 exploratory training",
        "source": "LASI Wave 1 Daman and Diu Individual records",
        "training_config": {
            "test_size": 0.20, "random_state": 42, "stratify": True,
            "numeric_preprocessing": ["median imputation", "StandardScaler"],
            "categorical_preprocessing": ["most_frequent imputation", "OneHotEncoder(handle_unknown='ignore')"],
            "logistic_regression": {"max_iter": 2000, "class_weight": "balanced", "random_state": 42},
            "random_forest": {"n_estimators": 300, "class_weight": "balanced_subsample", "min_samples_leaf": 3, "random_state": 42},
        },
        "task_summaries": summaries,
        "results": all_results,
        "clinical_disclaimer": "Exploratory model evaluation on a single small regional LASI subset. Not a clinical validation, diagnosis, or prospective risk tool. Do not deploy for medical decisions.",
    }
    (out_dir / "reports" / "lasi_daman_diu_model_metrics.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    csv_path = out_dir / "reports" / "lasi_daman_diu_model_metrics.csv"
    if all_results:
        fieldnames = list(all_results[0].keys())
        with csv_path.open("w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(all_results)
    print("\n=== LASI DAMAN & DIU EXPLORATORY MODEL COMPARISON ===")
    print("WARNING: These are exploratory, unweighted survey-sample metrics, not clinical validation.")
    print("Audit diabetes:", audit["diabetes_target"])
    print("Audit CVD composite:", audit["cvd_composite_target"])
    print("HT006 heart-disease-only positives:", heart_only_positive)
    for item in all_results:
        print(f"\n{item['task']} | {item['model']} | n={item['n_usable']} train={item['train_n']} test={item['test_n']}")
        for k in ("accuracy", "balanced_accuracy", "sensitivity_recall_positive", "specificity_recall_negative", "precision", "f1_score", "roc_auc", "confusion_matrix"):
            print(f"  {k}: {item[k]}")
    print("\nReports saved:", csv_path, "and", out_dir / "reports" / "lasi_daman_diu_model_metrics.json")

if __name__ == "__main__":
    main()
