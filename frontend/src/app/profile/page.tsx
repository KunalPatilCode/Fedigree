"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePedigreeStore, Relative } from "@/store/pedigreeStore";
import { translations } from "@/lib/translations";
import Link from "next/link";
import {
  User,
  Shield,
  Heart,
  Activity,
  Wind,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Download,
  RefreshCw,
  Users,
  Dumbbell,
  Cigarette,
  MapPin,
  Brain,
  TrendingUp,
  Utensils,
  Stethoscope,
  ChevronRight,
  Sparkles,
  Clock,
} from "lucide-react";

/* ─────────────────── Types ─────────────────── */
interface HeredityBurden {
  diabetesCount: number;
  hypertensionCount: number;
  heartDiseaseCount: number;
  strokeCount: number;
  asthmaCount: number;
  totalConditions: number;
  totalRelatives: number;
  affectedMembers: number;
  score: number; // 0-100
  level: "Low" | "Moderate" | "High" | "Very High";
}

interface ProfileRecommendation {
  icon: typeof Heart;
  title: string;
  description: string;
  priority: "critical" | "important" | "advisory";
  category: "diet" | "exercise" | "screening" | "lifestyle" | "environment";
}

/* ─────────────── Trilingual Profile Keys ─────────────── */
const profileText = {
  en: {
    pageTitle: "Unified Health Profile",
    pageSubtitle: "Your comprehensive health risk dashboard — family history, clinical scores, ML predictions, and personalized recommendations in one view.",
    sectionDemographics: "Personal Demographics",
    sectionHeredity: "Family Hereditary Load",
    sectionRiskScores: "Risk Score Dashboard",
    sectionLifestyle: "Lifestyle & Environment",
    sectionRecommendations: "Personalized Action Plan",
    sectionTimeline: "Screening Timeline",
    age: "Age",
    gender: "Gender",
    male: "Male",
    female: "Female",
    waist: "Waist Circumference",
    district: "District",
    education: "Education Level",
    income: "MPCE Quintile",
    activityLevel: "Physical Activity",
    tobacco: "Tobacco Use",
    aqiExposure: "Air Quality Exposure",
    idrsTitle: "ICMR IDRS Score",
    idrsDesc: "Indian Diabetes Risk Score (validated clinical standard)",
    mlDiabTitle: "ML Diabetes Risk",
    mlDiabDesc: "LASI Random Forest demographic classifier",
    mlCvdTitle: "ML CVD Risk",
    mlCvdDesc: "Cardiovascular composite logistic regression",
    heredityTitle: "Hereditary Burden",
    heredityDesc: "Family tree disease clustering analysis",
    compositeTitle: "Overall Risk Profile",
    compositeDesc: "Weighted composite of all risk engines",
    refreshScores: "Refresh All Scores",
    refreshing: "Recalculating...",
    downloadProfile: "Download Profile PDF",
    noData: "Run assessment first",
    goAssess: "Complete Health Assessment",
    heredityLow: "Low family burden — no major NCDs in immediate family",
    heredityMod: "Moderate — some NCD history detected in family tree",
    heredityHigh: "High — multiple NCD conditions across family members",
    heredityVHigh: "Very High — dense hereditary NCD clustering detected",
    familyMembers: "Family Members",
    conditionsDetected: "Conditions Detected",
    affectedMembers: "Affected Members",
    overallLow: "Your overall risk profile is favorable. Continue healthy habits and regular check-ups.",
    overallMod: "Moderate risk detected. Consider lifestyle adjustments and annual screenings.",
    overallHigh: "Elevated risk across multiple indicators. Clinical follow-up strongly recommended.",
    overallVHigh: "High-risk profile. Urgent clinical consultation and comprehensive screening advised.",
    generatedAt: "Profile generated at",
    disclaimer: "This health profile is for awareness and screening purposes only. It does not replace professional medical diagnosis. LASI models are survey-sample classifiers, not clinical diagnostic tools.",
    screenEvery3: "Re-screen every 3 years",
    screenAnnual: "Annual FPG & HbA1c screening",
    screenUrgent: "Urgent: Get FPG, HbA1c, and lipid profile done",
    screenBP: "Regular blood pressure monitoring",
    screenLipid: "Lipid profile check recommended",
    screenECG: "ECG & cardiac evaluation advised",
  },
  mr: {
    pageTitle: "एकत्रित आरोग्य प्रोफाइल",
    pageSubtitle: "तुमचे संपूर्ण आरोग्य जोखीम डॅशबोर्ड — कौटुंबिक इतिहास, क्लिनिकल स्कोअर, ML अंदाज, आणि वैयक्तिक शिफारसी एकत्र.",
    sectionDemographics: "वैयक्तिक माहिती",
    sectionHeredity: "कौटुंबिक आनुवंशिक भार",
    sectionRiskScores: "जोखीम स्कोअर डॅशबोर्ड",
    sectionLifestyle: "जीवनशैली आणि पर्यावरण",
    sectionRecommendations: "वैयक्तिक कृती योजना",
    sectionTimeline: "तपासणी वेळापत्रक",
    age: "वय",
    gender: "लिंग",
    male: "पुरुष",
    female: "स्त्री",
    waist: "कमरेचा घेर",
    district: "जिल्हा",
    education: "शिक्षण पातळी",
    income: "MPCE पंचक",
    activityLevel: "शारीरिक हालचाल",
    tobacco: "तंबाखू सेवन",
    aqiExposure: "हवेची गुणवत्ता",
    idrsTitle: "ICMR IDRS गुण",
    idrsDesc: "भारतीय मधुमेह जोखीम गुण (प्रमाणित)",
    mlDiabTitle: "ML मधुमेह जोखीम",
    mlDiabDesc: "LASI रँडम फॉरेस्ट वर्गीकरण",
    mlCvdTitle: "ML हृदयरोग जोखीम",
    mlCvdDesc: "हृदयरोग संयुक्त गुण",
    heredityTitle: "आनुवंशिक भार",
    heredityDesc: "कौटुंबिक वृक्ष रोग विश्लेषण",
    compositeTitle: "एकूण जोखीम प्रोफाइल",
    compositeDesc: "सर्व जोखीम इंजिनांचे एकत्रित मूल्यांकन",
    refreshScores: "सर्व गुण ताजे करा",
    refreshing: "पुनर्गणना सुरू...",
    downloadProfile: "प्रोफाइल PDF डाउनलोड करा",
    noData: "प्रथम आरोग्य तपासणी करा",
    goAssess: "आरोग्य तपासणी पूर्ण करा",
    heredityLow: "कमी कौटुंबिक भार — कुटुंबात प्रमुख NCD नाहीत",
    heredityMod: "मध्यम — कुटुंबात काही NCD इतिहास आढळला",
    heredityHigh: "उच्च — अनेक कुटुंब सदस्यांमध्ये NCD",
    heredityVHigh: "अत्यंत उच्च — दाट आनुवंशिक NCD क्लस्टरिंग",
    familyMembers: "कुटुंब सदस्य",
    conditionsDetected: "आढळलेले आजार",
    affectedMembers: "प्रभावित सदस्य",
    overallLow: "तुमचे एकूण जोखीम प्रोफाइल अनुकूल आहे. निरोगी सवयी चालू ठेवा.",
    overallMod: "मध्यम जोखीम आढळले. जीवनशैली बदल आणि वार्षिक तपासणी विचारात घ्या.",
    overallHigh: "अनेक निर्देशकांमध्ये उच्च जोखीम. डॉक्टरांचा सल्ला घ्या.",
    overallVHigh: "उच्च-जोखीम प्रोफाइल. तातडीने डॉक्टरांचा सल्ला आणि संपूर्ण तपासणी आवश्यक.",
    generatedAt: "प्रोफाइल तयार केले",
    disclaimer: "हे आरोग्य प्रोफाइल केवळ जागरूकतेसाठी आहे. हे वैद्यकीय निदानाची जागा घेत नाही.",
    screenEvery3: "दर ३ वर्षांनी पुनर्तपासणी",
    screenAnnual: "वार्षिक FPG व HbA1c तपासणी",
    screenUrgent: "तातडी: FPG, HbA1c, लिपिड प्रोफाइल करा",
    screenBP: "नियमित रक्तदाब तपासणी",
    screenLipid: "लिपिड प्रोफाइल तपासणी शिफारस",
    screenECG: "ECG आणि हृदय मूल्यांकन सल्ला",
  },
  hi: {
    pageTitle: "एकीकृत स्वास्थ्य प्रोफ़ाइल",
    pageSubtitle: "आपका संपूर्ण स्वास्थ्य जोखिम डैशबोर्ड — पारिवारिक इतिहास, क्लिनिकल स्कोर, ML भविष्यवाणी, और व्यक्तिगत सुझाव एक साथ.",
    sectionDemographics: "व्यक्तिगत जानकारी",
    sectionHeredity: "पारिवारिक आनुवंशिक भार",
    sectionRiskScores: "जोखिम स्कोर डैशबोर्ड",
    sectionLifestyle: "जीवनशैली और पर्यावरण",
    sectionRecommendations: "व्यक्तिगत कार्य योजना",
    sectionTimeline: "जांच समय-सारिणी",
    age: "उम्र",
    gender: "लिंग",
    male: "पुरुष",
    female: "महिला",
    waist: "कमर का घेरा",
    district: "जिला",
    education: "शिक्षा स्तर",
    income: "MPCE पंचक",
    activityLevel: "शारीरिक गतिविधि",
    tobacco: "तंबाकू सेवन",
    aqiExposure: "वायु गुणवत्ता",
    idrsTitle: "ICMR IDRS स्कोर",
    idrsDesc: "भारतीय मधुमेह जोखिम स्कोर (प्रमाणित)",
    mlDiabTitle: "ML डायबिटीज जोखिम",
    mlDiabDesc: "LASI रैंडम फ़ॉरेस्ट वर्गीकरण",
    mlCvdTitle: "ML हृदय रोग जोखिम",
    mlCvdDesc: "हृदय रोग संयुक्त स्कोर",
    heredityTitle: "आनुवंशिक भार",
    heredityDesc: "पारिवारिक वृक्ष रोग विश्लेषण",
    compositeTitle: "समग्र जोखिम प्रोफ़ाइल",
    compositeDesc: "सभी जोखिम इंजनों का भारित मूल्यांकन",
    refreshScores: "सभी स्कोर ताज़ा करें",
    refreshing: "पुनर्गणना जारी...",
    downloadProfile: "प्रोफ़ाइल PDF डाउनलोड करें",
    noData: "पहले स्वास्थ्य जांच करें",
    goAssess: "स्वास्थ्य जांच पूरी करें",
    heredityLow: "कम पारिवारिक भार — परिवार में कोई प्रमुख NCD नहीं",
    heredityMod: "मध्यम — परिवार में कुछ NCD इतिहास पाया गया",
    heredityHigh: "उच्च — कई परिवार सदस्यों में NCD",
    heredityVHigh: "बहुत उच्च — घना आनुवंशिक NCD क्लस्टरिंग",
    familyMembers: "परिवार सदस्य",
    conditionsDetected: "पहचानी गई बीमारियां",
    affectedMembers: "प्रभावित सदस्य",
    overallLow: "आपका समग्र जोखिम प्रोफ़ाइल अनुकूल है। स्वस्थ आदतें जारी रखें।",
    overallMod: "मध्यम जोखिम पाया गया। जीवनशैली बदलाव और वार्षिक जांच पर विचार करें।",
    overallHigh: "कई संकेतकों में ऊंचा जोखिम। डॉक्टर से परामर्श की सलाह।",
    overallVHigh: "उच्च-जोखिम प्रोफ़ाइल। तत्काल डॉक्टर परामर्श और व्यापक जांच आवश्यक।",
    generatedAt: "प्रोफ़ाइल बनाई गई",
    disclaimer: "यह स्वास्थ्य प्रोफ़ाइल केवल जागरूकता के लिए है। यह पेशेवर चिकित्सा निदान का विकल्प नहीं है।",
    screenEvery3: "हर 3 साल में पुनर्जांच",
    screenAnnual: "वार्षिक FPG व HbA1c जांच",
    screenUrgent: "तत्काल: FPG, HbA1c, लिपिड प्रोफ़ाइल कराएं",
    screenBP: "नियमित रक्तचाप निगरानी",
    screenLipid: "लिपिड प्रोफ़ाइल जांच सुझाव",
    screenECG: "ECG और हृदय मूल्यांकन सलाह",
  },
};

