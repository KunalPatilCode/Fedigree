"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePedigreeStore } from "@/store/pedigreeStore";
import { translations, Language } from "@/lib/translations";
import Image from "next/image";
import {
  Home,
  GitFork,
  Activity,
  UserCheck,
  Sparkles,
  FileText,
  Menu,
  X,
  Globe,
} from "lucide-react";

const UPCOMING_FEATURES = [
  "Doctor Guided",
  "Screening, Referrals and Follow-up",
  "Screening Management",
  "Referral and Appointment Tracking",
  "Follow-Up and Patient Engagement",
  "Care-Gap Detection",
  "Programme Analytics Dashboard",
  "Family Level Prevention",
  "AI Diet Generation",
] as const;

function UpcomingFeaturesSection() {
  return (
    <div className="pt-5 mt-4 border-t border-[#ded3eb]/70">
      <div className="px-3 mb-2">
        <p className="text-[11px] font-bold tracking-[0.14em] text-[#8064A9] uppercase">
          UPCOMING FEATURES
        </p>
      </div>

      <div className="flex flex-col gap-1 font-sans">
        {UPCOMING_FEATURES.map((feature) => (
          <div
            key={feature}
            aria-disabled="true"
            className="flex items-start justify-between gap-2 px-3 py-2 rounded-xl text-[13px] leading-snug font-medium text-[#5e546b] select-none cursor-default"
          >
            <span className="flex-1">{feature}</span>
            <span className="shrink-0 mt-0.5 px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase rounded-md bg-[#EAE2F5] text-[#8064A9] border border-[#ded3eb]/80">
              SOON
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const { language, setLanguage } = usePedigreeStore();
  const t = translations[language];
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: t.navHome, icon: Home },
    { href: "/tree", label: t.navTree, icon: GitFork, rotateIcon: true },
    { href: "/assess", label: t.navAssess, icon: Activity },
    { href: "/profile", label: t.navProfile, icon: UserCheck },
    { href: "/predict", label: t.navPredict, icon: Sparkles },
    { href: "/report", label: t.navReport, icon: FileText },
  ];

  return (
    <>
      {/* ───────────────────────────────────────────────────────────── */}
      {/* DESKTOP SIDEBAR NAVBAR (LEFT HAND SIDE) */}
      {/* ───────────────────────────────────────────────────────────── */}
      <aside
        aria-label="Sidebar Navigation"
        className="hidden lg:flex flex-col justify-between w-64 xl:w-72 h-screen sticky top-0 shrink-0 bg-white/75 backdrop-blur-2xl border-r border-[#ded3eb] p-6 z-40 shadow-[4px_0_24px_rgba(69,38,83,0.03)]"
      >
        {/* Top: Brand Logo & Subtitle */}
        <div className="shrink-0 pb-6 mb-4 border-b border-[#ded3eb]/70">
          <Link href="/" className="flex items-center gap-2 group">
            <Image
              src="/fedigree-logo-cropped.png"
              alt="Fedigree"
              width={160}
              height={44}
              priority
              className="h-10 sm:h-11 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
            />
          </Link>
          <p className="text-[11px] font-semibold text-[#8064A9] mt-2 tracking-wide uppercase">
            Family Health & NCD Triage
          </p>
        </div>

        {/* Scrollable Navigation & Upcoming Features */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pr-1.5">
          {/* Navigation Links (Vertical List) */}
          <nav aria-label="Main Navigation" className="flex flex-col gap-1.5 font-editorial">
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[16px] xl:text-[17px] font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-[#452653] text-white shadow-md shadow-[#452653]/20 font-semibold translate-x-1"
                      : "text-[#4a3b57] hover:text-[#281432] hover:bg-[#EAE2F5]/50"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 transition-transform ${
                      item.rotateIcon ? "rotate-180" : ""
                    } ${isActive ? "text-[#EAE2F5]" : "text-[#8064A9]"}`}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Upcoming Features section immediately after Doctor Triage Brief */}
          <UpcomingFeaturesSection />
        </div>

        {/* Bottom: Language Selector & Platform Status */}
        <div className="shrink-0 pt-4 mt-3 border-t border-[#ded3eb]/80 flex flex-col gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5e546b] mb-2 px-1">
              <Globe className="w-3.5 h-3.5 text-[#8064A9]" />
              <span>Language / भाषा</span>
            </div>
            <div className="flex items-center bg-white/70 backdrop-blur-md p-1 rounded-xl border border-[#ded3eb] font-sans text-xs shadow-xs">
              {(["en", "mr", "hi"] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`flex-1 py-1.5 rounded-lg font-medium transition-colors duration-150 text-center ${
                    language === lang
                      ? "bg-[#452653] text-white shadow-xs font-semibold"
                      : "text-[#5e546b] hover:text-[#281432] hover:bg-white/60"
                  }`}
                  title={`Switch language to ${lang.toUpperCase()}`}
                >
                  {lang === "en" ? "EN" : lang === "mr" ? "मराठी" : "हिंदी"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MOBILE TOP BAR (SHOWN ONLY ON SCREENS < LG) */}
      {/* ───────────────────────────────────────────────────────────── */}
      <header className="lg:hidden sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl border-b border-[#ded3eb] shadow-xs font-editorial">
        <div className="w-full px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/fedigree-logo-cropped.png"
              alt="Fedigree"
              width={140}
              height={38}
              priority
              className="h-9 w-auto object-contain"
            />
          </Link>

          <div className="flex items-center gap-2">
            {/* Mobile Language Switcher */}
            <div className="flex items-center bg-white/60 p-0.5 rounded-lg border border-[#ded3eb] text-xs font-sans">
              {(["en", "mr", "hi"] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2 py-1 rounded-md font-medium transition-colors ${
                    language === lang
                      ? "bg-[#452653] text-white font-semibold"
                      : "text-[#5e546b] hover:text-[#281432]"
                  }`}
                >
                  {lang === "en" ? "EN" : lang === "mr" ? "मराठी" : "हिंदी"}
                </button>
              ))}
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
              className="p-2 rounded-xl text-[#452653] hover:bg-[#EAE2F5]/60 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MOBILE SLIDE-IN SIDEBAR DRAWER OVERLAY */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative w-72 max-w-[80vw] h-full bg-[#FAF8FC] border-r border-[#ded3eb] shadow-2xl flex flex-col p-6 z-10 animate-in slide-in-from-left duration-200">
            <div className="shrink-0 flex items-center justify-between pb-5 mb-5 border-b border-[#ded3eb]">
              <Image
                src="/fedigree-logo-cropped.png"
                alt="Fedigree"
                width={130}
                height={36}
                priority
                className="h-8 w-auto object-contain"
              />
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-[#5e546b] hover:bg-[#EAE2F5]"
                aria-label="Close menu"
              >
                <X className="w-5 h-5 text-[#452653]" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pr-1.5">
              <nav aria-label="Mobile Navigation" className="flex flex-col gap-1.5 font-editorial">
                {navLinks.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-base font-medium transition-all ${
                        isActive
                          ? "bg-[#452653] text-white shadow-md shadow-[#452653]/20 font-semibold"
                          : "text-[#4a3b57] hover:text-[#281432] hover:bg-[#EAE2F5]/50"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 shrink-0 ${
                          item.rotateIcon ? "rotate-180" : ""
                        } ${isActive ? "text-[#EAE2F5]" : "text-[#8064A9]"}`}
                      />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Upcoming Features section immediately after Doctor Triage Brief */}
              <UpcomingFeaturesSection />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
