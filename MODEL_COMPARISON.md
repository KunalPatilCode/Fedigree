# Fedigree LASI Model Comparison — Combined Maharashtra + Daman & Diu Baselines & Tuned Models

## Model Artifact Selection Summary

| Task | Baseline Artifact | Fine-Tuned Artifact | Selected Algorithm | Fine-Tuning Performance Gain |
|---|---|---|---|---|
| **Model 1: Diabetes Diagnosis** | `models/diabetes_random_forest_combined_baseline.joblib` | `models/diabetes_random_forest_combined_tuned.joblib` | Random Forest | Test ROC-AUC up from 0.7507 to **0.7654** (+0.0147); 5-fold CV ROC-AUC up to **0.7926**; Sensitivity up to **64.58%**; False negatives down from 65 to **51**. |
| **Model 2: CVD Composite** | `models/cvd_composite_logistic_regression_combined_baseline.joblib` | `models/cvd_composite_logistic_regression_combined_tuned.joblib` | Logistic Regression | 5-fold CV ROC-AUC up to **0.7474**; Sensitivity up from 61.69% to **65.26%**; F1-score up to **56.38%**; False negatives down from 118 to **107**. |

---

## Benchmark Comparison Table (Hold-Out Test Split N=990)

| Task | Model Configuration | Threshold | Accuracy | Balanced Accuracy | Sensitivity | Specificity | Precision | F1-Score | Test ROC-AUC | Train 5-Fold CV ROC-AUC |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **Diabetes** | Baseline Logistic Regression | 0.50 | 72.12% | 70.43% | 68.06% | 72.81% | 29.88% | 41.53% | 0.7580 | 0.7820 (±0.0205) |
| **Diabetes** | Baseline Random Forest | 0.50 | 79.39% | 69.22% | 54.86% | 83.57% | 36.24% | 43.65% | 0.7507 | 0.7764 (±0.0209) |
| **Diabetes** | Tuned RF (Default Thresh) | 0.50 | 72.93% | 70.62% | 67.36% | 73.88% | 30.50% | 41.99% | **0.7654** | **0.7926 (±0.0185)** |
| **Diabetes** | **Tuned RF (Calibrated Thresh)** | **0.53** | **74.24%** | **70.23%** | **64.58%** | **75.89%** | **31.31%** | **42.18%** | **0.7654** | **0.7926 (±0.0185)** |
| **CVD Composite** | Baseline Logistic Regression | 0.50 | 69.70% | 67.50% | 61.69% | 73.31% | 51.08% | 55.88% | 0.7386 | 0.7439 (±0.0210) |
| **CVD Composite** | Baseline Random Forest | 0.50 | 73.23% | 67.93% | 53.90% | 81.96% | 57.44% | 55.61% | 0.7277 | 0.7391 (±0.0245) |
| **CVD Composite** | Tuned LR (Default Thresh) | 0.50 | 73.54% | 64.77% | 41.56% | 87.98% | 60.95% | 49.42% | 0.7362 | **0.7474 (±0.0208)** |
| **CVD Composite** | **Tuned LR (Calibrated Thresh)** | **0.39** | **68.59%** | **67.67%** | **65.26%** | **70.09%** | **49.63%** | **56.38%** | **0.7362** | **0.7474 (±0.0208)** |

---

## Dataset Scale and Evaluation Conditions

- **Scope:** Combined individual records from Maharashtra (3,973) and Daman & Diu (991) = 4,964 total respondents.
- **Usable records:** 4,948 for each task (16 missing/unresolved excluded).
- **Split:** 80/20 stratified hold-out split (3,958 training, 990 test; `random_state=42`).
- **Tuning methodology:**
  - Random Forest tuned via `RandomizedSearchCV` (30 iterations) on 5-fold CV ROC-AUC + out-of-fold threshold calibration.
  - Logistic Regression tuned via `GridSearchCV` on 5-fold CV ROC-AUC + out-of-fold threshold calibration.
- **Historical baselines:** Daman & Diu-only models are preserved in `models/` for reference and backward compatibility.
- **Limitations:** Exploratory survey-sample metrics. Outcomes are self-reported diagnoses. Not clinically validated; do not deploy for medical decision-making.
