"use client";

import { useState } from "react";
import Link from "next/link";
import { usePedigreeStore, Relative } from "@/store/pedigreeStore";
import { translations } from "@/lib/translations";
import { AddRelativeModal } from "@/components/canvas/AddRelativeModal";
import { Plus, Trash2, ArrowRight, ShieldCheck, HeartPulse, Activity } from "lucide-react";

export default function PedigreeTreePage() {
  const { language, relatives, deleteRelative } = usePedigreeStore();
  const t = translations[language];
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Group relatives into 3 generational tiers
  const grandparents = relatives.filter((r) => r.relation === "grandfather" || r.relation === "grandmother");
  const parents = relatives.filter((r) => r.relation === "father" || r.relation === "mother");
  const selfAndSiblings = relatives.filter((r) => r.relation === "self" || r.relation === "brother" || r.relation === "sister");
  const children = relatives.filter((r) => r.relation === "child");

  const renderRelativeCard = (rel: Relative) => {
    const isSelf = rel.relation === "self";
    const isMale = rel.gender === "male";

    return (
      <div
        key={rel.id}
        className={`relative flex flex-col p-4 rounded-2xl border transition-all ${
          isSelf
            ? "bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-500/20 shadow-md"
            : "bg-white border-slate-200 hover:border-slate-300 shadow-xs"
        } min-w-[200px] max-w-[240px]`}
      >
        {/* Top: Iconography & Delete */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {/* Standard Pedigree glyph: Square for male, Circle for female */}
            <div
              className={`w-7 h-7 flex items-center justify-center font-bold text-xs ${
                isMale
                  ? "bg-blue-100 text-blue-700 rounded-md"
                  : "bg-rose-100 text-rose-700 rounded-full"
              }`}
            >
              {isMale ? "■" : "●"}
            </div>
            <span className="text-xs uppercase font-bold tracking-wider text-slate-500">
              {rel.relation}
            </span>
          </div>

          {!isSelf && (
            <button
              onClick={() => deleteRelative(rel.id)}
              className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
              title={t.delete}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Name and Age */}
        <div className="font-bold text-slate-800 text-sm">{rel.name}</div>
        <div className="text-xs text-slate-500 mt-0.5">
          {rel.age} years • {rel.isAlive ? "Living" : "Deceased"}
        </div>

        {/* Condition Badges */}
        <div className="mt-3 flex flex-wrap gap-1">
          {rel.hasDiabetes && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              Diabetes
            </span>
          )}
          {rel.hasHypertension && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              High BP
            </span>
          )}
          {rel.hasHeartDisease && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
              CAD/Heart
            </span>
          )}
          {rel.hasStroke && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Stroke
            </span>
          )}
          {rel.hasAsthma && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
              Asthma
            </span>
          )}

          {!rel.hasDiabetes && !rel.hasHypertension && !rel.hasHeartDisease && !rel.hasStroke && !rel.hasAsthma && (
            <span className="text-[10px] text-emerald-600 font-medium py-0.5">
              No NCDs reported
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t.treeTitle}
          </h1>
          <p className="text-slate-500 text-sm mt-1">{t.treeSubtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-transform hover:scale-102"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addRelative}</span>
          </button>

          <Link
            href="/assess"
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-xs flex items-center gap-2"
          >
            <span>Proceed to Screening</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Visual Pedigree Generation Hierarchy */}
      <div className="mt-8 space-y-10">
        {/* Generation 1: Grandparents */}
        <div className="p-6 rounded-3xl bg-slate-100/70 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Generation I • Grandparents (आजोबा / आजी)
            </span>
            <span className="text-xs text-slate-400">Hereditary Baseline</span>
          </div>

          <div className="flex flex-wrap gap-4">
            {grandparents.length > 0 ? (
              grandparents.map(renderRelativeCard)
            ) : (
              <div className="text-xs text-slate-400 italic py-3">
                No grandparents added. Click "+ Add Relative" to record paternal or maternal grandparents.
              </div>
            )}
          </div>
        </div>

        {/* Generation 2: Parents */}
        <div className="p-6 rounded-3xl bg-slate-100/70 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Generation II • Parents (आई / वडील)
            </span>
            <span className="text-xs font-semibold text-rose-600">
              Direct Genetic Contributors to IDRS
            </span>
          </div>

          <div className="flex flex-wrap gap-4">
            {parents.length > 0 ? (
              parents.map(renderRelativeCard)
            ) : (
              <div className="text-xs text-slate-400 italic py-3">
                No parents added yet.
              </div>
            )}
          </div>
        </div>

        {/* Generation 3: Self & Siblings */}
        <div className="p-6 rounded-3xl bg-emerald-50/50 border border-emerald-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Generation III • Primary Subject & Siblings (स्वतः आणि भावंडे)
            </span>
            <span className="text-xs font-semibold text-emerald-700">Primary Target for Prevention</span>
          </div>

          <div className="flex flex-wrap gap-4">
            {selfAndSiblings.map(renderRelativeCard)}
          </div>
        </div>

        {/* Generation 4: Children (if added) */}
        {children.length > 0 && (
          <div className="p-6 rounded-3xl bg-slate-100/70 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Generation IV • Children (मुलगा / मुलगी)
              </span>
              <span className="text-xs text-slate-400">Future Preventive Horizon</span>
            </div>

            <div className="flex flex-wrap gap-4">{children.map(renderRelativeCard)}</div>
          </div>
        )}
      </div>

      {/* Add Relative Modal */}
      <AddRelativeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
