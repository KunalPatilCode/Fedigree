"use client";

import Link from "next/link";
import { usePedigreeStore } from "@/store/pedigreeStore";
import { translations } from "@/lib/translations";
import { GitFork, Activity, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

export default function HomePage() {
  const { language } = usePedigreeStore();
  const t = translations[language];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#EAE2F5]/60 via-[#FAF8FC] to-[#FAF8FC] py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EAE2F5] text-[#452653] text-xs font-bold mb-6 border border-[#ded3eb] shadow-xs">
            <Sparkles className="w-4 h-4 text-[#8064A9]" />
            <span>{t.badgeHackathon}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#292333] tracking-tight max-w-4xl mx-auto leading-tight">
            {t.heroTitle}
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-[#5e546b] max-w-3xl mx-auto leading-relaxed font-normal">
            {t.heroSubtitle}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/tree"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#452653] hover:bg-[#573068] text-white font-bold text-base shadow-lg shadow-[#452653]/25 flex items-center justify-center gap-2.5 transition-all hover:scale-102"
            >
              <GitFork className="w-5 h-5 rotate-180" />
              <span>{t.ctaStartTree}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/assess"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white hover:bg-[#FAF8FC] text-[#292333] font-bold text-base border border-[#ded3eb] hover:border-[#8064A9] shadow-xs flex items-center justify-center gap-2.5 transition-all hover:scale-102"
            >
              <Activity className="w-5 h-5 text-[#8064A9]" />
              <span>{t.ctaFastScreen}</span>
            </Link>
          </div>
        </div>

        {/* Subtle grid pattern background tinted with deep plum */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(69,38,83,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(69,38,83,0.05)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      </section>


      {/* India & Maharashtra Demographic Realities */}
      <section className="py-16 bg-[#FAF8FC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-[#452653] via-[#573068] to-[#8064A9] text-white p-8 sm:p-12 shadow-xl shadow-[#452653]/15 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-[#EAE2F5] text-sm font-semibold mb-3">
                <ShieldCheck className="w-5 h-5 text-[#b7a4d5]" />
                <span>The South Asian &quot;Thin-Fat&quot; Phenotype Reality</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold leading-snug">
                Why standard Western calculators like FamGenix fail Indian patients:
              </h2>
              <p className="mt-3 text-[#EAE2F5] text-sm sm:text-base leading-relaxed opacity-95">
                Indians develop Type 2 Diabetes and premature Heart Attacks (CAD) at much lower BMIs due to high visceral adiposity. Fedigree integrates the <strong>ICMR-INDIAB IDRS</strong> and live <strong>Maharashtra AQI exposure</strong> to capture risks that Western apps miss completely.
              </p>
            </div>

            <Link
              href="/assess"
              className="px-7 py-3.5 rounded-xl bg-white text-[#452653] font-bold hover:bg-[#FAF8FC] hover:scale-105 transition-all whitespace-nowrap shadow-lg text-sm"
            >
              Start Free Screening
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
