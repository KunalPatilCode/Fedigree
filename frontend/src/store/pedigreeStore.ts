import { create } from "zustand";
import { Language } from "@/lib/translations";
import { IDRSResult, calculateClientIDRS } from "@/lib/idrsClient";

export interface Relative {
  id: string;
  relation: "self" | "father" | "mother" | "brother" | "sister" | "grandfather" | "grandmother" | "child";
  name: string;
  age: number;
  gender: "male" | "female";
  isAlive: boolean;
  hasDiabetes: boolean;
  hasHypertension: boolean;
  hasHeartDisease: boolean;
  hasStroke: boolean;
  hasAsthma: boolean;
  notes?: string;
}

export interface AssessmentData {
  ageYears: number;
  gender: "male" | "female";
  waistCm: number;
  physicalActivity: "vigorous" | "moderate" | "sedentary";
  tobaccoEver: boolean;
  district: string;
  educationLevel: string;
  mpceQuintile: number;
}

interface PedigreeStore {
  language: Language;
  setLanguage: (lang: Language) => void;
  relatives: Relative[];
  addRelative: (rel: Omit<Relative, "id">) => void;
  updateRelative: (id: string, rel: Partial<Relative>) => void;
  deleteRelative: (id: string) => void;
  assessment: AssessmentData;
  setAssessment: (data: Partial<AssessmentData>) => void;
  idrsResult: IDRSResult | null;
  mlDiabetesScore: number | null;
  mlCvdScore: number | null;
  aqiData: { district: string; aqi: number; category: string; impact: string } | null;
  isCalculating: boolean;
  runAssessment: () => Promise<void>;
}

const DEFAULT_RELATIVES: Relative[] = [
  {
    id: "self-node",
    relation: "self",
    name: "Self / स्वतः",
    age: 38,
    gender: "male",
    isAlive: true,
    hasDiabetes: false,
    hasHypertension: false,
    hasHeartDisease: false,
    hasStroke: false,
    hasAsthma: false,
  },
  {
    id: "father-node",
    relation: "father",
    name: "Father / वडील",
    age: 65,
    gender: "male",
    isAlive: true,
    hasDiabetes: true,
    hasHypertension: true,
    hasHeartDisease: false,
    hasStroke: false,
    hasAsthma: false,
  },
  {
    id: "mother-node",
    relation: "mother",
    name: "Mother / आई",
    age: 61,
    gender: "female",
    isAlive: true,
    hasDiabetes: true,
    hasHypertension: false,
    hasHeartDisease: false,
    hasStroke: false,
    hasAsthma: false,
  },
];