/* ─────────────────── SVG Gauge ─────────────────── */
function RiskGauge({
  value,
  maxValue = 100,
  label,
  sublabel,
  size = 140,
  colorScheme = "auto",
}: {
  value: number | null;
  maxValue?: number;
  label: string;
  sublabel: string;
  size?: number;
  colorScheme?: "auto" | "emerald" | "amber" | "rose";
}) {
  const displayVal = value !== null ? value : 0;
  const pct = Math.min(Math.max(displayVal / maxValue, 0), 1);
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - pct);

  let strokeColor = "#8064A9"; // purple
  let bgClass = "text-[#EAE2F5]";
  let textColor = "text-[#452653]";

  if (colorScheme === "auto") {
    if (pct > 0.6) {
      strokeColor = "#F43F5E"; bgClass = "text-rose-100"; textColor = "text-rose-700";
    } else if (pct > 0.3) {
      strokeColor = "#F59E0B"; bgClass = "text-amber-100"; textColor = "text-amber-700";
    }
  } else if (colorScheme === "amber") {
    strokeColor = "#F59E0B"; bgClass = "text-amber-100"; textColor = "text-amber-700";
  } else if (colorScheme === "rose") {
    strokeColor = "#F43F5E"; bgClass = "text-rose-100"; textColor = "text-rose-700";
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-sm">
        {/* Background track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" strokeWidth={10}
          className={bgClass} stroke="currentColor"
        />
        {/* Progress arc */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" strokeWidth={10}
          stroke={strokeColor}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="transition-all duration-1000 ease-out"
        />
        {/* Center value */}
        <text
          x={size / 2} y={size / 2 - 4}
          textAnchor="middle" dominantBaseline="central"
          className={`font-black ${textColor}`} fontSize={size * 0.22} fill="currentColor"
        >
          {value !== null ? (maxValue === 1 ? `${(displayVal * 100).toFixed(0)}%` : Math.round(displayVal)) : "—"}
        </text>
        {maxValue !== 1 && value !== null && (
          <text
            x={size / 2} y={size / 2 + 16}
            textAnchor="middle" dominantBaseline="central"
            className="text-slate-400" fontSize={10} fill="currentColor"
          >
            / {maxValue}
          </text>
        )}
      </svg>
      <div className="text-center">
        <div className="text-sm font-bold text-slate-800">{label}</div>
        <div className="text-[11px] text-slate-500">{sublabel}</div>
      </div>
    </div>
  );
}

