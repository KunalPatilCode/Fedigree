# Fedigree Diabetes Classifier — Synthetic Prototype Dataset (500 rows)

## Important: these are NOT real patients
Every row is artificially generated. The records do not come from a survey, clinic, government dataset, or residents of Daman/Diu. The `district_demo` and state/UT fields only provide a demo context. Do not describe this file as a real Daman & Diu dataset or use it to make medical claims.

The target `diabetes_status_synthetic` was generated using a simple artificial probability rule based on the synthetic features. It is NOT a clinically determined diagnosis, and a model trained on it will learn that artificial rule rather than real-world diabetes risk. Use it only to test preprocessing, training code, API integration, and UI behavior while waiting for approved real data.

## Size
- Rows: 500
- Columns: 15
- Synthetic positive/negative labels: see the CSV; class balance is artificial and not an estimate of local diabetes prevalence.
- Seed: 20261011 (for reproducibility with the included generator)

## Column dictionary
- `record_id`: artificial record identifier; not a real patient ID.
- `is_synthetic`: always `True`; do not use as a predictive feature.
- `country`, `state_ut`: context-only labels, not data provenance.
- `district_demo`: artificial `Daman`/`Diu` label for UI/demo purposes only.
- `age_years`: synthetic age (18–85).
- `sex`: synthetic category (`Female`/`Male`).
- `bmi_kg_m2`: synthetic BMI in kg/m².
- `waist_circumference_cm`: synthetic waist circumference in cm.
- `family_history_diabetes`: binary indicator (1=yes, 0=no).
- `physical_activity_level`: `Low`, `Moderate`, or `High`.
- `diet_pattern`: `Balanced`, `Mixed`, or `High_sugar_processed`; illustrative categories only.
- `hypertension_history`: binary indicator (1=yes, 0=no).
- `tobacco_use`: binary indicator (1=yes, 0=no).
- `diabetes_status_synthetic`: synthetic target (1=simulated positive, 0=simulated negative), not actual diagnosis.

## Prototype training note
Before training, exclude `record_id`, `is_synthetic`, `country`, `state_ut`, and `district_demo` from model features. Use `diabetes_status_synthetic` only as the target. Keep a fixed train/test split and report all results as *synthetic-data pipeline tests*, not as clinical accuracy. When official Indian individual-level data is approved, inspect its codebook, labels, consent/access terms and missingness; then rebuild the feature mapping and retrain/evaluate.
