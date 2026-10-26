"use client";

import { useRouter } from "next/navigation";
import { usePedigreeStore } from "@/store/pedigreeStore";
import { translations } from "@/lib/translations";
import { Activity, MapPin, Gauge, ShieldAlert, ArrowRight } from "lucide-react";

const MAHARASHTRA_DISTRICTS = [
  "Pune",
  "Mumbai",
  "Thane",
  "Nagpur",
  "Nashik",
  "Chhatrapati Sambhajinagar",
  "Solapur",
  "Kolhapur",
  "Amravati",
  "Nanded",
];

export default function AssessPage() {
  const router = useRouter();
  const { language, assessment, setAssessment, runAssessment, isCalculating, relatives } = usePedigreeStore();
  const t = translations[language];

  // Count parental diabetes history from the tree
  const father = relatives.find((r) => r.relation === "father");
  const mother = relatives.find((r) => r.relation === "mother");
  const hasParentsDiabetic = (father?.hasDiabetes ? 1 : 0) + (mother?.hasDiabetes ? 1 : 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await runAssessment();
    router.push("/report");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#292333] tracking-tight">
          {t.assessTitle}
        </h1>
        <p className="text-[#5e546b] text-sm mt-1">{t.assessSubtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Demographics & Waist Circumference */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#ded3eb] shadow-xs space-y-6">
          <div className="flex items-center gap-2 text-[#452653] font-bold text-lg border-b border-[#ded3eb]/60 pb-3">
            <Gauge className="w-5 h-5 text-[#8064A9]" />
            <span>1. Non-Invasive Metabolic Biomarkers</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#292333] mb-2">
                Age / वय (Completed Years)
              </label>
              <input
                type="number"
                min={18}
                max={110}
                value={assessment.ageYears}
                onChange={(e) => setAssessment({ ageYears: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-medium text-[#292333] focus:ring-2 focus:ring-[#8064A9]"
                required
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                IDRS score weights: &lt;35 (0 pts), 35-49 (20 pts), &ge;50 (30 pts).
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#292333] mb-2">
                Biological Sex / लिंग
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setAssessment({ gender: "male" })}
                  className={`flex-1 py-2.5 rounded-xl font-semibold text-sm border transition-all ${
                    assessment.gender === "male"
                      ? "bg-blue-50 border-blue-500 text-blue-700 shadow-xs"
                      : "bg-white border-slate-200 text-[#5e546b]"
                  }`}
                >
                  Male / पुरुष
                </button>
                <button
                  type="button"
                  onClick={() => setAssessment({ gender: "female" })}
                  className={`flex-1 py-2.5 rounded-xl font-semibold text-sm border transition-all ${
                    assessment.gender === "female"
                      ? "bg-rose-50 border-rose-500 text-rose-700 shadow-xs"
                      : "bg-white border-slate-200 text-[#5e546b]"
                  }`}
                >
                  Female / महिला
                </button>
              </div>
            </div>
          </div>

          {/* Waist Circumference Slider */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#292333]">
                {t.waistCircumference}
              </label>
              <span className="text-xl font-black text-[#452653] bg-[#EAE2F5] px-3 py-1 rounded-lg border border-[#ded3eb]">
                {assessment.waistCm} cm
              </span>
            </div>

            <input
              type="range"
              min={60}
              max={140}
              step={1}
              value={assessment.waistCm}
              onChange={(e) => setAssessment({ waistCm: Number(e.target.value) })}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#8064A9]"
            />

            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>60 cm (Slender)</span>
              <span>80 cm (Cutoff)</span>
              <span>90 cm (High Risk)</span>
              <span>140 cm</span>
            </div>

            <p className="text-xs text-[#5e546b] mt-2 bg-[#FAF8FC] p-2.5 rounded-xl border border-[#ded3eb]/60">
              {t.waistHelp}
            </p>
          </div>
        </div>

        {/* Section 2: Physical Activity & Habits */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#ded3eb] shadow-xs space-y-6">
          <div className="flex items-center gap-2 text-[#452653] font-bold text-lg border-b border-[#ded3eb]/60 pb-3">
            <Activity className="w-5 h-5 text-[#8064A9]" />
            <span>2. Daily Lifestyle & Physical Activity</span>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#292333] mb-3">
              {t.physicalActivity}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { key: "vigorous", title: "Vigorous / कष्टाचे", desc: t.vigorous, pts: "0 pts" },
                { key: "moderate", title: "Moderate / मध्यम", desc: t.moderate, pts: "20 pts" },
                { key: "sedentary", title: "Sedentary / बैठी", desc: t.sedentary, pts: "30 pts" },
              ].map((act) => (
                <button
                  key={act.key}
                  type="button"
                  onClick={() => setAssessment({ physicalActivity: act.key as "vigorous" | "moderate" | "sedentary" })}
                  className={`p-4 rounded-2xl text-left border transition-all ${
                    assessment.physicalActivity === act.key
                      ? "bg-[#EAE2F5]/80 border-[#8064A9] ring-2 ring-[#8064A9]/20 shadow-xs"
                      : "bg-white border-slate-200 hover:border-[#8064A9]/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#292333] text-sm">{act.title}</span>
                    <span className="text-[10px] font-bold text-[#452653] bg-[#EAE2F5] px-1.5 py-0.5 rounded border border-[#ded3eb]">
                      {act.pts}
                    </span>
                  </div>
                  <p className="text-xs text-[#5e546b]">{act.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Tobacco Habit */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#292333] mb-2">
              {t.tobaccoHabit}
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setAssessment({ tobaccoEver: true })}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                  assessment.tobaccoEver
                    ? "bg-rose-50 border-rose-500 text-rose-700 shadow-xs"
                    : "bg-white border-slate-200 text-[#5e546b]"
                }`}
              >
                {t.yes}
              </button>
              <button
                type="button"
                onClick={() => setAssessment({ tobaccoEver: false })}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                  !assessment.tobaccoEver
                    ? "bg-[#EAE2F5] border-[#8064A9] text-[#452653] font-bold shadow-xs"
                    : "bg-white border-slate-200 text-[#5e546b]"
                }`}
              >
                {t.no}
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: Environmental Location & AQI */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#ded3eb] shadow-xs space-y-6">
          <div className="flex items-center gap-2 text-[#452653] font-bold text-lg border-b border-[#ded3eb]/60 pb-3">
            <MapPin className="w-5 h-5 text-[#8064A9]" />
            <span>3. Maharashtra Environmental AQI Exposure</span>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#292333] mb-2">
              {t.selectDistrict}
            </label>
            <select
              value={assessment.district}
              onChange={(e) => setAssessment({ district: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-medium text-[#292333] bg-white focus:ring-2 focus:ring-[#8064A9]"
            >
              {MAHARASHTRA_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d} (Maharashtra)
                </option>
              ))}
            </select>
            <span className="text-xs text-[#5e546b] mt-2 block">
              CPCB air pollution data is cross-referenced with your lifestyle profile to calculate cardiovascular and respiratory impact.
            </span>
          </div>
        </div>

        {/* Dynamic Family History Alert summary */}
        <div className="p-4 rounded-2xl bg-[#FAF8FC] border border-[#ded3eb] flex items-center justify-between text-xs text-[#292333]">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#8064A9]" />
            <span>
              Connected Family History: <strong>{hasParentsDiabetic} diabetic parent(s)</strong> tagged on your family tree.
            </span>
          </div>
          <span className="font-bold text-[#452653] bg-[#EAE2F5] px-2.5 py-0.5 rounded border border-[#ded3eb]">
            {hasParentsDiabetic === 2 ? "+20 IDRS pts" : hasParentsDiabetic === 1 ? "+10 IDRS pts" : "+0 pts"}
          </span>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isCalculating}
          className="w-full py-4 rounded-2xl bg-[#452653] hover:bg-[#573068] text-white font-bold text-base shadow-lg shadow-[#452653]/25 flex items-center justify-center gap-2.5 transition-all hover:scale-101 disabled:opacity-50"
        >
          {isCalculating ? (
            <span>{t.calculating}</span>
          ) : (
            <>
              <span>{t.calculateRisk}</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