/* ─────────────── Heredity Calculator ─────────────── */
function calculateHeredityBurden(relatives: Relative[]): HeredityBurden {
  let diabetesCount = 0;
  let hypertensionCount = 0;
  let heartDiseaseCount = 0;
  let strokeCount = 0;
  let asthmaCount = 0;
  let affectedCount = 0;

  for (const r of relatives) {
    const hasAny = r.hasDiabetes || r.hasHypertension || r.hasHeartDisease || r.hasStroke || r.hasAsthma;
    if (hasAny) affectedCount++;
    if (r.hasDiabetes) diabetesCount++;
    if (r.hasHypertension) hypertensionCount++;
    if (r.hasHeartDisease) heartDiseaseCount++;
    if (r.hasStroke) strokeCount++;
    if (r.hasAsthma) asthmaCount++;
  }

  const totalConditions = diabetesCount + hypertensionCount + heartDiseaseCount + strokeCount + asthmaCount;

  // Weighted scoring: parents get 2x weight, grandparents 1.5x, siblings 1.2x
  let score = 0;
  for (const r of relatives) {
    if (r.relation === "self") continue;
    const weight = (r.relation === "father" || r.relation === "mother") ? 2.0
      : (r.relation === "grandfather" || r.relation === "grandmother") ? 1.5
        : 1.2; // siblings, children
    const conditions = [r.hasDiabetes, r.hasHypertension, r.hasHeartDisease, r.hasStroke, r.hasAsthma]
      .filter(Boolean).length;
    score += conditions * weight * 10;
  }
  score = Math.min(Math.round(score), 100);

  let level: HeredityBurden["level"] = "Low";
  if (score >= 70) level = "Very High";
  else if (score >= 45) level = "High";
  else if (score >= 20) level = "Moderate";

  return {
    diabetesCount,
    hypertensionCount,
    heartDiseaseCount,
    strokeCount,
    asthmaCount,
    totalConditions,
    totalRelatives: relatives.length,
    affectedMembers: affectedCount,
    score,
    level,
  };
}

/* ─────────────── Composite Risk ─────────────── */
function calculateCompositeRisk(
  idrsScore: number | null,
  mlDiab: number | null,
  mlCvd: number | null,
  heredityScore: number
): { score: number; level: "Low" | "Moderate" | "High" | "Very High" } {
  // Weighted average: IDRS 30%, ML Diabetes 25%, ML CVD 20%, Heredity 25%
  const idrsNorm = (idrsScore ?? 50) / 100;
  const diabNorm = mlDiab ?? 0.38;
  const cvdNorm = mlCvd ?? 0.29;
  const heredNorm = heredityScore / 100;

  const composite = (idrsNorm * 0.30 + diabNorm * 0.25 + cvdNorm * 0.20 + heredNorm * 0.25) * 100;
  const score = Math.round(Math.min(composite, 100));

  let level: "Low" | "Moderate" | "High" | "Very High" = "Low";
  if (score >= 65) level = "Very High";
  else if (score >= 48) level = "High";
  else if (score >= 30) level = "Moderate";

  return { score, level };
}

