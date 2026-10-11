# Fedigree Model 1 — Diabetes Classifier (Synthetic ML Pipeline)

> **Experimental prototype only.** This project currently uses 500 artificially generated profiles and artificial target labels. It is **not real Daman & Diu data**, and the evaluation metrics below are **not clinical performance results**. Do not use these models to diagnose a person or estimate a real person's diabetes risk.

## 1. Overview

This project implements the initial machine-learning pipeline for Fedigree Model 1. It is intended to test data preprocessing, model training and comparison, saving/loading fitted pipelines, and generating predictions for backend integration.

Two supervised binary-classification algorithms are included:

- **Logistic Regression** — baseline classifier.
- **Random Forest** — comparison classifier.

Both models were trained and evaluated on the same train/test split from the synthetic dataset. No clinical validation has been performed.

## 2. Dataset details

| Property | Current setup |
|---|---|
| Dataset file | `data/fedigree_diabetes_synthetic_500.csv` |
| Data type | Synthetic structured/tabular data |
| Total records | 500 |
| Total CSV columns | 15 |
| Synthetic class 0 | 344 records |
| Synthetic class 1 | 156 records |
| Model input features | 9 |
| Target column | `diabetes_status_synthetic` (artificial binary label: 0/1) |
| Training split | 80% (400 records) |
| Test split | 20% (100 records) |
| Split method | Stratified split |
| Split random state | `42` |

The dataset exists to test the engineering pipeline while access requests for an approved Indian individual-level dataset are pending. Its labels are artificial, not confirmed clinical diagnoses, and its records do not represent an actual patient population.

## 3. Input features

The current ML pipelines expect these nine feature names. Keep the names and supported category values consistent across the dataset, inference module, and backend request schema.

| Feature | Type | Current values / range |
|---|---|---|
| `age_years` | Integer | 18–120 (prototype validation) |
| `bmi_kg_m2` | Number | 10–80 (prototype validation) |
| `waist_circumference_cm` | Number | 30–250 (prototype validation) |
| `family_history_diabetes` | Integer | `0` or `1` |
| `hypertension_history` | Integer | `0` or `1` |
| `tobacco_use` | Integer | `0` or `1` |
| `sex` | Category | `Male`, `Female` |
| `physical_activity_level` | Category | `Low`, `Moderate`, `High` |
| `diet_pattern` | Category | `Balanced`, `Mixed`, `High_sugar_processed` |

The numeric ranges are basic prototype input-validation limits, not clinical cut-offs. Binary values are encodings in this schema. If frontend fields or categories change, update and test the training/inference contract as well.

## 4. Model comparison results

Both models were evaluated on the same 100-record synthetic test split. Metrics are copied from the current `compare_model.py` output.

| Metric | Logistic Regression | Random Forest |
|---|---:|---:|
| Accuracy | **76.00%** | 75.00% |
| Sensitivity / Recall (class 1) | 32.26% | **35.48%** |
| Specificity | **95.65%** | 92.75% |
| Precision | **76.92%** | 68.75% |
| F1-score | 45.45% | **46.81%** |
| ROC-AUC | **0.7391** | 0.7179 |
| True negatives (TN) | 66 | 64 |
| False positives (FP) | 3 | 5 |
| False negatives (FN) | 21 | 20 |
| True positives (TP) | 10 | 11 |

### Interpretation

- Logistic Regression has slightly higher accuracy, specificity, precision, and ROC-AUC on this synthetic test split.
- Random Forest has slightly higher sensitivity and F1-score on this synthetic test split.
- Both models missed a number of synthetic positive labels; sensitivity is low in this experiment.
- These results do **not** establish clinical usefulness, real-world accuracy, or performance on Indian patients. Do not choose a model for medical use based on this synthetic comparison.

## 5. Algorithm configuration and preprocessing

| Configuration | Logistic Regression | Random Forest |
|---|---|---|
| Scikit-learn estimator | `LogisticRegression` | `RandomForestClassifier` |
| Explicitly configured parameters | `max_iter=2000` | `n_estimators=300`, `random_state=42` |
| Data split | Stratified 80/20, `random_state=42` | Same split |
| Preprocessing | Same pipeline | Same pipeline |

Preprocessing in `compare_model.py`:

- **Numerical features:** median imputation followed by `StandardScaler`.
- **Categorical features:** most-frequent imputation followed by `OneHotEncoder(handle_unknown="ignore")`.
- Preprocessing and the estimator are combined in a scikit-learn `Pipeline`, fitted using the training data only.

## 6. Model artifacts and reports

The model-comparison script saves these outputs:

| File | Purpose |
|---|---|
| `models/diabetes_logistic_synthetic.joblib` | Fitted preprocessing + Logistic Regression pipeline |
| `models/diabetes_random_forest_synthetic.joblib` | Fitted preprocessing + Random Forest pipeline |
| `reports/synthetic_model_comparison.csv` | Side-by-side model evaluation metrics |
| `reports/synthetic_model_comparison.json` | Metrics, feature order, data status, split counts, and training metadata |

The `synthetic` suffix is intentionally included in artifact names to make their current limitation clear. The baseline script `train_diabetes.py` may also save its standalone baseline artifact and report as documented by that script; for the two-model comparison, use the artifacts above.

## 7. Project structure

```text
project/
├── .venv/                         # Local virtual environment; do not commit
├── data/
│   ├── fedigree_diabetes_synthetic_500.csv
│   └── README_DATASET.md
├── models/
│   ├── diabetes_logistic_synthetic.joblib
│   └── diabetes_random_forest_synthetic.joblib
├── reports/
│   ├── synthetic_model_comparison.csv
│   └── synthetic_model_comparison.json
├── compare_model.py
├── diabetes_inference.py
├── MODEL_CONTRACT.md
├── predict_both_models.py
├── predict_diabetes.py
├── README.md
├── requirements.txt
└── train_diabetes.py
```

Some generated files appear only after the corresponding script runs. Keep `.venv/` out of GitHub; dependencies should be installed from `requirements.txt`.

## 8. Setup and run (Windows PowerShell)

Create and activate a virtual environment, then install dependencies:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

If PowerShell blocks activation, use Command Prompt with `.venv\Scripts\activate.bat`, or run commands through `.venv\Scripts\python.exe` directly.

### Train and compare both models

```powershell
python compare_model.py
```

This validates the CSV schema, makes a stratified 80/20 train/test split, fits the preprocessing and model pipelines, calculates metrics, saves both model artifacts, and writes the comparison reports.

### Test predictions from both models

```powershell
python predict_both_models.py
```

### Test the reusable inference module

```powershell
python diabetes_inference.py
```

The scripts are for engineering and synthetic-pipeline testing. Their predictions must not be interpreted as medical advice or real diabetes risk.

## 9. Backend integration contract

The backend should call the reusable function in `diabetes_inference.py` rather than reimplementing preprocessing or model logic. Requests must include all nine fields listed in **Input features**, using the exact keys and valid category values.

Example input:

```json
{
  "age_years": 45,
  "bmi_kg_m2": 27.0,
  "waist_circumference_cm": 90.0,
  "family_history_diabetes": 1,
  "hypertension_history": 0,
  "tobacco_use": 0,
  "sex": "Male",
  "physical_activity_level": "Low",
  "diet_pattern": "Mixed"
}
```

Current inference output includes:

- `model_name` — `logistic_regression` or `random_forest`.
- `predicted_synthetic_label` — predicted artificial class label (`0` or `1`).
- `synthetic_positive_label_probability` — score for synthetic class 1; **not** a real clinical risk percentage.
- `model_status` — `experimental_synthetic_data_only`.
- `notice` — warning explaining the model limitation.

The frontend must not display the probability as a patient's true diabetes risk or present the class label as a diagnosis. Restrict this functionality to internal engineering/demo use until suitable clinical data, validation, and governance review are completed.

## 10. When approved Indian clinical data becomes available

1. Review the dataset source, codebook, access terms, and target-label definitions.
2. Confirm the intended target and eligible population before training.
3. Map available real-data columns to the feature contract; do not assume all current features exist.
4. Retrain and evaluate the pipeline with appropriate validation, threshold analysis, and probability-calibration checks where suitable.
5. Document limitations and seek appropriate clinical review before claiming medical utility.

The current synthetic dataset is a temporary engineering resource, not a substitute for Indian clinical data.
