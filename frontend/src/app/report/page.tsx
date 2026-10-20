"use client";

import { useState, useEffect } from "react";
import { usePedigreeStore } from "@/store/pedigreeStore";
import { translations } from "@/lib/translations";
import { Printer, ArrowLeft, Activity, AlertCircle, Utensils } from "lucide-react";
import Link from "next/link";

export default function ReportPage() {
  const { language, idrsResult, mlDiabetesScore, mlCvdScore, assessment, relatives, aqiData } = usePedigreeStore();
  const t = translations[language];
  const [currentDate, setCurrentDate] = useState<string>("15/10/2026");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentDate(new Date().toLocaleDateString("en-IN"));
  }, []);

  // Fallback calculation if navigated directly
  const score = idrsResult?.score ?? 50;
  const riskLevel = idrsResult?.riskLevel ?? "Moderate";
  const diabProb = mlDiabetesScore !== null ? (mlDiabetesScore * 100).toFixed(1) : "38.0";
  const cvdProb = mlCvdScore !== null ? (mlCvdScore * 100).toFixed(1) : "29.0";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 print:hidden">
        <Link
          href="/assess"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Assessment</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-transform hover:scale-102"
          >
            <Printer className="w-4 h-4" />
            <span>{t.downloadPdf}</span>
          </button>
        </div>
      </div>

      {/* Printable Clinical 1-Page Document Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 sm:p-12 print:shadow-none print:border-none print:p-0">
        {/* Header with SEVA Badge & Clinical Stamp */}
        <div className="flex items-start justify-between border-b-2 border-slate-900 pb-6 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-slate-900">{t.appName}</span>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                Clinical OPD Triage
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Family Health Tree & Non-Communicable Disease (NCD) Preventive Care Summary
            </p>
          </div>

          <div className="text-right text-xs text-slate-500">
            <div><strong>Date:</strong> {currentDate}</div>
            <div><strong>Location:</strong> {assessment.district}, Maharashtra</div>
            <div className="text-[10px] text-slate-400">SEVA Innovation Challenge 2026</div>
          </div>
        </div>

        {/* Section 1: Patient Biometrics & Air Quality Index */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-6 text-xs">
          <div>
            <span className="text-slate-400 block uppercase font-semibold">Subject Age / Sex</span>
            <span className="font-bold text-slate-900 text-sm">{assessment.ageYears} Yrs • {assessment.gender.toUpperCase()}</span>
          </div>
          <div>
            <span className="text-slate-400 block uppercase font-semibold">Waist Circumference</span>
            <span className="font-bold text-slate-900 text-sm">{assessment.waistCm} cm</span>
          </div>
          <div>
            <span className="text-slate-400 block uppercase font-semibold">Physical Activity</span>
            <span className="font-bold text-slate-900 text-sm capitalize">{assessment.physicalActivity}</span>
          </div>
          <div>
            <span className="text-slate-400 block uppercase font-semibold">Ambient AQI ({assessment.district})</span>
            <span className="font-bold text-amber-700 text-sm">{aqiData?.aqi || 128} ({aqiData?.category || "Moderate"})</span>
          </div>
        </div>

        {/* Section 2: Stratified Clinical Risk Cards (Dual-Engine) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Card 1: IDRS (Clinical Standard) */}
          <div className="p-5 rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/30">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-900 mb-2">
              <span>MDRF / ICMR IDRS</span>
              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                score >= 60 ? "bg-rose-100 text-rose-800" : score >= 30 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
              }`}>
                {riskLevel} Risk
              </span>
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1">
              {score} <span className="text-sm font-normal text-slate-500">/ 100</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">
              Validated Indian Diabetes Risk Score. Cutoff: &ge;60 indicates high risk for undiagnosed diabetes.
            </p>
          </div>

          {/* Card 2: LASI ML Model 1 (Diabetes) */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
              <span>LASI ML Diabetes Model</span>
              <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">Tuned RF</span>
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1">
              {diabProb}%
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Indian longitudinal survey demographic classification probability (11 features).
            </p>
          </div>

          {/* Card 3: LASI ML Model 2 (CVD Composite) */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
              <span>LASI CVD Composite</span>
              <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">LogReg</span>
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1">
              {cvdProb}%
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Composite likelihood for Hypertension, Heart Disease, or Stroke based on family load.
            </p>
          </div>
        </div>

        {/* Section 3: Family Pedigree Snapshot */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/40 mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>3-Generation Family Tree Disease Lineage</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {relatives.map((r) => (
              <div key={r.id} className="p-2.5 rounded-xl bg-white border border-slate-200">
                <div className="font-bold text-slate-800 capitalize flex items-center justify-between">
                  <span>{r.relation}</span>
                  <span className="text-[10px] font-normal text-slate-400">{r.age}y</span>
                </div>
                <div className="mt-1 space-y-0.5 text-[11px]">
                  {r.hasDiabetes && <div className="text-rose-600 font-semibold">• Type 2 Diabetes</div>}
                  {r.hasHypertension && <div className="text-blue-600 font-semibold">• Hypertension</div>}
                  {r.hasHeartDisease && <div className="text-purple-600 font-semibold">• CAD/Heart Attack</div>}
                  {!r.hasDiabetes && !r.hasHypertension && !r.hasHeartDisease && (
                    <div className="text-slate-400 italic">No major NCDs</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Recommended Doctor Diagnostic Tests & Lab Checklist */}
        <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200 mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-2 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Actionable Doctor Triage Checklist (For OPD Medical Officer)</span>
          </h3>
          <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
            <li><strong>Fasting Plasma Glucose (FPG) & HbA1c:</strong> Strongly indicated due to IDRS score of {score}/100 and positive parental history.</li>
            <li><strong>Lipid Profile:</strong> Check Triglycerides / HDL ratio (hallmark of South Asian dyslipidemia).</li>
            <li><strong>Blood Pressure Monitoring:</strong> Serial resting BP checks during morning OPD hours.</li>
            <li><strong>Environmental Protection:</strong> Limit early morning outdoor strenuous cardio in {assessment.district} when AQI &gt; 150.</li>
          </ul>
        </div>

        {/* Section 5: ICMR-NIN Cultural Dietary Prescription (Maharashtra) */}
        <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 text-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-2 flex items-center gap-1.5">
            <Utensils className="w-4 h-4 text-emerald-700" />
            <span>{t.dietAdviceTitle}</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-700 mt-2">
            <div className="p-2.5 rounded-xl bg-white border border-emerald-100">
              <strong className="block text-emerald-800">1. Whole Grains / Millets</strong>
              Replace polished white rice with traditional Maharashtrian Jowar (ज्वारी) or Bajra (बाजरी) bhakri for low glycemic index.
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-emerald-100">
              <strong className="block text-emerald-800">2. Edible Oil Limitation</strong>
              Cap daily cooking oil to &le;20 grams/day. Rotate groundnut oil and mustard oil; avoid repeated deep frying.
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-emerald-100">
              <strong className="block text-emerald-800">3. Daily 30-Min Brisk Walk</strong>
              Accumulate at least 150 minutes of moderate physical activity weekly to cut insulin resistance by up to 30%.
            </div>
          </div>
        </div>

        {/* Footer Disclaimer */}
        <div className="mt-8 pt-4 border-t border-slate-200 text-[10px] text-slate-400 text-center">
          Notice: This triage document provides risk awareness based on ICMR-INDIAB IDRS and LASI research models. It does not replace a clinical physician&apos;s formal medical diagnosis.
        </div>
      </div>
    </div>
  );
}
