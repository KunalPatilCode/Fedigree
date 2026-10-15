"use client";

import { usePedigreeStore } from "@/store/pedigreeStore";
import { translations } from "@/lib/translations";
import { Heart } from "lucide-react";

export function Footer() {
  const { language } = usePedigreeStore();
  const t = translations[language];

  return (
    <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-white font-bold text-base tracking-tight">{t.appName}</span>
          <p className="text-xs text-slate-500 mt-1">{t.tagline}</p>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <span>Engineered for</span>
          <span className="text-emerald-400 font-semibold">{t.badgeHackathon}</span>
          <span>with</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
        </div>
      </div>
    </footer>
  );
}
