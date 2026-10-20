# Fedigree LASI Model Input/Output Contract (Combined Maharashtra + Daman & Diu)

## Active Artifacts

### 1. Fine-Tuned Candidate Artifacts
- **Diabetes (Model 1):** `models/diabetes_random_forest_combined_tuned.joblib` — Random Forest tuned via 5-fold CV ROC-AUC + calibrated decision threshold (0.528).
- **CVD Composite (Model 2):** `models/cvd_composite_logistic_regression_combined_tuned.joblib` — Logistic Regression tuned via 5-fold CV ROC-AUC + calibrated decision threshold (0.390).

### 2. Active Baseline Comparison Artifacts
- **Diabetes (Model 1):** `models/diabetes_random_forest_combined_baseline.joblib` — fresh baseline Random Forest candidate.
- **CVD Composite (Model 2):** `models/cvd_composite_logistic_regression_combined_baseline.joblib` — fresh baseline Logistic Regression candidate.
- **Diabetes (LR Comparison):** `models/diabetes_logistic_regression_combined_baseline.joblib`
- **CVD Composite (RF Comparison):** `models/cvd_composite_random_forest_combined_baseline.joblib`

### 3. Historical Baselines Preserved
- Historical Daman & Diu-only artifacts (`models/diabetes_random_forest_tuned_lasi_dd.joblib`, `models/diabetes_random_forest_lasi_dd.joblib`, `models/diabetes_logistic_regression_lasi_dd.joblib`, `models/cvd_composite_logistic_regression_lasi_dd.joblib`, `models/cvd_composite_random_forest_lasi_dd.joblib`) remain preserved and accessible via historical keys in `lasi_model_inference.py`.

---

## General Status and Limitations

These models are exploratory disease-classification baselines trained on combined individual records from **Maharashtra** (3,973 respondents) and **Daman & Diu** (991 respondents) from LASI Wave 1 (total n=4,964; usable target n=4,948). Targets are self-reported physician diagnoses. Metrics are unweighted exploratory results from a single stratified hold-out split (3,958 train, 990 test). Models are **not clinically validated** and must **not** be used for clinical diagnosis, triage, or medical decision-making.

---

## Model 1 — Diabetes Reported-Diagnosis Classifier

**Target:** `HT003`: `1=Yes` (physician ever diagnosed diabetes/high blood sugar), `2=No`. Mapped to binary `1` and `0`. 16 records with missing/unresolved target were excluded. This classifies reported diagnosis; it does **not** predict prospective diabetes onset.

### Input Schema (11 Fields)

| Field | Type / Encodings | Source / Construction |
|---|---|---|
| `age_years` | numeric (int / float > 0) | `DM005`, age at last birthday |
| `sex_code` | category: `'1'`, `'2'` | `DM003` (`'1'` Male, `'2'` Female) |
| `residence_code` | category: `'1'`, `'2'` | `residence` (`'1'` Urban, `'2'` Rural) |
| `mpce_quintile` | category: `'1'`–`'5'` | `mpce_quintile` |
| `education_level` | category: `'0_never_attended'` or `'level_<1-9>'` | Derived from `DM006` and `DM008` |
| `family_history_diabetes` | category: `'0'`, `'1'` | `FM304` family-member indicators (`fm304s1`–`fm304s7`) |
| `hypertension_history` | category: `'0'`, `'1'` | `HT002`, yes/no mapped to `'1'` / `'0'` |
| `high_cholesterol_history` | category: `'0'`, `'1'` | `HT010`, yes/no mapped to `'1'` / `'0'` |
| `tobacco_ever` | category: `'0'`, `'1'` | `HB001`, ever smoked or used smokeless tobacco |
| `vigorous_activity_frequency` | category: `'1'`–`'5'` | `HB211` |
| `moderate_activity_frequency` | category: `'1'`–`'5'` | `HB213` |

### Candidate Baseline Metrics (Hold-Out Test Split N=990)
Random Forest Baseline: Accuracy 79.39%, Balanced Accuracy 69.22%, Sensitivity 54.86%, Specificity 83.57%, Precision 36.24%, F1-Score 43.65%, ROC-AUC 0.7507. Confusion matrix: TN=707, FP=139, FN=65, TP=79.
Training 5-fold CV: Mean ROC-AUC = 0.7764 (±0.0209), Mean Balanced Acc = 68.58% (±1.83%), Mean F1 = 42.84% (±2.00%).

