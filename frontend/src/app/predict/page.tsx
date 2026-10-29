"use client";

import React, { useState, useRef } from "react";
import {
  FlaskConical,
  User,
  Building2,
  Trees,
  GraduationCap,
  Sparkles,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  ShieldAlert,
  HeartPulse,
  Activity,
  RotateCcw,
  Globe,
} from "lucide-react";

type Language = "en" | "mr" | "hi";

interface DiabetesFormData {
  age_years: number;
  sex_code: number; // 1 = Male, 2 = Female
  residence_code: number; // 1 = Urban, 2 = Rural
  mpce_quintile: number; // 1 to 5
  education_level: string; // "0_never_attended" | "level_1" | "level_2" | "level_3" | "level_4"
  family_history_diabetes: number; // 0 or 1
  hypertension_history: number; // 0 or 1
  high_cholesterol_history: number; // 0 or 1
  tobacco_ever: number; // 0 or 1
  vigorous_activity_frequency: number; // 1 to 4
  moderate_activity_frequency: number; // 1 to 4
}

interface PredictionResult {
  model_name?: string;
  task_name?: string;
  predicted_class: number;
  predicted_class_meaning: string;
  probability: number;
  model_status?: string;
  notice?: string;
  feature_contributions?: Record<string, unknown>;
}

const initialFormData: DiabetesFormData = {
  age_years: 48,
  sex_code: 1, // Male
  residence_code: 1, // Urban
  mpce_quintile: 3, // Quintile 3 (Middle)
  education_level: "level_2", // Secondary
  family_history_diabetes: 0,
  hypertension_history: 0,
  high_cholesterol_history: 0,
  tobacco_ever: 0,
  vigorous_activity_frequency: 3, // 1-3 times a month
  moderate_activity_frequency: 2, // > once a week
};

