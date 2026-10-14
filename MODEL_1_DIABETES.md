# Fedigree Model 1 — Diabetes Reported-Diagnosis Classifier (LASI Daman & Diu)

## Current selection

**Selected experimental candidate:** tuned Random Forest, artifact `models/diabetes_random_forest_tuned_lasi_dd.joblib`.

This model classifies a LASI respondent's **self-reported prior/current diagnosis of diabetes or high blood sugar by a health professional**. It does not predict future diabetes onset and is not a clinical diagnostic tool.

## Dataset and target

- Source: authorized LASI Wave 1 Daman & Diu individual-level extract.
- Source rows: 991.
- Target: `HT003`; source coding `1=Yes`, `2=No`.
- Usable target records: 986 (171 Yes, 815 No, 5 missing/unknown).
- Train/test split: stratified 80/20; 788 training and 198 test records; `random_state=42`.

## Input feature contract (11 fields)

| API field | Source / construction | Representation |
|---|---|---|
| `age_years` | `DM005`, age at last birthday | Numeric |
| `sex_code` | `DM003` | Source category code |
| `residence_code` | `residence` | Source category code (`1` urban, `2` rural, per codebook) |
| `mpce_quintile` | `mpce_quintile` | Category `1`–`5` |
| `education_level` | Derived from `DM006` and `DM008` | `0_never_attended` or `level_<DM008 code>` |
| `family_history_diabetes` | `FM304` family-member indicators | Category `0` / `1` |
| `hypertension_history` | `HT002`; `1=Yes`, `2=No` mapped to `1` / `0` | Category `0` / `1` |
| `high_cholesterol_history` | `HT010`; `1=Yes`, `2=No` mapped to `1` / `0` | Category `0` / `1` |
| `tobacco_ever` | `HB001`, ever smoked or used smokeless tobacco | Category `0` / `1` |
| `vigorous_activity_frequency` | `HB211` | Source category code |
| `moderate_activity_frequency` | `HB213` | Source category code |

Check all category mappings against the authorized LASI codebook before changing the API contract.

## Algorithm selection and metrics

The table below compares the original baselines with the latest tuned Random Forest. All numbers are unweighted metrics on the same 198-record hold-out split; this split has already been inspected during model selection and is not independent validation.

| Metric | Logistic Regression baseline | Random Forest baseline | **Tuned Random Forest — selected candidate** |
|---|---:|---:|---:|
| Accuracy | 69.70% | 77.27% | 71.72% |
| Balanced accuracy | 64.22% | 66.46% | 74.77% |
| Sensitivity / recall-positive | 55.88% | 50.00% | 79.41% |
| Specificity / recall-negative | 72.56% | 82.93% | 70.12% |
| Precision | 29.69% | 37.78% | 35.53% |
| F1-score | 38.78% | 43.04% | 49.09% |
| ROC-AUC | 0.7626 | 0.7165 | 0.7593 |
| TN | 119 | 136 | 115 |
| FP | 45 | 28 | 49 |
| FN | 15 | 17 | 7 |
| TP | 19 | 17 | 27 |

### Why the tuned candidate was retained

The tuned model is selected as a **sensitivity-focused experimental candidate**: on this hold-out split, sensitivity increased from 50.00% to 79.41%, false negatives decreased from 17 to 7, and F1/ROC-AUC improved compared with the baseline Random Forest. The trade-off is that accuracy and specificity decreased, and false positives increased from 28 to 49. It is not better on every metric.

### Tuning configuration

- Search: sampled Random Forest parameter configurations.
- CV: 3-fold StratifiedKFold within the training partition.
- Selection metric: mean CV ROC-AUC.
- CV mean ROC-AUC: 0.8082; SD: 0.0096.
- CV mean balanced accuracy: 0.7375.
- CV mean F1-score: 0.4895.
- Selected parameters: `n_estimators=200`, `max_depth=4`, `min_samples_split=15`, `min_samples_leaf=8`, `max_features="sqrt"`, `class_weight="balanced"`; `random_state=42` where configured by the script.
- Threshold remains the model's default 0.5 unless separately documented.

## Selected artifact and related files

- Selected: `models/diabetes_random_forest_tuned_lasi_dd.joblib`
- Baseline for comparison: `models/diabetes_random_forest_lasi_dd.joblib`
- Additional comparison baseline: `models/diabetes_logistic_regression_lasi_dd.joblib`
- Inference helper: `lasi_model_inference.py`
- Tuning report: `reports/lasi_daman_diu_selected_model_tuning.md`
- Metrics: `reports/lasi_daman_diu_model_metrics.csv`, `reports/lasi_daman_diu_selected_model_tuning.csv`

## Limitations

- This is a classifier for self-reported diagnosis, not a prospective risk model.
- Metrics are unweighted, from one regional hold-out split; no independent external validation or LASI survey-design-aware analysis has been done.
- The hold-out split has informed model selection; results may be optimistic and should not be considered an unbiased final estimate.
- The positive-class probability is not a calibrated personal risk percentage.
- Do not use for diagnosis, triage, or medical decisions. Additional validation and clinical oversight are required.
- Do not commit raw respondent-level LASI data or identifiers to public GitHub. Follow IIPS access/use conditions.
