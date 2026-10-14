# Backend Handover — Fedigree LASI Models

## Selected artifacts

- Model 1 Diabetes: `models/diabetes_random_forest_tuned_lasi_dd.joblib` (tuned sensitivity-focused candidate).
- Model 2 CVD composite: `models/cvd_composite_logistic_regression_lasi_dd.joblib` (original baseline Logistic Regression).

## Integration files

- `lasi_model_inference.py`: reusable prediction helper.
- `MODEL_CONTRACT.md`: exact input schemas and response fields.
- `MODEL_1_DIABETES.md` and `MODEL_2_CVD_COMPOSITE.md`: individual model documentation.
- `README.md`: run steps, dataset audit and comparison table.

## Integration requirements

1. Keep each model's required input schema exact; Diabetes expects 11 fields, CVD composite expects 13. These do not match the earlier synthetic 9-feature prototype.
2. Use the selected artifacts listed above as defaults. Retain comparison artifacts only for reproducibility.
3. Keep preprocessing inside the saved pipeline; do not independently refit transformations in FastAPI.
4. Validate incoming fields and supported category values before prediction.
5. Return predicted class, class meaning, model score/probability, model status and the full limitations notice.
6. Treat probability as model output, not calibrated individual medical risk.
7. Do not enable for diagnosis, triage, or medical decision-making; models are experimental and not clinically validated.

## Data protection

Do not commit the raw LASI Individual XLSX, respondent identifiers, or row-level records to public GitHub. Keep these local and follow IIPS data access/use conditions.