export const usePedigreeStore = create<PedigreeStore>((set, get) => ({
  language: "en",
  setLanguage: (lang) => set({ language: lang }),
  relatives: DEFAULT_RELATIVES,

  addRelative: (rel) => {
    const newRelative: Relative = {
      ...rel,
      id: `rel-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    set((state) => ({ relatives: [...state.relatives, newRelative] }));
  },

  updateRelative: (id, updated) => {
    set((state) => ({
      relatives: state.relatives.map((r) => (r.id === id ? { ...r, ...updated } : r)),
    }));
  },

  deleteRelative: (id) => {
    set((state) => ({
      relatives: state.relatives.filter((r) => r.id !== id),
    }));
  },

  assessment: {
    ageYears: 38,
    gender: "male",
    waistCm: 88,
    physicalActivity: "moderate",
    tobaccoEver: false,
    district: "Pune",
    educationLevel: "level_2",
    mpceQuintile: 3,
  },

  setAssessment: (data) => {
    set((state) => ({
      assessment: { ...state.assessment, ...data },
    }));
  },

  idrsResult: null,
  mlDiabetesScore: null,
  mlCvdScore: null,
  aqiData: {
    district: "Pune",
    aqi: 128,
    category: "Moderate",
    impact: "Breathing discomfort to sensitive people with lung/heart disease",
  },
  isCalculating: false,

  runAssessment: async () => {
    const state = get();
    set({ isCalculating: true });

    // Determine family history from tree
    const father = state.relatives.find((r) => r.relation === "father");
    const mother = state.relatives.find((r) => r.relation === "mother");
    const fatherDiabetic = !!father?.hasDiabetes;
    const motherDiabetic = !!mother?.hasDiabetes;

    let familyHistoryIDRS: "none" | "one_parent" | "both_parents" = "none";
    if (fatherDiabetic && motherDiabetic) {
      familyHistoryIDRS = "both_parents";
    } else if (fatherDiabetic || motherDiabetic) {
      familyHistoryIDRS = "one_parent";
    }

    // 1. Deterministic Client IDRS calculation (100% offline capable)
    const clientIDRS = calculateClientIDRS({
      age: state.assessment.ageYears,
      gender: state.assessment.gender,
      waistCm: state.assessment.waistCm,
      activity: state.assessment.physicalActivity,
      familyHistory: familyHistoryIDRS,
    });

    let mlDiab = 0.38;
    let mlCvd = 0.29;

    // 2. Try fetching from FastAPI backend if online
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
      const resDiab = await fetch(`${API_URL}/api/v1/diabetes/predict-ml`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age_years: state.assessment.ageYears,
          sex_code: state.assessment.gender === "male" ? 1 : 2,
          residence_code: 1,
          mpce_quintile: state.assessment.mpceQuintile,
          education_level: state.assessment.educationLevel,
          family_history_diabetes: familyHistoryIDRS !== "none" ? 1 : 0,
          hypertension_history: state.relatives.some((r) => r.relation === "self" && r.hasHypertension) ? 1 : 0,
          high_cholesterol_history: 0,
          tobacco_ever: state.assessment.tobaccoEver ? 1 : 0,
          vigorous_activity_frequency: state.assessment.physicalActivity === "vigorous" ? 1 : 4,
          moderate_activity_frequency: state.assessment.physicalActivity === "moderate" ? 2 : 4,
        }),
      });

      if (resDiab.ok) {
        const dataDiab = await resDiab.json();
        mlDiab = dataDiab.probability;
      }

      const resCvd = await fetch(`${API_URL}/api/v1/cvd/predict-ml`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age_years: state.assessment.ageYears,
          sex_code: state.assessment.gender === "male" ? 1 : 2,
          residence_code: 1,
          mpce_quintile: state.assessment.mpceQuintile,
          education_level: state.assessment.educationLevel,
          family_history_hypertension: state.relatives.some((r) => (r.relation === "father" || r.relation === "mother") && r.hasHypertension) ? 1 : 0,
          family_history_heart_disease: state.relatives.some((r) => (r.relation === "father" || r.relation === "mother") && r.hasHeartDisease) ? 1 : 0,
          family_history_stroke: state.relatives.some((r) => (r.relation === "father" || r.relation === "mother") && r.hasStroke) ? 1 : 0,
          diabetes_reported: state.relatives.some((r) => r.relation === "self" && r.hasDiabetes) ? 1 : 0,
          high_cholesterol_history: 0,
          tobacco_ever: state.assessment.tobaccoEver ? 1 : 0,
          vigorous_activity_frequency: state.assessment.physicalActivity === "vigorous" ? 1 : 4,
          moderate_activity_frequency: state.assessment.physicalActivity === "moderate" ? 2 : 4,
        }),
      });

      if (resCvd.ok) {
        const dataCvd = await resCvd.json();
        mlCvd = dataCvd.probability;
      }
    } catch {
      console.log("Backend offline; using client-side calibrated risk heuristics.");
      mlDiab = clientIDRS.score >= 60 ? 0.74 : clientIDRS.score >= 30 ? 0.42 : 0.18;
      mlCvd = (fatherDiabetic || motherDiabetic) ? 0.45 : 0.22;
    }

    set({
      idrsResult: clientIDRS,
      mlDiabetesScore: mlDiab,
      mlCvdScore: mlCvd,
      isCalculating: false,
    });
  },
}));
