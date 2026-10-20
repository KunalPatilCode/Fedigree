# Fedigree Model 2 — LASI-Defined CVD Composite Classifier (Combined Maharashtra + Daman & Diu)

## Candidate Models

- **Active Fine-Tuned Candidate:** `models/cvd_composite_logistic_regression_combined_tuned.joblib`
  - Hyperparameters: `C=0.01`, `penalty="l2"`, `class_weight={0: 1.0, 1: 1.5}`, `solver="lbfgs"`, `max_iter=4000`
  - Calibrated Decision Threshold: `0.390`
  - Performance: Hold-out Sensitivity **65.26%** | Hold-out ROC-AUC **0.7362** | 5-Fold CV ROC-AUC **0.7474** | F1-Score **56.38%**
- **Baseline Comparison Candidate:** `models/cvd_composite_logistic_regression_combined_baseline.joblib`
  - Hyperparameters: standard baseline (`max_iter=2000`, `class_weight="balanced"`)
  - Threshold: 0.50 | Hold-out Sensitivity 61.69% | Hold-out ROC-AUC 0.7386
- **Historical Daman & Diu-only artifacts:** Preserved in `models/` for provenance.

This model classifies a broad LASI-defined **self-reported condition composite (hypertension OR chronic heart disease OR stroke)**. It is **NOT** a CAD-specific model and is **NOT** a future or 10-year cardiovascular-risk prediction tool.

---

## Dataset Scope and Target Definition

The composite target is positive (`1`) if any of these three LASI diagnosis items is reported as Yes (`1`):
- `HT002`: Hypertension / high blood pressure
- `HT006`: Chronic heart disease
- `HT007`: Stroke

The composite is negative (`0`) only when all three source items are explicitly No (`2`). Rows with unknown/missing target status in any component without a positive diagnosis are excluded.

- **Source files:** Authorized LASI Wave 1 Individual-level extracts for **Maharashtra** (3,973 respondents) and **Daman & Diu** (991 respondents).
- **Total respondents:** 4,964.
- **Usable target labels:** 4,948 (1,538 Positive / 31.08% prevalence, 3,410 Negative, 16 missing/unresolved excluded).
- **Standalone `HT006` chronic heart disease:** 209 positive reports across both states (182 in Maharashtra, 27 in Daman & Diu).
- **Train/test split:** Stratified 80/20 (`random_state=42`):
  - Training set: 3,958 records (1,230 Positive, 2,728 Negative)
  - Hold-out test set: 990 records (308 Positive, 682 Negative)
  - Zero duplicate respondent IDs across train and test partitions.

---

## Input Feature Contract (13 Fields)

| API field | Source / construction | Representation | Accepted values / encodings |
|---|---|---|---|
| `age_years` | `DM005` | Numeric | Plausible integer / float (> 0) |
| `sex_code` | `DM003` | Category code | `'1'` (Male), `'2'` (Female) |
| `residence_code` | `residence` | Category code | `'1'` (Urban), `'2'` (Rural) |
| `mpce_quintile` | `mpce_quintile` | Category code | `'1'`, `'2'`, `'3'`, `'4'`, `'5'` |
| `education_level` | Derived from `DM006` and `DM008` | Categorical string | `'0_never_attended'`, `'level_1'` through `'level_9'` |
| `family_history_hypertension` | `FM303` family-member indicators | Binary string | `'1'` (any family member positive), `'0'` (no / none flag) |
| `family_history_heart_disease` | `FM305` family-member indicators | Binary string | `'1'` (any family member positive), `'0'` (no / none flag) |
| `family_history_stroke` | `FM306` family-member indicators | Binary string | `'1'` (any family member positive), `'0'` (no / none flag) |
| `diabetes_reported` | `HT003`; `1=Yes`, `2=No` mapped to `'1'` / `'0'` | Binary string | `'1'` (reported diabetes), `'0'` (no) |
| `high_cholesterol_history` | `HT010`; `1=Yes`, `2=No` mapped to `'1'` / `'0'` | Binary string | `'1'` (reported high cholesterol), `'0'` (no) |
| `tobacco_ever` | `HB001` | Binary string | `'1'` (ever used), `'0'` (never used) |
| `vigorous_activity_frequency` | `HB211` | Category code | `'1'`, `'2'`, `'3'`, `'4'`, `'5'` |
| `moderate_activity_frequency` | `HB213` | Category code | `'1'`, `'2'`, `'3'`, `'4'`, `'5'` |

### Mandatory Target Leakage Prevention
The three outcome-defining fields (`HT002`, `HT006`, `HT007`) and all their downstream interview questions (`HT002a-d`, `HT006a-h`, `HT007a-k`) are strictly excluded from the feature matrix. `diabetes_reported` (`HT003`) is retained as a comorbidity, as diabetes is distinct from the cardiovascular outcome composite.

---

## Evaluation Metrics (Hold-Out Test Split N=990)

| Metric | LR Baseline | RF Baseline | **LR Tuned (Calibrated Thresh 0.39)** |
|---|---:|---:|---:|
| **Accuracy** | 69.70% | 73.23% | **68.59%** |
| **Balanced accuracy** | 67.50% | 67.93% | **67.67%** |
| **Sensitivity (Recall)** | 61.69% | 53.90% | **65.26%** |
| **Specificity** | 73.31% | 81.96% | **70.09%** |
| **Precision** | 51.08% | 57.44% | **49.63%** |
| **F1-score** | 55.88% | 55.61% | **56.38%** |
| **ROC-AUC** | 0.7386 | 0.7277 | **0.7362** |
| **5-Fold CV ROC-AUC** | 0.7439 (±0.0210) | 0.7391 (±0.0245) | **0.7474 (±0.0208)** |
| **True Negatives (TN)** | 500 | 559 | **478** |
| **False Positives (FP)** | 182 | 123 | **204** |
| **False Negatives (FN)** | 118 | 142 | **107 (11 fewer missed cases)** |
| **True Positives (TP)** | 190 | 166 | **201** |

---

## Artifact Files

- **Active Tuned Candidate:** `models/cvd_composite_logistic_regression_combined_tuned.joblib`
- **Active Combined Baseline:** `models/cvd_composite_logistic_regression_combined_baseline.joblib`
- **Comparison Baseline:** `models/cvd_composite_random_forest_combined_baseline.joblib`
- **Historical Daman & Diu-only models:** `models/cvd_composite_logistic_regression_lasi_dd.joblib`, `models/cvd_composite_random_forest_lasi_dd.joblib`
- **Inference helper:** `lasi_model_inference.py` (key: `cvd_composite_logistic_regression_tuned`)
- **Tuning reports:** `reports/combined_model_tuning.md`, `reports/combined_model_tuning.json`, `reports/combined_model_tuning.csv`