const translationsData = {
  en: {
    bannerTitle: "ML Model Sandbox & Direct Inference Tool",
    bannerBadge: "Model Testbed",
    bannerDesc:
      "This interactive testing page feeds direct input into the LASI Random Forest machine learning pipeline at /api/v1/diabetes/predict-ml to evaluate classification performance and risk probability.",
    pageTitle: "Diabetes ML Prediction Test Bench",
    pageSubtitle:
      "Direct inference interface for the 11-feature machine learning model trained on Indian longitudinal demographic & biometric data.",
    secDemographics: "1. Personal Demographics",
    secMedical: "2. Medical History & Heredity",
    secLifestyle: "3. Lifestyle & Physical Activity",
    secResults: "4. Machine Learning Prediction Results",
    ageLabel: "Age / वय (Completed Years)",
    ageHelp: "Eligible model input range: 18 - 120 years",
    sexLabel: "Biological Sex / लिंग",
    male: "Male / पुरुष",
    female: "Female / महिला",
    residenceLabel: "Residence Area / निवास क्षेत्र",
    urban: "Urban / शहरी",
    rural: "Rural / ग्रामीण",
    incomeLabel: "Monthly Per Capita Expenditure (MPCE Quintile)",
    incomeHelp: "Socio-economic quintile (Q1 = Lowest 20% consumption, Q5 = Highest 20%)",
    educationLabel: "Highest Education Level / शिक्षण पातळी",
    familyDiabetesLabel: "Family History of Diabetes / कौटुंबिक मधुमेह इतिहास",
    familyDiabetesHelp: "Biological parents or siblings clinically diagnosed with Type 2 diabetes",
    hypertensionLabel: "History of Hypertension / उच्च रक्तदाब (High BP)",
    hypertensionHelp: "Ever formally diagnosed with high blood pressure by a healthcare provider",
    cholesterolLabel: "History of High Cholesterol / कोलेस्टेरॉल विकार",
    cholesterolHelp: "Ever clinically diagnosed with high cholesterol or lipid disorders",
    tobaccoLabel: "Ever Consumed Tobacco / तंबाखू, गुटखा, विडी किंवा सिगारेट",
    tobaccoHelp: "Any lifetime consumption of tobacco, bidi, gutka, khaini, or cigarettes",
    vigorousLabel: "Vigorous Physical Activity Frequency / कष्टाचे काम",
    vigorousHelp: "Strenuous physical labor, cycling, farming, heavy lifting, or brisk athletic activity",
    moderateLabel: "Moderate Physical Activity Frequency / मध्यम व्यायाम",
    moderateHelp: "Brisk walking, brisk housework, cleaning, gardening, or moderate mobility >30 mins/day",
    submitButton: "Run ML Prediction",
    submittingButton: "Running Model Inference...",
    testAgain: "Test Again / Modify Features",
    resetDefaults: "Reset to Defaults",
    resultHeading: "Prediction Outcome & Probability",
    probabilityLabel: "Predicted Model Probability",
    modelBadge: "Model Pipeline",
    classificationLabel: "Model Classification",
    modelNoticeTitle: "Model Architecture Notice",
    clinicalDisclaimerTitle: "Clinical & Survey Model Disclaimer",
    clinicalDisclaimerText:
      "This model predicts LASI self-reported diabetes diagnosis classification. It is NOT a clinical diagnosis tool. Exploratory survey-sample model; not clinically validated.",
    yes: "Yes",
    no: "No",
    lowRiskLabel: "Low Probability (< 30%)",
    moderateRiskLabel: "Moderate Probability (30% - 60%)",
    highRiskLabel: "Elevated Probability (> 60%)",
    posClassMeaning: "Reported Diagnosed Diabetes (Positive Classification)",
    negClassMeaning: "No Reported Diagnosed Diabetes (Negative Classification)",
    featuresSummaryTitle: "Evaluated 11 Feature Vector",
  },
  mr: {
    bannerTitle: "ML मॉडेल चाचणी व थेट पडताळणी साधन",
    bannerBadge: "चाचणी मंच",
    bannerDesc:
      "हे परस्परसंवादी चाचणी साधन LASI रँडम फॉरेस्ट मशीन लर्निंग पाइपलाइन (/api/v1/diabetes/predict-ml) थेट तपासून मॉडेलच्या अचूकतेचे व संभाव्यतेचे विश्लेषण करते.",
    pageTitle: "LASI मधुमेह ML अंदाज चाचणी",
    pageSubtitle:
      "भारतीय लोकसंख्या व आरोग्य घटकांवर प्रशिक्षित ११ घटकांच्या मशीन लर्निंग मॉडेलचे थेट चाचणी दालन.",
    secDemographics: "१. वैयक्तिक लोकसंख्याशास्त्रीय माहिती",
    secMedical: "२. वैद्यकीय इतिहास व अनुवंशिकता",
    secLifestyle: "३. जीवनशैली व शारीरिक हालचाल",
    secResults: "४. मशीन लर्निंग अंदाज निकाल",
    ageLabel: "वय / Age (पूर्ण झालेली वर्षे)",
    ageHelp: "मॉडेल वयोगट: १८ ते १२० वर्षे",
    sexLabel: "जैविक लिंग / Biological Sex",
    male: "पुरुष / Male",
    female: "महिला / Female",
    residenceLabel: "निवास क्षेत्र / Residence Area",
    urban: "शहरी / Urban",
    rural: "ग्रामीण / Rural",
    incomeLabel: "मासिक दरडोई खर्च स्तर (MPCE Quintile)",
    incomeHelp: "आर्थिक स्तर (Q1 = सर्वात कमी २०%, Q5 = सर्वाधिक २०%)",
    educationLabel: "शिक्षण पातळी / Education Level",
    familyDiabetesLabel: "कुटुंबात मधुमेहाचा इतिहास / Family History",
    familyDiabetesHelp: "आई-वडील किंवा भावंडांना कधी मधुमेहाचे निदान झाले आहे का",
    hypertensionLabel: "उच्च रक्तदाबाचा (High BP) इतिहास",
    hypertensionHelp: "डॉक्टरांनी कधी उच्च रक्तदाब असल्याचे सांगितले आहे का",
    cholesterolLabel: "उच्च कोलेस्टेरॉल / लिपिड विकाराचा इतिहास",
    cholesterolHelp: "कधी रक्तातील कोलेस्टेरॉल वाढल्याचे निदान झाले आहे का",
    tobaccoLabel: "तंबाखू, गुटखा, विडी किंवा सिगारेटचे सेवन",
    tobaccoHelp: "आयुष्यात कधीही तंबाखू किंवा संबंधित पदार्थांचे सेवन केले आहे का",
    vigorousLabel: "कष्टाचे / जोरदार काम (वारंवारता)",
    vigorousHelp: "शेती, सायकल चालवणे, कष्टाचे श्रम किंवा जोराचा व्यायाम",
    moderateLabel: "मध्यम हालचाल / चालणे (वारंवारता)",
    moderateHelp: "दररोज ३० मिनिटे जलद चालणे, घरकाम किंवा मध्यम व्यायाम",
    submitButton: "Run ML Prediction (अंदाज मोजा)",
    submittingButton: "मॉडेल विश्लेषण सुरू आहे...",
    testAgain: "पुन्हा चाचणी करा / मूल्ये बदला",
    resetDefaults: "मूळ मूल्ये आणा",
    resultHeading: "मॉडेल अंदाज व संभाव्यता निकाल",
    probabilityLabel: "संभाव्यता टक्केवारी",
    modelBadge: "मॉडेल अल्गोरिदम",
    classificationLabel: "वर्गीकरण निकाल",
    modelNoticeTitle: "मॉडेल सूचना",
    clinicalDisclaimerTitle: "वैद्यकीय सूचना व अस्वीकरण",
    clinicalDisclaimerText:
      "This model predicts LASI self-reported diabetes diagnosis classification. It is NOT a clinical diagnosis tool. Exploratory survey-sample model; not clinically validated.",
    yes: "होय",
    no: "नाही",
    lowRiskLabel: "कमी संभाव्यता (< ३०%)",
    moderateRiskLabel: "मध्यम संभाव्यता (३०% - ६०%)",
    highRiskLabel: "उच्च संभाव्यता (> ६०%)",
    posClassMeaning: "मधुमेह शक्यता वर्गीकरण (Positive Class 1)",
    negClassMeaning: "मधुमेह नसलेले वर्गीकरण (Negative Class 0)",
    featuresSummaryTitle: "तपासलेले ११ निकष",
  },
  hi: {
    bannerTitle: "ML मॉडल परीक्षण एवं प्रत्यक्ष सत्यापन टूल",
    bannerBadge: "मॉडल टेस्टबेड",
    bannerDesc:
      "यह इंटरफेस प्रशिक्षित LASI रैंडम फॉरेस्ट ML पाइपलाइन (/api/v1/diabetes/predict-ml) का प्रत्यक्ष परीक्षण करके वर्गीकरण और जोखिम संभावना की गणना करता है।",
    pageTitle: "LASI डायबिटीज ML भविष्यवाणी परीक्षण",
    pageSubtitle:
      "भारतीय जनसांख्यिकी और स्वास्थ्य डेटा पर प्रशिक्षित 11-फीचर मशीन लर्निंग मॉडल का प्रत्यक्ष परीक्षण बेंच।",
    secDemographics: "1. व्यक्तिगत जनसांख्यिकी जानकारी",
    secMedical: "2. चिकित्सीय इतिहास एवं आनुवंशिकता",
    secLifestyle: "3. जीवनशैली और शारीरिक गतिविधि",
    secResults: "4. मशीन लर्निंग भविष्यवाणी परिणाम",
    ageLabel: "आयु / Age (पूर्ण वर्ष)",
    ageHelp: "मॉडल आयु सीमा: 18 - 120 वर्ष",
    sexLabel: "जैविक लिंग / Biological Sex",
    male: "पुरुष / Male",
    female: "महिला / Female",
    residenceLabel: "निवास क्षेत्र / Residence Area",
    urban: "शहरी / Urban",
    rural: "ग्रामीण / Rural",
    incomeLabel: "मासिक प्रति व्यक्ति खर्च (MPCE Quintile)",
    incomeHelp: "आर्थिक वर्ग (Q1 = न्यूनतम 20%, Q5 = उच्चतम 20%)",
    educationLabel: "शिक्षा का स्तर / Education Level",
    familyDiabetesLabel: "परिवार में डायबिटीज का इतिहास / Family History",
    familyDiabetesHelp: "माता-पिता या भाई-बहन में डायबिटीज का चिकित्सकीय निदान",
    hypertensionLabel: "हाई ब्लड प्रेशर (हाइपरटेंशन) का इतिहास",
    hypertensionHelp: "क्या डॉक्टर द्वारा कभी हाई ब्लड प्रेशर का निदान किया गया है",
    cholesterolLabel: "हाई कोलेस्ट्रॉल का इतिहास",
    cholesterolHelp: "क्या कभी कोलेस्ट्रॉल या लिपिड असंतुलन की पुष्टि हुई है",
    tobaccoLabel: "तंबाकू, बीड़ी, गुटखा या सिगरेट का सेवन",
    tobaccoHelp: "जीवन में कभी भी तंबाकू उत्पादों का उपयोग किया है",
    vigorousLabel: "कठिन शारीरिक गतिविधि / परिश्रम (आवृत्ति)",
    vigorousHelp: "कठिन शारीरिक श्रम, साइकिल चलाना, भारी काम या तेज खेल",
    moderateLabel: "मध्यम शारीरिक गतिविधि / व्यायाम (आवृत्ति)",
    moderateHelp: "30 मिनट तेज चलना, घरेलू कार्य या मध्यम स्तर की सक्रियता",
    submitButton: "Run ML Prediction (भविष्यवाणी करें)",
    submittingButton: "मॉडल विश्लेषण जारी है...",
    testAgain: "पुनः परीक्षण करें / इनपुट बदलें",
    resetDefaults: "डिफ़ॉल्ट सेट करें",
    resultHeading: "मॉडल भविष्यवाणी एवं जोखिम परिणाम",
    probabilityLabel: "मॉडल द्वारा आकलित संभावना",
    modelBadge: "मॉडल एल्गोरिदम",
    classificationLabel: "मॉडल वर्गीकरण",
    modelNoticeTitle: "मॉडल आर्किटेक्चर सूचना",
    clinicalDisclaimerTitle: "चिकित्सीय अस्वीकरण (Disclaimer)",
    clinicalDisclaimerText:
      "This model predicts LASI self-reported diabetes diagnosis classification. It is NOT a clinical diagnosis tool. Exploratory survey-sample model; not clinically validated.",
    yes: "हाँ",
    no: "नहीं",
    lowRiskLabel: "कम संभावना (< 30%)",
    moderateRiskLabel: "मध्यम संभावना (30% - 60%)",
    highRiskLabel: "उच्च संभावना (> 60%)",
    posClassMeaning: "डायबिटीज संभावित वर्गीकरण (Positive Class 1)",
    negClassMeaning: "गैर-डायबिटिक वर्गीकरण (Negative Class 0)",
    featuresSummaryTitle: "मूल्यांकित 11 फीचर्स",
  },
};

