# Project Scope: Fedigree (Family Health Tree & NCD Preventive Care Platform)

**Competition:** SEVA Innovation Challenge 2026 (Maharashtra Zone)  
**Category:** Category 4 – Non-Communicable and Emerging Lifestyle-Oriented Diseases  
**Target Region:** Maharashtra, India (Trilingual: Marathi, Hindi, English)  
**Repository Branch:** `md`  

---

## 1. Executive Summary
Non-communicable diseases (NCDs)—primarily Type 2 Diabetes, Hypertension, Coronary Artery Disease (CAD), and Chronic Obstructive Pulmonary Diseases (COPD)—account for over 65% of all mortalities in India. The risk is compounded by the **South Asian "thin-fat" phenotype**, where individuals develop metabolic syndrome at lower BMIs due to higher visceral adiposity. 

Currently, family health histories in India remain scattered across fragmented paper prescriptions, siloed diagnostic labs, and personal memory. Consequently, families miss early opportunities for cascade screening, genetic risk evaluation, and preventive lifestyle intervention.

**Fedigree** is an India-centric, privacy-first, web-based digital health platform that bridges hereditary risk, metabolic biometrics, lifestyle habits, and real-time environmental exposure (air quality/AQI) to calculate personalized NCD risks and provide actionable, culturally tailored preventive care pathways.

---

## 2. In-Scope vs. Out-of-Scope

### In-Scope (Hackathon MVP & Target Deliverables)
1. **Interactive Multi-Generational Pedigree Canvas**:
   - Web-based graphical pedigree builder supporting 3 generations (Grandparents, Parents, Self/Siblings, Children).
   - Standard clinical iconography with disease-specific color badging (Diabetes, Hypertension, Heart Attack before 55/65, Stroke, Cancer, Chronic Respiratory Disease).
   - Real-time relation mapping with medical condition tags.
2. **Validated South Asian Clinical Risk Engines**:
   - **IDRS (Indian Diabetes Risk Score)**: Non-invasive assessment based on Age, Waist Circumference (Indian cutoffs: $<80$, $80-89$, $\ge 90$ cm for men; $<70$, $70-79$, $\ge 80$ cm for women), Physical Activity, and Parental History.
   - **Cardiovascular & Hypertension Risk Matrix**: Calibrated using Indian Hypertension Guidelines (IHS-IV) and WHO/ISH South-East Asia risk charts.
   - **Environmental AQI Multiplier**: Live integration with Maharashtra city AQI (via Central Pollution Control Board / Data.gov.in API) to assess cardiopulmonary risk.
3. **Triple-Vector Assessment Engine**:
   - Vector 1: Hereditary Load (Family Pedigree).
   - Vector 2: Metabolic & Lifestyle Biometrics (Waist-to-height, physical activity, tobacco/gutka, alcohol, sleep).
   - Vector 3: Environmental Factors (Ambient PM2.5/PM10, indoor biomass smoke exposure).
4. **Trilingual Localization Engine (Maharashtra Focus)**:
   - Dynamic localization across **Marathi (मराठी)**, **Hindi (हिंदी)**, and **English**.
5. **Doctor-Ready Clinical Triage Export (1-Page PDF)**:
   - Rapid-read summary designed for 2-minute OPD/PHC consultations containing family pedigree diagram, risk score breakdowns, flagged red flags, and recommended confirmatory diagnostic tests (e.g., HbA1c, Lipid Profile, ECG).
6. **Privacy-Preserving Family Consent Architecture**:
   - Granular permissions: Family members can be connected on the family tree without automatically exposing private diagnostic reports or sensitive records.
7. **Actionable ICMR-NIN Preventive Recommendations**:
   - Dietary guidelines tailored to Indian diets (millets, regional Maharashtrian diets, oil rotation, refined sugar limits).

### Out-of-Scope (Post-Hackathon / Future Expansion)
- Direct ABDM production deployment (requires regulatory sandbox approval and government security audit; simulated mock ABDM/ABHA integration will be demonstrated for the hackathon).
- Monogenic hereditary cancer whole-exome sequencing analysis (e.g., full BRCA1/2 raw FASTQ processing).
- Prescribing prescription-grade pharmaceutical medications (system provides screening referrals and lifestyle advice, strictly avoiding unverified drug prescriptions).
- Hardware sensor manufacturing (platform ingests manual user entry or standard Bluetooth/smart device metrics).

---

## 3. Core Functional Modules

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FEDIGREE SYSTEM MODULES                         │
├─────────────────┬───────────────────┬──────────────────────────────────┤
│ Module 1        │ Module 2          │ Module 3                         │
│ Pedigree Canvas │ Risk Engine       │ Lifestyle & Environment Context  │
│ • Visual Nodes  │ • IDRS Diabetes   │ • ICMR-NIN Diet Guidance         │
│ • Kinship Graph │ • HTN / CVD Matrix│ • Live CPCB AQI Ingestion        │
│ • Disease Badges│ • Risk Tiering    │ • Tobacco/Biomass Tracking       │
├─────────────────┼───────────────────┼──────────────────────────────────┤
│ Module 4        │ Module 5          │ Module 6                         │
│ Privacy & Auth  │ Multi-Lingual UI  │ Clinical Triage PDF Export       │
│ • Consent Vault │ • Marathi (मराठी) │ • Standardized 1-Page Summary    │
│ • Node Masking  │ • Hindi (हिंदी)   │ • Doctor Decision Support Flags  │
│ • Role Access   │ • English         │ • Lab Test Referral Checklists   │
└─────────────────┴───────────────────┴──────────────────────────────────┘
```

---

## 4. Key Performance Indicators (KPIs) for Success
1. **Clinical Accuracy & Validity**: 100% adherence of the IDRS engine to Dr. V. Mohan / ICMR-INDIAB published cutoffs and scoring tables.
2. **Speed & Accessibility**: Complete family health history and risk evaluation intake in under 4 minutes.
3. **Usability in Maharashtra**: Smooth language toggle between Marathi, Hindi, and English with zero UI breakage.
4. **Doctor Consultation Utility**: Ability to generate a high-density, 1-page clinical PDF in under 2 seconds.
5. **Zero Data Leakage**: Enforced boundary where unconsented medical records remain masked between linked family nodes.
