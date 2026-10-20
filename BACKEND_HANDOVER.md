# Backend Handover — Fedigree Combined LASI Models

## Selected Active Artifacts

### 1. Fine-Tuned Candidate Artifacts (Recommended for Deployment)
- **Model 1 Diabetes (Tuned):** `models/diabetes_random_forest_combined_tuned.joblib`
  - Algorithm: Random Forest (`n_estimators=350`, `max_depth=5`, `min_samples_leaf=8`, `max_features="log2"`, `class_weight="balanced"`)
  - Calibrated Decision Threshold: `0.528 (~0.53)`
  - Hold-Out ROC-AUC: **0.7654** | Sensitivity: **64.58%** | Specificity: **75.89%**
- **Model 2 CVD Composite (Tuned):** `models/cvd_composite_logistic_regression_combined_tuned.joblib`
  - Algorithm: Logistic Regression (`C=0.01`, `penalty="l2"`, `class_weight={0: 1.0, 1: 1.5}`)
  - Calibrated Decision Threshold: `0.390`
  - Hold-Out ROC-AUC: **0.7362** | Sensitivity: **65.26%** | Specificity: **70.09%** | F1: **56.38%**

### 2. Active Baseline Comparison Artifacts
- `models/diabetes_random_forest_combined_baseline.joblib`
- `models/diabetes_logistic_regression_combined_baseline.joblib`
- `models/cvd_composite_logistic_regression_combined_baseline.joblib`
- `models/cvd_composite_random_forest_combined_baseline.joblib`

### 3. Preserved Historical Baselines (Daman & Diu Only)
- `models/diabetes_random_forest_tuned_lasi_dd.joblib`
- `models/diabetes_random_forest_lasi_dd.joblib`
- `models/diabetes_logistic_regression_lasi_dd.joblib`
- `models/cvd_composite_logistic_regression_lasi_dd.joblib`
- `models/cvd_composite_random_forest_lasi_dd.joblib`

---

## Integration Files

- **Inference helper:** `lasi_model_inference.py` — standard prediction interface (`predict(model_key, input_dict)`).
- **Smoke test & validation:** `predict_lasi_models.py` — automated test harness with fictional profiles.
- **Contract specification:** `MODEL_CONTRACT.md` — exact input schemas, category codes, and output payload format.
- **Model documentation:** `MODEL_1_DIABETES.md`, `MODEL_2_CVD_COMPOSITE.md`, `MODEL_COMPARISON.md`, `TUNING_SUMMARY.md`.
- **Comparison & Tuning reports:** `reports/combined_model_tuning.md`, `reports/combined_model_tuning.json`, `reports/combined_model_tuning.csv`, `reports/combined_model_comparison.md`.

---

## Backend Integration Requirements

1. **Input schema validation:**
   - Diabetes requires exactly **11 fields**.
   - CVD Composite requires exactly **13 fields**.
   - Missing or extra fields raise explicit errors.
   - `age_years` must be numeric and positive.
2. **Preprocessing encapsulation:**
   - Preprocessing (median imputation, scaling, and one-hot encoding) is fully enclosed in the saved `joblib` pipeline.
   - Do **NOT** independently preprocess, scale, or encode data in FastAPI / backend handlers.
3. **Model keys in `lasi_model_inference.py`:**
   - `diabetes_random_forest_tuned` -> **active tuned candidate** (RF with calibrated threshold 0.528).
   - `cvd_composite_logistic_regression_tuned` -> **active tuned candidate** (LR with calibrated threshold 0.390).
   - `diabetes_random_forest` -> combined baseline RF.
   - `diabetes_logistic_regression` -> combined baseline LR.
   - `cvd_composite_logistic_regression` -> combined baseline LR.
   - `cvd_composite_random_forest` -> combined baseline RF.
   - Historical keys (`historical_diabetes_random_forest_tuned_dd`, etc.) remain supported for backward compatibility.
4. **Output handling:**
   - Always return: `predicted_class`, `predicted_class_meaning`, `model_positive_class_probability`, `classification_threshold`, `data_scope`, `model_status`, and the full `notice` disclaimer string.
   - Model probability is a model score, **not** a calibrated clinical risk percentage.
5. **Execution environment:**
   - Python 3.13.7, scikit-learn 1.9.1, pandas 3.0.6, numpy 2.5.4, joblib 1.6.0.
6. **Clinical safety:**
   - These models are **not clinically validated**. Do not use for clinical triage, diagnosis, or medical treatment decision-making.

---

## Data Protection

Do **NOT** commit raw LASI Excel workbooks (`Individual_Daman_and_Diu.xlsx`, `Individual_Maharashtra.xlsx`), respondent IDs (`prim_key`), or row-level patient data to public repositories. Follow all IIPS data-access and usage agreements.
