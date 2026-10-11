# Technical Architecture & Technology Stack: Fedigree

**Project:** Fedigree – Family Health Tree & NCD Risk Engine  
**Platform Target:** Modern Web Application (Responsive: Mobile, Tablet, Desktop)  
**Branch:** `md`  

---

## 1. High-Level Architecture Overview

Fedigree employs a modular, client-first modern web architecture designed for low latency, rapid rendering, high responsiveness on mobile devices (critical for Indian tier-2/tier-3 cities and field health workers), and seamless offline/online transitions.

```
                              ┌────────────────────────────────────────┐
                              │            USER INTERFACE              │
                              │  (Next.js 14 / React 18 + TailwindCSS) │
                              └───────────────────┬────────────────────┘
                                                  │
                ┌─────────────────────────────────┼────────────────────────────────┐
                ▼                                 ▼                                ▼
     ┌───────────────────────┐       ┌────────────────────────┐      ┌──────────────────────────┐
     │ Interactive Pedigree  │       │ Trilingual Engine      │      │ Dynamic Form Intake      │
     │ (@xyflow/react/React  │       │ (i18next: MR, HI, EN)  │      │ (React Hook Form + Zod)  │
     │  Flow + SVG Canvas)   │       └────────────────────────┘      └────────────┬─────────────┘
     └──────────┬────────────┘                                                    │
                │                                                                 │
                └─────────────────────────┬───────────────────────────────────────┘
                                          ▼
                             ┌─────────────────────────┐
                             │    CORE CLIENT ENGINE   │
                             ├─────────────────────────┤
                             │ • IDRS Risk Calculator  │
                             │ • CVD & HTN Evaluator   │
                             │ • Consent Guard Engine  │
                             └────────────┬────────────┘
                                          │
                ┌─────────────────────────┼─────────────────────────┐
                ▼                         ▼                         ▼
   ┌──────────────────────────┐ ┌───────────────────┐ ┌──────────────────────────┐
   │ External Services & APIs │ │ 1-Page Doctor PDF │ │ Local & Cloud Storage    │
   │ • CPCB AQI (Data.gov.in) │ │ (@react-pdf /     │ │ • IndexedDB (Offline)    │
   │ • Simulated ABDM Gateway │ │  html2canvas+jsPDF│ │ • Supabase / PostgreSQL  │
   └──────────────────────────┘ └───────────────────┘ └──────────────────────────┘
```

---

## 2. Layer-by-Layer Technology Choices

### A. Frontend Application Layer
* **Framework**: **Next.js 14 (App Router) + React 18**
  * *Rationale*: Provides optimal SEO, Server-Side Rendering (SSR) for static health education articles, and lightning-fast Client-Side hydration for interactive pedigree trees.
* **Styling & UI Components**: **Tailwind CSS + shadcn/ui + Lucide React Icons**
  * *Rationale*: Rapid UI assembly, highly accessible UI primitives (dialogs, tabs, accordions), and low bundle weight.
* **State Management**: **Zustand**
  * *Rationale*: Extremely lightweight (<1KB), avoids React Context boilerplate, and provides easy persistence to `localStorage` / `IndexedDB` for draft trees and patient sessions.

### B. Interactive Family Pedigree Canvas
* **Tree & Graph Rendering**: **`@xyflow/react` (React Flow)** or **D3.js Tree Layout**
  * *Rationale*: 
    * Smooth zooming, panning, and drag-and-drop node placement on both touchscreens and desktops.
    * Highly customizable node components capable of rendering multi-disease color badges, age indicators, and consent lock icons.
    * Generates clean SVG/PNG snapshots for inclusion into the doctor triage PDF.

### C. Clinical Risk & Scoring Engine (Pure TypeScript / JavaScript)
* **IDRS (Indian Diabetes Risk Score) Engine**:
  * Pure, deterministic client-side execution for instant feedback.
  * Inputs: Age ($<35, 35-49, \ge 50$), Waist Circumference (Gender-adjusted Indian cutoffs), Physical Activity (Vigorous, Moderate, Sedentary), Parental History (No, 1 parent, Both parents).
* **Cardiovascular & Hypertension Risk Matrix**:
  * Non-invasive risk stratification based on family history of premature CAD ($<55$ male / $<65$ female), systolic/diastolic blood pressure history, and tobacco usage.
