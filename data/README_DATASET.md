# Fedigree Dataset Directory

This directory contains data resources used across the Fedigree ML pipelines.

---

## 1. LASI Wave 1 Individual-Level Extracts

The combined Fedigree baseline models are trained on two authorized LASI Wave 1 Individual-level XLSX extracts:

1. **`Individual_Daman_and_Diu.xlsx`**
   - **Respondents (rows):** 991
   - **Columns:** 2,623
   - **State:** Daman and Diu (stateid = 25)
   - **Usable target records:** 986 (171 diabetes positive; 327 CVD composite positive; 5 missing/unresolved)
   - **Survey weights:** `stateindividualweight` (mean 34.25), `indiaindividualweight` (mean 35.70)

2. **`Individual_Maharashtra.xlsx`**
   - **Respondents (rows):** 3,973
   - **Columns:** 2,623
   - **State:** Maharashtra (stateid = 27)
   - **Usable target records:** 3,962 (549 diabetes positive; 1,211 CVD composite positive; 11 missing/unresolved)
   - **Survey weights:** `stateindividualweight` (mean 6,520.52), `indiaindividualweight` (mean 7,341.20)

### Combined Dataset Scope
- **Total rows appended row-wise:** 4,964 respondents
- **Unique respondent identifiers (`prim_key`):** 4,964 (0 duplicates, 0 overlapping IDs between states)
- **Model 1 (Diabetes) usable records:** 4,948 (720 Yes / 14.55% prevalence, 4,228 No, 16 missing)
- **Model 2 (CVD Composite) usable records:** 4,948 (1,538 Positive / 31.08% prevalence, 3,410 Negative, 16 missing)
- **Chronic Heart Disease (`ht006`) standalone:** 209 positive reports across both states

> **CRITICAL SECURITY AND DATA USE NOTICE:**
> The raw survey workbooks (`Individual_Daman_and_Diu.xlsx`, `Individual_Maharashtra.xlsx`) and any derived row-level respondent health records are strictly excluded from Git by `.gitignore`. Do not commit, stage, or publish restricted individual-level LASI records or derived microdata. Follow all IIPS (International Institute for Population Sciences) access and data-use agreements.

---

## 2. Synthetic Prototype Dataset (`fedigree_diabetes_synthetic_500.csv`)

### Note: These are NOT real patients
Every row is artificially generated. The records do not come from a survey, clinic, government dataset, or residents of Daman/Diu or Maharashtra. The `district_demo` and state/UT fields only provide demo context. Do not describe this file as a real dataset or use it to make medical claims.

The target `diabetes_status_synthetic` was generated using an artificial probability rule based on synthetic features. It is NOT a clinically determined diagnosis. Use it only to test pipeline mechanics, API integration, and UI behavior.

### Overview
- **Rows:** 500
- **Columns:** 15
- **Purpose:** Prototype testing for initial synthetic pipeline (`train_diabetes.py`, `diabetes_inference.py`).
- **Seed:** 20261011 (for reproducibility)
