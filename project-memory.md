# Project Memory & Living Changelog: Fedigree

**Project:** Fedigree – Family Health Tree & NCD Preventive Care Platform  
**Hackathon:** SEVA Innovation Challenge 2026 (Maharashtra Zone)  
**Branch:** `md`  
**Current Date:** 10 October 2026  
**Status:** In Progress (Active Planning & Scaffolding)  

---

## 1. Project Overview & Core Mission
Fedigree is a web-based digital health platform engineered to curb the epidemic of Non-Communicable Diseases (NCDs) in India—specifically Type 2 Diabetes, Hypertension, and Coronary Artery Disease. It combines a 3-generation interactive family pedigree, non-invasive biometrics (using the ICMR-validated Indian Diabetes Risk Score - IDRS), and live Maharashtra environmental air quality (AQI) to provide personalized, culturally contextualized preventive care pathways.

---

## 2. What Has Been Completed (Current State)

### Repository & Environment
- [x] Initialized Git repository in local workspace.
- [x] Connected remote to `https://github.com/KunalPatilCode/Fedigree.git`.
- [x] Synced and pulled `main` branch.
- [x] Created and checked out active development branch: **`md`**.
- [x] Analyzed baseline document: `Family_Health_NCD_Prevention_Concept.md`.

### Research & Competitive Intelligence
- [x] Conducted in-depth teardown of Western competitor **FamGenix** (specifically analyzed models on `famgenix.com/cancer-risk-assessment/`: Tyrer-Cuzick, BOADICEA, BayesMendel/BRCAPRO, Gail, Claus, QRISK3).
- [x] Established competitive differentiation: FamGenix focuses on Western monogenic hereditary cancers; Fedigree focuses on Indian polygenic lifestyle NCDs (Diabetes, Hypertension, CAD) using South Asian metrics (visceral adiposity/waist circumference vs. Western BMI cutoffs).
- [x] Researched and established clinical models: **IDRS (Indian Diabetes Risk Score by MDRF/ICMR)**, **Indian Hypertension Guidelines (IHS-IV)**, and **CPCB Air Quality Index integration**.

### Foundational Project Documentation
- [x] **`project-scope.md`**: Detailed scope, functional modules, and KPIs.
- [x] **`tech-stack.md`**: Enhanced with FastAPI (Python) backend for ML inference, Supabase RLS, and Dexie.js offline-first fallback.
- [x] **`implementation-plan.md`**: 5-phase execution plan from foundation to final pitch.
- [x] **`end-users.md`**: Granular profile of all primary, secondary, and tertiary user personas.
- [x] **`project-memory.md`**: Living record of project state and next immediate milestones.
- [x] **`project-flow.md`**: End-to-end user flow diagrams and sequence architecture.
- [x] **`team-roles.md`**: 5-member team delegation matrix.

### Machine Learning Models Integrated (from `feat/diabetes-ml-model`)
- [x] **Model 1 (Diabetes Classifier)**: `models/diabetes_random_forest_tuned_lasi_dd.joblib` (Tuned sensitivity-focused model on LASI Wave 1 Daman & Diu dataset; 11 input features).
- [x] **Model 2 (CVD Composite Classifier)**: `models/cvd_composite_logistic_regression_lasi_dd.joblib` (Baseline Logistic Regression for reported hypertension/heart disease/stroke; 13 input features).
- [x] **Inference Infrastructure**: Reusable prediction helpers (`lasi_model_inference.py`), smoke test scripts, and strict `MODEL_CONTRACT.md` schemas.
- [x] **Runtime Compatibility**: Verified and patched for cross-version scikit-learn unpickling compatibility.

---

## 3. What Is Currently Being Built (Active Phase)
* **Backend & API Layer**:
  * FastAPI endpoints (`/predict/diabetes`, `/predict/cvd-composite`) conforming to `MODEL_CONTRACT.md`.
  * Deterministic client-side fallback for IDRS (MDRF/ICMR score) in the frontend for 100% offline capability.
* **Frontend Web Application**:
  * Next.js 14 interactive family pedigree canvas.
  * Trilingual intake forms (Marathi, Hindi, English).

---

## 4. What Is Going to Be Built Next (Immediate Pipeline)

| Priority | Feature / Task | Expected Output |
| :---: | :--- | :--- |
| **P1** | **Interactive Pedigree Canvas** | Drag-and-drop or node-based family graph displaying 3 generations with disease color tags. |
| **P2** | **Non-Invasive Biometric Form** | Interactive form with Indian waist circumference slider, activity selectors, and AQI city picker. |
| **P3** | **1-Page Doctor Triage PDF** | Instant PDF export containing patient vitals, pedigree snapshot, IDRS risk level, and lab recommendations. |
| **P4** | **Dietary & Lifestyle Engine** | Actionable, ICMR-NIN recommendations tailored for Maharashtrian diets. |
| **P5** | **Team Role Alignment & Pitch Video** | Role delegation across the 5 team members and demo recording for SEVA hackathon submission. |

---

## 5. Decision Log & Architecture Choices
* **Decision 1: Focus on Web First**: Selected responsive Next.js/React web app over mobile-only app to allow universal access across smartphones, laptops, and tablets without requiring app-store installation.
* **Decision 2: Non-Invasive First Layer**: Prioritized non-invasive risk screening (IDRS) so any citizen or ASHA worker can determine diabetes/CVD risk in 2 minutes without needing immediate needle blood tests.
* **Decision 3: Trilingual (Marathi First for Maharashtra Zone)**: Native Marathi localization ensures accessibility for peri-urban and rural families across Maharashtra.
