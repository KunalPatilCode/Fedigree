"use client";

import Link from "next/link";
import { usePedigreeStore } from "@/store/pedigreeStore";
import { translations } from "@/lib/translations";
import {
  GitFork,
  Activity,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

// ─── Blurry purple molecular blob visual (right-side hero decoration) ─────────
function MolecularBlob() {
  return (
    <div className="relative w-full h-full min-h-[420px] pointer-events-none select-none" aria-hidden="true">
      {/* Outer lavender haze */}
      <div className="absolute inset-0 rounded-full bg-[#c9b8e8]/20 blur-3xl scale-110" />

      {/* Main central blob */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full blur-2xl"
        style={{ background: "radial-gradient(circle, rgba(155,126,200,0.60) 0%, rgba(123,85,176,0.40) 50%, rgba(69,38,83,0.25) 100%)" }}
      />

      {/* Secondary top-right cluster */}
      <div className="absolute top-8 right-12 w-[130px] h-[130px] rounded-full bg-[#b49ad7]/50 blur-2xl" />

      {/* Third blob — bottom-left offset */}
      <div className="absolute bottom-16 left-8 w-[100px] h-[100px] rounded-full bg-[#8064a9]/35 blur-2xl" />

      {/* Small floating accent orbs */}
      <div className="absolute top-1/3 left-1/4 w-[60px] h-[60px] rounded-full bg-[#d4c0f0]/60 blur-xl" />
      <div className="absolute bottom-1/3 right-1/4 w-[50px] h-[50px] rounded-full bg-[#c5a8e0]/55 blur-xl" />
      <div className="absolute top-[15%] right-[20%] w-[40px] h-[40px] rounded-full bg-[#f3edfb]/80 blur-lg" />
      <div className="absolute bottom-[20%] left-[35%] w-[30px] h-[30px] rounded-full bg-[#ede0fa]/70 blur-md" />

      {/* Tiny micro dots for depth */}
      <div className="absolute top-[60%] right-[12%] w-[22px] h-[22px] rounded-full bg-[#b49ad7]/80 blur-md" />
      <div className="absolute top-[30%] left-[12%] w-[18px] h-[18px] rounded-full bg-[#8064a9]/70 blur-sm" />
      <div className="absolute top-[45%] right-[35%] w-[14px] h-[14px] rounded-full bg-white/50 blur-sm" />

      {/* Bottom elongated DNA-like strand shadow */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[120px] h-[200px] rounded-full bg-[#5c3878]/30 blur-3xl rotate-12" />
    </div>
  );
}

export default function HomePage() {
  const { language } = usePedigreeStore();
  const t = translations[language];

  return (
    <div className="flex flex-col">

      {/* ──────────────────────────────────────────────────────── */}
      {/* HERO — Two Column: Text Left · Blob Right               */}
      {/* ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[calc(100vh-64px)] lg:min-h-screen flex items-center">

        {/* Very soft lavender radial wash behind the hero */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#EAE2F5]/40 via-[#f5f1fb]/20 to-transparent pointer-events-none" />
        {/* Subtle dot-grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(69,38,83,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(69,38,83,0.04)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_70%_60%_at_40%_40%,#000_60%,transparent_100%)] pointer-events-none" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 lg:py-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-6 items-center">

            {/* ── LEFT: Text Content ─────────────────────────── */}
            <div className="flex flex-col gap-6 lg:pr-8">
              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold text-[#1a1025] tracking-tight leading-[1.1]">
                {t.heroTitle}
              </h1>

              <p className="text-base sm:text-lg text-[#5e546b] leading-relaxed max-w-xl font-normal">
                {t.heroSubtitle}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-start gap-3 mt-2">
                <Link
                  href="/tree"
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-[#452653] hover:bg-[#573068] text-white font-bold text-sm shadow-lg shadow-[#452653]/30 transition-all hover:scale-[1.03] active:scale-[0.98] group"
                >
                  <GitFork className="w-4 h-4 rotate-180 group-hover:rotate-0 transition-transform duration-300" />
                  <span>{t.ctaStartTree}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  href="/assess"
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-white/85 backdrop-blur-md hover:bg-white text-[#292333] font-semibold text-sm border border-[#ded3eb] hover:border-[#8064A9] shadow-sm transition-all hover:scale-[1.02]"
                >
                  <Activity className="w-4 h-4 text-[#8064A9]" />
                  <span>{t.ctaFastScreen}</span>
                </Link>
              </div>
            </div>

            {/* ── RIGHT: Molecular Blob Visual ──────────────── */}
            <div className="relative flex items-center justify-center lg:justify-end h-[380px] lg:h-[520px]">
              <MolecularBlob />
            </div>

          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────── */}
      {/* INDIA & MAHARASHTRA DEMOGRAPHIC REALITY BANNER          */}
      {/* ──────────────────────────────────────────────────────── */}
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
