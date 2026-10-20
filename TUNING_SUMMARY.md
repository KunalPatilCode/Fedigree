# Fedigree — Model Tuning Summary and Combined Dataset Fine-Tuning Status

## 1. Combined Dataset Fine-Tuning Status (Completed Run)

Systematic fine-tuning has been executed on the combined individual records from **Maharashtra** (3,973 respondents) and **Daman & Diu** (991 respondents) from LASI Wave 1:
- Total respondents: **4,964**
- Target complete records: **4,948**
- Hold-out split: Stratified 80/20 train/test (`random_state=42`; 3,958 train, 990 test)
- Model selection: 5-Fold Stratified Cross-Validation on the 3,958-sample training split only
- Final evaluation: Evaluated on the untouched 990-sample hold-out test set

---

## 2. Combined Dataset Fine-Tuned Results vs Baselines (Hold-Out N=990)

| Task | Configuration | Threshold | Accuracy | Balanced Acc | Sensitivity | Specificity | Precision | F1-Score | ROC-AUC | 5-Fold CV ROC-AUC | Status |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| **Diabetes** | Baseline Random Forest | 0.50 | 79.39% | 69.22% | 54.86% | 83.57% | 36.24% | 43.65% | 0.7507 | 0.7764 (±0.0209) | Comparison Baseline |
| **Diabetes** | Tuned RF (Default Thresh) | 0.50 | 72.93% | 70.62% | 67.36% | 73.88% | 30.50% | 41.99% | **0.7654** | **0.7926 (±0.0185)** | Intermediate |
| **Diabetes** | **Tuned RF (Calibrated Thresh)** | **0.53** | **74.24%** | **70.23%** | **64.58%** | **75.89%** | **31.31%** | **42.18%** | **0.7654** | **0.7926 (±0.0185)** | **Active Tuned Candidate** |
| **CVD Composite** | Baseline Logistic Regression | 0.50 | 69.70% | 67.50% | 61.69% | 73.31% | 51.08% | 55.88% | 0.7386 | 0.7439 (±0.0210) | Comparison Baseline |
| **CVD Composite** | Tuned LR (Default Thresh) | 0.50 | 73.54% | 64.77% | 41.56% | 87.98% | 60.95% | 49.42% | 0.7362 | **0.7474 (±0.0208)** | Intermediate |
| **CVD Composite** | **Tuned LR (Calibrated Thresh)** | **0.39** | **68.59%** | **67.67%** | **65.26%** | **70.09%** | **49.63%** | **56.38%** | **0.7362** | **0.7474 (±0.0208)** | **Active Tuned Candidate** |

---

## 3. Best Fine-Tuned Hyperparameters

### Model 1 — Diabetes Diagnosis (Random Forest)
- **Artifact:** `models/diabetes_random_forest_combined_tuned.joblib`
- **Search technique:** `RandomizedSearchCV` (30 iterations, 5-Fold Stratified CV, scoring: `roc_auc`)
- **Selected parameters:**
  ```json
  {
    "model__n_estimators": 350,
    "model__min_samples_split": 2,
    "model__min_samples_leaf": 8,
    "model__max_features": "log2",
    "model__max_depth": 5,
    "model__class_weight": "balanced"
  }
  ```
- **Threshold calibration:** Youden's J optimal is 0.4659; F1 optimal is 0.5900; calibrated balanced threshold is **0.528 (~0.53)**.
- **Key gains:**
  - Hold-out ROC-AUC improved from **0.7507** to **0.7654** (+0.0147).
  - 5-fold CV ROC-AUC improved from **0.7764** to **0.7926** (+0.0162).
  - Sensitivity improved from **54.86%** to **64.58%**.
  - False Negatives dropped from **65** to **51** (14 fewer missed cases).

### Model 2 — CVD Composite (Logistic Regression)
- **Artifact:** `models/cvd_composite_logistic_regression_combined_tuned.joblib`
- **Search technique:** `GridSearchCV` (5-Fold Stratified CV, scoring: `roc_auc`)
- **Selected parameters:**
  ```json
  {
    "model__C": 0.01,
    "model__class_weight": {
      "0": 1.0,
      "1": 1.5
    },
    "model__max_iter": 4000,
    "model__penalty": "l2",
    "model__solver": "lbfgs"
  }
  ```
- **Threshold calibration:** Youden's J optimal is 0.4107; F1 optimal is 0.3700; calibrated balanced threshold is **0.390**.
- **Key gains:**
  - 5-fold CV ROC-AUC improved from **0.7439** to **0.7474**.
  - At the calibrated threshold (0.39), Sensitivity improved from **61.69%** to **65.26%**.
  - F1-score improved from **55.88%** to **56.38%**.
  - False Negatives reduced from **118** to **107** (11 fewer missed CVD condition composite cases).

---

## 4. Historical Daman & Diu-Only Tuning Record (Archival Reference)

> The numbers below reflect an earlier historical experiment conducted exclusively on the small Daman & Diu subsample ($N=991$ total, $N=198$ test split). Preserved for provenance of `models/diabetes_random_forest_tuned_lasi_dd.joblib`.

| Metric | Historical DD Baseline RF | Historical DD Tuned RF | Historical DD Baseline LR |
|---|---:|---:|---:|
| Accuracy | 77.27% | 71.72% | 69.70% |
| Balanced accuracy | 66.46% | 74.77% | 64.22% |
| Sensitivity | 50.00% | 79.41% | 55.88% |
| Specificity | 82.93% | 70.12% | 72.56% |
| Precision | 37.78% | 35.53% | 29.69% |
| F1-score | 43.04% | 49.09% | 38.78% |
| ROC-AUC | 0.7165 | 0.7593 | 0.7626 |

---

## 5. Artifact & Integration Reference

- Tuned Diabetes Model: `models/diabetes_random_forest_combined_tuned.joblib`
- Tuned CVD Model: `models/cvd_composite_logistic_regression_combined_tuned.joblib`
- Full tuning report: `reports/combined_model_tuning.md` and `reports/combined_model_tuning.json`
- Inference helper: `lasi_model_inference.py` (keys: `diabetes_random_forest_tuned`, `cvd_composite_logistic_regression_tuned`)
- Automated verification: `predict_lasi_models.py`
