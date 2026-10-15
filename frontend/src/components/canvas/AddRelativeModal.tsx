"use client";

import { useState } from "react";
import { usePedigreeStore, Relative } from "@/store/pedigreeStore";
import { translations } from "@/lib/translations";
import { X, User, HeartPulse, Activity, AlertTriangle, Wind } from "lucide-react";

interface AddRelativeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddRelativeModal({ isOpen, onClose }: AddRelativeModalProps) {
  const { language, addRelative } = usePedigreeStore();
  const t = translations[language];

  const [relation, setRelation] = useState<Relative["relation"]>("father");
  const [name, setName] = useState("");
  const [age, setAge] = useState<number>(55);
  const [gender, setGender] = useState<"male" | "female">("male");
  const [isAlive, setIsAlive] = useState(true);
  const [hasDiabetes, setHasDiabetes] = useState(false);
  const [hasHypertension, setHasHypertension] = useState(false);
  const [hasHeartDisease, setHasHeartDisease] = useState(false);
  const [hasStroke, setHasStroke] = useState(false);
  const [hasAsthma, setHasAsthma] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addRelative({
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
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2 font-bold text-slate-800 text-lg">
            <User className="w-5 h-5 text-emerald-600" />
            <span>{t.addRelative}</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Relation Type */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Relationship / नाते
            </label>
            <select
              value={relation}
              onChange={(e) => {
                const val = e.target.value as Relative["relation"];
                setRelation(val);
                if (["father", "brother", "grandfather"].includes(val)) setGender("male");
                if (["mother", "sister", "grandmother"].includes(val)) setGender("female");
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
            >
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
                Gender / लिंग
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setGender("male")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border ${
                    gender === "male"
                      ? "bg-blue-50 border-blue-500 text-blue-700"
                      : "bg-white border-slate-200 text-slate-600"
                  }`}
                >
                  Male (Square ■)
                </button>
                <button
                  type="button"
                  onClick={() => setGender("female")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border ${
                    gender === "female"
                      ? "bg-rose-50 border-rose-500 text-rose-700"
                      : "bg-white border-slate-200 text-slate-600"
                  }`}
                >
                  Female (Circle ●)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Status
              </label>
              <button
                type="button"
                onClick={() => setIsAlive(!isAlive)}
                className={`w-full py-1.5 rounded-lg text-xs font-semibold border ${
                  isAlive
                    ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                    : "bg-slate-100 border-slate-300 text-slate-500"
                }`}
              >
                {isAlive ? "Living / हयात" : "Deceased / दिवंगत"}
              </button>
            </div>
          </div>

          {/* Diagnosed Conditions Checkboxes */}
          <div className="pt-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
              {t.conditions}
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasDiabetes}
                  onChange={(e) => setHasDiabetes(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="text-sm font-medium text-slate-800">{t.diabetes}</span>
              </label>

              <label className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasHypertension}
                  onChange={(e) => setHasHypertension(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm font-medium text-slate-800">{t.hypertension}</span>
              </label>

              <label className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasHeartDisease}
                  onChange={(e) => setHasHeartDisease(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <span className="w-3 h-3 rounded-full bg-purple-600" />
                <span className="text-sm font-medium text-slate-800">{t.heartDisease}</span>
              </label>

              <label className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasStroke}
                  onChange={(e) => setHasStroke(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-sm font-medium text-slate-800">{t.stroke}</span>
              </label>

              <label className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasAsthma}
                  onChange={(e) => setHasAsthma(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <span className="w-3 h-3 rounded-full bg-teal-500" />
                <span className="text-sm font-medium text-slate-800">{t.respiratory}</span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
            >
              {t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
