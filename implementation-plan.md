# Implementation Plan: Fedigree Web Application

**Competition:** SEVA Innovation Challenge 2026 (Maharashtra Zone)  
**Target:** Category 4 – Non-Communicable and Emerging Lifestyle-Oriented Diseases  
**Team Size:** 5 Members  
**Branch:** `md`  

---

## 1. Phased Roadmap Overview

The development process is structured into 5 cohesive phases, transitioning from foundation to clinical intelligence, UI/UX polish, and final hackathon presentation.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        IMPLEMENTATION TIMELINE                         │
├────────────────────┬────────────────────┬──────────────────────────────┤
│ Phase 1: Core Base │ Phase 2: Canvas    │ Phase 3: Clinical Engines    │
│ • Next.js Scaffold │ • Pedigree Graph   │ • IDRS Diabetes Scoring      │
│ • Zustand State    │ • Dynamic Nodes    │ • CVD / HTN Matrix           │
│ • Trilingual JSON  │ • Kinship Edges    │ • Environmental AQI          │
├────────────────────┴────────────────────┴──────────────────────────────┤
│ Phase 4: Care Pathways & Export         │ Phase 5: Testing & Pitch     │
│ • ICMR-NIN Nutrition & Habit Guidance   │ • Test Cases & Validation    │
│ • 1-Page Clinical Triage PDF Export     │ • Video Demo & Deck          │
│ • Consent-Guard Simulation              │ • GitHub Final Sync          │
└─────────────────────────────────────────┴──────────────────────────────┘
```

---

## 2. Phase-by-Phase Breakdown

### Phase 1: Foundation, Workspace & Localization Scaffold
* **Goal**: Establish the Next.js/React project structure, theme, core UI components, and trilingual foundation.
* **Key Tasks**:
  1. Initialize Next.js 14 project with Tailwind CSS and Lucide icons.
  2. Implement global state store using Zustand (`pedigreeStore.ts`) for managing family nodes, relations, and current user profile.
  3. Set up trilingual internationalization dictionaries (`en.json`, `mr.json`, `hi.json`) covering all medical terms, navigation, and questions in Marathi, Hindi, and English.
  4. Create responsive navigation header with quick language switcher and dark/light theme support.
* **Deliverable**: Running web application shell with live trilingual switching.

---

### Phase 2: Interactive Family Pedigree Canvas
* **Goal**: Build the interactive, visual multi-generational pedigree chart.
* **Key Tasks**:
  1. Integrate `@xyflow/react` (React Flow) canvas.
  2. Build custom Pedigree Node components (`FamilyMemberNode.tsx`):
     - Displays avatar/gender glyph (Standard square for male, circle for female).
     - Color-coded badges for tracked NCD conditions (Red = Diabetes, Blue = Hypertension, Purple = Heart Disease, Green = Respiratory).
     - Indicator for consent status (Unlocked vs. Restricted).
  3. Build the "Add Relative" modal: Quick form to add Father, Mother, Sibling, Child, or Grandparent with verified conditions.
  4. Implement auto-layout algorithms for clean generational hierarchy alignment.
* **Deliverable**: Fully interactive family canvas allowing users to visualize 3 generations in real time.

---

### Phase 3: Clinical Risk Engine & Environmental Multiplier
* **Goal**: Implement deterministic, validated clinical calculators with zero latency.
* **Key Tasks**:
  1. **IDRS Engine (`idrsCalculator.ts`)**:
     - Strict implementation of MDRF / ICMR-INDIAB score:
       - Age: $<35$ (0 pts), $35-49$ (20 pts), $\ge 50$ (30 pts).
       - Waist Circumference: Female $<80\text{ cm}$ (0), $80-89\text{ cm}$ (10), $\ge 90\text{ cm}$ (20); Male $<80\text{ cm}$ (0), $80-89\text{ cm}$ (10), $\ge 90\text{ cm}$ (20).
       - Physical Activity: Vigorous work/exercise (0), Moderate (20), Sedentary (30).
       - Family History: Neither parent diabetic (0), One parent (10), Both parents (20).
     - Output: Score out of 100 with Low ($<30$), Moderate ($30-59$), High ($\ge 60$) classifications.
  2. **Cardiovascular & Hypertension Matrix (`cardioRiskMatrix.ts`)**:
     - Evaluates parental premature CAD, systolic/diastolic readings, and tobacco/gutka usage.
  3. **Environmental AQI Ingestion (`aqiService.ts`)**:
     - Integration with CPCB real-time AQI data or simulated Maharashtra district mapper (Pune, Mumbai, Nagpur, Nashik, Aurangabad).
* **Deliverable**: Complete risk dashboard showing dynamic visual gauges and risk breakdowns.

---

### Phase 4: Actionable Care Pathways & Doctor-Ready PDF Export
* **Goal**: Bridge diagnosis with practical action and clinical utility.
* **Key Tasks**:
  1. **ICMR-NIN Preventive Guidance**:
     - Tailored nutritional tips matching regional dietary patterns (e.g., Jowar/Bajra bhakri vs. refined flour, recommended edible oil blends, salt reduction targets).
  2. **1-Page Doctor Triage PDF Generator (`DoctorTriageReport.tsx`)**:
     - One-click browser generation of a high-density, printable medical summary using `@react-pdf/renderer` or `jspdf`.
     - Layout: Patient vitals, mini-pedigree diagram, stratified IDRS & CVD risk scores, red-flag risk factors, and recommended diagnostic lab orders.
  3. **Privacy & Consent Guard**:
     - UI demonstration showing how a relative can be invited without granting unrestricted access to private lab reports.
* **Deliverable**: Functional PDF download and personalized lifestyle intervention plan.

---

### Phase 5: Verification, Validation & Hackathon Pitch Polish
* **Goal**: Thorough testing, clinical sanity checking, documentation, and submission prep.
* **Key Tasks**:
  1. Unit test the risk scoring engine against published ICMR clinical benchmark profiles.
  2. Test responsiveness across mobile phones, tablets, and desktop browsers.
  3. Validate Marathi translations for linguistic accuracy and regional naturalness.
  4. Record 3-minute video walkthrough demonstration.
  5. Final commit and push to branch `md` on GitHub (`https://github.com/KunalPatilCode/Fedigree.git`).
* **Deliverable**: Production-ready hackathon repository, live demo, and submission-ready pitch artifacts.