/* ─────────────── Recommendations Engine ─────────────── */
function generateRecommendations(
  idrsScore: number | null,
  mlDiab: number | null,
  mlCvd: number | null,
  heredity: HeredityBurden,
  assessment: { physicalActivity: string; tobaccoEver: boolean; waistCm: number },
  aqiData: { aqi: number } | null,
  lang: keyof typeof profileText
): ProfileRecommendation[] {
  const recs: ProfileRecommendation[] = [];
  const score = idrsScore ?? 50;
  const diab = mlDiab ?? 0.38;
  const cvd = mlCvd ?? 0.29;

  // Diet recommendations
  if (score >= 30 || diab > 0.4) {
    recs.push({
      icon: Utensils,
      title: lang === "mr" ? "ज्वारी/बाजरी भाकरी वापरा" : lang === "hi" ? "ज्वार/बाजरा रोटी खाएं" : "Switch to Millet-Based Diet",
      description: lang === "mr" ? "पॉलिश तांदळाऐवजी ज्वारी/बाजरी भाकरी खा — कमी ग्लायसेमिक इंडेक्स." : lang === "hi" ? "पॉलिश्ड चावल की जगह ज्वार/बाजरा रोटी खाएं — कम ग्लाइसेमिक इंडेक्स." : "Replace polished white rice with Jowar/Bajra bhakri — lower glycemic index helps control blood sugar.",
      priority: score >= 60 ? "critical" : "important",
      category: "diet",
    });
  }

  if (assessment.waistCm >= 90) {
    recs.push({
      icon: Utensils,
      title: lang === "mr" ? "दैनिक तेल ≤20 ग्रॅम" : lang === "hi" ? "दैनिक तेल ≤20 ग्राम" : "Limit Daily Cooking Oil to 20g",
      description: lang === "mr" ? "शेंगदाणा/मोहरीचे तेल वापरा; वारंवार तळणे टाळा." : lang === "hi" ? "मूंगफली/सरसों का तेल प्रयोग करें; बार-बार तलना बंद करें." : "Rotate groundnut and mustard oil. Avoid repeated deep frying to reduce visceral fat.",
      priority: "important",
      category: "diet",
    });
  }

  // Exercise recommendations
  if (assessment.physicalActivity === "sedentary") {
    recs.push({
      icon: Dumbbell,
      title: lang === "mr" ? "रोज ३० मिनिटे चाला" : lang === "hi" ? "रोज़ 30 मिनट तेज़ चलें" : "Start Daily 30-Min Brisk Walking",
      description: lang === "mr" ? "दर आठवड्यात किमान १५० मिनिटे मध्यम व्यायामाने इन्सुलिन प्रतिरोध ३०% कमी होतो." : lang === "hi" ? "साप्ताहिक 150 मिनट मध्यम व्यायाम से इंसुलिन प्रतिरोध 30% कम होता है." : "150 minutes of moderate activity per week can reduce insulin resistance by up to 30%.",
      priority: "critical",
      category: "exercise",
    });
  } else if (assessment.physicalActivity === "moderate") {
    recs.push({
      icon: Dumbbell,
      title: lang === "mr" ? "व्यायामाची तीव्रता वाढवा" : lang === "hi" ? "व्यायाम की तीव्रता बढ़ाएं" : "Increase Exercise Intensity",
      description: lang === "mr" ? "आठवड्यातून २-३ दिवस जोमाने व्यायाम (धावणे, सायकलिंग) जोडा." : lang === "hi" ? "सप्ताह में 2-3 दिन तीव्र व्यायाम (दौड़ना, साइकिलिंग) जोड़ें." : "Add vigorous exercise (cycling, running) 2-3 times per week for cardiovascular benefit.",
      priority: "advisory",
      category: "exercise",
    });
  }

  // Tobacco
  if (assessment.tobaccoEver) {
    recs.push({
      icon: Cigarette,
      title: lang === "mr" ? "तंबाखू पूर्णपणे सोडा" : lang === "hi" ? "तंबाकू पूरी तरह छोड़ें" : "Quit Tobacco Completely",
      description: lang === "mr" ? "तंबाखू सोडल्यास मधुमेह जोखीम ३०-४०% कमी होते; NCD प्रतिबंधातील सर्वात प्रभावी एक पाऊल." : lang === "hi" ? "तंबाकू छोड़ने से डायबिटीज का जोखिम 30-40% कम होता है; NCD रोकथाम का सबसे प्रभावी कदम." : "Quitting tobacco reduces diabetes risk by 30-40%. Single most impactful step for NCD prevention.",
      priority: "critical",
      category: "lifestyle",
    });
  }

  // Screening recommendations based on composite risk
  if (score >= 60 || diab > 0.55) {
    recs.push({
      icon: Stethoscope,
      title: lang === "mr" ? "FPG आणि HbA1c तातडीने करा" : lang === "hi" ? "FPG और HbA1c तत्काल कराएं" : "Urgent: Get FPG & HbA1c Tests",
      description: lang === "mr" ? "IDRS ≥६० व उच्च ML गुण — तातडीने फास्टिंग ग्लुकोज आणि HbA1c तपासणी करा." : lang === "hi" ? "IDRS ≥60 और उच्च ML स्कोर — तुरंत फास्टिंग ग्लूकोज़ और HbA1c जांच कराएं." : "IDRS ≥60 combined with elevated ML score. Fasting plasma glucose and HbA1c tests strongly indicated.",
      priority: "critical",
      category: "screening",
    });
  } else if (score >= 30 || diab > 0.4) {
    recs.push({
      icon: Stethoscope,
      title: lang === "mr" ? "वार्षिक मधुमेह तपासणी" : lang === "hi" ? "वार्षिक डायबिटीज जांच" : "Annual Diabetes Screening",
      description: lang === "mr" ? "मध्यम जोखीम — वर्षातून एकदा FPG तपासणी करा." : lang === "hi" ? "मध्यम जोखिम — साल में एक बार FPG जांच कराएं." : "Moderate risk detected. Annual fasting blood glucose screening recommended.",
      priority: "important",
      category: "screening",
    });
  }

  if (cvd > 0.4 || heredity.heartDiseaseCount > 0) {
    recs.push({
      icon: Heart,
      title: lang === "mr" ? "लिपिड प्रोफाइल तपासणी" : lang === "hi" ? "लिपिड प्रोफ़ाइल जांच" : "Get Lipid Profile Checked",
      description: lang === "mr" ? "Triglycerides/HDL गुणोत्तर तपासा — दक्षिण आशियाई डिस्लिपिडेमियाचे प्रमुख लक्षण." : lang === "hi" ? "Triglycerides/HDL अनुपात जांचें — दक्षिण एशियाई डिस्लिपिडेमिया का प्रमुख संकेत." : "Check Triglycerides/HDL ratio — hallmark of South Asian dyslipidemia pattern.",
      priority: cvd > 0.5 ? "critical" : "important",
      category: "screening",
    });
  }

  // Environmental
  if (aqiData && aqiData.aqi > 150) {
    recs.push({
      icon: Wind,
      title: lang === "mr" ? "बाह्य व्यायाम मर्यादित करा" : lang === "hi" ? "बाहरी व्यायाम सीमित करें" : "Limit Outdoor Exercise When AQI > 150",
      description: lang === "mr" ? `AQI ${aqiData.aqi} — सकाळी बाहेर जोमदार कसरत टाळा; बंद जागी चाला.` : lang === "hi" ? `AQI ${aqiData.aqi} — सुबह बाहर तीव्र कसरत से बचें; बंद जगह में चलें.` : `Current AQI is ${aqiData.aqi}. Avoid early morning outdoor strenuous cardio. Walk indoors instead.`,
      priority: aqiData.aqi > 200 ? "critical" : "important",
      category: "environment",
    });
  }

  return recs;
}