---

## Model 2 — LASI-Defined CVD Composite Classifier

**Target:** `1` if any of `HT002` (hypertension), `HT006` (chronic heart disease), or `HT007` (stroke) is reported as Yes (`1`); `0` only if all three are explicitly No (`2`). 16 records with unresolved status were excluded. This is a broad condition composite, **not** CAD-specific and **not** a 10-year prospective risk score.

### Input Schema (13 Fields)

| Field | Type / Encodings | Source / Construction |
|---|---|---|
| `age_years` | numeric (int / float > 0) | `DM005` |
| `sex_code` | category: `'1'`, `'2'` | `DM003` (`'1'` Male, `'2'` Female) |
| `residence_code` | category: `'1'`, `'2'` | `residence` (`'1'` Urban, `'2'` Rural) |
| `mpce_quintile` | category: `'1'`–`'5'` | `mpce_quintile` |
| `education_level` | category: `'0_never_attended'` or `'level_<1-9>'` | Derived from `DM006` and `DM008` |
| `family_history_hypertension` | category: `'0'`, `'1'` | `FM303` family-member indicators (`fm303s1`–`fm303s7`) |
| `family_history_heart_disease` | category: `'0'`, `'1'` | `FM305` family-member indicators (`fm305s1`–`fm305s7`) |
| `family_history_stroke` | category: `'0'`, `'1'` | `FM306` family-member indicators (`fm306s1`–`fm306s7`) |
| `diabetes_reported` | category: `'0'`, `'1'` | `HT003`, mapped to `'1'` / `'0'` |
| `high_cholesterol_history` | category: `'0'`, `'1'` | `HT010`, mapped to `'1'` / `'0'` |
| `tobacco_ever` | category: `'0'`, `'1'` | `HB001` |
| `vigorous_activity_frequency` | category: `'1'`–`'5'` | `HB211` |
| `moderate_activity_frequency` | category: `'1'`–`'5'` | `HB213` |

### Candidate Baseline Metrics (Hold-Out Test Split N=990)
Logistic Regression Baseline: Accuracy 69.70%, Balanced Accuracy 67.50%, Sensitivity 61.69%, Specificity 73.31%, Precision 51.08%, F1-Score 55.88%, ROC-AUC 0.7386. Confusion matrix: TN=500, FP=182, FN=118, TP=190.
Training 5-fold CV: Mean ROC-AUC = 0.7439 (±0.0210), Mean Balanced Acc = 68.19% (±2.06%), Mean F1 = 56.72% (±2.53%).

---

## Prediction Response Schema

The inference helper `predict(model_key, input_features)` returns:
```json
{
  "model_key": "diabetes_random_forest",
  "model_name": "random_forest",
  "task_name": "diabetes",
  "predicted_class": 0,
  "predicted_class_meaning": "no_reported_diagnosed_diabetes",
  "model_positive_class_probability": 0.086527,
  "classification_threshold": 0.528,
  "data_scope": "Combined Maharashtra and Daman & Diu sample, total n=4964; target complete labels n=4948",
  "model_status": "baseline_combined_lasi_survey_data_not_clinically_validated",
  "training_environment": {
    "sklearn_version": "1.9.1",
    "current_sklearn": "1.9.1"
  },
  "notice": "Predicts LASI self-reported diabetes diagnosis classification (HT003), NOT prospective future diabetes risk and NOT a clinical diagnostic test. Exploratory baseline model trained on LASI survey data. Not clinically validated. Do NOT deploy for medical decision-making, individual triage, or diagnosis."
}
```

---

## Runtime Contract and Validation Rules

1. **Schema enforcement:** Incoming requests must provide all required features. Missing or unexpected fields raise explicit `ValueError`.
2. **Type validation:** `age_years` must be numeric and plausible (1–125).
3. **No independent preprocessing in API:** The saved `joblib` pipeline contains the fitted `ColumnTransformer` (median imputation, scaling, and one-hot encoding).
4. **Dependency alignment:** Built with Python 3.13.7, scikit-learn 1.9.1, pandas 3.0.6, numpy 2.5.4, joblib 1.6.0.
5. **Data protection:** Raw Excel extracts and respondent IDs are never committed or exposed via the API.
