# Full-Stack Implementation Plan (Frontend & Backend)

**Project:** Fedigree – Family Health Tree & NCD Preventive Care Platform  
**Competition:** SEVA Innovation Challenge 2026 (Category 4: NCDs)  
**Branch:** `md`  
**Date:** 15 October 2026  

---

## 1. Project Directory Structure

```
SEVA_FIRST_HACK_TEAM_INNOWATI_PROJECT/
├── backend/                             # Python / FastAPI Service
│   ├── app/
│   │   ├── api/
│   │   │   ├── endpoints/
│   │   │   │   ├── diabetes.py         # Model 1 & IDRS endpoints
│   │   │   │   ├── cvd.py              # Model 2 CVD composite
│   │   │   │   ├── aqi.py              # CPCB / Maharashtra AQI service
│   │   │   │   └── health.py           # Service liveness & readiness
│   │   ├── core/
│   │   │   └── config.py               # Env vars, CORS, paths
│   │   ├── schemas/
│   │   │   ├── diabetes_schema.py      # Pydantic 11-feature contract
│   │   │   ├── cvd_schema.py           # Pydantic 13-feature contract
│   │   │   └── common.py               # Response wrappers & disclaimers
│   │   ├── services/
│   │   │   ├── ml_service.py           # LASI .joblib model inference
│   │   │   └── idrs_service.py         # Validated MDRF/ICMR IDRS logic
│   │   └── main.py                     # FastAPI app factory & routes
│   ├── tests/
│   │   └── test_api.py                 # Smoke & contract tests
│   ├── requirements.txt                # FastAPI, uvicorn, scikit-learn, etc.
│   └── run.py                          # Local backend entrypoint
│
├── frontend/                            # Next.js 14 / React 18 Web App
│   ├── public/
│   │   └── locales/
│   │       ├── en/common.json          # English
│   │       ├── mr/common.json          # Marathi (मराठी)
│   │       └── hi/common.json          # Hindi (हिंदी)
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx              # Root layout + Theme + Providers
│   │   │   ├── page.tsx                # Landing & language selector
│   │   │   ├── tree/page.tsx           # Interactive Pedigree Canvas
│   │   │   ├── assess/page.tsx         # Biometric & Lifestyle Intake
│   │   │   └── report/page.tsx         # Results, Action Plan & 1-Page PDF
│   │   ├── components/
│   │   │   ├── canvas/
│   │   │   │   ├── PedigreeCanvas.tsx  # @xyflow/react canvas
│   │   │   │   ├── FamilyNode.tsx      # Generational node with disease badges
│   │   │   │   └── RelativeModal.tsx   # Add/Edit relative modal
│   │   │   ├── intake/
│   │   │   │   ├── BiometricForm.tsx   # Indian waist, activity, habits
│   │   │   │   └── AQIPicker.tsx       # Maharashtra district/pincode
│   │   │   ├── dashboard/
│   │   │   │   ├── RiskGauge.tsx       # SVG Speedometer gauge
│   │   │   │   └── Explainability.tsx  # Feature contribution cards
│   │   │   ├── report/
│   │   │   │   ├── DoctorTriagePDF.tsx # 1-page clinical print/download
│   │   │   │   └── DietPlan.tsx        # ICMR-NIN Maharashtrian nutrition
│   │   │   └── layout/
│   │   │       ├── Navbar.tsx          # Language switcher & nav
│   │   │       └── Footer.tsx
│   │   ├── lib/
│   │   │   ├── api.ts                  # Axios/fetch client to FastAPI
│   │   │   ├── idrs.ts                 # Client-side offline IDRS engine
│   │   │   └── i18n.ts                 # Localization loader
│   │   └── store/
│   │       └── pedigreeStore.ts        # Zustand tree & assessment state
│   ├── package.json
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── models/                              # Pre-trained .joblib artifacts (merged)
├── data/                                # Synthetic & reference schemas
├── docs/ (existing .md files)
```

---

## 2. Phase-by-Phase Execution Plan

### Phase 1: Backend API Service (`backend/`)
- Setup FastAPI structure, Pydantic schemas mirroring `MODEL_CONTRACT.md`.
- Implement `ml_service.py` to wrap `models/diabetes_random_forest_tuned_lasi_dd.joblib` and `models/cvd_composite_logistic_regression_lasi_dd.joblib`.
- Implement `idrs_service.py` (MDRF/ICMR validated scoring) + fallback.
- Create `/api/v1/predict/diabetes`, `/api/v1/predict/cvd`, and `/api/v1/aqi` endpoints with CORS for frontend.
- Verify with automated smoke tests.

### Phase 2: Frontend Foundation & Localization (`frontend/`)
- Initialize Next.js 14 + Tailwind CSS + Lucide icons.
- Build trilingual engine (`i18n.ts`) supporting **मराठी (Marathi)**, **हिंदी (Hindi)**, and **English**.
- Setup Zustand `pedigreeStore.ts` with local storage persistence.

### Phase 3: Interactive Pedigree Tree Canvas
- Build `@xyflow/react` interactive canvas supporting 3 generations.
- Implement custom node component with gender shapes, disease badges (Diabetes, BP, Heart, Asthma), and consent locks.
- Modal to add parents, grandparents, siblings, and children.

### Phase 4: Intake Forms & Dual Risk Evaluation
- Non-invasive intake form: Indian waist circumference slider, physical activity, tobacco, and Maharashtra district AQI selector.
- Connect frontend to FastAPI backend endpoints with graceful offline fallback to client-side IDRS engine.
- Interactive results dashboard with speedometers and risk factor explanations.

### Phase 5: Action Plan & 1-Page Doctor Triage PDF
- Culturally tailored ICMR-NIN diet & lifestyle prescriptions (Millets, oil limit, physical goals).
- 1-Page printable/downloadable Doctor Triage PDF containing patient vitals, 3-gen pedigree snapshot, risk levels, and suggested lab tests.
- Final end-to-end integration test and GitHub push to branch `md`.
