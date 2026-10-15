"use client";

import Link from "next/link";
import { usePedigreeStore } from "@/store/pedigreeStore";
import { translations } from "@/lib/translations";
import { GitFork, Activity, FileCheck, ArrowRight, ShieldCheck, Sparkles, AlertCircle } from "lucide-react";

export default function HomePage() {
  const { language } = usePedigreeStore();
  const t = translations[language];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-white to-slate-50 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-semibold mb-6 border border-emerald-200">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>{t.badgeHackathon}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            {t.heroTitle}
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            {t.heroSubtitle}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/tree"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all hover:scale-102"
            >
              <GitFork className="w-5 h-5 rotate-180" />
              <span>{t.ctaStartTree}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/assess"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-base border border-slate-300 shadow-xs flex items-center justify-center gap-2 transition-all"
            >
              <Activity className="w-5 h-5 text-emerald-600" />
              <span>{t.ctaFastScreen}</span>
            </Link>
          </div>
        </div>

        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0596690a_1px,transparent_1px),linear-gradient(to_bottom,#0596690a_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      </section>

      {/* 3 Value Pillars */}
      <section className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-5">
                <GitFork className="w-6 h-6 rotate-180" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{t.feature1Title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{t.feature1Desc}</p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-5">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{t.feature2Title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{t.feature2Desc}</p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center mb-5">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{t.feature3Title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{t.feature3Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* India & Maharashtra Demographic Realities */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-emerald-300 text-sm font-semibold mb-3">
                <ShieldCheck className="w-5 h-5" />
                <span>The South Asian "Thin-Fat" Phenotype Reality</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold leading-snug">
                Why standard Western calculators like FamGenix fail Indian patients:
              </h2>
              <p className="mt-3 text-emerald-100 text-sm sm:text-base leading-relaxed">
                Indians develop Type 2 Diabetes and premature Heart Attacks (CAD) at much lower BMIs due to high visceral adiposity. Fedigree integrates the <strong>ICMR-INDIAB IDRS</strong> and live <strong>Maharashtra AQI exposure</strong> to capture risks that Western apps miss completely.
              </p>
            </div>

            <Link
              href="/assess"
              className="px-6 py-3.5 rounded-xl bg-white text-emerald-900 font-bold hover:bg-emerald-50 transition-colors whitespace-nowrap shadow-md text-sm"
            >
              Start Free Screening
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