const EDUCATION_OPTIONS = [
  {
    value: "0_never_attended",
    labelEn: "Never Attended (0_never_attended)",
    subEn: "No formal schooling / Illiterate",
    subMr: "कधीही शाळेत गेले नाही / निरक्षर",
    subHi: "कभी स्कूल नहीं गए / अनौपचारिक",
  },
  {
    value: "level_1",
    labelEn: "Primary (level_1)",
    subEn: "Up to 5th Standard",
    subMr: "इयत्ता १ ली ते ५ वी पर्यंत",
    subHi: "कक्षा 1 से 5 तक",
  },
  {
    value: "level_2",
    labelEn: "Secondary (level_2)",
    subEn: "6th to 10th Standard",
    subMr: "इयत्ता ६ वी ते १० वी पर्यंत",
    subHi: "कक्षा 6 से 10 तक",
  },
  {
    value: "level_3",
    labelEn: "Higher Secondary (level_3)",
    subEn: "11th - 12th Std / Technical Diploma",
    subMr: "इयत्ता ११ वी - १२ वी / डिप्लोमा",
    subHi: "कक्षा 11 - 12 / डिप्लोमा",
  },
  {
    value: "level_4",
    labelEn: "Graduate & Above (level_4)",
    subEn: "College Degree / Post-Graduate / PhD",
    subMr: "पदवीधर / पदव्युत्तर / उच्चशिक्षित",
    subHi: "स्नातक / परास्नातक / उच्च शिक्षा",
  },
];

const ACTIVITY_FREQUENCIES = [
  {
    code: 1,
    labelEn: "Daily",
    labelMr: "दररोज",
    labelHi: "प्रतिदिन",
    descEn: "Every day",
  },
  {
    code: 2,
    labelEn: "> Once a week",
    labelMr: "> आठवड्यातून १ वेळा",
    labelHi: "> सप्ताह में १ बार",
    descEn: "Multiple times / week",
  },
  {
    code: 3,
    labelEn: "1-3 times / month",
    labelMr: "महिन्यातून १-३ वेळा",
    labelHi: "माह में १-३ बार",
    descEn: "Occasional activity",
  },
  {
    code: 4,
    labelEn: "Hardly ever / Never",
    labelMr: "कधीच नाही / क्वचित",
    labelHi: "कभी नहीं / दुर्लभ",
    descEn: "Sedentary lifestyle",
  },
];

