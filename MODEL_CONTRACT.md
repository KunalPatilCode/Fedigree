# Fedigree LASI Model Input/Output Contract

## Selected artifacts

- **Diabetes (Model 1):** `models/diabetes_random_forest_tuned_lasi_dd.joblib` — tuned, sensitivity-focused experimental candidate.
- **CVD composite (Model 2):** `models/cvd_composite_logistic_regression_lasi_dd.joblib` — baseline Logistic Regression; no tuning selected.

The baseline Diabetes artifacts and CVD Random Forest are retained only for comparison where present. They must not be substituted for the selected models without an explicit decision.

## General status and limitations

These are exploratory classifiers trained on a small LASI Wave 1 Daman & Diu survey subset. Targets are self-reported diagnoses. Metrics are unweighted and based on a single stratified hold-out split; the split was inspected during prior experimentation and is not independent validation. Models are not clinically validated and must not be used for diagnosis, triage, or medical decisions.

## Model 1 — Diabetes reported-diagnosis classifier

**Target:** `HT003`: `1=Yes` (health professional ever diagnosed diabetes/high blood sugar), `2=No`. Five records with unknown target were excluded. This is classification of reported diagnosis, not future diabetes risk.

### Input schema (11 fields)

| Field | Type / codes | Source / construction |
|---|---|---|
| `age_years` | numeric | `DM005`, age at last birthday |
| `sex_code` | category: source-coded | `DM003` |
| `residence_code` | category: source-coded (`1` urban, `2` rural per codebook) | `residence` |
| `mpce_quintile` | category `1`–`5` | `mpce_quintile` |
| `education_level` | category `0_never_attended` or `level_<DM008 code>` | Derived from `DM006` and `DM008` |
| `family_history_diabetes` | category `0` / `1` | `FM304` family-member indicators |
| `hypertension_history` | category `0` / `1` | `HT002`, yes/no mapped to `1` / `0` |
| `high_cholesterol_history` | category `0` / `1` | `HT010`, yes/no mapped to `1` / `0` |
| `tobacco_ever` | category `0` / `1` | `HB001` |
| `vigorous_activity_frequency` | source category code | `HB211` |
| `moderate_activity_frequency` | source category code | `HB213` |

### Latest selected model metrics

Tuned Random Forest: accuracy 71.72%, balanced accuracy 74.77%, sensitivity 79.41%, specificity 70.12%, precision 35.53%, F1 49.09%, ROC-AUC 0.7593. Confusion matrix: TN=115, FP=49, FN=7, TP=27.

Parameters: `n_estimators=200`, `max_depth=4`, `min_samples_split=15`, `min_samples_leaf=8`, `max_features="sqrt"`, `class_weight="balanced"`. Three-fold CV on the training split: mean ROC-AUC 0.8082 (SD 0.0096), mean balanced accuracy 0.7375, mean F1 0.4895. These are exploratory results; sensitivity improved versus baseline at the cost of more false positives and lower specificity/accuracy.

## Model 2 — LASI-defined CVD composite classifier

**Target:** `1` if any of `HT002` (hypertension), `HT006` (chronic heart disease), or `HT007` (stroke) is reported; `0` only if all three are explicitly No. Unknown composite outcomes are excluded. This is not CAD-only and is not future/10-year risk.

### Input schema (13 fields)

| Field | Type / codes | Source / construction |
|---|---|---|
| `age_years` | numeric | `DM005` |
| `sex_code` | source category code | `DM003` |
| `residence_code` | source category code | `residence` |
| `mpce_quintile` | category `1`–`5` | `mpce_quintile` |
| `education_level` | category | Derived from `DM006`, `DM008` |
| `family_history_hypertension` | category `0` / `1` | `FM303` family-member indicators |
| `family_history_heart_disease` | category `0` / `1` | `FM305` family-member indicators |
| `family_history_stroke` | category `0` / `1` | `FM306` family-member indicators |
| `diabetes_reported` | category `0` / `1` | `HT003` mapped to `1` / `0` |
| `high_cholesterol_history` | category `0` / `1` | `HT010` mapped to `1` / `0` |
| `tobacco_ever` | category `0` / `1` | `HB001` |
| `vigorous_activity_frequency` | source category code | `HB211` |
| `moderate_activity_frequency` | source category code | `HB213` |

### Selected baseline metrics

Logistic Regression: accuracy 73.23%, balanced accuracy 69.32%, sensitivity 57.58%, specificity 81.06%, precision 60.32%, F1 58.91%, ROC-AUC 0.7586. Confusion matrix: TN=107, FP=25, FN=28, TP=38. Model 2 remains at baseline; do not use an older tuned CVD candidate as the selected artifact.

## Prediction response

`lasi_model_inference.py` returns model name, task, predicted class, class meaning, positive-class probability, model status and a limitation notice. The probability is the model score for its target label; it is not a calibrated individual medical-risk percentage.

## Runtime contract

- Match exact field names and accepted categorical codes.
- Send one dictionary/profile containing every required feature and no unexpected fields.
- Do not refit preprocessing in the API; use the saved pipeline.
- Keep the selected artifact paths above consistent between inference code and README.
- `joblib` artifacts should be loaded only from trusted sources and with compatible dependency versions.

## Data handling

Keep the authorized Individual-level XLSX local and out of public GitHub. Follow IIPS access and data-use conditions. Only share code, documentation, and permitted aggregate metrics.
