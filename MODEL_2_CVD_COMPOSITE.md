# Fedigree Model 2 — LASI-Defined CVD Composite Classifier

## Current selection

**Selected experimental model:** baseline Logistic Regression, artifact `models/cvd_composite_logistic_regression_lasi_dd.joblib`.

No fine-tuning is selected for Model 2 in the current handover. If an older tuned CVD artifact exists in a previous package, it is not the selected model and must not overwrite this baseline.

This model classifies a broad LASI-defined **self-reported condition composite**. It is not a CAD-specific model and is not a future or 10-year cardiovascular-risk model.

## Dataset and target

The composite target is positive if any of these LASI diagnosis items is Yes:
- `HT002`: hypertension / high blood pressure
- `HT006`: chronic heart disease
- `HT007`: stroke

The composite is negative only when all three source items are explicitly No. Rows with unknown target status are excluded.

- Source rows: 991.
- Usable target labels: 986 (327 positive, 659 negative, 5 unknown).
- `HT006` chronic heart-disease-only positive reports: 27.
- Stratified 80/20 split: 788 train and 198 test rows; `random_state=42`.

## Input feature contract (13 fields)

| API field | Source / construction | Representation |
|---|---|---|
| `age_years` | `DM005` | Numeric |
| `sex_code` | `DM003` | Source category code |
| `residence_code` | `residence` | Source category code (`1` urban, `2` rural, per codebook) |
| `mpce_quintile` | `mpce_quintile` | Category `1`–`5` |
| `education_level` | Derived from `DM006`, `DM008` | `0_never_attended` or `level_<DM008 code>` |
| `family_history_hypertension` | `FM303` family-member indicators | Category `0` / `1` |
| `family_history_heart_disease` | `FM305` family-member indicators | Category `0` / `1` |
| `family_history_stroke` | `FM306` family-member indicators | Category `0` / `1` |
| `diabetes_reported` | `HT003`, yes/no mapped to `1` / `0` | Category `0` / `1` |
| `high_cholesterol_history` | `HT010`, yes/no mapped to `1` / `0` | Category `0` / `1` |
| `tobacco_ever` | `HB001` | Category `0` / `1` |
| `vigorous_activity_frequency` | `HB211` | Source category code |
| `moderate_activity_frequency` | `HB213` | Source category code |

The three outcome-defining fields (`HT002`, `HT006`, `HT007`) are excluded from input features to avoid direct target leakage. Verify code mappings against the authorized LASI codebook.

## Hold-out metrics

Single unweighted stratified 80/20 hold-out split; metrics have not been survey-weighted or externally validated.

| Metric | Logistic Regression — selected baseline | Random Forest baseline comparison |
|---|---:|---:|
| Accuracy | 73.23% | 69.70% |
| Balanced accuracy | 69.32% | 65.91% |
| Sensitivity / recall-positive | 57.58% | 54.55% |
| Specificity / recall-negative | 81.06% | 77.27% |
| Precision | 60.32% | 54.55% |
| F1-score | 58.91% | 54.55% |
| ROC-AUC | 0.7586 | 0.7316 |
| TN | 107 | 102 |
| FP | 25 | 30 |
| FN | 28 | 30 |
| TP | 38 | 36 |

Logistic Regression remains the baseline selection because it performed better on the listed metrics in this split. This is only an engineering prototype choice; it is not evidence of clinical suitability.

## Selected artifact and related files

- Selected: `models/cvd_composite_logistic_regression_lasi_dd.joblib`
- Comparison baseline: `models/cvd_composite_random_forest_lasi_dd.joblib`
- Inference helper: `lasi_model_inference.py`
- Metrics: `reports/lasi_daman_diu_model_metrics.csv`, `reports/lasi_daman_diu_model_metrics.json`

## Limitations

- Not CAD-specific, not a future/10-year risk model, and not a medical diagnostic tool.
- It predicts a composite based on self-reported hypertension, chronic heart disease or stroke; these are not necessarily lab-confirmed outcomes.
- Only 27 respondents reported chronic heart disease alone, making CAD-only modelling particularly limited for this regional subset.
- Metrics are unweighted and use a single hold-out split that informed earlier model selection. Independent validation and survey-design-aware evaluation are required.
- Positive-class probabilities are model scores, not validated individual cardiovascular-risk percentages.
- Do not use for diagnosis, triage, or medical decisions. Do not publish raw respondent-level LASI data or identifiers.
