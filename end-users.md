# End-User Personas & Stakeholder Analysis: Fedigree

**Project:** Fedigree – Family Health Tree & NCD Preventive Care Platform  
**Competition:** SEVA Innovation Challenge 2026 (Maharashtra Zone)  
**Target:** Category 4 – Non-Communicable and Emerging Lifestyle-Oriented Diseases  
**Branch:** `md`  

---

## 1. Overview of Stakeholder Ecosystem

To build an impactful solution for India and the Maharashtra Zone, Fedigree addresses the needs of multiple key user groups across the healthcare delivery chain:

```
                          ┌─────────────────────────────┐
                          │     FEDIGREE ECOSYSTEM      │
                          └──────────────┬──────────────┘
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
┌──────────────────────┐      ┌──────────────────────┐      ┌──────────────────────┐
│  PRIMARY CONSUMERS   │      │ COMMUNITY & GRASSROOT│      │ CLINICIANS & PHCs    │
│  Families & Patients │      │ ASHA / ANM Workers   │      │ Doctors & OPD Staff  │
└──────────────────────┘      └──────────────────────┘      └──────────────────────┘
```

---

## 2. Detailed End-User Personas

### Persona 1: The "Family Health Anchor" (Primary Consumer)
* **Demographics**: Age 24–45, working professional or homemaker residing in Pune, Mumbai, Nashik, or tier-2 Maharashtra cities.
* **Profile**: Often the most digitally literate person in the household who manages appointments and medicines for aging parents and younger siblings/children.
* **Core Pain Points**:
  - Medical prescriptions and diagnostic reports of parents are lost in physical files or scattered across WhatsApp chats.
  - Anxious about hereditary risk ("My father had a heart attack at 48 and my mother has diabetes—am I at risk?").
  - Lack of actionable preventive lifestyle guidance suited to traditional Indian diets.
* **Fedigree Value Proposition**:
  - Builds a single, unified 3-generation family tree in minutes.
  - Understands their personal risk score (IDRS) without requiring invasive needle tests right away.
  - Receives culturally tailored ICMR dietary advice (e.g., portion control for rice/bhakri, recommended edible oil blends).

---

### Persona 2: The ASHA / ANM Worker (Grassroots Community Screener)
* **Demographics**: Accredited Social Health Activist (ASHA) or Auxiliary Nurse Midwife (ANM) operating in rural or peri-urban Maharashtra (e.g., Satara, Ahmednagar, Solapur).
* **Profile**: Conducts door-to-door population-based screening under the National NCD Programme. Equipped with a basic smartphone or tablet.
* **Core Pain Points**:
  - Paper-based survey registers (CBAC forms) are slow, error-prone, and burdensome to digitize.
  - High language barrier if software is only in English.
  - Lack of instant visual tools to show families why they should visit the Primary Health Centre (PHC).
* **Fedigree Value Proposition**:
  - **Trilingual Marathi (मराठी) Interface**: Native Marathi prompts make data entry rapid and natural.
  - **Offline/Lightweight Web Access**: Works smoothly on low-spec Android devices.
  - **Instant Visual Traffic-Light Scoring**: Shows family members a simple Green/Yellow/Red risk indicator that encourages them to attend PHC screening.

---

### Persona 3: Primary Health Centre (PHC) Medical Officer & Clinic Doctor
* **Demographics**: General Physician or Medical Officer at an urban/rural health dispensary or private clinic.
* **Profile**: Examines 60–100 patients in a 3-hour morning Outpatient Department (OPD), giving only 2–3 minutes per consultation.
* **Core Pain Points**:
  - No time to elicit a comprehensive 3-generation family medical history during a brief consultation.
  - Patients frequently forget details about parents' medical conditions or ages of onset.
  - Sifting through stacks of unorganized paper reports consumes valuable consultation time.
* **Fedigree Value Proposition**:
  - **1-Page "Doctor-Ready" Triage PDF**: Patients walk in with or share a structured 1-page summary.
  - Visual 3-generation pedigree diagram clearly highlights early cardiovascular events, diabetes, and hypertension patterns.
  - Automated diagnostic suggestion checklist (e.g., "Recommend Fasting Blood Sugar + Lipid Profile").

---

### Persona 4: High-Risk Individual with Lifestyle Vulnerability
* **Demographics**: Age 30–55, sedentary office worker or shop owner living in high-AQI urban areas (e.g., Mumbai, Pune).
* **Profile**: Long working hours, irregular sleep, high-sodium/fried snack consumption, exposed to high ambient PM2.5 pollution.
* **Core Pain Points**:
  - Feels healthy ("I don't have any symptoms, so I'm fine")—unaware of silent hypertension or prediabetes.
  - Hesitant to take time off work for full hospital checkups.
* **Fedigree Value Proposition**:
  - Non-invasive IDRS calculation takes under 2 minutes.
  - Connects real-time local air pollution (AQI) data with personal lifestyle habits, illustrating how environmental exposure compounds cardiovascular risk.
  - Provides achievable micro-habits rather than intimidating, unrealistic diet regimens.

---

## 3. User Journey Mapping

```
Step 1: Onboarding & Language Selection (Marathi / Hindi / English)
   │
   ▼
Step 2: Interactive 3-Generation Family Tree Construction
   │    (Mark conditions: Diabetes, BP, Heart Attack, Stroke)
   ▼
Step 3: Quick Non-Invasive Biometrics & Lifestyle Form
   │    (Age, Waist Circumference, Activity, City/Pin code for AQI)
   ▼
Step 4: Real-time Multi-Vector Risk Calculation
   │    (IDRS Diabetes Score, CVD Vulnerability, Environmental Impact)
   ▼
Step 5: Personalized Action Plan & 1-Page Doctor Brief Generation
   │    (Printable PDF for OPD visit + ICMR-NIN Diet Guidelines)
   ▼
Step 6: Consented Family Sharing
        (Invite relatives with privacy guard enabled)
```

---

## 4. Key Usability & Accessibility Requirements
1. **Linguistic Fluency**: All Marathi text must use culturally authentic and clinically validated terms (e.g., 'मधुमेह' for Diabetes, 'उच्च रक्तदाब' for Hypertension, 'हृदयविकार' for Heart Disease).
2. **Low Cognitive Load**: Replace complex clinical genetic terms with clear visual iconography, intuitive color coding, and plain-language explanations.
3. **Inclusive Design**: Touch targets of at least 44x44px and high contrast ratios to assist elderly users and field screeners in outdoor sunlight.
