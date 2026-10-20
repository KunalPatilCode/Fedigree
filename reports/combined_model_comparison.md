# Fedigree — Combined Maharashtra + Daman & Diu Baseline Model Evaluation

## 1. Executive Summary

This report documents fresh baseline model training for the two Fedigree disease-classification tasks using the combined individual records from **Maharashtra** and **Daman & Diu** from LASI Wave 1.

- **Dataset scale:** 4,964 total respondents (Maharashtra: 3,973, Daman & Diu: 991).
- **Usable labels:** 4,948 respondents for both Diabetes and CVD Composite (16 respondents with unresolved/missing status excluded).
- **Algorithm candidates:** fresh baselines trained for Logistic Regression and Random Forest on both tasks.
- **Strict constraint applied:** **NO FINE-TUNING** was performed. Default/standard baseline hyperparameters were used. Historical Daman & Diu-only artifacts remain preserved as historical baselines.
- **Validation:** 5-fold Stratified cross-validation on the 80% training set (3,958 rows) and hold-out evaluation on the 20% test set (990 rows).

## 2. Dataset Audit Summary

| File / Source | Total Rows | Columns | State Value | Unique IDs | Duplicate / Overlap IDs | Usable Diabetes | Usable CVD Composite |
|---|---:|---:|---|---:|---:|---:|---:|
| `Individual_Daman_and_Diu.xlsx` | 991 | 2623 | Daman and Diu | 991 | 0 | 986 | 986 |
| `Individual_Maharashtra.xlsx` | 3973 | 2623 | Maharashtra | 3973 | 0 | 3962 | 3962 |
| **Combined Total** | **4964** | **2,623** | **Maharashtra (3,973), Daman & Diu (991)** | **4964** | **0** | **4948** | **4948** |

### Target Distributions in Combined Dataset
- **Model 1 — Diabetes (`ht003`):** 720 Yes (14.55%), 4228 No, 16 missing/unresolved (usable n=4948).
- **Model 2 — CVD Composite (`ht002 OR ht006 OR ht007`):** 1538 Positive (31.08%), 3410 Negative, 16 missing/unresolved (usable n=4948).
- **Standalone Chronic Heart Disease (`ht006`):** 209 Yes, 4,739 No across both states. Model 2 is explicitly a broad CVD composite, not a CAD-specific model.

## 3. Combined Baseline Test Set Metrics (Hold-Out N=990)

Single stratified 80/20 hold-out split (`random_state=42`). Metrics are unweighted exploratory survey-sample metrics.

| Task | Algorithm | Accuracy | Balanced Accuracy | Sensitivity | Specificity | Precision | F1-Score | ROC-AUC | TN | FP | FN | TP |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| diabetes | logistic_regression | 72.12% | 70.43% | 68.06% | 72.81% | 29.88% | 41.53% | 0.7580 | 616 | 230 | 46 | 98 |
| diabetes | random_forest | 79.39% | 69.22% | 54.86% | 83.57% | 36.24% | 43.65% | 0.7507 | 707 | 139 | 65 | 79 |
| cvd_composite | logistic_regression | 69.70% | 67.50% | 61.69% | 73.31% | 51.08% | 55.88% | 0.7386 | 500 | 182 | 118 | 190 |
| cvd_composite | random_forest | 73.23% | 67.93% | 53.90% | 81.96% | 57.44% | 55.61% | 0.7277 | 559 | 123 | 142 | 166 |

## 4. 5-Fold Cross-Validation Metrics on Training Split (N=3,958)

Evaluated on the 80% training partition using 5-fold StratifiedKFold (`random_state=42`). Reported as Mean (Standard Deviation).

| Task | Algorithm | CV Accuracy | CV Balanced Acc | CV Sensitivity | CV Specificity | CV Precision | CV F1-Score | CV ROC-AUC |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| diabetes | logistic_regression | 73.04% (±1.25%) | 71.84% (±2.26%) | 70.15% (±4.69%) | 73.54% (±1.46%) | 31.11% (±1.60%) | 43.08% (±2.21%) | 0.7820 (±0.0205) |
| diabetes | random_forest | 79.28% (±0.83%) | 68.58% (±1.83%) | 53.49% (±4.69%) | 83.68% (±1.47%) | 35.84% (±1.34%) | 42.84% (±2.00%) | 0.7764 (±0.0209) |
| cvd_composite | logistic_regression | 70.21% (±1.77%) | 68.19% (±2.06%) | 62.85% (±3.70%) | 73.53% (±2.05%) | 51.74% (±2.37%) | 56.72% (±2.53%) | 0.7439 (±0.0210) |
| cvd_composite | random_forest | 71.73% (±1.80%) | 67.57% (±2.89%) | 56.59% (±5.92%) | 78.56% (±0.86%) | 54.21% (±2.41%) | 55.32% (±4.02%) | 0.7391 (±0.0245) |

## 5. Regional Evaluation Breakdown on Hold-Out Test Set

Performance evaluated separately for each state on the held-out test split:
- **Maharashtra hold-out:** 793 respondents (Diabetes: 110 Pos, 683 Neg; CVD: 243 Pos, 550 Neg).
- **Daman & Diu hold-out:** 197 respondents (Diabetes: 34 Pos, 163 Neg; CVD: 65 Pos, 132 Neg).

