"use client";

import { useState } from "react";
import { usePedigreeStore, Relative } from "@/store/pedigreeStore";
import { translations } from "@/lib/translations";
import { X, User, Edit3, HeartPulse, FileText } from "lucide-react";

interface AddRelativeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Relative | null;
  defaultRelation?: Relative["relation"];
}

function AddRelativeModalForm({
  onClose,
  initialData,
  defaultRelation = "father",
}: Omit<AddRelativeModalProps, "isOpen">) {
  const { language, addRelative, updateRelative } = usePedigreeStore();
  const t = translations[language];

  const isEditing = Boolean(initialData);

  const getInitialGender = (rel: Relative["relation"]) => {
    if (["father", "brother", "grandfather"].includes(rel)) return "male";
    if (["mother", "sister", "grandmother"].includes(rel)) return "female";
    return "male";
  };

  const [relation, setRelation] = useState<Relative["relation"]>(
    initialData?.relation || defaultRelation
  );
  const [name, setName] = useState(initialData?.name || "");
  const [age, setAge] = useState<number>(initialData?.age ?? 55);
  const [gender, setGender] = useState<"male" | "female">(
    initialData?.gender || getInitialGender(defaultRelation)
  );
  const [isAlive, setIsAlive] = useState(initialData?.isAlive ?? true);
  const [hasDiabetes, setHasDiabetes] = useState(initialData?.hasDiabetes ?? false);
  const [hasHypertension, setHasHypertension] = useState(initialData?.hasHypertension ?? false);
  const [hasHeartDisease, setHasHeartDisease] = useState(initialData?.hasHeartDisease ?? false);
  const [hasStroke, setHasStroke] = useState(initialData?.hasStroke ?? false);
  const [hasAsthma, setHasAsthma] = useState(initialData?.hasAsthma ?? false);
  const [notes, setNotes] = useState(initialData?.notes || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      relation,
      name: name.trim() || `${relation.toUpperCase()} (${age}y)`,
      age: Number(age) || 50,
      gender,
      isAlive,
      hasDiabetes,
      hasHypertension,
      hasHeartDisease,
      hasStroke,
      hasAsthma,
      notes: notes.trim() || undefined,
    };

    if (isEditing && initialData) {
      updateRelative(initialData.id, payload);
    } else {
      addRelative(payload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5 font-bold text-slate-800 text-base sm:text-lg">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              {isEditing ? <Edit3 className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>
            <div>
              <span>{isEditing ? "Edit Relative / माहिती बदला" : t.addRelative}</span>
              <p className="text-[11px] font-normal text-slate-500">
                {isEditing ? `Modifying profile for ${initialData?.name}` : "Clinical pedigree node registration"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-slate-700">
          {/* Relation Type */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Relationship / नाते
            </label>
            <select
              value={relation}
              disabled={isEditing && initialData?.relation === "self"}
              onChange={(e) => {
                const val = e.target.value as Relative["relation"];
                setRelation(val);
                if (["father", "brother", "grandfather"].includes(val)) setGender("male");
                if (["mother", "sister", "grandmother"].includes(val)) setGender("female");
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium disabled:bg-slate-100 disabled:cursor-not-allowed"
            >
              {isEditing && initialData?.relation === "self" && (
                <option value="self">{t.selfNode}</option>
              )}
              <option value="father">{t.father}</option>
              <option value="mother">{t.mother}</option>
              <option value="brother">{t.brother}</option>
              <option value="sister">{t.sister}</option>
              <option value="grandfather">{t.grandfather} (Paternal/Maternal)</option>
              <option value="grandmother">{t.grandmother} (Paternal/Maternal)</option>
              <option value="child">{t.child}</option>
            </select>
          </div>

          {/* Name & Age */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Name / नाव (Optional)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Patil"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                {t.ageYears}
              </label>
              <input
                type="number"
                min={1}
                max={120}
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          {/* Gender & Living Status */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Gender / लिंग (Pedigree Glyph)
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setGender("male")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                    gender === "male"
                      ? "bg-blue-50 border-blue-500 text-blue-700 shadow-xs"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="font-bold">■</span> Male
                </button>
                <button
                  type="button"
                  onClick={() => setGender("female")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                    gender === "female"
                      ? "bg-rose-50 border-rose-500 text-rose-700 shadow-xs"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="font-bold">●</span> Female
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Status / स्थिती
              </label>
              <button
                type="button"
                onClick={() => setIsAlive(!isAlive)}
                className={`w-full py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  isAlive
                    ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                    : "bg-slate-100 border-slate-300 text-slate-600"
                }`}
              >
                {isAlive ? "Living / हयात (Active)" : "Deceased / दिवंगत (Diagonal /)"}
              </button>
            </div>
          </div>

          {/* Diagnosed Conditions Checkboxes */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                <span>{t.conditions}</span>
              </label>
              <span className="text-[10px] text-slate-400">Select all confirmed diagnoses</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label className="flex items-center gap-2.5 p-2 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={hasDiabetes}
                  onChange={(e) => setHasDiabetes(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                <span className="text-xs font-medium text-slate-800">{t.diabetes}</span>
              </label>

              <label className="flex items-center gap-2.5 p-2 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={hasHypertension}
                  onChange={(e) => setHasHypertension(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                <span className="text-xs font-medium text-slate-800">{t.hypertension}</span>
              </label>

              <label className="flex items-center gap-2.5 p-2 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={hasHeartDisease}
                  onChange={(e) => setHasHeartDisease(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600 shrink-0" />
                <span className="text-xs font-medium text-slate-800">{t.heartDisease}</span>
              </label>

              <label className="flex items-center gap-2.5 p-2 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={hasStroke}
                  onChange={(e) => setHasStroke(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                <span className="text-xs font-medium text-slate-800">{t.stroke}</span>
              </label>

              <label className="flex items-center gap-2.5 p-2 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors sm:col-span-2">
                <input
                  type="checkbox"
                  checked={hasAsthma}
                  onChange={(e) => setHasAsthma(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500 shrink-0" />
                <span className="text-xs font-medium text-slate-800">{t.respiratory}</span>
              </label>
            </div>
          </div>

          {/* Clinical Notes Field */}
          <div className="pt-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Clinical / Medication Notes (Optional)</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Diagnosed at age 48, currently prescribed Metformin & Telmisartan"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all hover:scale-102"
            >
              {isEditing ? "Update Relative" : t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AddRelativeModal({ isOpen, onClose, initialData, defaultRelation }: AddRelativeModalProps) {
  if (!isOpen) return null;
  const formKey = `${initialData ? `edit-${initialData.id}` : `add-${defaultRelation || "father"}`}`;

  return (
    <AddRelativeModalForm
      key={formKey}
      onClose={onClose}
      initialData={initialData}
      defaultRelation={defaultRelation}
    />
  );
}
