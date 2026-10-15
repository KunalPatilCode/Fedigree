# Fedigree Dataset Directory

This directory contains data resources used across the Fedigree ML pipelines.

---

## 1. Local LASI Data Extract (`Individual_Daman_and_Diu.xlsx`)

Place the authorized `Individual_Daman_and_Diu.xlsx` extract in this folder before running the LASI model trainer (`train_lasi_models.py`), or pass a local path with `--input`.

> **IMPORTANT:** The raw survey workbook and any row-level derivatives are strictly excluded from Git by `.gitignore`. Do not publish restricted individual-level LASI records or derived row-level health data. Follow all IIPS access and data-use conditions.

---

## 2. Synthetic Prototype Dataset (`fedigree_diabetes_synthetic_500.csv`)

### Note: These are NOT real patients
Every row is artificially generated. The records do not come from a survey, clinic, government dataset, or residents of Daman/Diu. The `district_demo` and state/UT fields only provide demo context. Do not describe this file as a real Daman & Diu dataset or use it to make medical claims.

The target `diabetes_status_synthetic` was generated using a simple artificial probability rule based on the synthetic features. It is NOT a clinically determined diagnosis. Use it only to test preprocessing, training code, API integration, and UI behavior.

### Overview
- **Rows:** 500
- **Columns:** 15
- **Purpose:** Prototype testing for initial synthetic pipeline (`train_diabetes.py`, `diabetes_inference.py`).
- **Seed:** 20261011 (for reproducibility)

