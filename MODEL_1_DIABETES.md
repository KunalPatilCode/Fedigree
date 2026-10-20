# Fedigree Model 1 — Diabetes Reported-Diagnosis Classifier (Combined Maharashtra + Daman & Diu)

## Candidate Models

- **Active Fine-Tuned Candidate:** `models/diabetes_random_forest_combined_tuned.joblib`
  - Hyperparameters: `n_estimators=350`, `max_depth=5`, `min_samples_leaf=8`, `min_samples_split=2`, `max_features="log2"`, `class_weight="balanced"`
  - Calibrated Decision Threshold: `0.528 (~0.53)`
  - Performance: Hold-out ROC-AUC **0.7654** | Sensitivity **64.58%** | Specificity **75.89%** | 5-Fold CV ROC-AUC **0.7926**
- **Baseline Comparison Candidate:** `models/diabetes_random_forest_combined_baseline.joblib`
  - Hyperparameters: default standard baseline (`n_estimators=300`, `class_weight="balanced_subsample"`, `min_samples_leaf=3`)
  - Threshold: 0.50 | Hold-out ROC-AUC 0.7507 | Sensitivity 54.86% | Specificity 83.57%
- **Historical Daman & Diu-only artifacts:** Preserved in `models/` for provenance.

This model classifies a LASI respondent's **self-reported prior/current diagnosis of diabetes or high blood sugar by a health professional (HT003)**. It does not predict prospective future diabetes risk and is not a clinical diagnostic tool.

---

## Dataset Scope and Target Definition

- **Source:** Authorized LASI Wave 1 Individual-level extracts from **Maharashtra** (`Individual_Maharashtra.xlsx`) and **Daman & Diu** (`Individual_Daman_and_Diu.xlsx`).
- **Respondent counts:**
  - Maharashtra: 3,973 respondents (549 Yes, 3,413 No, 11 missing)
  - Daman & Diu: 991 respondents (171 Yes, 815 No, 5 missing)
  - Combined total: 4,964 respondents
- **Unique respondent identifiers (`prim_key`):** 4,964 (0 internal duplicates, 0 overlapping IDs between states).
- **Target variable:** `HT003`; source coding `1=Yes`, `2=No`. Mapped to binary label `1` (positive) and `0` (negative).
- **Usable target records:** 4,948 (720 Positive / 14.55% prevalence, 4,228 Negative, 16 missing/unresolved excluded).
- **Train/test split:** Stratified 80/20 (`random_state=42`):
  - Training set: 3,958 records (576 Positive, 3,382 Negative)
  - Hold-out test set: 990 records (144 Positive, 846 Negative)
  - Duplicate prevention verified: 0 overlapping respondent IDs across train and test.

---

## Input Feature Contract (11 Fields)

| API field | Source / construction | Representation | Accepted values / encodings |
|---|---|---|---|
| `age_years` | `DM005`, age at last birthday | Numeric | Plausible integer / float (> 0) |
| `sex_code` | `DM003` | Category code | `'1'` (Male), `'2'` (Female) |
| `residence_code` | `residence` | Category code | `'1'` (Urban), `'2'` (Rural) |
| `mpce_quintile` | `mpce_quintile` | Category code | `'1'`, `'2'`, `'3'`, `'4'`, `'5'` |
| `education_level` | Derived from `DM006` and `DM008` | Categorical string | `'0_never_attended'`, `'level_1'` through `'level_9'` |
| `family_history_diabetes` | `FM304` family-member indicators (`fm304s1`–`fm304s7`) | Binary string | `'1'` (any family member positive), `'0'` (no / none flag) |
| `hypertension_history` | `HT002`; `1=Yes`, `2=No` mapped to `'1'` / `'0'` | Binary string | `'1'` (reported hypertension), `'0'` (no) |
| `high_cholesterol_history` | `HT010`; `1=Yes`, `2=No` mapped to `'1'` / `'0'` | Binary string | `'1'` (reported high cholesterol), `'0'` (no) |
| `tobacco_ever` | `HB001`, ever smoked or used smokeless tobacco | Binary string | `'1'` (ever used), `'0'` (never used) |
| `vigorous_activity_frequency` | `HB211` | Category code | `'1'`, `'2'`, `'3'`, `'4'`, `'5'` |
| `moderate_activity_frequency` | `HB213` | Category code | `'1'`, `'2'`, `'3'`, `'4'`, `'5'` |

### Mandatory Target Leakage Prevention
- Target field `HT003` and all downstream question items (`HT003a`–`HT003e`, `HT004*` treatment/medication, `HT005*` age/year of diagnosis) are strictly excluded from the feature matrix.
- `hypertension_history` (`HT002`) and `high_cholesterol_history` (`HT010`) are documented comorbidities, not diabetes indicators.
- Family history is based on relatives (`FM304`), not the respondent's own diagnosis.

---

## Evaluation Metrics (Hold-Out Test Split N=990)

| Metric | LR Baseline | RF Baseline | **RF Tuned (Calibrated Thresh 0.53)** |
|---|---:|---:|---:|
| **Accuracy** | 72.12% | 79.39% | **74.24%** |
| **Balanced accuracy** | 70.43% | 69.22% | **70.23%** |
| **Sensitivity / recall-positive** | 68.06% | 54.86% | **64.58%** |
| **Specificity / recall-negative** | 72.81% | 83.57% | **75.89%** |
| **Precision** | 29.88% | 36.24% | **31.31%** |
| **F1-score** | 41.53% | 43.65% | **42.18%** |
| **ROC-AUC** | 0.7580 | 0.7507 | **0.7654** |
| **5-Fold CV ROC-AUC** | 0.7820 (±0.0205) | 0.7764 (±0.0209) | **0.7926 (±0.0185)** |
| **True Negatives (TN)** | 616 | 707 | **642** |
| **False Positives (FP)** | 230 | 139 | **204** |
| **False Negatives (FN)** | 46 | 65 | **51 (14 fewer missed cases)** |
| **True Positives (TP)** | 98 | 79 | **93** |

---

## Artifact Files

- **Active Tuned Candidate:** `models/diabetes_random_forest_combined_tuned.joblib`
- **Active Combined Baseline:** `models/diabetes_random_forest_combined_baseline.joblib`
- **Comparison Baseline:** `models/diabetes_logistic_regression_combined_baseline.joblib`
- **Historical Daman & Diu-only models:** `models/diabetes_random_forest_tuned_lasi_dd.joblib`, `models/diabetes_random_forest_lasi_dd.joblib`
- **Inference helper:** `lasi_model_inference.py` (key: `diabetes_random_forest_tuned`)
- **Tuning reports:** `reports/combined_model_tuning.md`, `reports/combined_model_tuning.json`, `reports/combined_model_tuning.csv`

---

## Preprocessing Pipeline Architecture

Preprocessing is embedded inside the fitted scikit-learn pipeline:
- **Numeric pipeline (`age_years`):** `SimpleImputer(strategy='median')` -> `StandardScaler()`
- **Categorical pipeline (10 features):** `SimpleImputer(strategy='most_frequent')` -> `OneHotEncoder(handle_unknown='ignore')`
- Imputers and scalers were fit on training data only.