/* ─────────────── Education label mapper ─────────────── */
function getEducationLabel(level: string, lang: keyof typeof profileText): string {
  const labels: Record<string, Record<string, string>> = {
    "0_never_attended": { en: "Never Attended School", mr: "शाळेत कधी गेलो नाही", hi: "कभी स्कूल नहीं गया" },
    "level_1": { en: "Primary (1-5)", mr: "प्राथमिक (१-५)", hi: "प्राथमिक (1-5)" },
    "level_2": { en: "Secondary (6-10)", mr: "माध्यमिक (६-१०)", hi: "माध्यमिक (6-10)" },
    "level_3": { en: "Higher Secondary (11-12)", mr: "उच्च माध्यमिक (११-१२)", hi: "उच्च माध्यमिक (11-12)" },
    "level_4": { en: "Graduate & Above", mr: "पदवीधर व अधिक", hi: "स्नातक व ऊपर" },
  };
  return labels[level]?.[lang] ?? level;
}

/* ─────────────── Activity label mapper ─────────────── */
function getActivityLabel(activity: string, lang: keyof typeof profileText): string {
  const labels: Record<string, Record<string, string>> = {
    vigorous: { en: "Vigorous", mr: "जोमदार", hi: "कठिन" },
    moderate: { en: "Moderate", mr: "मध्यम", hi: "मध्यम" },
    sedentary: { en: "Sedentary", mr: "बैठी जीवनशैली", hi: "बैठी जीवनशैली" },
  };
  return labels[activity]?.[lang] ?? activity;
}

/* ═══════════════════════════════════════════════════════
   ███  MAIN COMPONENT  ███
   ═══════════════════════════════════════════════════════ */
