# Fedigree — LASI Daman & Diu Experimental ML Models

## Current selected model artifacts

This repository package contains two exploratory classification tasks built from an authorized LASI Wave 1 Daman & Diu individual-level extract. The selected artifacts for the current prototype are:

- **Model 1 — Diabetes reported-diagnosis classifier:** tuned Random Forest, `models/diabetes_random_forest_tuned_lasi_dd.joblib`.
- **Model 2 — LASI-defined CVD composite classifier:** baseline Logistic Regression, `models/cvd_composite_logistic_regression_lasi_dd.joblib`.

Keep the baseline Diabetes models and CVD Random Forest as comparison artifacts if they are present, but do not load them as the default selected model. The selected model mapping is also specified in `MODEL_CONTRACT.md`.

## Scope and target definitions

- **Diabetes target:** `HT003`, self-reported diagnosis of diabetes/high blood sugar by a health professional (`1=Yes`, `2=No`). This classifies reported diagnosis; it does not predict future diabetes onset.
- **CVD composite target:** positive if any of `HT002` (hypertension), `HT006` (chronic heart disease), or `HT007` (stroke) is reported. This is not CAD-specific and is not a future/10-year cardiovascular-risk model.

## Dataset audit

- Source rows: 991, all coded as Daman and Diu.
- Diabetes target: 171 Yes, 815 No, 5 missing (986 usable target records).
- CVD composite: 327 positive, 659 negative, 5 unknown (986 usable target records).
- Chronic heart disease (`HT006`) alone: 27 positive reports.

Raw Individual-level health data is **not** included in this documentation bundle. Keep the authorized `Individual_Daman_and_Diu.xlsx` local. Do not commit respondent-level records or identifiers to public GitHub; follow IIPS access and data-use conditions.

## Current hold-out comparison

Metrics are from a single stratified 80/20 split (`random_state=42`) and are unweighted exploratory results. The hold-out set was inspected during prior experimentation and model selection; therefore these should not be treated as independent final validation.

| Task | Model | Accuracy | Balanced accuracy | Sensitivity | Specificity | Precision | F1-score | ROC-AUC | TN | FP | FN | TP |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Diabetes | Logistic Regression baseline | 69.70% | 64.22% | 55.88% | 72.56% | 29.69% | 38.78% | 0.7626 | 119 | 45 | 15 | 19 |
| Diabetes | Random Forest baseline | 77.27% | 66.46% | 50.00% | 82.93% | 37.78% | 43.04% | 0.7165 | 136 | 28 | 17 | 17 |
| Diabetes | **Random Forest tuned — selected candidate** | 71.72% | 74.77% | 79.41% | 70.12% | 35.53% | 49.09% | 0.7593 | 115 | 49 | 7 | 27 |
| CVD composite | **Logistic Regression baseline — selected** | 73.23% | 69.32% | 57.58% | 81.06% | 60.32% | 58.91% | 0.7586 | 107 | 25 | 28 | 38 |
| CVD composite | Random Forest baseline | 69.70% | 65.91% | 54.55% | 77.27% | 54.55% | 54.55% | 0.7316 | 102 | 30 | 30 | 36 |

### Model 1 tuning decision

The tuned Diabetes Random Forest was selected as a **sensitivity-focused experimental candidate**. Compared with the baseline Random Forest on this hold-out set, sensitivity increased from 50.00% to 79.41%, false negatives decreased from 17 to 7, and F1/ROC-AUC improved. Accuracy fell from 77.27% to 71.72%, specificity fell from 82.93% to 70.12%, and false positives increased from 28 to 49. This is an explicit trade-off, not an across-the-board improvement.

The tuning search used 3-fold stratified CV within the training split and selected by mean CV ROC-AUC. Best CV results: mean ROC-AUC 0.8082 (SD 0.0096), mean balanced accuracy 0.7375, mean F1 0.4895. See `TUNING_SUMMARY.md` for parameters and limitations.

### Model 2 selection

No further tuning is being applied to Model 2 for the current handover. Keep the baseline Logistic Regression artifact selected. An older exploratory tuned CVD candidate may exist in prior packages; it is **not selected** and should not overwrite the baseline artifact.

## Feature contracts and preprocessing

See `MODEL_CONTRACT.md` for exact API field names (Diabetes: 11 features; CVD composite: 13 features), target coding, output schema, and selected artifact paths. Model inputs in the frontend/backend must exactly match these contracts. The previous synthetic 9-feature contract is not compatible with the LASI-trained models.

Each fitted pipeline includes preprocessing: numerical imputation/scaling and categorical imputation/one-hot encoding. Do not independently refit preprocessing in the API.

## Reproduce locally

1. Keep the authorized XLSX at `data/Individual_Daman_and_Diu.xlsx` or pass the local path explicitly.
2. Activate your virtual environment.
3. Install requirements: `python -m pip install -r requirements.txt`.
4. Train baseline artifacts: `python train_lasi_models.py --input "E:\\path\\to\\Individual_Daman_and_Diu.xlsx"`.
5. Run Diabetes Random Forest tuning: `python tune_selected_models.py` (the local script's current configuration should tune only the `diabetes` task, as in the documented latest run).
6. Run smoke tests: `python predict_lasi_models.py`.

After retraining/tuning, review the reports and update this README and the model-specific documents if outputs differ. Do not silently assume previous metrics remain current.

## Limitations / safe use

- The subset contains 991 respondents, with 986 usable target labels per task; it is a small regional survey subset.
- Outcomes are self-reported diagnoses, not necessarily lab-confirmed disease.
- Metrics are unweighted and do not account for LASI's survey weights, strata, or clusters.
- There is no independent external validation. The 80/20 hold-out was consulted during previous model selection, so a prespecified new test set or external validation is needed before stronger performance claims.
- Model scores/probabilities are not calibrated individual medical-risk percentages.
- Do not use these artifacts for diagnosis, triage, or medical decisions. Use only as an experimental engineering/demo prototype pending appropriate validation and clinical oversight.

## Legacy Reference — Synthetic Prototype Pipeline

For initial software testing prior to authorized survey data availability, a 500-record synthetic pipeline was maintained:
- Training: `python train_diabetes.py`
- Comparison: `python compare_model.py`
- Inference: `python predict_diabetes.py` or `python predict_both_models.py`
- Dataset: `data/fedigree_diabetes_synthetic_500.csv`
- Artifacts: `models/diabetes_logistic_synthetic.joblib`, `models/diabetes_random_forest_synthetic.joblib`
