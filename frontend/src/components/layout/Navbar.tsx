"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePedigreeStore } from "@/store/pedigreeStore";
import { translations, Language } from "@/lib/translations";
import { Activity, GitFork, FileText, Home, Globe } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { language, setLanguage } = usePedigreeStore();
  const t = translations[language];

  const navLinks = [
    { href: "/", label: t.navHome, icon: Home },
    { href: "/tree", label: t.navTree, icon: GitFork },
    { href: "/assess", label: t.navAssess, icon: Activity },
    { href: "/report", label: t.navReport, icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <GitFork className="w-5 h-5 rotate-180" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-700 to-teal-800 bg-clip-text text-transparent">
              {t.appName}
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
              SEVA 2026
            </span>
          </div>
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200/60 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-emerald-600" : "text-slate-400"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Language Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
            <Globe className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-1" />
            {(["en", "mr", "hi"] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  language === lang
                    ? "bg-white text-emerald-700 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {lang === "en" ? "EN" : lang === "mr" ? "मराठी" : "हिंदी"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