export default function ProfilePage() {
  const {
    language, relatives, assessment, idrsResult,
    mlDiabetesScore, mlCvdScore, aqiData, isCalculating, runAssessment,
  } = usePedigreeStore();

  const t = profileText[language];
  const navT = translations[language];
  const printRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState<string>("—");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentTime(new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }));
  }, []);

  // Derived calculations
  const heredity = calculateHeredityBurden(relatives);
  const composite = calculateCompositeRisk(idrsResult?.score ?? null, mlDiabetesScore, mlCvdScore, heredity.score);
  const recommendations = generateRecommendations(
    idrsResult?.score ?? null, mlDiabetesScore, mlCvdScore, heredity,
    assessment, aqiData, language
  );

  const hasAssessmentData = idrsResult !== null;

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await runAssessment();
    setIsRefreshing(false);
    setCurrentTime(new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }));
  }, [runAssessment]);

  const handlePrint = () => {
    window.print();
  };

  // Risk level color helpers
  const getRiskBadge = (level: string) => {
    switch (level) {
      case "Low": return "bg-[#EAE2F5] text-[#452653] border-[#ded3eb]";
      case "Moderate": return "bg-amber-100 text-amber-800 border-amber-200";
      case "High": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Very High": return "bg-rose-100 text-rose-800 border-rose-200";
      default: return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const getOverallMessage = (level: string) => {
    switch (level) {
      case "Low": return t.overallLow;
      case "Moderate": return t.overallMod;
      case "High": return t.overallHigh;
      case "Very High": return t.overallVHigh;
      default: return "";
    }
  };

  const getHeredityMessage = (level: string) => {
    switch (level) {
      case "Low": return t.heredityLow;
      case "Moderate": return t.heredityMod;
      case "High": return t.heredityHigh;
      case "Very High": return t.heredityVHigh;
      default: return "";
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:py-2">
      {/* ─── Top Action Bar ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 print:hidden">
        <div>
          <Link
            href="/assess"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#5e546b] hover:text-[#452653] transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Assessment</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-[#452653] to-[#8064A9] bg-clip-text text-transparent">
            {t.pageTitle}
          </h1>
          <p className="text-sm text-[#5e546b] mt-1 max-w-2xl">{t.pageSubtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || isCalculating}
            className="px-4 py-2.5 rounded-xl bg-white border border-[#ded3eb] text-[#292333] font-semibold text-sm shadow-xs hover:bg-[#FAF8FC] flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-[#8064A9] ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? t.refreshing : t.refreshScores}</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl bg-[#452653] hover:bg-[#573068] text-white font-bold text-sm shadow-md shadow-[#452653]/20 flex items-center gap-2 transition-all hover:scale-102"
          >
            <Download className="w-4 h-4" />
            <span>{t.downloadProfile}</span>
          </button>
        </div>
      </div>

      {/* ─── No Data State ─── */}
      {!hasAssessmentData && (
        <div className="p-12 rounded-3xl bg-white border border-[#ded3eb] shadow-xs text-center space-y-4 mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#EAE2F5] flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-[#8064A9]" />
          </div>
          <h2 className="text-xl font-bold text-[#292333]">{t.noData}</h2>
          <p className="text-sm text-[#5e546b] max-w-md mx-auto">
            {language === "mr" ? "प्रथम आरोग्य तपासणी पृष्ठावर जा आणि तुमची माहिती भरा." : language === "hi" ? "पहले स्वास्थ्य जांच पृष्ठ पर जाएं और अपनी जानकारी भरें." : "Visit the Health Assessment page first and complete your screening to generate your unified profile."}
          </p>
          <Link
            href="/assess"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#452653] text-white font-bold hover:bg-[#573068] shadow-md transition-all"
          >
            <Activity className="w-5 h-5 text-[#EAE2F5]" />
            <span>{t.goAssess}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* ─── Main Profile Content ─── */}
      <div ref={printRef} className="space-y-6">

        {/* ═══ Section 1: Overall Risk Summary Banner ═══ */}
        <div className={`p-6 sm:p-8 rounded-3xl border-2 shadow-lg ${composite.level === "Very High" ? "bg-rose-50/60 border-rose-300"
            : composite.level === "High" ? "bg-orange-50/60 border-orange-300"
              : composite.level === "Moderate" ? "bg-amber-50/60 border-amber-300"
                : "bg-[#EAE2F5]/40 border-[#ded3eb]"
          }`}>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <RiskGauge
              value={composite.score}
              maxValue={100}
              label={t.compositeTitle}
              sublabel={t.compositeDesc}
              size={160}
            />
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getRiskBadge(composite.level)}`}>
                  {composite.level === "Very High" ? (language === "mr" ? "अत्यंत उच्च जोखीम" : language === "hi" ? "बहुत उच्च जोखिम" : "Very High Risk")
                    : composite.level === "High" ? navT.riskHigh
                      : composite.level === "Moderate" ? navT.riskModerate
                        : navT.riskLow}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {t.generatedAt} {currentTime}
                </span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                {getOverallMessage(composite.level)}
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-1 bg-white/80 rounded-lg border border-slate-200 font-medium">
                  IDRS: {idrsResult?.score ?? "—"}/100
                </span>
                <span className="px-2 py-1 bg-white/80 rounded-lg border border-slate-200 font-medium">
                  ML Diabetes: {mlDiabetesScore !== null ? `${(mlDiabetesScore * 100).toFixed(1)}%` : "—"}
                </span>
                <span className="px-2 py-1 bg-white/80 rounded-lg border border-slate-200 font-medium">
                  ML CVD: {mlCvdScore !== null ? `${(mlCvdScore * 100).toFixed(1)}%` : "—"}
                </span>
                <span className="px-2 py-1 bg-white/80 rounded-lg border border-slate-200 font-medium">
                  {t.heredityTitle}: {heredity.score}/100
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ Section 2: Risk Score Gauges Grid ═══ */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#ded3eb] shadow-xs">
          <div className="flex items-center gap-2 text-[#452653] font-bold text-lg border-b border-[#ded3eb]/60 pb-3 mb-6">
            <Brain className="w-5 h-5 text-[#8064A9]" />
            <span>{t.sectionRiskScores}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <RiskGauge
              value={idrsResult?.score ?? null}
              maxValue={100}
              label={t.idrsTitle}
              sublabel={t.idrsDesc}
              size={130}
            />
            <RiskGauge
              value={mlDiabetesScore}
              maxValue={1}
              label={t.mlDiabTitle}
              sublabel={t.mlDiabDesc}
              size={130}
            />
            <RiskGauge
              value={mlCvdScore}
              maxValue={1}
              label={t.mlCvdTitle}
              sublabel={t.mlCvdDesc}
              size={130}
            />
            <RiskGauge
              value={heredity.score}
              maxValue={100}
              label={t.heredityTitle}
              sublabel={t.heredityDesc}
              size={130}
            />
          </div>
        </div>

        {/* ═══ Section 3: Personal Demographics ═══ */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#ded3eb] shadow-xs">
          <div className="flex items-center gap-2 text-[#452653] font-bold text-lg border-b border-[#ded3eb]/60 pb-3 mb-6">
            <User className="w-5 h-5 text-[#8064A9]" />
            <span>{t.sectionDemographics}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[
              { label: t.age, value: `${assessment.ageYears} ${language === "en" ? "years" : language === "mr" ? "वर्षे" : "वर्ष"}`, icon: User },
              { label: t.gender, value: assessment.gender === "male" ? t.male : t.female, icon: User },
              { label: t.waist, value: `${assessment.waistCm} cm`, icon: Activity },
              { label: t.district, value: `${assessment.district}, MH`, icon: MapPin },
              { label: t.education, value: getEducationLabel(assessment.educationLevel, language), icon: Brain },
              { label: t.income, value: `Q${assessment.mpceQuintile}`, icon: TrendingUp },
              { label: t.activityLevel, value: getActivityLabel(assessment.physicalActivity, language), icon: Dumbbell },
              { label: t.tobacco, value: assessment.tobaccoEver ? (language === "mr" ? "होय" : language === "hi" ? "हाँ" : "Yes") : (language === "mr" ? "नाही" : language === "hi" ? "नहीं" : "No"), icon: Cigarette },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="p-3.5 rounded-2xl bg-[#FAF8FC] border border-[#ded3eb]">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold uppercase mb-1">
                    <Icon className="w-3.5 h-3.5 text-[#8064A9]" />
                    {item.label}
                  </div>
                  <div className="text-sm font-bold text-[#292333]">{item.value}</div>
                </div>
              );
            })}
          </div>

          {/* AQI Sub-section */}
          {aqiData && (
            <div className="mt-4 p-4 rounded-2xl bg-amber-50/50 border border-amber-200 flex items-center gap-4">
              <Wind className={`w-6 h-6 flex-shrink-0 ${aqiData.aqi > 150 ? "text-rose-600" : aqiData.aqi > 100 ? "text-amber-600" : "text-[#8064A9]"}`} />
              <div className="flex-1">
                <div className="text-xs font-semibold uppercase text-amber-800">{t.aqiExposure} — {aqiData.district}</div>
                <div className="text-lg font-black text-slate-900">{aqiData.aqi} <span className="text-sm font-normal text-slate-500">({aqiData.category})</span></div>
                <div className="text-xs text-slate-600">{aqiData.impact}</div>
              </div>
            </div>
          )}
        </div>

        {/* ═══ Section 4: Family Hereditary Load ═══ */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#ded3eb] shadow-xs">
          <div className="flex items-center gap-2 text-[#452653] font-bold text-lg border-b border-[#ded3eb]/60 pb-3 mb-6">
            <Users className="w-5 h-5 text-[#8064A9]" />
            <span>{t.sectionHeredity}</span>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-[#FAF8FC] border border-[#ded3eb] text-center">
              <div className="text-3xl font-black text-[#292333]">{heredity.totalRelatives}</div>
              <div className="text-xs text-[#5e546b] font-medium">{t.familyMembers}</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#FAF8FC] border border-[#ded3eb] text-center">
              <div className="text-3xl font-black text-rose-700">{heredity.affectedMembers}</div>
              <div className="text-xs text-[#5e546b] font-medium">{t.affectedMembers}</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#FAF8FC] border border-[#ded3eb] text-center">
              <div className="text-3xl font-black text-[#292333]">{heredity.totalConditions}</div>
              <div className="text-xs text-[#5e546b] font-medium">{t.conditionsDetected}</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#FAF8FC] border border-[#ded3eb] text-center">
              <div className={`text-3xl font-black ${heredity.level === "Low" ? "text-[#452653]" : heredity.level === "Moderate" ? "text-amber-700" : "text-rose-700"}`}>
                {heredity.score}
              </div>
              <div className="text-xs text-[#5e546b] font-medium">{t.heredityTitle}</div>
            </div>
          </div>

          {/* Heredity level message */}
          <div className={`p-4 rounded-2xl border mb-6 ${getRiskBadge(heredity.level)}`}>
            <div className="flex items-center gap-2">
              {heredity.level === "Low" ? <CheckCircle2 className="w-5 h-5 text-[#8064A9]" />
                : heredity.level === "Moderate" ? <AlertTriangle className="w-5 h-5 text-amber-600" />
                  : <XCircle className="w-5 h-5 text-rose-600" />}
              <span className="text-sm font-semibold">{getHeredityMessage(heredity.level)}</span>
            </div>
          </div>

          {/* Disease breakdown bars */}
          <div className="space-y-3">
            {[
              { label: language === "mr" ? "मधुमेह" : language === "hi" ? "डायबिटीज" : "Type 2 Diabetes", count: heredity.diabetesCount, color: "bg-rose-500", maxCount: heredity.totalRelatives },
              { label: language === "mr" ? "उच्च रक्तदाब" : language === "hi" ? "हाई बीपी" : "Hypertension", count: heredity.hypertensionCount, color: "bg-blue-500", maxCount: heredity.totalRelatives },
              { label: language === "mr" ? "हृदयविकार" : language === "hi" ? "हृदय रोग" : "Heart Disease (CAD)", count: heredity.heartDiseaseCount, color: "bg-purple-500", maxCount: heredity.totalRelatives },
              { label: language === "mr" ? "पक्षाघात" : language === "hi" ? "स्ट्रोक" : "Stroke", count: heredity.strokeCount, color: "bg-orange-500", maxCount: heredity.totalRelatives },
              { label: language === "mr" ? "दमा" : language === "hi" ? "दमा" : "Asthma / COPD", count: heredity.asthmaCount, color: "bg-teal-500", maxCount: heredity.totalRelatives },
            ].map((d, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs font-medium text-slate-600 w-36 truncate">{d.label}</span>
                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${d.color}`}
                    style={{ width: `${d.maxCount > 0 ? (d.count / d.maxCount) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-700 w-8 text-right">{d.count}/{d.maxCount}</span>
              </div>
            ))}
          </div>

          {/* Family member cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-6">
            {relatives.map((r) => {
              const conditions = [
                r.hasDiabetes && (language === "mr" ? "मधुमेह" : language === "hi" ? "डायबिटीज" : "Diabetes"),
                r.hasHypertension && (language === "mr" ? "उच्च रक्तदाब" : language === "hi" ? "हाई बीपी" : "High BP"),
                r.hasHeartDisease && (language === "mr" ? "हृदयविकार" : language === "hi" ? "हृदय रोग" : "CAD"),
                r.hasStroke && (language === "mr" ? "पक्षाघात" : language === "hi" ? "स्ट्रोक" : "Stroke"),
                r.hasAsthma && (language === "mr" ? "दमा" : language === "hi" ? "दमा" : "Asthma"),
              ].filter(Boolean);
              const hasConditions = conditions.length > 0;

              return (
                <div key={r.id} className={`p-3 rounded-xl border text-xs ${hasConditions ? "bg-rose-50/50 border-rose-200" : "bg-white border-slate-200"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800 capitalize">{r.relation}</span>
                    <span className="text-slate-400">{r.age}y • {r.gender === "male" ? "♂" : "♀"}</span>
                  </div>
                  {hasConditions ? (
                    <div className="space-y-0.5">
                      {conditions.map((c, j) => (
                        <div key={j} className="text-rose-700 font-semibold">• {c}</div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[#8064A9] italic">
                      {language === "mr" ? "NCD नाही" : language === "hi" ? "NCD नहीं" : "No NCDs"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══ Section 5: Personalized Recommendations ═══ */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#ded3eb] shadow-xs">
          <div className="flex items-center gap-2 text-[#452653] font-bold text-lg border-b border-[#ded3eb]/60 pb-3 mb-6">
            <Shield className="w-5 h-5 text-[#8064A9]" />
            <span>{t.sectionRecommendations}</span>
          </div>

          {recommendations.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <CheckCircle2 className="w-12 h-12 mx-auto text-[#8064A9] mb-3" />
              <p className="text-sm font-medium">{language === "mr" ? "सध्या कोणत्या विशेष शिफारसी नाहीत!" : language === "hi" ? "फिलहाल कोई विशेष सुझाव नहीं!" : "No specific recommendations at this time. Keep up the healthy lifestyle!"}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.map((rec, i) => {
                const Icon = rec.icon;
                const priorityColor = rec.priority === "critical" ? "border-l-rose-500 bg-rose-50/30"
                  : rec.priority === "important" ? "border-l-amber-500 bg-amber-50/30"
                    : "border-l-[#8064A9] bg-[#EAE2F5]/30";
                const priorityBadge = rec.priority === "critical" ? "bg-rose-100 text-rose-700"
                  : rec.priority === "important" ? "bg-amber-100 text-amber-700"
                    : "bg-[#EAE2F5] text-[#452653] border border-[#ded3eb]";
                const priorityLabel = rec.priority === "critical" ? (language === "mr" ? "तातडीचे" : language === "hi" ? "अत्यावश्यक" : "Critical")
                  : rec.priority === "important" ? (language === "mr" ? "महत्त्वाचे" : language === "hi" ? "महत्वपूर्ण" : "Important")
                    : (language === "mr" ? "सल्ला" : language === "hi" ? "सलाह" : "Advisory");

                return (
                  <div key={i} className={`p-4 rounded-2xl border-l-4 border border-slate-100 ${priorityColor}`}>
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 flex-shrink-0 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                        <Icon className="w-4.5 h-4.5 text-[#452653]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold text-[#292333]">{rec.title}</h4>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${priorityBadge}`}>
                            {priorityLabel}
                          </span>
                        </div>
                        <p className="text-xs text-[#5e546b] leading-relaxed">{rec.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ═══ Section 6: IDRS Breakdown (if available) ═══ */}
        {idrsResult && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#ded3eb] shadow-xs">
            <div className="flex items-center gap-2 text-[#452653] font-bold text-lg border-b border-[#ded3eb]/60 pb-3 mb-6">
              <Stethoscope className="w-5 h-5 text-[#8064A9]" />
              <span>{language === "mr" ? "IDRS गुण विश्लेषण" : language === "hi" ? "IDRS स्कोर विश्लेषण" : "IDRS Score Breakdown"}</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: language === "mr" ? "वय" : language === "hi" ? "उम्र" : "Age",
                  value: `${idrsResult.breakdown.age.value} ${language === "en" ? "yrs" : language === "mr" ? "वर्षे" : "वर्ष"}`,
                  points: idrsResult.breakdown.age.points,
                  max: idrsResult.breakdown.age.max,
                },
                {
                  label: language === "mr" ? "कमरेचा घेर" : language === "hi" ? "कमर घेरा" : "Waist",
                  value: `${idrsResult.breakdown.waist.value} cm`,
                  points: idrsResult.breakdown.waist.points,
                  max: idrsResult.breakdown.waist.max,
                },
                {
                  label: language === "mr" ? "शारीरिक हालचाल" : language === "hi" ? "शारीरिक गतिविधि" : "Activity",
                  value: getActivityLabel(idrsResult.breakdown.activity.value, language),
                  points: idrsResult.breakdown.activity.points,
                  max: idrsResult.breakdown.activity.max,
                },
                {
                  label: language === "mr" ? "कौटुंबिक इतिहास" : language === "hi" ? "पारिवारिक इतिहास" : "Family History",
                  value: idrsResult.breakdown.familyHistory.value === "none" ? (language === "mr" ? "नाही" : language === "hi" ? "नहीं" : "None")
                    : idrsResult.breakdown.familyHistory.value === "one_parent" ? (language === "mr" ? "एक पालक" : language === "hi" ? "एक माता/पिता" : "One Parent")
                      : (language === "mr" ? "दोन्ही पालक" : language === "hi" ? "दोनों माता/पिता" : "Both Parents"),
                  points: idrsResult.breakdown.familyHistory.points,
                  max: idrsResult.breakdown.familyHistory.max,
                },
              ].map((b, i) => (
                <div key={i} className="p-4 rounded-2xl bg-[#FAF8FC] border border-[#ded3eb]">
                  <div className="text-xs font-semibold uppercase text-slate-400 mb-1">{b.label}</div>
                  <div className="text-sm font-bold text-[#292333] mb-2">{b.value}</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${b.points >= b.max ? "bg-rose-500" : b.points > 0 ? "bg-amber-500" : "bg-[#8064A9]"}`}
                        style={{ width: `${b.max > 0 ? (b.points / b.max) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-[#292333]">{b.points}/{b.max}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 rounded-2xl bg-[#EAE2F5]/40 border border-[#ded3eb] text-sm text-[#452653]">
              <strong>{language === "mr" ? "शिफारस:" : language === "hi" ? "सुझाव:" : "Recommendation:"}</strong> {idrsResult.recommendation}
            </div>
          </div>
        )}

        {/* ═══ Footer Disclaimer ═══ */}
        <div className="text-center text-[11px] text-slate-400 py-4 border-t border-slate-200 mt-4">
          <p>{t.disclaimer}</p>
          {/* <p className="mt-1 font-medium text-slate-500">Fedigree • SEVA Innovation Challenge 2026 • Category 4: NCDs</p> */}
        </div>
      </div>
    </div>
  );
}