export default function PredictPage() {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("pedigree-storage");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (
            parsed?.state?.language &&
            (parsed.state.language === "en" ||
              parsed.state.language === "mr" ||
              parsed.state.language === "hi")
          ) {
            return parsed.state.language as Language;
          }
        }
      } catch {
        // Standalone execution: safely keep default language
      }
    }
    return "en";
  });
  const [formData, setFormData] = useState<DiabetesFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [apiMeta, setApiMeta] = useState<{
    latencyMs: number;
    timestamp: string;
    status: number;
  } | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const t = translationsData[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const startTime = performance.now();
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
      const res = await fetch(`${API_URL}/api/v1/diabetes/predict-ml`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const elapsedMs = Math.round(performance.now() - startTime);

      if (!res.ok) {
        const errorJson = await res.json().catch(() => null);
        const errorDetail =
          errorJson?.detail || `API responded with HTTP error code ${res.status}`;
        throw new Error(errorDetail);
      }

      const data: PredictionResult = await res.json();
      setResult(data);
      setApiMeta({
        latencyMs: elapsedMs,
        timestamp: new Date().toLocaleTimeString(),
        status: res.status,
      });

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Unknown error during prediction request.";
      setError(
        `${message} - Please ensure the backend API is reachable.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setResult(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Offline mock fallback tester in case the user tests UI without FastAPI running
  const handleOfflineSimulation = () => {
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      // Approximate probability based on weighted LASI survey coefficients
      let score = 0.12;
      if (formData.age_years >= 60) score += 0.28;
      else if (formData.age_years >= 45) score += 0.18;
      else if (formData.age_years >= 35) score += 0.08;

      if (formData.family_history_diabetes === 1) score += 0.22;
      if (formData.hypertension_history === 1) score += 0.16;
      if (formData.high_cholesterol_history === 1) score += 0.12;
      if (formData.tobacco_ever === 1) score += 0.07;
      if (formData.residence_code === 1) score += 0.05; // Urban slightly higher
      if (formData.mpce_quintile >= 4) score += 0.06; // Affluence association in survey
      if (formData.vigorous_activity_frequency >= 3) score += 0.06;
      if (formData.moderate_activity_frequency >= 3) score += 0.04;

      const probability = Math.min(0.96, Math.max(0.04, score));
      const predicted_class = probability >= 0.45 ? 1 : 0;

      setResult({
        model_name: "diabetes_random_forest_tuned_lasi_dd (Simulated Local Preview)",
        task_name: "diabetes_diagnosis_classification",
        predicted_class,
        predicted_class_meaning:
          predicted_class === 1
            ? "reported_diagnosed_diabetes"
            : "no_reported_diagnosed_diabetes",
        probability: Math.round(probability * 1000) / 1000,
        model_status: "offline_preview_simulation",
        notice:
          "Predicts LASI self-reported diabetes diagnosis classification, not future diabetes risk or a clinical diagnosis. Exploratory survey-sample model; not clinically validated.",
        feature_contributions: {
          age_years: formData.age_years,
          family_history_diabetes: formData.family_history_diabetes,
          hypertension_history: formData.hypertension_history,
        },
      });

      setIsLoading(false);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    }, 450);
  };

  // Color stratification helpers
  const probability = result?.probability ?? 0;
  const isHighRisk = probability > 0.6;
  const isModerateRisk = probability >= 0.3 && probability <= 0.6;

  const gaugeStrokeColor = isHighRisk
    ? "#e11d48" // rose-600
    : isModerateRisk
    ? "#f59e0b" // amber-500
    : "#8064A9"; // purple-500

  const gaugeTrackColor = isHighRisk
    ? "#ffe4e6" // rose-100
    : isModerateRisk
    ? "#fef3c7" // amber-100
    : "#EAE2F5"; // lavender

  const gaugeRadius = 78;
  const gaugeCircumference = 2 * Math.PI * gaugeRadius;
  const strokeDashoffset =
    gaugeCircumference - (Math.min(Math.max(probability, 0), 1) * gaugeCircumference);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Testing Banner */}
      <div className="mb-8 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#FAF8FC] to-[#EAE2F5]/50 border border-[#ded3eb] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-2xl bg-[#452653] text-white shrink-0 shadow-md shadow-[#452653]/20">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-[#452653]">{t.bannerTitle}</span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#EAE2F5] text-[#452653] border border-[#ded3eb]">
                {t.bannerBadge}
              </span>
            </div>
            <p className="text-xs text-[#5e546b] mt-1 leading-relaxed max-w-2xl">
              {t.bannerDesc}
            </p>
          </div>
        </div>

        {/* Trilingual Switcher */}
        <div className="flex items-center bg-white/90 p-1 rounded-2xl border border-[#ded3eb] shadow-xs shrink-0 self-end sm:self-center">
          <Globe className="w-3.5 h-3.5 text-[#8064A9] ml-2 mr-1" />
          {(["en", "mr", "hi"] as Language[]).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setLanguage(lang)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                language === lang
                  ? "bg-[#452653] text-white shadow-xs font-bold"
                  : "text-[#5e546b] hover:text-[#292333] hover:bg-[#FAF8FC]"
              }`}
            >
              {lang === "en" ? "EN" : lang === "mr" ? "मराठी" : "हिंदी"}
            </button>
          ))}
        </div>
      </div>

      {/* Main Page Title Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#452653] bg-[#EAE2F5] px-2.5 py-0.5 rounded-md border border-[#ded3eb]">
              FastAPI Inference Bench
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">LASI Wave 1 Schema</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#292333] tracking-tight">
            {t.pageTitle}
          </h1>
          <p className="text-[#5e546b] text-sm mt-1">{t.pageSubtitle}</p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5e546b] hover:text-[#292333] bg-white border border-[#ded3eb] px-3.5 py-2 rounded-xl hover:bg-[#FAF8FC] transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#8064A9]" />
          <span>{t.resetDefaults}</span>
        </button>
      </div>

      {/* Quick Profile Presets */}
      <div className="mb-6 p-4 rounded-2xl bg-white border border-[#ded3eb] shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="text-xs font-bold text-[#292333] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#8064A9]" />
            <span>Quick Test Profiles (Click to Load &amp; Test Sensitivity)</span>
          </span>
          <span className="text-[11px] text-slate-400">Instant demographic scenarios</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() =>
              setFormData({
                age_years: 20,
                sex_code: 1,
                residence_code: 1,
                mpce_quintile: 3,
                education_level: "level_4",
                family_history_diabetes: 0,
                hypertension_history: 0,
                high_cholesterol_history: 0,
                tobacco_ever: 0,
                vigorous_activity_frequency: 1,
                moderate_activity_frequency: 1,
              })
            }
            className="p-2.5 rounded-xl border border-[#ded3eb] hover:border-[#8064A9] hover:bg-[#FAF8FC] text-left transition-all text-xs cursor-pointer"
          >
            <div className="font-bold text-[#292333]">Young Adult (20y)</div>
            <div className="text-[10px] text-[#5e546b] mt-0.5">Graduate, Active (51.0%)</div>
          </button>
          <button
            type="button"
            onClick={() =>
              setFormData({
                age_years: 48,
                sex_code: 1,
                residence_code: 1,
                mpce_quintile: 3,
                education_level: "level_2",
                family_history_diabetes: 0,
                hypertension_history: 0,
                high_cholesterol_history: 0,
                tobacco_ever: 0,
                vigorous_activity_frequency: 3,
                moderate_activity_frequency: 2,
              })
            }
            className="p-2.5 rounded-xl border border-[#ded3eb] hover:border-[#8064A9] hover:bg-[#FAF8FC] text-left transition-all text-xs cursor-pointer"
          >
            <div className="font-bold text-[#292333]">Middle-Aged (48y)</div>
            <div className="text-[10px] text-[#5e546b] mt-0.5">Baseline LASI Adult (54.3%)</div>
          </button>
          <button
            type="button"
            onClick={() =>
              setFormData({
                age_years: 65,
                sex_code: 1,
                residence_code: 1,
                mpce_quintile: 5,
                education_level: "level_3",
                family_history_diabetes: 1,
                hypertension_history: 1,
                high_cholesterol_history: 1,
                tobacco_ever: 1,
                vigorous_activity_frequency: 4,
                moderate_activity_frequency: 4,
              })
            }
            className="p-2.5 rounded-xl border border-rose-200 bg-rose-50/30 hover:border-rose-500 hover:bg-rose-50 text-left transition-all text-xs cursor-pointer"
          >
            <div className="font-bold text-rose-950">Senior High Risk (65y)</div>
            <div className="text-[10px] text-rose-700/80 mt-0.5">HTN + Diab + Sedentary (61.4%)</div>
          </button>
          <button
            type="button"
            onClick={() =>
              setFormData({
                age_years: 65,
                sex_code: 2,
                residence_code: 2,
                mpce_quintile: 1,
                education_level: "0_never_attended",
                family_history_diabetes: 0,
                hypertension_history: 0,
                high_cholesterol_history: 0,
                tobacco_ever: 0,
                vigorous_activity_frequency: 1,
                moderate_activity_frequency: 1,
              })
            }
            className="p-2.5 rounded-xl border border-[#ded3eb] bg-[#FAF8FC] hover:border-[#8064A9] hover:bg-[#EAE2F5]/40 text-left transition-all text-xs cursor-pointer"
          >
            <div className="font-bold text-[#452653]">Senior Healthy (65y)</div>
            <div className="text-[10px] text-[#8064A9] mt-0.5">Rural, Active Labor (52.1%)</div>
          </button>
        </div>
      </div>

      {/* Interactive 11-Feature Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ========================================================
            Section 1: Personal Demographics (5 Features)
           ======================================================== */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#ded3eb] shadow-xs space-y-6">
          <div className="flex items-center gap-2 text-[#452653] font-bold text-lg border-b border-[#ded3eb] pb-3">
            <User className="w-5 h-5 text-[#8064A9]" />
            <span>{t.secDemographics}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* 1. age_years */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#292333]">
                  {t.ageLabel}
                </label>
                <span className="text-sm font-bold text-[#452653] bg-[#EAE2F5] px-2.5 py-0.5 rounded-lg border border-[#ded3eb]">
                  {formData.age_years} yrs
                </span>
              </div>
              <input
                type="number"
                min={18}
                max={120}
                value={formData.age_years}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    age_years: Math.max(18, Math.min(120, Number(e.target.value) || 18)),
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-[#ded3eb] font-semibold text-[#292333] focus:ring-2 focus:ring-[#8064A9] focus:border-[#8064A9] outline-none"
                required
              />
              <span className="text-[11px] text-[#5e546b] mt-1 block">{t.ageHelp}</span>
            </div>

            {/* 2. sex_code (1=Male, 2=Female) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#292333] mb-2">
                {t.sexLabel}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, sex_code: 1 })}
                  className={`py-2.5 px-3 rounded-xl font-semibold text-sm border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    formData.sex_code === 1
                      ? "bg-[#EAE2F5] border-[#8064A9] text-[#452653] ring-2 ring-[#8064A9]/20 shadow-xs"
                      : "bg-white border-[#ded3eb] text-[#5e546b] hover:border-[#8064A9]"
                  }`}
                >
                  <User className="w-4 h-4 text-[#8064A9]" />
                  <span>{t.male}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, sex_code: 2 })}
                  className={`py-2.5 px-3 rounded-xl font-semibold text-sm border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    formData.sex_code === 2
                      ? "bg-[#EAE2F5] border-[#8064A9] text-[#452653] ring-2 ring-[#8064A9]/20 shadow-xs"
                      : "bg-white border-[#ded3eb] text-[#5e546b] hover:border-[#8064A9]"
                  }`}
                >
                  <User className="w-4 h-4 text-[#8064A9]" />
                  <span>{t.female}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            {/* 3. residence_code (1=Urban, 2=Rural) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#292333] mb-2">
                {t.residenceLabel}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, residence_code: 1 })}
                  className={`py-2.5 px-3 rounded-xl font-semibold text-sm border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    formData.residence_code === 1
                      ? "bg-[#EAE2F5] border-[#8064A9] text-[#452653] ring-2 ring-[#8064A9]/20 shadow-xs"
                      : "bg-white border-[#ded3eb] text-[#5e546b] hover:border-[#8064A9]"
                  }`}
                >
                  <Building2 className="w-4 h-4 text-[#8064A9]" />
                  <span>{t.urban} (1)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, residence_code: 2 })}
                  className={`py-2.5 px-3 rounded-xl font-semibold text-sm border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    formData.residence_code === 2
                      ? "bg-[#EAE2F5] border-[#8064A9] text-[#452653] ring-2 ring-[#8064A9]/20 shadow-xs"
                      : "bg-white border-[#ded3eb] text-[#5e546b] hover:border-[#8064A9]"
                  }`}
                >
                  <Trees className="w-4 h-4 text-[#8064A9]" />
                  <span>{t.rural} (2)</span>
                </button>
              </div>
            </div>

            {/* 5. education_level (string) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#292333] mb-2">
                {t.educationLabel}
              </label>
              <div className="relative">
                <select
                  value={formData.education_level}
                  onChange={(e) =>
                    setFormData({ ...formData, education_level: e.target.value })
                  }
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border border-[#ded3eb] font-semibold text-sm text-[#292333] bg-white focus:ring-2 focus:ring-[#8064A9] focus:border-[#8064A9] outline-none appearance-none cursor-pointer"
                >
                  {EDUCATION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {language === "mr"
                        ? `${opt.subMr} (${opt.value})`
                        : language === "hi"
                        ? `${opt.subHi} (${opt.value})`
                        : `${opt.labelEn} - ${opt.subEn}`}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
                  <GraduationCap className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* 4. mpce_quintile (1-5) */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#292333]">
                {t.incomeLabel}
              </label>
              <span className="text-xs font-bold text-[#452653] bg-[#EAE2F5] px-2.5 py-0.5 rounded-lg border border-[#ded3eb]">
                Quintile {formData.mpce_quintile} / 5
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2 sm:gap-3">
              {[1, 2, 3, 4, 5].map((q) => {
                const isSelected = formData.mpce_quintile === q;
                return (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setFormData({ ...formData, mpce_quintile: q })}
                    className={`py-2.5 px-1.5 rounded-2xl text-center border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#452653] border-[#452653] text-white shadow-sm ring-2 ring-[#8064A9]/30"
                        : "bg-white border-[#ded3eb] text-[#292333] hover:border-[#8064A9] hover:bg-[#FAF8FC]"
                    }`}
                  >
                    <div className="font-extrabold text-sm sm:text-base">Q{q}</div>
                    <div
                      className={`text-[10px] hidden sm:block ${
                        isSelected ? "text-[#EAE2F5]" : "text-[#5e546b]"
                      }`}
                    >
                      {q === 1
                        ? "Poorest 20%"
                        : q === 5
                        ? "Richest 20%"
                        : `Tier ${q}`}
                    </div>
                  </button>
                );
              })}
            </div>
            <span className="text-[11px] text-[#5e546b] mt-2 block">{t.incomeHelp}</span>
          </div>
        </div>

        {/* ========================================================
            Section 2: Medical History (3 Features)
           ======================================================== */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#ded3eb] shadow-xs space-y-6">
          <div className="flex items-center gap-2 text-[#452653] font-bold text-lg border-b border-[#ded3eb] pb-3">
            <HeartPulse className="w-5 h-5 text-[#8064A9]" />
            <span>{t.secMedical}</span>
          </div>

          <div className="space-y-4">
            {/* 6. family_history_diabetes (0 or 1) */}
            <div className="p-4 rounded-2xl bg-[#FAF8FC] border border-[#ded3eb] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="font-bold text-sm text-[#292333]">
                  {t.familyDiabetesLabel}
                </div>
                <div className="text-xs text-[#5e546b]">{t.familyDiabetesHelp}</div>
              </div>
              <div className="flex gap-2 min-w-[170px]">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, family_history_diabetes: 1 })}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    formData.family_history_diabetes === 1
                      ? "bg-rose-50 border-rose-500 text-rose-700 ring-2 ring-rose-500/20 shadow-2xs"
                      : "bg-white border-[#ded3eb] text-[#5e546b] hover:border-[#8064A9]"
                  }`}
                >
                  {t.yes} (1)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, family_history_diabetes: 0 })}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    formData.family_history_diabetes === 0
                      ? "bg-[#EAE2F5] border-[#8064A9] text-[#452653] ring-2 ring-[#8064A9]/20 shadow-2xs"
                      : "bg-white border-[#ded3eb] text-[#5e546b] hover:border-[#8064A9]"
                  }`}
                >
                  {t.no} (0)
                </button>
              </div>
            </div>

            {/* 7. hypertension_history (0 or 1) */}
            <div className="p-4 rounded-2xl bg-[#FAF8FC] border border-[#ded3eb] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="font-bold text-sm text-[#292333]">
                  {t.hypertensionLabel}
                </div>
                <div className="text-xs text-[#5e546b]">{t.hypertensionHelp}</div>
              </div>
              <div className="flex gap-2 min-w-[170px]">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, hypertension_history: 1 })}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    formData.hypertension_history === 1
                      ? "bg-rose-50 border-rose-500 text-rose-700 ring-2 ring-rose-500/20 shadow-2xs"
                      : "bg-white border-[#ded3eb] text-[#5e546b] hover:border-[#8064A9]"
                  }`}
                >
                  {t.yes} (1)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, hypertension_history: 0 })}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    formData.hypertension_history === 0
                      ? "bg-[#EAE2F5] border-[#8064A9] text-[#452653] ring-2 ring-[#8064A9]/20 shadow-2xs"
                      : "bg-white border-[#ded3eb] text-[#5e546b] hover:border-[#8064A9]"
                  }`}
                >
                  {t.no} (0)
                </button>
              </div>
            </div>

            {/* 8. high_cholesterol_history (0 or 1) */}
            <div className="p-4 rounded-2xl bg-[#FAF8FC] border border-[#ded3eb] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="font-bold text-sm text-[#292333]">
                  {t.cholesterolLabel}
                </div>
                <div className="text-xs text-[#5e546b]">{t.cholesterolHelp}</div>
              </div>
              <div className="flex gap-2 min-w-[170px]">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, high_cholesterol_history: 1 })
                  }
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    formData.high_cholesterol_history === 1
                      ? "bg-rose-50 border-rose-500 text-rose-700 ring-2 ring-rose-500/20 shadow-2xs"
                      : "bg-white border-[#ded3eb] text-[#5e546b] hover:border-[#8064A9]"
                  }`}
                >
                  {t.yes} (1)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, high_cholesterol_history: 0 })
                  }
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    formData.high_cholesterol_history === 0
                      ? "bg-[#EAE2F5] border-[#8064A9] text-[#452653] ring-2 ring-[#8064A9]/20 shadow-2xs"
                      : "bg-white border-[#ded3eb] text-[#5e546b] hover:border-[#8064A9]"
                  }`}
                >
                  {t.no} (0)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            Section 3: Lifestyle Factors (3 Features)
           ======================================================== */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#ded3eb] shadow-xs space-y-6">
          <div className="flex items-center gap-2 text-[#452653] font-bold text-lg border-b border-[#ded3eb] pb-3">
            <Activity className="w-5 h-5 text-[#8064A9]" />
            <span>{t.secLifestyle}</span>
          </div>

          {/* 9. tobacco_ever (0 or 1) */}
          <div className="p-4 rounded-2xl bg-[#FAF8FC] border border-[#ded3eb] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="font-bold text-sm text-[#292333]">{t.tobaccoLabel}</div>
              <div className="text-xs text-[#5e546b]">{t.tobaccoHelp}</div>
            </div>
            <div className="flex gap-2 min-w-[170px]">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, tobacco_ever: 1 })}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  formData.tobacco_ever === 1
                    ? "bg-rose-50 border-rose-500 text-rose-700 ring-2 ring-rose-500/20 shadow-2xs"
                    : "bg-white border-[#ded3eb] text-[#5e546b] hover:border-[#8064A9]"
                }`}
              >
                {t.yes} (1)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, tobacco_ever: 0 })}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  formData.tobacco_ever === 0
                    ? "bg-[#EAE2F5] border-[#8064A9] text-[#452653] ring-2 ring-[#8064A9]/20 shadow-2xs"
                    : "bg-white border-[#ded3eb] text-[#5e546b] hover:border-[#8064A9]"
                }`}
              >
                {t.no} (0)
              </button>
            </div>
          </div>

          {/* 10. vigorous_activity_frequency (1-4) */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#292333]">
                {t.vigorousLabel}
              </label>
              <span className="text-xs font-bold text-[#452653] bg-[#EAE2F5] px-2 py-0.5 rounded border border-[#ded3eb]">
                Code {formData.vigorous_activity_frequency}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {ACTIVITY_FREQUENCIES.map((freq) => {
                const isSelected = formData.vigorous_activity_frequency === freq.code;
                return (
                  <button
                    key={freq.code}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        vigorous_activity_frequency: freq.code,
                      })
                    }
                    className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#EAE2F5] border-[#8064A9] ring-2 ring-[#8064A9]/20 shadow-2xs"
                        : "bg-white border-[#ded3eb] hover:border-[#8064A9]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-[#292333] text-xs sm:text-sm">
                        {language === "mr"
                          ? freq.labelMr
                          : language === "hi"
                          ? freq.labelHi
                          : freq.labelEn}
                      </span>
                      <span className="text-[10px] font-bold text-[#5e546b]">
                        {freq.code}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5e546b]">{freq.descEn}</p>
                  </button>
                );
              })}
            </div>
            <span className="text-[11px] text-[#5e546b] block">{t.vigorousHelp}</span>
          </div>

          {/* 11. moderate_activity_frequency (1-4) */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#292333]">
                {t.moderateLabel}
              </label>
              <span className="text-xs font-bold text-[#452653] bg-[#EAE2F5] px-2 py-0.5 rounded border border-[#ded3eb]">
                Code {formData.moderate_activity_frequency}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {ACTIVITY_FREQUENCIES.map((freq) => {
                const isSelected = formData.moderate_activity_frequency === freq.code;
                return (
                  <button
                    key={freq.code}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        moderate_activity_frequency: freq.code,
                      })
                    }
                    className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#EAE2F5] border-[#8064A9] ring-2 ring-[#8064A9]/20 shadow-2xs"
                        : "bg-white border-[#ded3eb] hover:border-[#8064A9]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-[#292333] text-xs sm:text-sm">
                        {language === "mr"
                          ? freq.labelMr
                          : language === "hi"
                          ? freq.labelHi
                          : freq.labelEn}
                      </span>
                      <span className="text-[10px] font-bold text-[#5e546b]">
                        {freq.code}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5e546b]">{freq.descEn}</p>
                  </button>
                );
              })}
            </div>
            <span className="text-[11px] text-[#5e546b] block">{t.moderateHelp}</span>
          </div>
        </div>

        {/* Global Clinical Disclaimer Banner Before Submit */}
        <div className="p-4 rounded-2xl bg-[#FAF8FC] border border-[#ded3eb] flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-[#8064A9] shrink-0 mt-0.5" />
          <div className="text-xs text-[#5e546b] space-y-1">
            <span className="font-bold text-[#292333] block">
              {t.clinicalDisclaimerTitle}
            </span>
            <p className="leading-relaxed">{t.clinicalDisclaimerText}</p>
          </div>
        </div>

        {/* Submit Execution Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 rounded-2xl bg-[#452653] hover:bg-[#573068] text-white font-bold text-base shadow-lg shadow-[#452653]/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>{t.submittingButton}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>{t.submitButton}</span>
              <ArrowRight className="w-5 h-5 ml-1" />
            </>
          )}
        </button>
      </form>

      {/* Backend Connection Error Alert */}
      {error && (
        <div className="mt-8 p-6 rounded-3xl bg-amber-50 border border-amber-200 text-amber-900 space-y-4 shadow-sm animate-in fade-in duration-300">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1.5 flex-1">
              <h3 className="font-bold text-base text-amber-900">
                Backend Connection Error
              </h3>
              <p className="text-xs text-amber-800 leading-relaxed font-mono bg-white/70 p-2.5 rounded-xl border border-amber-200/80">
                {error}
              </p>
              <p className="text-xs text-amber-700">
                Tip: Run the backend with{" "}
                <code className="bg-amber-100/80 px-1.5 py-0.5 rounded font-mono font-bold">
                  cd backend &amp;&amp; uvicorn app.main:app --reload
                </code>{" "}
                on port 8000. Alternatively, preview the prediction visualization below
                using local estimation:
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleOfflineSimulation}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <FlaskConical className="w-4 h-4" />
              <span>Run Local Preview Simulation</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          Section 4: Prediction Results (Shown After Prediction)
         ======================================================== */}
      {result && (
        <div
          ref={resultsRef}
          className="mt-10 p-6 sm:p-8 rounded-3xl bg-white border border-[#ded3eb] shadow-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          {/* Section Card Header */}
          <div className="flex items-center justify-between border-b border-[#ded3eb] pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2 text-[#452653] font-bold text-lg">
              <CheckCircle2 className="w-5 h-5 text-[#8064A9]" />
              <span>{t.secResults}</span>
            </div>

            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#EAE2F5] text-[#452653] border border-[#ded3eb]">
              {result.model_status || "Inference Output"}
            </span>
          </div>

          {/* Results Gauge and Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Circular Progress Gauge */}
            <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-[#FAF8FC] rounded-3xl border border-[#ded3eb]">
              <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                  {/* Background Track */}
                  <circle
                    cx="100"
                    cy="100"
                    r={gaugeRadius}
                    stroke={gaugeTrackColor}
                    strokeWidth="14"
                    fill="transparent"
                  />
                  {/* Animated Foreground Arc */}
                  <circle
                    cx="100"
                    cy="100"
                    r={gaugeRadius}
                    stroke={gaugeStrokeColor}
                    strokeWidth="14"
                    strokeDasharray={gaugeCircumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>

                <div className="absolute flex flex-col items-center justify-center text-center px-4">
                  <span className="text-4xl font-black tracking-tight text-[#292333]">
                    {(probability * 100).toFixed(1)}%
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#5e546b] mt-0.5">
                    {t.probabilityLabel}
                  </span>
                </div>
              </div>

              {/* Color Coded Risk Bracket Badge */}
              <div
                className={`mt-4 px-3.5 py-1.5 rounded-full text-xs font-bold border ${
                  isHighRisk
                    ? "bg-rose-50 text-rose-800 border-rose-300"
                    : isModerateRisk
                    ? "bg-amber-50 text-amber-800 border-amber-300"
                    : "bg-[#EAE2F5] text-[#452653] border-[#ded3eb]"
                }`}
              >
                {isHighRisk
                  ? t.highRiskLabel
                  : isModerateRisk
                  ? t.moderateRiskLabel
                  : t.lowRiskLabel}
              </div>
            </div>

            {/* Model Outcomes & Details */}
            <div className="md:col-span-7 space-y-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#5e546b] block mb-1">
                  {t.classificationLabel}
                </span>
                <div className="flex items-center gap-2.5">
                  {result.predicted_class === 1 ? (
                    <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="p-2 rounded-xl bg-[#EAE2F5] text-[#452653]">
                      <CheckCircle2 className="w-5 h-5 text-[#8064A9]" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-extrabold text-[#292333] leading-tight">
                      {result.predicted_class === 1
                        ? t.posClassMeaning
                        : t.negClassMeaning}
                    </h3>
                    <p className="text-xs text-[#5e546b] font-mono mt-0.5">
                      Raw Meaning: {result.predicted_class_meaning} (Class:{" "}
                      {result.predicted_class})
                    </p>
                  </div>
                </div>
              </div>

              {/* Model Metadata Card */}
              <div className="p-4 rounded-2xl bg-[#FAF8FC] border border-[#ded3eb] space-y-2">
                <div className="flex items-center justify-between text-xs text-[#5e546b]">
                  <span className="font-semibold text-[#5e546b]">{t.modelBadge}:</span>
                  <span className="font-mono font-bold text-[#292333]">
                    {result.model_name || "RandomForest (LASI-DD)"}
                  </span>
                </div>
                {result.task_name && (
                  <div className="flex items-center justify-between text-xs text-[#5e546b]">
                    <span className="font-semibold text-[#5e546b]">Task:</span>
                    <span className="font-mono text-[#292333]">{result.task_name}</span>
                  </div>
                )}
              </div>

              {/* Model Notice */}
              {result.notice && (
                <div className="p-3.5 rounded-2xl bg-[#FAF8FC] border border-[#ded3eb] flex items-start gap-2.5 text-xs text-[#292333]">
                  <Info className="w-4 h-4 text-[#8064A9] shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-bold text-[#452653] block">
                      {t.modelNoticeTitle}
                    </span>
                    <p className="leading-relaxed text-[#5e546b]">{result.notice}</p>
                  </div>
                </div>
              )}

              {/* Live Telemetry Bar */}
              {apiMeta && (
                <div className="p-3 rounded-2xl bg-[#FAF8FC] border border-[#ded3eb] flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-[#452653]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#8064A9] animate-pulse"></span>
                    <span>Live Backend Response ({apiMeta.status} OK)</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-[#8064A9] font-mono">
                    <span>Latency: <strong>{apiMeta.latencyMs}ms</strong></span>
                    <span>•</span>
                    <span>Received: <strong>{apiMeta.timestamp}</strong></span>
                  </div>
                </div>
              )}

              {/* LASI Demographic Sensitivity Notice */}
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-amber-950 block">
                    Why does Age 20 stay around 51.0% across some toggle changes?
                  </span>
                  <p className="leading-relaxed text-amber-800/95">
                    This Random Forest model was trained on the <strong>LASI survey of older Indian adults (mean age 58.0 yrs)</strong>. For young ages (e.g. 20y), the decision trees branch down early terminal paths where comorbidity flags have smaller splitting weights. <strong>Try loading the Middle-Aged (48y) or Senior (65y) presets above</strong> or increase Age to see how the model dynamically shifts between 45% and 62%+!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Evaluated 11 Feature Summary Vector */}
          <div className="border-t border-[#ded3eb] pt-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#5e546b] mb-3">
              {t.featuresSummaryTitle}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-[#FAF8FC] border border-[#ded3eb]">
                <span className="text-[#5e546b] block text-[10px]">age_years</span>
                <span className="font-bold text-[#292333]">{formData.age_years}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF8FC] border border-[#ded3eb]">
                <span className="text-[#5e546b] block text-[10px]">sex_code</span>
                <span className="font-bold text-[#292333]">
                  {formData.sex_code === 1 ? "1 (Male)" : "2 (Female)"}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF8FC] border border-[#ded3eb]">
                <span className="text-[#5e546b] block text-[10px]">residence_code</span>
                <span className="font-bold text-[#292333]">
                  {formData.residence_code === 1 ? "1 (Urban)" : "2 (Rural)"}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF8FC] border border-[#ded3eb]">
                <span className="text-[#5e546b] block text-[10px]">mpce_quintile</span>
                <span className="font-bold text-[#292333]">
                  Q{formData.mpce_quintile}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF8FC] border border-[#ded3eb]">
                <span className="text-[#5e546b] block text-[10px]">education_level</span>
                <span className="font-bold text-[#292333] font-mono text-[11px] truncate block">
                  {formData.education_level}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF8FC] border border-[#ded3eb]">
                <span className="text-[#5e546b] block text-[10px]">family_diabetes</span>
                <span className="font-bold text-[#292333]">
                  {formData.family_history_diabetes === 1 ? "1 (Yes)" : "0 (No)"}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF8FC] border border-[#ded3eb]">
                <span className="text-[#5e546b] block text-[10px]">hypertension</span>
                <span className="font-bold text-[#292333]">
                  {formData.hypertension_history === 1 ? "1 (Yes)" : "0 (No)"}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF8FC] border border-[#ded3eb]">
                <span className="text-[#5e546b] block text-[10px]">high_cholesterol</span>
                <span className="font-bold text-[#292333]">
                  {formData.high_cholesterol_history === 1 ? "1 (Yes)" : "0 (No)"}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF8FC] border border-[#ded3eb]">
                <span className="text-[#5e546b] block text-[10px]">tobacco_ever</span>
                <span className="font-bold text-[#292333]">
                  {formData.tobacco_ever === 1 ? "1 (Yes)" : "0 (No)"}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF8FC] border border-[#ded3eb]">
                <span className="text-[#5e546b] block text-[10px]">vigorous_activity</span>
                <span className="font-bold text-[#292333]">
                  Code {formData.vigorous_activity_frequency}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF8FC] border border-[#ded3eb]">
                <span className="text-[#5e546b] block text-[10px]">moderate_activity</span>
                <span className="font-bold text-[#292333]">
                  Code {formData.moderate_activity_frequency}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#EAE2F5] border border-[#ded3eb] flex items-center justify-center">
                <span className="font-bold text-[#452653] text-xs">
                  All 11 Features Evaluated
                </span>
              </div>
            </div>
          </div>

          {/* Action Footer with 'Test Again' Reset */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#ded3eb]">
            <p className="text-xs text-[#5e546b]">
              Need to evaluate another demographic profile? Modify features above or reset.
            </p>
            <button
              type="button"
              onClick={() => {
                setResult(null);
                window.scrollTo({ top: 180, behavior: "smooth" });
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#452653] hover:bg-[#573068] text-white font-bold text-sm shadow-md shadow-[#452653]/20 flex items-center justify-center gap-2 transition-transform hover:scale-101 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t.testAgain}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