* **Validation Library**: **Zod**
  * *Rationale*: Strict type checking and runtime schema validation for biometric and kinship inputs.

### D. Localization & Multi-Language Support
* **Localization Library**: **i18next + react-i18next**
* **Supported Locales**:
  * `mr`: Marathi (मराठी) – Native focus for Maharashtra Zone.
  * `hi`: Hindi (हिंदी) – Pan-India national accessibility.
  * `en`: English – Standard clinical & international language.
* **Storage**: Local JSON dictionaries loaded dynamically based on user selection or browser language header.

### E. Clinical Document Export Engine (Doctor-Ready Brief)
* **Library**: **`@react-pdf/renderer`** (or **`jspdf` + `html2canvas`**)
* **Capabilities**:
  * Vector-grade clinical PDF generation directly in the browser with zero server roundtrip.
  * Generates a 1-page structured medical summary featuring:
    1. Patient biometrics & verified vitals.
    2. 3-generation pedigree diagram snapshot.
    3. Stratified risk scores (IDRS, CVD, Environmental).
    4. Suggested clinical actions (e.g., Fasting Blood Glucose, HbA1c, Lipid Profile).


### F. Backend, AI Services & Data Persistence

* **Backend API: FastAPI (Python)**
  * Serves as the custom backend for machine learning inference, risk-assessment services, RAG pipelines, and application-specific business logic.
  * **ML Inference:** Integrates the Diabetes and CVD/CAD classifier pipelines through validated REST API endpoints.
  * **Request Validation:** Uses Pydantic schemas to validate incoming requests and standardize prediction responses.
  * **API Server:** Uvicorn runs the FastAPI application.
  * **Security:** Authenticates requests, validates user permissions, and protects sensitive health data.

* **Database & Authentication (BaaS): Supabase (PostgreSQL)**
  * **Authentication:** Phone OTP or Email/Password authentication for users.
  * **Data Persistence:** Stores user profiles, family relationships, pedigrees, and authorized medical-history records.
  * **Row Level Security (RLS):** Enforces record-level access policies so users can access only the data they are authorized to view.
  * **Backend Integration:** FastAPI can access Supabase data according to the application's authentication and authorization rules.

* **RAG & AI Integration**
  * FastAPI orchestrates retrieval and response-generation workflows for relevant health information.
  * The specific embedding model, vector store, and LLM provider will be finalized separately.
  * Retrieved information should be grounded in reliable sources and must not replace professional medical advice.

* **Offline-First Fallback: IndexedDB (via Dexie.js)**
  * Stores locally available pedigree information and permitted data for offline use.
  * Supports offline pedigree creation and synchronization when internet connectivity returns.
  * Deterministic screening calculations, such as an appropriately implemented IDRS score, can run in the frontend while offline.
  * **ML Limitation:** The Python `.joblib` models require a running Python inference environment. Offline ML predictions require a separately implemented local inference solution; otherwise, predictions must wait until connectivity is restored.
  * Sensitive locally stored health data must be protected, and synchronization must respect consent, authentication, and conflict-resolution rules.


### G. External Integrations & APIs
* **Environmental API**: **Central Pollution Control Board (CPCB) / Data.gov.in Real-Time AQI API**
  * Ingests real-time PM2.5 and PM10 concentrations based on user pin code or district in Maharashtra (e.g., Pune, Mumbai, Nagpur, Nashik).
* **ABDM (Ayushman Bharat Digital Mission) Mock Adapter**:
  * Implements simulated endpoints for ABHA address creation and consent artifact creation conforming to National Health Authority (NHA) M1/M2/M3 specifications.

---

## 3. Security, Privacy & Consent Architecture
* **Role-Based Access Control (RBAC)**: Distinguishes between Primary Account Holder, Linked Family Member, and Healthcare Provider.
* **Consent Token Model**: A family member node has two visibility states:
  * `Graph State` (Visible): Relationship link (e.g., "Mother", "Maternal Grandfather") and aggregated hereditary flag ("History of Diabetes").
  * `Clinical State` (Restricted): Granular diagnostic records, exact medication logs, and lab results, accessible only with cryptographic or explicit user approval.
