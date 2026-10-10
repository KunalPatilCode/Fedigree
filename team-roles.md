# Team Roles & Collaboration Matrix: Fedigree

**Project:** Fedigree – Family Health Tree & NCD Preventive Care Platform  
**Competition:** SEVA Innovation Challenge 2026 (Maharashtra Zone)  
**Team Name:** Team Innowati  
**Team Size:** 5 Members  
**Branch:** `md`  

---

## 1. Collaboration Philosophy

To maximize velocity in the hackathon, each member owns a dedicated vertical while maintaining clear handoff interfaces. This structure ensures parallel development with zero blocking.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TEAM INNOWATI STRUCTURE                         │
├────────────────────────────────────────────────────────────────────────┤
│                       MEMBER 1: PROJECT LEAD & ARCHITECT               │
│                     (Canvas Engine, Full-Stack Scaffold)               │
├───────────────────┬───────────────────┬────────────────────────────────┤
│ MEMBER 2          │ MEMBER 3          │ MEMBER 4                       │
│ Frontend & UX     │ Clinical Engine   │ Preventive Care & Reporting    │
│ (Trilingual Forms)│ (IDRS & AQI APIs) │ (ICMR Advice & Doctor PDF)     │
├───────────────────┴───────────────────┴────────────────────────────────┤
│                       MEMBER 5: AI/ML, QA & PRESENTATION               │
│                     (OCR Vision, Validation & Pitch Deck)              │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Granular Member Role Breakdown

### Member 1: Full-Stack Architect & Pedigree Canvas Lead
* **Primary Ownership**: System architecture, core repository management, interactive family tree canvas, and global state.
* **Core Responsibilities**:
  1. Set up and maintain the Next.js 14 web app foundation and GitHub branch workflows.
  2. Implement the interactive Pedigree Canvas using `@xyflow/react` (React Flow).
  3. Build custom generational nodes with gender shapes, kinship lines, and disease badges.
  4. Manage global state synchronization with **Zustand** (`pedigreeStore.ts`).
* **Key Deliverables**:
  - `src/components/canvas/PedigreeCanvas.tsx`
  - `src/components/canvas/FamilyMemberNode.tsx`
  - `src/store/pedigreeStore.ts`
* **Collaborates Closely With**: Member 2 (modal inputs) & Member 3 (tree data to risk engine).

---

### Member 2: Frontend & Multilingual UX Specialist
* **Primary Ownership**: User interface design, non-invasive biometric input forms, and trilingual localization (Marathi, Hindi, English).
* **Core Responsibilities**:
  1. Build clean, accessible form components (Waist circumference slider, activity radio buttons, city dropdown).
  2. Implement `i18next` configuration and manage translation dictionaries:
     - `public/locales/mr/common.json` (मराठी)
     - `public/locales/hi/common.json` (हिंदी)
     - `public/locales/en/common.json` (English)
  3. Ensure seamless mobile/tablet responsiveness with Tailwind CSS and shadcn/ui.
  4. Create the Language Switcher component and accessible typography controls.
* **Key Deliverables**:
  - `src/components/intake/BiometricForm.tsx`
  - `src/components/intake/RelativeModal.tsx`
  - `src/components/layout/LanguageToggle.tsx`
  - Translation dictionary JSON files.
* **Collaborates Closely With**: Member 1 (modal integration) & Member 5 (linguistic review).

---

### Member 3: Clinical Risk Engine & External Data Lead
* **Primary Ownership**: Algorithmic implementation of validated Indian clinical scoring models and live environmental API integration.
* **Core Responsibilities**:
  1. Implement the **IDRS (Indian Diabetes Risk Score)** calculation logic strictly following ICMR-INDIAB and MDRF clinical benchmarks.
  2. Build the **Cardiovascular & Hypertension Risk Matrix** based on Indian Hypertension Guidelines (IHS-IV) and WHO/ISH South-East Asia charts.
  3. Connect to the **CPCB / Data.gov.in Real-Time AQI API** (or create an offline Maharashtra district fallback mapper for Pune, Mumbai, Nagpur, etc.).
  4. Build the dynamic SVG/Canvas speedometers and score gauge components.
* **Key Deliverables**:
  - `src/lib/calculators/idrsCalculator.ts`
  - `src/lib/calculators/cardioRiskMatrix.ts`
  - `src/lib/services/aqiService.ts`
  - `src/components/dashboard/RiskGauge.tsx`
* **Collaborates Closely With**: Member 1 (intake payload) & Member 4 (scores for PDF).

---

### Member 4: Preventive Care & Clinical Reporting Lead
* **Primary Ownership**: Actionable lifestyle recommendations and the 1-Page "Doctor-Ready" Triage PDF generator.
* **Core Responsibilities**:
  1. Curate clinically reviewed dietary and lifestyle guidelines based on **ICMR-NIN (National Institute of Nutrition)** tailored for Maharashtra (millets, oil limits, salt targets).
  2. Build the **1-Page Clinical Triage PDF Export** using `@react-pdf/renderer` or `jspdf`.
  3. Ensure the PDF report layout is optimized for rapid 2-minute OPD doctor reviews (vitals, 3-gen tree snapshot, risk tiers, recommended diagnostic lab orders).
  4. Implement the consent and privacy-masking logic between connected family nodes.
* **Key Deliverables**:
  - `src/components/reports/DoctorTriagePDF.tsx`
  - `src/components/guidance/NutritionPlan.tsx`
  - `src/lib/data/icmrNutritionData.ts`
* **Collaborates Closely With**: Member 3 (risk scores in PDF) & Member 1 (pedigree snapshot in PDF).

---

### Member 5: AI/ML, Quality Assurance & Pitch Presentation Lead
* **Primary Ownership**: AI report extraction (OCR/Vision AI), clinical validation test suite, hackathon pitch deck, and video demo.
* **Core Responsibilities**:
  1. Implement a lightweight Medical Report OCR feature (using Google Gemini API Vision / Tesseract) to parse uploaded lab photos (HbA1c, Fasting Glucose).
  2. Write unit tests to validate the IDRS and CVD scoring engines against verified clinical case studies.
  3. Create the hackathon submission pitch deck (Problem, Indian Context, FamGenix Gap, Solution, Architecture, Roadmap).
  4. Script and record the 3-minute video walkthrough demonstration highlighting Marathi language features and the 1-page doctor summary.
* **Key Deliverables**:
  - `src/lib/ai/reportScanner.ts`
  - `tests/calculators/idrs.test.ts`
  - `Fedigree_SEVA_Pitch_Deck.pdf / .pptx`
  - 3-Minute Demo Video Walkthrough.
* **Collaborates Closely With**: All members for testing, validation, and demo recording.

---

## 3. Daily Collaboration & Git Workflow

1. **Branching Strategy**:
   - Primary feature work remains centered around the branch **`md`**.
   - For individual features, team members can create short-lived sub-branches:
     - `feature/canvas-m1` (Member 1)
     - `feature/ui-forms-m2` (Member 2)
     - `feature/risk-engine-m3` (Member 3)
     - `feature/doctor-pdf-m4` (Member 4)
     - `feature/ai-tests-m5` (Member 5)
   - Merge approved features back into **`md`**.
2. **Communication Cadence**:
   - Daily 15-minute sync to check interface contracts (data types, JSON payloads, components).
   - Instant blocker resolution on the team chat.
