"use client";

import Link from "next/link";
import { usePedigreeStore } from "@/store/pedigreeStore";
import { translations } from "@/lib/translations";
import {
  GitFork,
  Activity,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  HeartPulse,
  Wind,
  Dna,
  Users,
  FileCheck,
} from "lucide-react";

export default function HomePage() {
  const { language } = usePedigreeStore();
  const t = translations[language];

  return (
    <div className="flex flex-col">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* HERO SECTION WITH FLOATING GENOMIC CARDS */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#EAE2F5]/30 via-transparent to-transparent py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-[#ded3eb] text-xs font-bold text-[#452653] shadow-xs mb-6 hover:scale-105 transition-transform cursor-default">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <Sparkles className="w-3.5 h-3.5 text-[#8064A9]" />
            <span>Interactive 3-Generation Pedigree & NCD Risk Engine</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#292333] tracking-tight max-w-4xl mx-auto leading-[1.15]">
            {t.heroTitle}
          </h1>

          <p className="mt-6 text-base sm:text-lg lg:text-xl text-[#5e546b] max-w-3xl mx-auto leading-relaxed font-normal">
            {t.heroSubtitle}
          </p>

          {/* CTA Action Buttons */}
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/tree"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#452653] hover:bg-[#573068] text-white font-extrabold text-base shadow-xl shadow-[#452653]/30 flex items-center justify-center gap-3 transition-all hover:scale-103 active:scale-98 group"
            >
              <GitFork className="w-5 h-5 rotate-180 group-hover:rotate-0 transition-transform duration-300" />
              <span>{t.ctaStartTree}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/assess"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/85 backdrop-blur-md hover:bg-white text-[#292333] font-bold text-base border border-[#ded3eb] hover:border-[#8064A9] shadow-sm flex items-center justify-center gap-2.5 transition-all hover:scale-102"
            >
              <Activity className="w-5 h-5 text-[#8064A9]" />
              <span>{t.ctaFastScreen}</span>
            </Link>
          </div>

          {/* Floating Key Intelligence Badges */}
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto text-left">
            {/* Feature 1 */}
            <div className="p-4 rounded-2xl bg-white/75 backdrop-blur-md border border-[#ded3eb] shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
              <div className="w-8 h-8 rounded-xl bg-[#EAE2F5] text-[#452653] flex items-center justify-center mb-3">
                <Dna className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-sm text-[#292333]">3-Generation Pedigree</h3>
              <p className="text-xs text-[#5e546b] mt-1 leading-relaxed">
                Map kinship heredity across Grandparents, Parents, Siblings, and Offspring with disease pathway glow.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-4 rounded-2xl bg-white/75 backdrop-blur-md border border-[#ded3eb] shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
              <div className="w-8 h-8 rounded-xl bg-[#EAE2F5] text-[#452653] flex items-center justify-center mb-3">
                <HeartPulse className="w-4 h-4 text-rose-600" />
              </div>
              <h3 className="font-extrabold text-sm text-[#292333]">IDRS Parental Triage</h3>
              <p className="text-xs text-[#5e546b] mt-1 leading-relaxed">
                Applies ICMR-INDIAB validated IDRS algorithm factoring +10 or +20 parental risk points.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-4 rounded-2xl bg-white/75 backdrop-blur-md border border-[#ded3eb] shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
              <div className="w-8 h-8 rounded-xl bg-[#EAE2F5] text-[#452653] flex items-center justify-center mb-3">
                <Wind className="w-4 h-4 text-sky-600" />
              </div>
              <h3 className="font-extrabold text-sm text-[#292333]">Live Maharashtra AQI</h3>
              <p className="text-xs text-[#5e546b] mt-1 leading-relaxed">
                Calibrates cardiovascular risk with live district-level Air Quality Index across 36 Maharashtra districts.
              </p>
            </div>
          </div>
        </div>

        {/* Subtle grid pattern background tinted with deep plum */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(69,38,83,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(69,38,83,0.05)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* INDIA & MAHARASHTRA DEMOGRAPHIC REALITY BANNER */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="py-12 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-[#452653] via-[#573068] to-[#8064A9] text-white p-8 sm:p-12 shadow-2xl shadow-[#452653]/20 flex flex-col md:flex-row items-center justify-between gap-8 border border-white/10">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-[#EAE2F5] text-xs sm:text-sm font-semibold mb-3">
                <ShieldCheck className="w-5 h-5 text-[#b7a4d5]" />
                <span className="uppercase tracking-wider">The South Asian &quot;Thin-Fat&quot; Phenotype Reality</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold leading-snug">
                Why standard Western calculators like FamGenix fail Indian patients:
              </h2>
              <p className="mt-3 text-[#EAE2F5] text-sm sm:text-base leading-relaxed opacity-95">
                Indians develop Type 2 Diabetes and premature Heart Attacks (CAD) at significantly lower BMIs due to high visceral adiposity. Fedigree integrates the <strong>ICMR-INDIAB IDRS</strong> and live <strong>Maharashtra AQI exposure</strong> to capture risks that Western apps miss completely.
              </p>
            </div>

            <Link
              href="/assess"
              className="px-7 py-3.5 rounded-xl bg-white text-[#452653] font-extrabold hover:bg-[#FAF8FC] hover:scale-105 transition-all whitespace-nowrap shadow-xl text-sm"
            >
              Start Free Screening
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