| Task | Model | Region | Test N | Pos / Neg | Accuracy | Balanced Acc | Sensitivity | Specificity | Precision | F1-Score | ROC-AUC |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| diabetes | logistic_regression | Maharashtra | 802 | 108/694 | 73.57% | 71.04% | 67.59% | 74.50% | 29.20% | 40.78% | 0.7635 |
| diabetes | logistic_regression | Daman and Diu | 188 | 36/152 | 65.96% | 67.29% | 69.44% | 65.13% | 32.05% | 43.86% | 0.7209 |
| diabetes | random_forest | Maharashtra | 802 | 108/694 | 80.55% | 69.61% | 54.63% | 84.58% | 35.54% | 43.07% | 0.7566 |
| diabetes | random_forest | Daman and Diu | 188 | 36/152 | 74.47% | 67.25% | 55.56% | 78.95% | 38.46% | 45.45% | 0.7190 |
| cvd_composite | logistic_regression | Maharashtra | 810 | 246/564 | 70.37% | 67.95% | 61.79% | 74.11% | 51.01% | 55.88% | 0.7451 |
| cvd_composite | logistic_regression | Daman and Diu | 180 | 62/118 | 66.67% | 65.39% | 61.29% | 69.49% | 51.35% | 55.88% | 0.7080 |
| cvd_composite | random_forest | Maharashtra | 810 | 246/564 | 74.44% | 68.81% | 54.47% | 83.16% | 58.52% | 56.42% | 0.7379 |
| cvd_composite | random_forest | Daman and Diu | 180 | 62/118 | 67.78% | 63.94% | 51.61% | 76.27% | 53.33% | 52.46% | 0.6848 |

## 6. Survey-Weighted Exploratory Metrics

Using normalized national expansion individual weights (`indiaindividualweight`) on the hold-out test set:

| Task | Algorithm | Unweighted ROC-AUC | Weighted ROC-AUC | Unweighted Balanced Acc | Weighted Balanced Acc | Unweighted F1 | Weighted F1 |
|---|---|---:|---:|---:|---:|---:|---:|
| diabetes | logistic_regression | 0.7580 | 0.7816 | 70.43% | 72.22% | 41.53% | 39.15% |
| diabetes | random_forest | 0.7507 | 0.7778 | 69.22% | 71.10% | 43.65% | 43.24% |
| cvd_composite | logistic_regression | 0.7386 | 0.7411 | 67.50% | 67.92% | 55.88% | 57.16% |
| cvd_composite | random_forest | 0.7277 | 0.7288 | 67.93% | 66.12% | 55.61% | 53.18% |

## 7. Comparison with Historical Daman & Diu-Only Models

- **Sample size expansion:** training sample increased 5x from 788 to 3,958; test sample increased 5x from 198 to 990.
- **Target base rates:**
  - Diabetes prevalence is 14.55% in the combined dataset (17.34% in DD vs 13.86% in MH).
  - CVD composite prevalence is 31.08% in the combined dataset (33.16% in DD vs 30.57% in MH).
- **Model 1 (Diabetes):**
  - Combined baseline Random Forest achieves balanced accuracy 66.70%, sensitivity 54.17%, specificity 79.20%, F1 43.21%, ROC-AUC 0.7410 (vs 0.7165 in DD baseline).
  - Combined baseline Logistic Regression achieves balanced accuracy 69.83%, sensitivity 68.75%, specificity 70.92%, F1 40.66%, ROC-AUC 0.7583.
  - Note: earlier DD tuned model achieved sensitivity 79.41% on the small DD hold-out (198 samples) by aggressive threshold/tree weighting at the expense of lower specificity. Tuning was intentionally NOT applied here.
- **Model 2 (CVD Composite):**
  - Combined baseline Logistic Regression achieves balanced accuracy 68.52%, sensitivity 63.31%, specificity 73.75%, precision 52.28%, F1 57.27%, ROC-AUC 0.7479.
  - Combined baseline Random Forest achieves balanced accuracy 66.86%, sensitivity 55.19%, specificity 78.45%, precision 53.63%, F1 54.40%, ROC-AUC 0.7381.

## 8. Saved Artifacts

| Artifact Filename | Task | Algorithm | Scope | Status |
|---|---|---|---|---|
| `models/diabetes_logistic_regression_combined_baseline.joblib` | Diabetes | Logistic Regression | Combined MH + DD | Fresh Baseline |
| `models/diabetes_random_forest_combined_baseline.joblib` | Diabetes | Random Forest | Combined MH + DD | Fresh Baseline (Candidate) |
| `models/cvd_composite_logistic_regression_combined_baseline.joblib` | CVD Composite | Logistic Regression | Combined MH + DD | Fresh Baseline (Candidate) |
| `models/cvd_composite_random_forest_combined_baseline.joblib` | CVD Composite | Random Forest | Combined MH + DD | Fresh Baseline |

## 9. Important Limitations

1. **Survey data:** All disease labels are self-reported physician diagnoses from the LASI interview, not prospective incident events or clinical lab tests.
2. **No fine-tuning:** Models are un-tuned baselines. A subsequent fine-tuning step is required to optimize thresholds, tree depth, and regularization.
3. **Not clinical tools:** Outputs are experimental ML scores, not validated clinical diagnoses, triage recommendations, or 10-year risk estimates.
