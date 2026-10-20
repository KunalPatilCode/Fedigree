# Fedigree — Combined LASI Model Fine-Tuning Report

This report documents the systematic fine-tuning of the selected baseline candidates:
- **Model 1 (Diabetes Diagnosis):** Random Forest tuned via 5-fold CV `RandomizedSearchCV` and decision threshold optimization.
- **Model 2 (CVD Composite):** Logistic Regression tuned via 5-fold CV `GridSearchCV` and decision threshold optimization.

Data scope: Combined **Maharashtra** (3,973) + **Daman & Diu** (991) = 4,964 respondents (4,948 usable labels).
Evaluation split: Stratified 80/20 hold-out (3,958 train, 990 test; `random_state=42`).

---

## 1. Executive Comparison: Baseline vs Tuned Candidates (Hold-Out Test Split N=990)

| Task | Algorithm & Configuration | Threshold | Accuracy | Balanced Acc | Sensitivity | Specificity | Precision | F1-Score | ROC-AUC | TN | FP | FN | TP |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **Diabetes** | Baseline Random Forest | 0.50 | 79.39% | 69.22% | 54.86% | 83.57% | 36.24% | 43.65% | 0.7507 | 707 | 139 | 65 | 79 |
| **Diabetes** | Tuned RF (Default Threshold) | 0.50 | 72.93% | 70.62% | 67.36% | 73.88% | 30.50% | 41.99% | 0.7654 | 625 | 221 | 47 | 97 |
| **Diabetes** | **Tuned RF (Calibrated Threshold)** | 0.53 | 74.24% | 70.23% | 64.58% | 75.89% | 31.31% | 42.18% | 0.7654 | 642 | 204 | 51 | 93 |
| **CVD Composite** | Baseline Logistic Regression | 0.50 | 69.70% | 67.50% | 61.69% | 73.31% | 51.08% | 55.88% | 0.7386 | 500 | 182 | 118 | 190 |
| **CVD Composite** | Tuned LR (Default Threshold) | 0.50 | 73.54% | 64.77% | 41.56% | 87.98% | 60.95% | 49.42% | 0.7362 | 600 | 82 | 180 | 128 |
| **CVD Composite** | **Tuned LR (Calibrated Threshold)** | 0.39 | 68.59% | 67.67% | 65.26% | 70.09% | 49.63% | 56.38% | 0.7362 | 478 | 204 | 107 | 201 |

---

## 2. Model 1: Diabetes Diagnosis (Random Forest Tuning Details)

### Hyperparameters Selected (5-Fold CV ROC-AUC Refit)
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

- **5-Fold Training CV ROC-AUC:** 0.7926 (±0.0185)
- **Decision Threshold Calibrated:** `0.528` (Youden's J optimal: 0.4659, F1 optimal: 0.59)
- **Sensitivity Impact:** Sensitivity improved from **54.86%** (baseline) to **64.58%** (calibrated tuned).
- **False Negatives Reduction:** Missed diabetes cases reduced from **65** to **51**.

---

## 3. Model 2: CVD Composite (Logistic Regression Tuning Details)

### Hyperparameters Selected (5-Fold CV ROC-AUC Refit)
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

- **5-Fold Training CV ROC-AUC:** 0.7474 (±0.0208)
- **Decision Threshold Calibrated:** `0.39` (Youden's J optimal: 0.4107, F1 optimal: 0.37)
- **ROC-AUC on Hold-Out:** **0.7362**

---

## 4. Regional Performance Breakdown (Tuned Models on Test Split)

| Task | Region | Configuration | Threshold | Accuracy | Balanced Acc | Sensitivity | Specificity | Precision | F1-Score | ROC-AUC |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Diabetes (RF Tuned) | Maharashtra | Default 0.50 | 0.50 | 74.44% | 71.16% | 66.67% | 75.65% | 29.88% | 41.26% | 0.7715 |
| Diabetes (RF Tuned) | Maharashtra | **Calibrated** | 0.53 | **75.56%** | **71.02%** | **64.81%** | **77.23%** | **30.70%** | **41.67%** | **0.7715** |
| Diabetes (RF Tuned) | Daman and Diu | Default 0.50 | 0.50 | 66.49% | 67.62% | 69.44% | 65.79% | 32.47% | 44.25% | 0.7274 |
| Diabetes (RF Tuned) | Daman and Diu | **Calibrated** | 0.53 | **68.62%** | **66.81%** | **63.89%** | **69.74%** | **33.33%** | **43.81%** | **0.7274** |
| CVD Composite (LR Tuned) | Maharashtra | Default 0.50 | 0.50 | 74.44% | 65.38% | 42.28% | 88.48% | 61.54% | 50.12% | 0.7442 |
| CVD Composite (LR Tuned) | Maharashtra | **Calibrated** | 0.39 | **69.01%** | **67.78%** | **64.63%** | **70.92%** | **49.23%** | **55.89%** | **0.7442** |
| CVD Composite (LR Tuned) | Daman and Diu | Default 0.50 | 0.50 | 69.44% | 62.15% | 38.71% | 85.59% | 58.54% | 46.60% | 0.6946 |
| CVD Composite (LR Tuned) | Daman and Diu | **Calibrated** | 0.39 | **66.67%** | **66.92%** | **67.74%** | **66.10%** | **51.22%** | **58.33%** | **0.6946** |

---

## 5. Summary & Handover Notice

- Active tuned model artifacts saved in `models/`:
  - `models\diabetes_random_forest_combined_tuned.joblib`
  - `models\cvd_composite_logistic_regression_combined_tuned.joblib`
- Both models maintain strict schema validation contracts with preprocessors self-contained in pipelines.
- **Safety Disclaimer:** Models classify self-reported survey conditions. Not clinically validated. Do not deploy for clinical triage, diagnosis, or medication prescription.