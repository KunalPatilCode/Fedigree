# Fedigree — Combined Maharashtra + Daman & Diu LASI ML Models

## 1. Project Overview and Objective

This repository contains the machine learning pipelines, model artifacts, inference helpers, and evaluation reports for the **Fedigree** disease-classification tasks.

Both models have been retrained on the combined individual records from **Maharashtra** and **Daman & Diu** from LASI (Longitudinal Ageing Study in India) Wave 1:

- **Model 1 — Diabetes Reported-Diagnosis Classifier:**
  - Active Fine-Tuned Candidate: `models/diabetes_random_forest_combined_tuned.joblib` (Random Forest tuned via 5-fold CV ROC-AUC + calibrated threshold 0.528).
  - Baseline Comparison: `models/diabetes_random_forest_combined_baseline.joblib`.
- **Model 2 — LASI-Defined CVD Composite Classifier:**
  - Active Fine-Tuned Candidate: `models/cvd_composite_logistic_regression_combined_tuned.joblib` (Logistic Regression tuned via 5-fold CV ROC-AUC + calibrated threshold 0.390).
  - Baseline Comparison: `models/cvd_composite_logistic_regression_combined_baseline.joblib`.

> **TUNING STATUS:**
> Systematic 5-fold CV hyperparameter search and threshold calibration have been executed across the combined Maharashtra + Daman & Diu dataset (N=4,964; N=4,948 usable). Historical Daman & Diu-only model artifacts (`models/*lasi_dd*.joblib`) and combined baseline models (`models/*combined_baseline*.joblib`) remain fully preserved for comparison. Full tuning metrics are available in [`reports/combined_model_tuning.md`](file:///e:/fedigree_lasi_dd_models/reports/combined_model_tuning.md) and [`TUNING_SUMMARY.md`](file:///e:/fedigree_lasi_dd_models/TUNING_SUMMARY.md).

---

## 2. Dataset Scope and Data Audit Summary

Data was extracted from two authorized LASI Wave 1 Individual-level XLSX extracts:
- `data/Individual_Maharashtra.xlsx`
- `data/Individual_Daman_and_Diu.xlsx`

Both files contain **2,623 columns** in identical order and use identical questionnaire definitions, variable names, category encodings, and missing-value conventions. Compatible records were appended row-wise.

### Respondent Counts Before and After Combining

| Dataset Extract | Total Rows | Total Columns | State Value | Unique Respondent IDs | Duplicate IDs | Usable Diabetes Labels | Usable CVD Composite Labels |
|---|---:|---:|---|---:|---:|---:|---:|
| `Individual_Daman_and_Diu.xlsx` | 991 | 2,623 | Daman and Diu (stateid=25) | 991 | 0 | 986 | 986 |
| `Individual_Maharashtra.xlsx` | 3,973 | 2,623 | Maharashtra (stateid=27) | 3,973 | 0 | 3,962 | 3,962 |
| **Combined Dataset** | **4,964** | **2,623** | **Maharashtra + Daman & Diu** | **4,964** | **0** | **4,948** | **4,948** |

- **Duplicate / overlap check:** Exactly 0 overlapping respondent IDs (`prim_key`) between Maharashtra and Daman & Diu.
- **Missing respondent IDs:** 0 missing IDs across both datasets.

### Target Distributions in Combined Dataset

1. **Model 1 — Diabetes (`ht003`):**
   - Definition: Self-reported diagnosis of diabetes or high blood sugar by a health professional (`1=Yes`, `2=No`).
   - Distribution: 720 Yes (14.55% prevalence), 4,228 No, 16 missing/unresolved excluded.
   - Total usable: **4,948 respondents**.
   - Note: This classifies reported diagnosis; it is **NOT** a prospective predictor of future diabetes risk.

2. **Model 2 — CVD Composite (`ht002 OR ht006 OR ht007`):**
   - Definition: Positive if any of hypertension (`ht002`), chronic heart disease (`ht006`), or stroke (`ht007`) is reported as Yes (`1`). Negative only when all three are explicitly No (`2`).
   - Distribution: 1,538 Positive (31.08% prevalence), 3,410 Negative, 16 missing/unresolved excluded.
   - Total usable: **4,948 respondents**.
   - Note: This is a broad condition composite; it is **NOT** CAD-specific and **NOT** a prospective 10-year cardiovascular risk score.
   - Standalone `ht006` chronic heart disease: 209 positive reports across both states (182 in Maharashtra, 27 in Daman & Diu).

---

## 3. Input Feature Contracts and Leakage Prevention

### Model 1 — Diabetes (11 Features)
1. `age_years` (from `dm005`, numeric)
2. `sex_code` (from `dm003`, `'1'` Male, `'2'` Female)
3. `residence_code` (from `residence`, `'1'` Urban, `'2'` Rural)
4. `mpce_quintile` (from `mpce_quintile`, `'1'`–`'5'`)
5. `education_level` (derived from `dm006`, `dm008`, `'0_never_attended'` or `'level_<1-9>'`)
6. `family_history_diabetes` (from `fm304s1`–`fm304s7`, `'0'`/`'1'`)
7. `hypertension_history` (from `ht002`, `'0'`/`'1'`)
8. `high_cholesterol_history` (from `ht010`, `'0'`/`'1'`)
9. `tobacco_ever` (from `hb001`, `'0'`/`'1'`)
10. `vigorous_activity_frequency` (from `hb211`, `'1'`–`'5'`)
11. `moderate_activity_frequency` (from `hb213`, `'1'`–`'5'`)

*Leakage Prevention:* `ht003` and downstream interview variables (`ht003a-e`, `ht004*`, `ht005*`) are strictly excluded from inputs.

### Model 2 — CVD Composite (13 Features)
1. `age_years` (from `dm005`, numeric)
2. `sex_code` (from `dm003`, `'1'` Male, `'2'` Female)
3. `residence_code` (from `residence`, `'1'` Urban, `'2'` Rural)
4. `mpce_quintile` (from `mpce_quintile`, `'1'`–`'5'`)
5. `education_level` (derived from `dm006`, `dm008`, `'0_never_attended'` or `'level_<1-9>'`)
6. `family_history_hypertension` (from `fm303s1`–`fm303s7`, `'0'`/`'1'`)
7. `family_history_heart_disease` (from `fm305s1`–`fm305s7`, `'0'`/`'1'`)
8. `family_history_stroke` (from `fm306s1`–`fm306s7`, `'0'`/`'1'`)
9. `diabetes_reported` (from `ht003`, `'0'`/`'1'`)
10. `high_cholesterol_history` (from `ht010`, `'0'`/`'1'`)
11. `tobacco_ever` (from `hb001`, `'0'`/`'1'`)
12. `vigorous_activity_frequency` (from `hb211`, `'1'`–`'5'`)
13. `moderate_activity_frequency` (from `hb213`, `'1'`–`'5'`)

*Leakage Prevention:* Outcome-defining fields `ht002`, `ht006`, `ht007` and all their downstream questions are strictly excluded from inputs.

---

## 4. Training and Evaluation Methodology

- **Train/Test Split:** Stratified 80/20 hold-out split (`test_size=0.20`, `random_state=42`):
  - Training set: **3,958 respondents** (80%)
  - Hold-out test set: **990 respondents** (20%)
  - Zero duplicate respondent IDs across train and test.
- **Preprocessing:** Embedded in pipeline; fit on training data only:
  - Numeric (`age_years`): `SimpleImputer(strategy='median')` -> `StandardScaler()`
  - Categoricals: `SimpleImputer(strategy='most_frequent')` -> `OneHotEncoder(handle_unknown='ignore')`
- **Cross-Validation:** 5-fold Stratified cross-validation on the 80% training partition (`StratifiedKFold`, `random_state=42`).
- **Baseline Hyperparameters:**
  - Logistic Regression: `max_iter=2000`, `class_weight='balanced'`, `random_state=42`
  - Random Forest: `n_estimators=300`, `class_weight='balanced_subsample'`, `min_samples_leaf=3`, `random_state=42`, `n_jobs=-1`

---

## 5. Hold-Out Baseline Evaluation Results (N=990)

Metrics on the 20% untouched hold-out test set (unweighted exploratory survey-sample metrics):

| Task | Baseline Algorithm | Accuracy | Balanced Acc | Sensitivity | Specificity | Precision | F1-Score | ROC-AUC | TN | FP | FN | TP |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **Diabetes** | Logistic Regression | 72.12% | 70.43% | 68.06% | 72.81% | 29.88% | 41.53% | 0.7580 | 616 | 230 | 46 | 98 |
| **Diabetes** | **Random Forest (Candidate)** | **79.39%** | **69.22%** | **54.86%** | **83.57%** | **36.24%** | **43.65%** | **0.7507** | **707** | **139** | **65** | **79** |
| **CVD Composite** | **Logistic Regression (Candidate)** | **69.70%** | **67.50%** | **61.69%** | **73.31%** | **51.08%** | **55.88%** | **0.7386** | **500** | **182** | **118** | **190** |
| **CVD Composite** | Random Forest | 73.23% | 67.93% | 53.90% | 81.96% | 57.44% | 55.61% | 0.7277 | 559 | 123 | 142 | 166 |

### Training Split 5-Fold Cross-Validation Metrics (N=3,958)

| Task | Algorithm | CV Accuracy | CV Balanced Acc | CV Sensitivity | CV Specificity | CV Precision | CV F1-Score | CV ROC-AUC |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| **Diabetes** | Logistic Regression | 73.04% (±1.25%) | 71.84% (±2.26%) | 70.15% (±4.69%) | 73.54% (±1.46%) | 31.11% (±1.60%) | 43.08% (±2.21%) | 0.7820 (±0.0205) |
| **Diabetes** | Random Forest | 79.28% (±0.83%) | 68.58% (±1.83%) | 53.49% (±4.69%) | 83.68% (±1.47%) | 35.84% (±1.34%) | 42.84% (±2.00%) | 0.7764 (±0.0209) |
| **CVD Composite** | Logistic Regression | 70.21% (±1.77%) | 68.19% (±2.06%) | 62.85% (±3.70%) | 73.53% (±2.05%) | 51.74% (±2.37%) | 56.72% (±2.53%) | 0.7439 (±0.0210) |
| **CVD Composite** | Random Forest | 71.73% (±1.80%) | 67.57% (±2.89%) | 56.59% (±5.92%) | 78.56% (±0.86%) | 54.21% (±2.41%) | 55.32% (±4.02%) | 0.7391 (±0.0245) |

### Candidate Selection Decision Rationale

- **Model 1 (Diabetes):** Random Forest is retained as the candidate baseline algorithm. It delivers 79.39% accuracy, 83.57% specificity, and 43.65% F1-score with 139 false positives (vs 230 for Logistic Regression). Logistic Regression yields higher sensitivity (68.06% vs 54.86%) due to balanced weighting.
- **Model 2 (CVD Composite):** Logistic Regression is retained as the candidate baseline algorithm. It achieves superior sensitivity (61.69% vs 53.90%), higher ROC-AUC (0.7386 vs 0.7277), and higher F1-score (55.88% vs 55.61%) compared to Random Forest, reinforced by higher 5-fold CV ROC-AUC (0.7439 vs 0.7391).

---

## 6. Regional Evaluation Breakdown (Hold-Out Test Split)

Performance evaluated separately on the 990-sample hold-out split for each region:

| Task | Model | Region | Test N | Pos / Neg | Accuracy | Balanced Acc | Sensitivity | Specificity | Precision | F1-Score | ROC-AUC |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **Diabetes** | Logistic Regression | Maharashtra | 802 | 108 / 694 | 73.57% | 71.04% | 67.59% | 74.50% | 29.20% | 40.78% | 0.7635 |
| **Diabetes** | Logistic Regression | Daman & Diu | 188 | 36 / 152 | 65.96% | 67.29% | 69.44% | 65.13% | 32.05% | 43.86% | 0.7209 |
| **Diabetes** | **Random Forest** | **Maharashtra** | **802** | **108 / 694** | **80.55%** | **69.61%** | **54.63%** | **84.58%** | **35.54%** | **43.07%** | **0.7566** |
| **Diabetes** | **Random Forest** | **Daman & Diu** | **188** | **36 / 152** | **74.47%** | **67.25%** | **55.56%** | **78.95%** | **38.46%** | **45.45%** | **0.7190** |
| **CVD Composite** | **Logistic Regression** | **Maharashtra** | **810** | **246 / 564** | **70.37%** | **67.95%** | **61.79%** | **74.11%** | **51.01%** | **55.88%** | **0.7451** |
| **CVD Composite** | **Logistic Regression** | **Daman & Diu** | **180** | **62 / 118** | **66.67%** | **65.39%** | **61.29%** | **69.49%** | **51.35%** | **55.88%** | **0.7080** |
| **CVD Composite** | Random Forest | Maharashtra | 810 | 246 / 564 | 74.44% | 68.81% | 54.47% | 83.16% | 58.52% | 56.42% | 0.7379 |
| **CVD Composite** | Random Forest | Daman & Diu | 180 | 62 / 118 | 67.78% | 63.94% | 51.61% | 76.27% | 53.33% | 52.46% | 0.6848 |

Both regions contain sufficient test cases for valid evaluation. Discrimination remains stable across both territories (ROC-AUC 0.72–0.76 for Diabetes; 0.71–0.75 for CVD in LR), with Maharashtra metrics slightly higher due to representing ~80% of the combined training data.

---

## 7. Survey Weights Analysis

- `stateindividualweight` expands to the state population: mean weight is **6,520.52** for Maharashtra (~25.9M adults) and **34.25** for Daman & Diu (~34,000 adults).
- `indiaindividualweight` expands to the national population: mean weight is **7,341.20** for Maharashtra and **35.70** for Daman & Diu.
- Primary reported metrics are unweighted exploratory results from an 80/20 stratified split.
- Exploratory weighted hold-out metrics using normalized national individual weights (`indiaindividualweight`):
  - Diabetes RF: Weighted ROC-AUC = 0.7778, Weighted Balanced Acc = 71.10%
  - Diabetes LR: Weighted ROC-AUC = 0.7816, Weighted Balanced Acc = 72.22%
  - CVD LR: Weighted ROC-AUC = 0.7411, Weighted Balanced Acc = 67.92%
  - CVD RF: Weighted ROC-AUC = 0.7288, Weighted Balanced Acc = 66.12%
- Complex survey design variance estimation (strata/PSU clusters) requires dedicated survey software (e.g., R `survey` package or Python `statsmodels`), which standard scikit-learn does not implement.

---

## 8. Artifact Inventory

### Active Fine-Tuned Models (Maharashtra + Daman & Diu)
- `models/diabetes_random_forest_combined_tuned.joblib` (Model 1 Active Tuned Candidate)
- `models/cvd_composite_logistic_regression_combined_tuned.joblib` (Model 2 Active Tuned Candidate)

### Active Combined Baseline Models
- `models/diabetes_random_forest_combined_baseline.joblib` (Model 1 Comparison Baseline)
- `models/diabetes_logistic_regression_combined_baseline.joblib` (Model 1 Comparison)
- `models/cvd_composite_logistic_regression_combined_baseline.joblib` (Model 2 Comparison Baseline)
- `models/cvd_composite_random_forest_combined_baseline.joblib` (Model 2 Comparison)

### Preserved Historical Daman & Diu-Only Baselines
- `models/diabetes_random_forest_tuned_lasi_dd.joblib`
- `models/diabetes_random_forest_lasi_dd.joblib`
- `models/diabetes_logistic_regression_lasi_dd.joblib`
- `models/cvd_composite_logistic_regression_lasi_dd.joblib`
- `models/cvd_composite_random_forest_lasi_dd.joblib`

### Generated Reports
- `reports/combined_model_tuning.md` (Tuning comparison & breakdown)
- `reports/combined_model_tuning.json` (Structured tuning results)
- `reports/combined_model_tuning.csv` (Tabular comparison)
- `reports/combined_data_audit.json`
- `reports/combined_model_metrics.csv`
- `reports/combined_model_metrics.json`
- `reports/combined_model_comparison.md`
- `reports/regional_evaluation.csv`
- `reports/regional_evaluation.json`
- `reports/inference_smoke_test.txt`

---

## 9. How to Reproduce Locally

1. Place both authorized Excel files in the `data/` directory:
   - `data/Individual_Daman_and_Diu.xlsx`
   - `data/Individual_Maharashtra.xlsx`
2. Activate your virtual environment:
   ```powershell
   .\.venv\Scripts\Activate.ps1
   ```
3. Install requirements:
   ```bash
   pip install -r requirements.txt
   ```
4. Run baseline training pipeline:
   ```bash
   python train_lasi_models.py
   ```
5. Run the combined fine-tuning pipeline:
   ```bash
   python tune_combined_models.py
   ```
6. Run the inference smoke test:
   ```bash
   python predict_lasi_models.py
   ```

---

## 10. Limitations and Clinical Disclaimer

- **Survey diagnosis classification:** Outcomes are self-reported physician diagnoses from survey interviews, not clinical laboratory tests or prospective incident events.
- **No fine-tuning:** Models are fresh baselines. Fine-tuning of decision thresholds and tree parameters will occur in a separate subsequent phase.
- **Not a clinical tool:** Output probabilities are model scores, not validated clinical risk percentages. Do **NOT** use for clinical triage, diagnosis, or treatment decisions.
- **Data protection:** Raw Excel workbooks, respondent IDs, and microdata are strictly excluded by `.gitignore` and must not be published.
