# Fedigree — LASI Daman & Diu Experimental Machine Learning Models

> **Technical & Scientific Documentation for Exploratory Healthcare Classification Pipelines**  
> **Dataset Source:** Longitudinal Ageing Study in India (LASI) Wave 1 — Daman & Diu Individual Extract  
> **Status:** Experimental Research Prototype • Not Clinically Validated

---

## Table of Contents

1. [Overview & Scope](#1-overview--scope)
2. [Selected Model Artifacts](#2-selected-model-artifacts)
3. [Target Definitions](#3-target-definitions)
4. [Dataset Audit & Governance](#4-dataset-audit--governance)
5. [Hold-Out Evaluation & Performance Metrics](#5-hold-out-evaluation--performance-metrics)
6. [Model 1: Diabetes Classifier Details & Tuning Decision](#6-model-1-diabetes-classifier-details--tuning-decision)
7. [Model 2: CVD Composite Classifier Details & Selection](#7-model-2-cvd-composite-classifier-details--selection)
8. [Feature Contracts & Preprocessing Pipelines](#8-feature-contracts--preprocessing-pipelines)
9. [Local Reproduction & Retraining](#9-local-reproduction--retraining)
10. [Scientific Limitations & Safe-Use Guidelines](#10-scientific-limitations--safe-use-guidelines)
11. [Related Technical Documents](#11-related-technical-documents)

---

## 1. Overview & Scope

The machine learning pipelines in Fedigree are exploratory classification models built from an authorized individual-level extract of the **Longitudinal Ageing Study in India (LASI) Wave 1 (Daman & Diu region)**. 

The primary research objective is to examine how self-reported demographic, behavioral, hereditary, and clinical indicators correlate with non-communicable disease (NCD) diagnoses in Indian regional cohorts, supporting interactive educational demonstrations and early-risk awareness workflows.

> [!IMPORTANT]
> **Experimental Prototype Notice:**  
> These models predict **self-reported prior diagnoses** recorded in a regional survey, **not future disease onset** or prospective 10-year cardiovascular risk. They are unweighted exploratory artifacts intended solely for technical evaluation, research exploration, and software demonstration. They are **not validated medical diagnostic devices** and must not be used for clinical decision-making, medical triage, or prescribing treatment.

---

## 2. Selected Model Artifacts

The repository contains comparison baselines and candidate models. The active production prototypes configured in the runtime contracts are:

| Model Task | Selected Algorithm | Artifact File Path | Rationale & Selection Status |
|---|---|---|---|
| **Model 1: Diabetes** | **Tuned Random Forest** | [`models/diabetes_random_forest_tuned_lasi_dd.joblib`](models/diabetes_random_forest_tuned_lasi_dd.joblib) | **Selected Candidate:** Sensitivity-focused tuning to minimize false negatives in preliminary health screening scenarios. |
| **Model 2: CVD Composite** | **Baseline Logistic Regression** | [`models/cvd_composite_logistic_regression_lasi_dd.joblib`](models/cvd_composite_logistic_regression_lasi_dd.joblib) | **Selected Artifact:** Retained at baseline; outperforms comparison Random Forest across key metrics without introducing overfitting. |

### Retention of Comparison Artifacts
The baseline Diabetes models and CVD Random Forest models are retained in the `models/` directory for historical benchmarking and reproducibility:
- `models/diabetes_random_forest_lasi_dd.joblib` (Random Forest baseline)
- `models/diabetes_logistic_regression_lasi_dd.joblib` (Logistic Regression baseline)
- `models/cvd_composite_random_forest_lasi_dd.joblib` (CVD Random Forest baseline)

These comparison artifacts must **not** overwrite or be substituted for the selected default artifacts in the backend API without a documented engineering decision.

---

## 3. Target Definitions

### Model 1 — Diabetes Reported-Diagnosis Classifier
- **Survey Target Variable:** `HT003` from LASI Wave 1.
- **Survey Coding:** `1 = Yes` (diagnosed with diabetes or high blood sugar by a health professional), `2 = No`.
- **Target Interpretation:** Classifies whether a respondent has reported a prior or current clinical diagnosis of diabetes. It does **not** predict future diabetes onset, biochemical glucose tolerance, or disease trajectory.

### Model 2 — LASI-Defined CVD Composite Classifier
- **Survey Target Variables:** Composite of `HT002` (hypertension), `HT006` (chronic heart disease), and `HT007` (stroke).
- **Composite Formulation:**
  - **Positive (`1`):** Reported `Yes` to any of `HT002`, `HT006`, or `HT007`.
  - **Negative (`0`):** Reported `No` explicitly across all three conditions (`HT002`, `HT006`, and `HT007`).
  - **Excluded:** Records with unknown or missing composite status.
- **Target Interpretation:** Represents a broad non-communicable circulatory/cardiovascular comorbidity indicator. It is **not** coronary artery disease (CAD) specific and does **not** estimate a 10-year Framingham or WHO cardiovascular risk score.

---

## 4. Dataset Audit & Governance

| Attribute | Value / Count | Notes |
|---|---|---|
| **Source Records** | **991 total rows** | All respondents geographically coded as Daman & Diu from LASI Wave 1. |
| **Diabetes Target (`HT003`)** | 171 Yes / 815 No | 5 missing records excluded $\rightarrow$ **986 usable target records**. |
| **CVD Composite Target** | 327 Positive / 659 Negative | 5 unknown records excluded $\rightarrow$ **986 usable target records**. |
| **Chronic Heart Disease (`HT006`) Alone** | 27 Positive reports | Illustrates why CAD-only modeling is constrained in this regional subset. |
| **Train / Test Partition** | 80% Train / 20% Hold-Out | Stratified split (`random_state=42`): 788 training rows, 198 hold-out test rows. |

### Data Protection & Privacy Notice
> [!CAUTION]
> **Data Privacy and IIPS Compliance:**  
> Raw individual-level survey data is **strictly excluded** from public version control. The authorized extract file `Individual_Daman_and_Diu.xlsx` must remain in local, secured storage (under `data/`). Never commit respondent-level microdata, direct identifiers, or raw survey sheets to GitHub. All analyses and documentation adhere to International Institute for Population Sciences (IIPS) data-access agreements.

---

## 5. Hold-Out Evaluation & Performance Metrics

Metrics are evaluated on a single stratified 80/20 hold-out split (198 test records; `random_state=42`) using unweighted exploratory evaluations.

> [!NOTE]
> **Evaluation Context:**  
> The hold-out split was consulted during preliminary model comparison and hyperparameter selection. Consequently, these metrics represent internal evaluation results rather than independent external validation on an unseen prospective cohort.

| Task | Algorithm / Model Pipeline | Accuracy | Balanced Accuracy | Sensitivity (Recall) | Specificity | Precision | F1-Score | ROC-AUC | True Negatives (TN) | False Positives (FP) | False Negatives (FN) | True Positives (TP) |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **Diabetes** | Logistic Regression Baseline | 69.70% | 64.22% | 55.88% | 72.56% | 29.69% | 38.78% | 0.7626 | 119 | 45 | 15 | 19 |
| **Diabetes** | Random Forest Baseline | 77.27% | 66.46% | 50.00% | 82.93% | 37.78% | 43.04% | 0.7165 | 136 | 28 | 17 | 17 |
| **Diabetes** | **Tuned Random Forest (Selected)** | **71.72%** | **74.77%** | **79.41%** | **70.12%** | **35.53%** | **49.09%** | **0.7593** | **115** | **49** | **7** | **27** |
| **CVD Composite** | **Logistic Regression Baseline (Selected)** | **73.23%** | **69.32%** | **57.58%** | **81.06%** | **60.32%** | **58.91%** | **0.7586** | **107** | **25** | **28** | **38** |
| **CVD Composite** | Random Forest Baseline | 69.70% | 65.91% | 54.55% | 77.27% | 54.55% | 54.55% | 0.7316 | 102 | 30 | 30 | 36 |

---

## 6. Model 1: Diabetes Classifier Details & Tuning Decision

### Rationale for Selecting the Tuned Random Forest
In preventive screening contexts, missing an undiagnosed or high-risk individual (**false negative**) carries higher public health consequences than recommending confirmatory blood testing to an individual who tests negative (**false positive**). 

The tuned Random Forest candidate was chosen as an explicitly **sensitivity-focused experimental model**:
- **Sensitivity increased:** From 50.00% (baseline RF) $\rightarrow$ **79.41%** (tuned RF) — an absolute gain of $+29.41\%$.
- **False Negatives reduced:** Decreased from 17 down to **7** (a $58.8\%$ reduction in missed reported diagnoses).
- **Composite metrics improved:** F1-score rose from 43.04% $\rightarrow$ **49.09%**, Balanced Accuracy rose from 66.46% $\rightarrow$ **74.77%**, and ROC-AUC improved from 0.7165 $\rightarrow$ **0.7593**.
- **Deliberate Trade-Off:** Overall accuracy fell from 77.27% $\rightarrow$ 71.72%, specificity fell from 82.93% $\rightarrow$ 70.12%, and false positives increased from 28 to 49. This trade-off is intentional for screening support and does not represent an across-the-board metric dominance.

### Hyperparameter Search & Cross-Validation
- **Search Space:** Randomized grid across tree depth, estimator counts, sample split criteria, and class weighting.
- **Validation Strategy:** 3-fold `StratifiedKFold` cross-validation executed strictly within the 788-sample training split.
- **Optimization Metric:** Mean Cross-Validation ROC-AUC.
- **Cross-Validation Results:**
  - Mean CV ROC-AUC: **0.8082** ($\text{SD} = 0.0096$)
  - Mean CV Balanced Accuracy: **0.7375**
  - Mean CV F1-Score: **0.4895**
- **Selected Hyperparameter Set:**
  ```json
  {
    "model__n_estimators": 200,
    "model__max_depth": 4,
    "model__min_samples_split": 15,
    "model__min_samples_leaf": 8,
    "model__max_features": "sqrt",
    "model__class_weight": "balanced"
  }
  ```

---

## 7. Model 2: CVD Composite Classifier Details & Selection

### Baseline Logistic Regression Selection
For the LASI-defined CVD composite task, the baseline Logistic Regression model demonstrated superior generalization compared to the non-linear Random Forest alternative on the 198-record hold-out split:
- **Higher Accuracy:** 73.23% vs. 69.70%
- **Higher Balanced Accuracy:** 69.32% vs. 65.91%
- **Higher Sensitivity:** 57.58% vs. 54.55% (38 TP vs. 36 TP)
- **Higher Specificity:** 81.06% vs. 77.27% (107 TN vs. 102 TN)
- **Higher F1-Score & ROC-AUC:** F1 58.91% vs. 54.55%; ROC-AUC 0.7586 vs. 0.7316

### Engineering Decision
No hyperparameter fine-tuning is currently adopted for Model 2. The baseline Logistic Regression artifact is frozen as the selected model. Any older exploratory tuned CVD artifacts from previous iterations must **not** overwrite this baseline.

---

## 8. Feature Contracts & Preprocessing Pipelines

Each model artifact contains a self-contained Scikit-Learn `Pipeline` encompassing both feature transformations and the trained estimator. **Do not re-implement or refit preprocessing independently in API endpoints.**

### Preprocessing Architecture
- **Numeric Features (`age_years`):** Handled via `SimpleImputer(strategy="median")` followed by `StandardScaler()`.
- **Categorical Features:** Handled via `SimpleImputer(strategy="most_frequent")` followed by `OneHotEncoder(handle_unknown="ignore")`.

### Input Feature Schemas

#### Model 1: Diabetes Input Contract (11 Features)
Defined in detail in [`MODEL_CONTRACT.md`](MODEL_CONTRACT.md):

| # | Field Name | Data Type | Permitted Values / Codes | Survey Source & Description |
|---|---|---|---|---|
| 1 | `age_years` | Numeric | $\ge 0$ | `DM005`: Age at last birthday |
| 2 | `sex_code` | Categorical | Source coded (`1` Male, `2` Female) | `DM003`: Biological sex |
| 3 | `residence_code` | Categorical | `1` Urban, `2` Rural | `residence`: Geographic location |
| 4 | `mpce_quintile` | Categorical | `1`, `2`, `3`, `4`, `5` | `mpce_quintile`: Monthly per capita expenditure |
| 5 | `education_level` | Categorical | `0_never_attended` or `level_<DM008>` | Derived from `DM006` and `DM008` |
| 6 | `family_history_diabetes` | Binary | `0`, `1` | `FM304`: Family member history of diabetes |
| 7 | `hypertension_history` | Binary | `0`, `1` | `HT002`: Reported hypertension mapped to $1/0$ |
| 8 | `high_cholesterol_history` | Binary | `0`, `1` | `HT010`: Reported high cholesterol mapped to $1/0$ |
| 9 | `tobacco_ever` | Binary | `0`, `1` | `HB001`: Lifetime history of tobacco consumption |
| 10 | `vigorous_activity_frequency`| Categorical | Source category code | `HB211`: Frequency of vigorous physical activity |
| 11 | `moderate_activity_frequency`| Categorical | Source category code | `HB213`: Frequency of moderate physical activity |

#### Model 2: CVD Composite Input Contract (13 Features)
Defined in detail in [`MODEL_CONTRACT.md`](MODEL_CONTRACT.md):

| # | Field Name | Data Type | Permitted Values / Codes | Survey Source & Description |
|---|---|---|---|---|
| 1 | `age_years` | Numeric | $\ge 0$ | `DM005`: Age at last birthday |
| 2 | `sex_code` | Categorical | Source coded | `DM003`: Biological sex |
| 3 | `residence_code` | Categorical | `1` Urban, `2` Rural | `residence`: Geographic location |
| 4 | `mpce_quintile` | Categorical | `1` to `5` | `mpce_quintile`: Economic quintile |
| 5 | `education_level` | Categorical | `0_never_attended` or level code | Derived from `DM006`, `DM008` |
| 6 | `family_history_hypertension` | Binary | `0`, `1` | `FM303`: Family member history of hypertension |
| 7 | `family_history_heart_disease`| Binary | `0`, `1` | `FM305`: Family member history of heart disease |
| 8 | `family_history_stroke` | Binary | `0`, `1` | `FM306`: Family member history of stroke |
| 9 | `diabetes_reported` | Binary | `0`, `1` | `HT003`: Reported diabetes mapped to $1/0$ |
| 10 | `high_cholesterol_history` | Binary | `0`, `1` | `HT010`: Reported cholesterol mapped to $1/0$ |
| 11 | `tobacco_ever` | Binary | `0`, `1` | `HB001`: Lifetime history of tobacco consumption |
| 12 | `vigorous_activity_frequency`| Categorical | Source category code | `HB211`: Frequency of vigorous physical activity |
| 13 | `moderate_activity_frequency`| Categorical | Source category code | `HB213`: Frequency of moderate physical activity |

> [!NOTE]
> To prevent direct target leakage, the three outcome-defining variables (`HT002`, `HT006`, and `HT007`) are excluded from Model 2's predictor inputs.

---

## 9. Local Reproduction & Retraining

To reproduce the training pipelines and verify metrics locally:

### Step 1: Prepare Environment
Ensure Python 3.10+ is active in your virtual environment and install project dependencies:
```bash
python -m pip install -r requirements.txt
```

### Step 2: Ensure Data Availability
Verify that the authorized survey file is placed locally at:
```
data/Individual_Daman_and_Diu.xlsx
```

### Step 3: Train Baseline Models
Execute the base training script across both tasks:
```bash
python train_lasi_models.py --input "data/Individual_Daman_and_Diu.xlsx"
```
*Outputs baseline model binaries in `models/` and evaluation metrics in `reports/lasi_daman_diu_model_metrics.csv`.*

### Step 4: Run Hyperparameter Tuning
Execute fine-tuning on the Diabetes task:
```bash
python tune_selected_models.py
```
*Saves the tuned pipeline to `models/diabetes_random_forest_tuned_lasi_dd.joblib` and generates `reports/lasi_daman_diu_selected_model_tuning.md`.*

### Step 5: Execute Smoke Tests
Verify model inference and schema compatibility:
```bash
python predict_lasi_models.py
```

---

## 10. Scientific Limitations & Safe-Use Guidelines

1. **Self-Reported Survey Ground Truth:**  
   Target classifications reflect respondents' self-reported diagnoses given by healthcare providers, which may be subject to recall bias, under-diagnosis in rural areas, or health literacy limitations.
2. **Small Regional Cohort:**  
   Trained on $N = 991$ respondents ($986$ usable labels) restricted to the Union Territory of Daman & Diu. Findings cannot be generalized to broader Indian national or state-level populations without representative multi-state training.
3. **Unweighted Statistical Metrics:**  
   Evaluations are calculated without applying LASI complex survey sampling weights, stratification indicators, or clustering adjustments.
4. **Prior Hold-Out Exposure:**  
   The 80/20 test split was referenced during experimental iterations; true generalization requires evaluation on an unobserved independent cohort.
5. **Score Probabilities Are Not Calibrated Medical Risks:**  
   Predicted probabilities generated by `predict_proba()` represent statistical classifier confidence within the feature space, **not** clinically calibrated absolute risks of developing disease.
6. **Strict Non-Diagnostic Restriction:**  
   These artifacts are software engineering demonstrations. They must **never** be used for clinical triage, automated medical diagnosis, or replacing evaluation by a registered medical practitioner.

---

## 11. Related Technical Documents

- [`MODEL_CONTRACT.md`](MODEL_CONTRACT.md) — Exact schema specifications, input constraints, and serialization details.
- [`MODEL_1_DIABETES.md`](MODEL_1_DIABETES.md) — Comprehensive technical notes for the Diabetes classification pipeline.
- [`MODEL_2_CVD_COMPOSITE.md`](MODEL_2_CVD_COMPOSITE.md) — Comprehensive technical notes for the CVD composite pipeline.
- [`TUNING_SUMMARY.md`](TUNING_SUMMARY.md) — Cross-validation analysis and hyperparameter tuning decisions.
- [`BACKEND_HANDOVER.md`](BACKEND_HANDOVER.md) — Guidelines for FastAPI service integration.
- [`reports/lasi_daman_diu_model_summary.md`](reports/lasi_daman_diu_model_summary.md) — Evaluation summary report.
