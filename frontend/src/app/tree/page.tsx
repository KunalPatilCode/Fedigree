"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  Node,
  Edge,
  NodeProps,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { usePedigreeStore, Relative } from "@/store/pedigreeStore";
import { AddRelativeModal } from "@/components/canvas/AddRelativeModal";
import {
  Plus,
  ArrowRight,
  Edit2,
  Trash2,
  X,
  HeartPulse,
  Sparkles,
  UserPlus,
  RotateCcw,
  Activity,
  FileText,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// ILLUSTRATED SVG AVATARS (Matching the user's reference diagram)
// ─────────────────────────────────────────────────────────────────────────────

function GrandmotherAvatar() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full pointer-events-none">
      <circle cx="50" cy="50" r="48" fill="#EAE2F5" />
      <circle cx="50" cy="22" r="11" fill="#E2E8F0" />
      <path d="M 22 92 C 22 68, 78 68, 78 92 Z" fill="#E69A43" />
      <path d="M 44 70 L 50 78 L 56 70 Z" fill="#F8FAFC" />
      <rect x="44" y="58" width="12" height="15" fill="#FDD6BA" rx="3" />
      <circle cx="50" cy="45" r="21" fill="#FDD6BA" />
      <path d="M 29 45 C 29 28, 71 28, 71 45 C 67 36, 33 36, 29 45 Z" fill="#CBD5E1" />
      <circle cx="42" cy="44" r="6" fill="none" stroke="#78350F" strokeWidth="1.5" />
      <circle cx="58" cy="44" r="6" fill="none" stroke="#78350F" strokeWidth="1.5" />
      <line x1="48" y1="44" x2="52" y2="44" stroke="#78350F" strokeWidth="1.5" />
      <circle cx="42" cy="44" r="1.5" fill="#78350F" />
      <circle cx="58" cy="44" r="1.5" fill="#78350F" />
      <circle cx="36" cy="49" r="3" fill="#FCA5A5" opacity="0.6" />
      <circle cx="64" cy="49" r="3" fill="#FCA5A5" opacity="0.6" />
      <path d="M 46 54 Q 50 57 54 54" fill="none" stroke="#9A3412" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="28" cy="46" r="2.5" fill="#F8FAFC" />
      <circle cx="72" cy="46" r="2.5" fill="#F8FAFC" />
    </svg>
  );
}

function GrandfatherAvatar() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full pointer-events-none">
      <circle cx="50" cy="50" r="48" fill="#EAE2F5" />
      <path d="M 20 92 C 20 68, 80 68, 80 92 Z" fill="#334155" />
      <path d="M 42 70 L 50 82 L 58 70 Z" fill="#F8FAFC" />
      <polygon points="46,71 54,71 50,74" fill="#0F172A" />
      <rect x="44" y="56" width="12" height="16" fill="#FDD6BA" rx="3" />
      <circle cx="50" cy="44" r="21" fill="#FDD6BA" />
      <path d="M 28 44 C 28 35, 33 32, 35 32 C 34 38, 30 45, 30 50 Z" fill="#475569" />
      <path d="M 72 44 C 72 35, 67 32, 65 32 C 66 38, 70 45, 70 50 Z" fill="#475569" />
      <circle cx="43" cy="41" r="2" fill="#0F172A" />
      <circle cx="57" cy="41" r="2" fill="#0F172A" />
      <path d="M 39 37 Q 43 35 46 38" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
      <path d="M 54 38 Q 57 35 61 37" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
      <path d="M 39 52 Q 45 47 50 51 Q 55 47 61 52 Q 55 56 50 53 Q 45 56 39 52 Z" fill="#1E293B" />
      <circle cx="36" cy="46" r="3" fill="#FCA5A5" opacity="0.5" />
      <circle cx="64" cy="46" r="3" fill="#FCA5A5" opacity="0.5" />
    </svg>
  );
}

function FatherAvatar() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full pointer-events-none">
      <circle cx="50" cy="50" r="48" fill="#EAE2F5" />
      <path d="M 20 92 C 20 68, 80 68, 80 92 Z" fill="#64748B" />
      <path d="M 43 68 L 50 78 L 57 68 Z" fill="#FFFFFF" />
      <rect x="44" y="56" width="12" height="15" fill="#FDD6BA" rx="3" />
      <circle cx="50" cy="44" r="20" fill="#FDD6BA" />
      <path d="M 30 40 C 30 25, 70 25, 70 40 C 65 28, 45 27, 30 40 Z" fill="#1E293B" />
      <circle cx="43" cy="42" r="2" fill="#1E293B" />
      <circle cx="57" cy="42" r="2" fill="#1E293B" />
      <path d="M 40 38 Q 43 36 46 38" fill="none" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M 54 38 Q 57 36 60 38" fill="none" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M 46 51 Q 50 54 54 51" fill="none" stroke="#9A3412" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="36" cy="46" r="3" fill="#FCA5A5" opacity="0.6" />
      <circle cx="64" cy="46" r="3" fill="#FCA5A5" opacity="0.6" />
    </svg>
  );
}

function MotherAvatar() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full pointer-events-none">
      <circle cx="50" cy="50" r="48" fill="#EAE2F5" />
      <circle cx="30" cy="48" r="10" fill="#451A03" />
      <circle cx="70" cy="48" r="10" fill="#451A03" />
      <path d="M 22 92 C 22 68, 78 68, 78 92 Z" fill="#1E293B" />
      <circle cx="40" cy="80" r="1.5" fill="#FFFFFF" />
      <circle cx="50" cy="82" r="1.5" fill="#FFFFFF" />
      <circle cx="60" cy="80" r="1.5" fill="#FFFFFF" />
      <rect x="44" y="58" width="12" height="14" fill="#FDD6BA" rx="3" />
      <circle cx="50" cy="45" r="20" fill="#FDD6BA" />
      <path d="M 29 45 C 29 27, 71 27, 71 45 C 67 34, 48 32, 29 45 Z" fill="#451A03" />
      <circle cx="43" cy="43" r="2" fill="#1E293B" />
      <circle cx="57" cy="43" r="2" fill="#1E293B" />
      <path d="M 40 39 Q 43 37 46 39" fill="none" stroke="#451A03" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M 54 39 Q 57 37 60 39" fill="none" stroke="#451A03" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M 46 52 Q 50 56 54 52" fill="none" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="36" cy="47" r="3.5" fill="#F43F5E" opacity="0.6" />
      <circle cx="64" cy="47" r="3.5" fill="#F43F5E" opacity="0.6" />
      <circle cx="28" cy="49" r="2.5" fill="#F59E0B" />
      <circle cx="72" cy="49" r="2.5" fill="#F59E0B" />
    </svg>
  );
}

function MeAvatar() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full pointer-events-none">
      <circle cx="50" cy="50" r="48" fill="#EAE2F5" stroke="#8064A9" strokeWidth="3" />
      <path d="M 20 92 C 20 68, 80 68, 80 92 Z" fill="#8064A9" />
      <path d="M 42 66 L 50 78 L 58 66 Z" fill="#FFFFFF" />
      <rect x="44" y="55" width="12" height="15" fill="#FDD6BA" rx="3" />
      <circle cx="50" cy="43" r="19" fill="#FDD6BA" />
      <path d="M 31 40 C 31 24, 69 24, 69 40 C 65 26, 44 26, 31 40 Z" fill="#1C1917" />
      <circle cx="43" cy="41" r="2" fill="#1C1917" />
      <circle cx="57" cy="41" r="2" fill="#1C1917" />
      <path d="M 45 49 Q 50 53 55 49" fill="none" stroke="#9A3412" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="36" cy="45" r="3.5" fill="#FCA5A5" opacity="0.7" />
      <circle cx="64" cy="45" r="3.5" fill="#FCA5A5" opacity="0.7" />
    </svg>
  );
}

function BrotherAvatar() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full pointer-events-none">
      <circle cx="50" cy="50" r="48" fill="#EAE2F5" />
      <path d="M 20 92 C 20 68, 80 68, 80 92 Z" fill="#6B7280" />
      <path d="M 40 70 Q 50 82 60 70 Z" fill="#DC2626" />
      <rect x="44" y="55" width="12" height="15" fill="#FDD6BA" rx="3" />
      <circle cx="50" cy="43" r="19" fill="#FDD6BA" />
      <path d="M 31 39 C 31 23, 69 23, 69 39 C 64 26, 42 27, 31 39 Z" fill="#78350F" />
      <path d="M 26 44 C 26 22, 74 22, 74 44" fill="none" stroke="#111827" strokeWidth="3.5" strokeLinecap="round" />
      <rect x="23" y="38" width="6" height="14" rx="3" fill="#111827" />
      <rect x="71" y="38" width="6" height="14" rx="3" fill="#111827" />
      <circle cx="43" cy="42" r="2" fill="#111827" />
      <circle cx="57" cy="42" r="2" fill="#111827" />
      <path d="M 46 50 Q 50 53 54 50" fill="none" stroke="#9A3412" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="36" cy="45" r="3" fill="#FCA5A5" opacity="0.5" />
      <circle cx="64" cy="45" r="3" fill="#FCA5A5" opacity="0.5" />
    </svg>
  );
}

function SisterAvatar() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full pointer-events-none">
      <circle cx="50" cy="50" r="48" fill="#EAE2F5" />
      <path d="M 22 92 C 22 68, 78 68, 78 92 Z" fill="#EA580C" />
      <path d="M 38 72 L 44 92 M 62 72 L 56 92" stroke="#FFFFFF" strokeWidth="3" />
      <rect x="44" y="56" width="12" height="14" fill="#FDD6BA" rx="3" />
      <circle cx="50" cy="44" r="19" fill="#FDD6BA" />
      <path d="M 28 45 C 28 26, 72 26, 72 45 L 72 56 C 70 54, 68 46, 68 44 C 64 36, 36 36, 32 44 C 32 46, 30 54, 28 56 Z" fill="#B91C1C" />
      <circle cx="43" cy="43" r="2" fill="#111827" />
      <circle cx="57" cy="43" r="2" fill="#111827" />
      <path d="M 46 51 Q 50 54 54 51" fill="none" stroke="#B91C1C" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="36" cy="46" r="3.5" fill="#FCA5A5" opacity="0.7" />
      <circle cx="64" cy="46" r="3.5" fill="#FCA5A5" opacity="0.7" />
    </svg>
  );
}

function ChildAvatar({ gender }: { gender: "male" | "female" }) {
  if (gender === "female") {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full pointer-events-none">
        <circle cx="50" cy="50" r="48" fill="#EAE2F5" />
        <circle cx="28" cy="28" r="8" fill="#1E293B" />
        <circle cx="72" cy="28" r="8" fill="#1E293B" />
        <path d="M 24 92 C 24 70, 76 70, 76 92 Z" fill="#F59E0B" />
        <rect x="45" y="58" width="10" height="12" fill="#FDD6BA" rx="2" />
        <circle cx="50" cy="46" r="18" fill="#FDD6BA" />
        <path d="M 32 44 C 32 30, 68 30, 68 44 C 62 36, 38 36, 32 44 Z" fill="#1E293B" />
        <circle cx="43" cy="45" r="2.5" fill="#1E293B" />
        <circle cx="57" cy="45" r="2.5" fill="#1E293B" />
        <path d="M 46 52 Q 50 56 54 52" fill="none" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="37" cy="48" r="3" fill="#F43F5E" opacity="0.6" />
        <circle cx="63" cy="48" r="3" fill="#F43F5E" opacity="0.6" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full pointer-events-none">
      <circle cx="50" cy="50" r="48" fill="#EAE2F5" />
      <path d="M 24 92 C 24 70, 76 70, 76 92 Z" fill="#EF4444" />
      <rect x="45" y="58" width="10" height="12" fill="#FDD6BA" rx="2" />
      <circle cx="50" cy="45" r="18" fill="#FDD6BA" />
      <path d="M 32 42 C 32 28, 42 22, 50 22 C 58 22, 68 28, 68 42 C 60 33, 40 33, 32 42 Z" fill="#78350F" />
      <circle cx="43" cy="44" r="2.2" fill="#1E293B" />
      <circle cx="57" cy="44" r="2.2" fill="#1E293B" />
      <path d="M 45 52 Q 50 56 55 52" fill="none" stroke="#9A3412" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="37" cy="47" r="3" fill="#FCA5A5" opacity="0.6" />
      <circle cx="63" cy="47" r="3" fill="#FCA5A5" opacity="0.6" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM REACT FLOW NODE: FamilyMemberNode
// ─────────────────────────────────────────────────────────────────────────────

interface FamilyMemberNodeData extends Record<string, unknown> {
  relative: Relative;
  labelTitle: string;
  avatarType: string;
  isPulsing: boolean;
  isDimmed: boolean;
  isSelected: boolean;
}

function FamilyMemberNode({ data }: NodeProps<Node<FamilyMemberNodeData>>) {
  const { relative, labelTitle, avatarType, isPulsing, isDimmed, isSelected } = data;
  const isSelf = relative.relation === "self";

  const renderAvatar = () => {
    switch (avatarType) {
      case "grandmother":
        return <GrandmotherAvatar />;
      case "grandfather":
        return <GrandfatherAvatar />;
      case "father":
        return <FatherAvatar />;
      case "mother":
        return <MotherAvatar />;
      case "brother":
        return <BrotherAvatar />;
      case "sister":
        return <SisterAvatar />;
      case "daughter":
        return <ChildAvatar gender="female" />;
      case "son":
        return <ChildAvatar gender="male" />;
      case "self":
      default:
        return <MeAvatar />;
    }
  };

  return (
    <div
      className={`relative flex flex-col items-center cursor-pointer select-none transition-all duration-200 group ${
        isDimmed ? "opacity-35 grayscale-40" : "opacity-100"
      }`}
    >
      {/* Handles for Orthogonal React Flow Connectors */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="!w-2 !h-2 !bg-[#8064A9] !border-none opacity-0 group-hover:opacity-60 transition-opacity"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="!w-2 !h-2 !bg-[#8064A9] !border-none opacity-0 group-hover:opacity-60 transition-opacity"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!w-2 !h-2 !bg-[#8064A9] !border-none opacity-0 group-hover:opacity-60 transition-opacity"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!w-2 !h-2 !bg-[#8064A9] !border-none opacity-0 group-hover:opacity-60 transition-opacity"
      />

      {/* Avatar Container */}
      <div
        className={`relative w-20 h-20 sm:w-22 sm:h-22 rounded-full shadow-md transition-all duration-200 group-hover:scale-105 group-hover:shadow-xl ${
          isSelected
            ? "ring-4 ring-[#452653] shadow-lg scale-105"
            : isSelf
            ? "ring-4 ring-[#8064A9] shadow-[#8064A9]/30"
            : "ring-2 ring-white/90"
        } ${isPulsing ? "ring-4 ring-rose-500 shadow-rose-500/40 animate-pulse scale-105" : ""}`}
      >
        {renderAvatar()}

        {/* Deceased diagonal slash indicator */}
        {!relative.isAlive && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-24 h-0.5 bg-slate-800 rotate-45 rounded-full shadow-xs" />
          </div>
        )}

        {/* Pulse / Flag Indicator Badge */}
        {isPulsing && (
          <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-rose-600 text-white font-black text-[9px] rounded-full shadow-md animate-bounce">
            FLAG
          </span>
        )}
      </div>

      {/* Labels below Avatar */}
      <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#8064A9] mt-2 text-center whitespace-nowrap">
        {labelTitle}
      </span>
      <span className="text-xs font-bold text-[#292333] max-w-[130px] truncate text-center">
        {relative.name}
      </span>
      <span className="text-[10px] text-slate-400 font-medium">
        {relative.age} yrs • {relative.isAlive ? "Living" : "Deceased"}
      </span>

      {/* Condition Pills */}
      <div className="flex flex-wrap justify-center gap-1 mt-1 max-w-[130px]">
        {relative.hasDiabetes && (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-white/95 border border-rose-200 text-rose-700 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            T2D
          </span>
        )}
        {relative.hasHypertension && (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-white/95 border border-blue-200 text-blue-700 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            BP
          </span>
        )}
        {relative.hasHeartDisease && (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-white/95 border border-purple-200 text-purple-700 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
            CAD
          </span>
        )}
        {relative.hasStroke && (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-white/95 border border-amber-200 text-amber-700 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Stroke
          </span>
        )}
        {relative.hasAsthma && (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-white/95 border border-teal-200 text-teal-700 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
            Asthma
          </span>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM REACT FLOW NODE: AddPlaceholderNode
// ─────────────────────────────────────────────────────────────────────────────

interface AddPlaceholderNodeData extends Record<string, unknown> {
  relationType: Relative["relation"];
  labelTitle: string;
  subLabel: string;
  onAdd: (rel: Relative["relation"]) => void;
}

function AddPlaceholderNode({ data }: NodeProps<Node<AddPlaceholderNodeData>>) {
  const { relationType, labelTitle, subLabel, onAdd } = data;

  return (
    <div className="relative flex flex-col items-center select-none cursor-pointer">
      <Handle type="target" position={Position.Top} id="top" className="opacity-0" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="opacity-0" />
      <Handle type="target" position={Position.Left} id="left" className="opacity-0" />
      <Handle type="source" position={Position.Right} id="right" className="opacity-0" />

      <button
        type="button"
        onClick={() => onAdd(relationType)}
        className="w-20 h-20 sm:w-22 sm:h-22 rounded-full border-2 border-dashed border-[#8064A9]/40 bg-[#EAE2F5]/30 hover:bg-[#EAE2F5]/80 flex flex-col items-center justify-center text-[#8064A9] hover:text-[#452653] hover:scale-105 active:scale-95 transition-all shadow-xs group"
        title={`Add ${labelTitle}`}
      >
        <Plus className="w-6 h-6 mb-0.5 group-hover:scale-125 transition-transform" />
        <span className="text-[10px] font-extrabold uppercase tracking-wider">Add</span>
      </button>

      <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#8064A9] mt-2 whitespace-nowrap">
        {labelTitle}
      </span>
      <span className="text-[10px] text-slate-400 italic mt-0.5">{subLabel}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN CANVAS CONTENT WRAPPER
// ─────────────────────────────────────────────────────────────────────────────

type DiseasePulse = "all" | "diabetes" | "hypertension" | "heart" | "stroke" | "asthma";

function PedigreeFlowCanvas() {
  const { relatives, updateRelative, deleteRelative } = usePedigreeStore();
  const { fitView } = useReactFlow();

  // Selected Relative for Node Detail Drawer
  const [selectedRelativeId, setSelectedRelativeId] = useState<string | null>("self-node");

  // Pulse Filter
  const [pulseFilter, setPulseFilter] = useState<DiseasePulse>("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRelative, setEditingRelative] = useState<Relative | null>(null);
  const [defaultRelation, setDefaultRelation] = useState<Relative["relation"]>("father");

  const selectedRelative = relatives.find((r) => r.id === selectedRelativeId) || null;

  const handleOpenAdd = useCallback((relation: Relative["relation"]) => {
    setEditingRelative(null);
    setDefaultRelation(relation);
    setIsModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback((rel: Relative) => {
    setEditingRelative(rel);
    setIsModalOpen(true);
  }, []);

  // 1-Click Condition Toggle directly in Detail Panel
  const toggleCondition = (relId: string, conditionKey: keyof Relative) => {
    const rel = relatives.find((r) => r.id === relId);
    if (!rel) return;
    updateRelative(relId, { [conditionKey]: !rel[conditionKey] });
  };

  // Node types memoized for React Flow
  const nodeTypes = useMemo(
    () => ({
      familyMember: FamilyMemberNode,
      addPlaceholder: AddPlaceholderNode,
    }),
    []
  );

  // ───────────────────────────────────────────────────────────────────────────
  // COMPUTE GRAPH NODES AND EDGES DYNAMICALLY FROM STORE
  // ───────────────────────────────────────────────────────────────────────────
  const { nodes, edges } = useMemo(() => {
    const computedNodes: Node[] = [];
    const computedEdges: Edge[] = [];

    const grandfathers = relatives.filter((r) => r.relation === "grandfather");
    const grandmothers = relatives.filter((r) => r.relation === "grandmother");
    const father = relatives.find((r) => r.relation === "father");
    const mother = relatives.find((r) => r.relation === "mother");
    const self = relatives.find((r) => r.relation === "self");
    const brothers = relatives.filter((r) => r.relation === "brother");
    const sisters = relatives.filter((r) => r.relation === "sister");
    const children = relatives.filter((r) => r.relation === "child");

    const checkPulsing = (rel: Relative) => {
      if (pulseFilter === "all") return false;
      if (pulseFilter === "diabetes") return rel.hasDiabetes;
      if (pulseFilter === "hypertension") return rel.hasHypertension;
      if (pulseFilter === "heart") return rel.hasHeartDisease;
      if (pulseFilter === "stroke") return rel.hasStroke;
      if (pulseFilter === "asthma") return rel.hasAsthma;
      return false;
    };

    const checkDimmed = (rel: Relative) => {
      if (pulseFilter === "all") return false;
      return !checkPulsing(rel);
    };

    // ── Tier 1: Grandparents (Y = 40) ──
    const gm = grandmothers[0];
    const gf = grandfathers[0];

    if (gm) {
      computedNodes.push({
        id: gm.id,
        type: "familyMember",
        position: { x: 320, y: 40 },
        data: {
          relative: gm,
          labelTitle: "GRANDMOTHER",
          avatarType: "grandmother",
          isPulsing: checkPulsing(gm),
          isDimmed: checkDimmed(gm),
          isSelected: selectedRelativeId === gm.id,
        },
      });
    } else {
      computedNodes.push({
        id: "placeholder-gm",
        type: "addPlaceholder",
        position: { x: 320, y: 40 },
        data: {
          relationType: "grandmother",
          labelTitle: "GRANDMOTHER",
          subLabel: "आजी",
          onAdd: handleOpenAdd,
        },
      });
    }

    if (gf) {
      computedNodes.push({
        id: gf.id,
        type: "familyMember",
        position: { x: 560, y: 40 },
        data: {
          relative: gf,
          labelTitle: "GRANDFATHER",
          avatarType: "grandfather",
          isPulsing: checkPulsing(gf),
          isDimmed: checkDimmed(gf),
          isSelected: selectedRelativeId === gf.id,
        },
      });
    } else {
      computedNodes.push({
        id: "placeholder-gf",
        type: "addPlaceholder",
        position: { x: 560, y: 40 },
        data: {
          relationType: "grandfather",
          labelTitle: "GRANDFATHER",
          subLabel: "आजोबा",
          onAdd: handleOpenAdd,
        },
      });
    }

    // Marriage edge between Grandparents
    computedEdges.push({
      id: "edge-gm-gf",
      source: gm ? gm.id : "placeholder-gm",
      target: gf ? gf.id : "placeholder-gf",
      sourceHandle: "right",
      targetHandle: "left",
      type: "straight",
      style: { stroke: "#8064A9", strokeWidth: 2.5 },
    });

    // ── Tier 2: Parents (Y = 270) ──
    if (mother) {
      computedNodes.push({
        id: mother.id,
        type: "familyMember",
        position: { x: 320, y: 270 },
        data: {
          relative: mother,
          labelTitle: "MOTHER",
          avatarType: "mother",
          isPulsing: checkPulsing(mother),
          isDimmed: checkDimmed(mother),
          isSelected: selectedRelativeId === mother.id,
        },
      });
    } else {
      computedNodes.push({
        id: "placeholder-mother",
        type: "addPlaceholder",
        position: { x: 320, y: 270 },
        data: {
          relationType: "mother",
          labelTitle: "MOTHER",
          subLabel: "आई",
          onAdd: handleOpenAdd,
        },
      });
    }

    if (father) {
      computedNodes.push({
        id: father.id,
        type: "familyMember",
        position: { x: 560, y: 270 },
        data: {
          relative: father,
          labelTitle: "FATHER",
          avatarType: "father",
          isPulsing: checkPulsing(father),
          isDimmed: checkDimmed(father),
          isSelected: selectedRelativeId === father.id,
        },
      });
    } else {
      computedNodes.push({
        id: "placeholder-father",
        type: "addPlaceholder",
        position: { x: 560, y: 270 },
        data: {
          relationType: "father",
          labelTitle: "FATHER",
          subLabel: "वडील",
          onAdd: handleOpenAdd,
        },
      });
    }

    // Marriage edge between Parents
    computedEdges.push({
      id: "edge-mother-father",
      source: mother ? mother.id : "placeholder-mother",
      target: father ? father.id : "placeholder-father",
      sourceHandle: "right",
      targetHandle: "left",
      type: "straight",
      style: { stroke: "#8064A9", strokeWidth: 2.5 },
    });

    // Descent edge from Grandparents down to Father/Mother
    const gpSource = gf ? gf.id : "placeholder-gf";
    const parentTarget = father ? father.id : "placeholder-father";
    computedEdges.push({
      id: "edge-gp-to-parents",
      source: gpSource,
      target: parentTarget,
      sourceHandle: "bottom",
      targetHandle: "top",
      type: "smoothstep",
      style: { stroke: "#8064A9", strokeWidth: 2 },
    });

    // ── Tier 3: Generation III (Siblings & ME) (Y = 500) ──
    const tier3List: { rel?: Relative; type: Relative["relation"]; label: string; avatar: string }[] =
      [];

    brothers.forEach((b, i) => {
      tier3List.push({
        rel: b,
        type: "brother",
        label: `BROTHER ${brothers.length > 1 ? i + 1 : ""}`.trim(),
        avatar: "brother",
      });
    });

    sisters.forEach((s, i) => {
      tier3List.push({
        rel: s,
        type: "sister",
        label: `SISTER ${sisters.length > 1 ? i + 1 : ""}`.trim(),
        avatar: "sister",
      });
    });

    // If no brother or sister yet, provide placeholder slots
    if (brothers.length === 0) {
      tier3List.unshift({
        type: "brother",
        label: "BROTHER",
        avatar: "brother",
      });
    }
    if (sisters.length === 0) {
      tier3List.push({
        type: "sister",
        label: "SISTER",
        avatar: "sister",
      });
    }

    // Add ME (Index Subject)
    tier3List.push({
      rel: self,
      type: "self",
      label: "ME",
      avatar: "self",
    });

    // Calculate dynamic X spacing
    const tier3Spacing = 220;
    const tier3StartX = 440 - ((tier3List.length - 1) * tier3Spacing) / 2;

    tier3List.forEach((item, index) => {
      const posX = tier3StartX + index * tier3Spacing;
      const nodeId = item.rel ? item.rel.id : `placeholder-${item.type}-${index}`;

      if (item.rel) {
        computedNodes.push({
          id: nodeId,
          type: "familyMember",
          position: { x: posX, y: 500 },
          data: {
            relative: item.rel,
            labelTitle: item.label,
            avatarType: item.avatar,
            isPulsing: checkPulsing(item.rel),
            isDimmed: checkDimmed(item.rel),
            isSelected: selectedRelativeId === item.rel.id,
          },
        });
      } else {
        computedNodes.push({
          id: nodeId,
          type: "addPlaceholder",
          position: { x: posX, y: 500 },
          data: {
            relationType: item.type,
            labelTitle: item.label,
            subLabel: item.type === "brother" ? "भाऊ" : "बहीण",
            onAdd: handleOpenAdd,
          },
        });
      }

      // Edge from parents down to sibling / ME
      const parentRoot = father ? father.id : "placeholder-father";
      computedEdges.push({
        id: `edge-parent-to-${nodeId}`,
        source: parentRoot,
        target: nodeId,
        sourceHandle: "bottom",
        targetHandle: "top",
        type: "smoothstep",
        style: { stroke: "#8064A9", strokeWidth: 2 },
      });
    });

    // ── Tier 4: Generation IV (Children) (Y = 730) ──
    const selfNodeId = self ? self.id : "placeholder-self";
    const selfNodeObj = computedNodes.find((n) => n.id === selfNodeId);
    const selfPosX = selfNodeObj ? selfNodeObj.position.x : 440;

    if (children.length > 0) {
      const childSpacing = 200;
      const childStartX = selfPosX - ((children.length - 1) * childSpacing) / 2;

      children.forEach((child, idx) => {
        const posX = childStartX + idx * childSpacing;
        computedNodes.push({
          id: child.id,
          type: "familyMember",
          position: { x: posX, y: 730 },
          data: {
            relative: child,
            labelTitle: child.gender === "female" ? "DAUGHTER" : "SON",
            avatarType: child.gender === "female" ? "daughter" : "son",
            isPulsing: checkPulsing(child),
            isDimmed: checkDimmed(child),
            isSelected: selectedRelativeId === child.id,
          },
        });

        computedEdges.push({
          id: `edge-self-to-${child.id}`,
          source: selfNodeId,
          target: child.id,
          sourceHandle: "bottom",
          targetHandle: "top",
          type: "smoothstep",
          style: { stroke: "#8064A9", strokeWidth: 2 },
        });
      });
    } else {
      // Default placeholder slots for Daughter & Son
      computedNodes.push({
        id: "placeholder-daughter",
        type: "addPlaceholder",
        position: { x: selfPosX - 100, y: 730 },
        data: {
          relationType: "child",
          labelTitle: "DAUGHTER",
          subLabel: "मुलगी",
          onAdd: handleOpenAdd,
        },
      });

      computedNodes.push({
        id: "placeholder-son",
        type: "addPlaceholder",
        position: { x: selfPosX + 100, y: 730 },
        data: {
          relationType: "child",
          labelTitle: "SON",
          subLabel: "मुलगा",
          onAdd: handleOpenAdd,
        },
      });

      computedEdges.push({
        id: "edge-self-to-placeholder-daughter",
        source: selfNodeId,
        target: "placeholder-daughter",
        sourceHandle: "bottom",
        targetHandle: "top",
        type: "smoothstep",
        style: { stroke: "#8064A9", strokeWidth: 2 },
      });

      computedEdges.push({
        id: "edge-self-to-placeholder-son",
        source: selfNodeId,
        target: "placeholder-son",
        sourceHandle: "bottom",
        targetHandle: "top",
        type: "smoothstep",
        style: { stroke: "#8064A9", strokeWidth: 2 },
      });
    }

    return { nodes: computedNodes, edges: computedEdges };
  }, [relatives, pulseFilter, selectedRelativeId, handleOpenAdd]);

  // Click on any node -> Select relative to show details in drawer!
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (node.type === "familyMember" && node.data?.relative) {
        const rel = node.data.relative as Relative;
        setSelectedRelativeId(rel.id);
      }
    },
    []
  );

  return (
    <div className="relative w-full h-[calc(100vh-64px)] lg:h-screen min-h-[750px] bg-[#FAF8FC] flex flex-col overflow-hidden">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* TOP HEADER CONTROLS BAR */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="relative z-20 px-6 py-4 bg-[#FAF8FC]/95 backdrop-blur-md border-b border-[#ded3eb] flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#EAE2F5] text-[#452653] flex items-center justify-center font-bold">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-[#292333] tracking-tight">
                React Flow Family Health Tree
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EAE2F5] text-[#452653] border border-[#ded3eb]">
                Live Canvas
              </span>
            </div>
            <p className="text-xs text-[#5e546b]">
              Click any node to inspect health history • Drag nodes to reposition • Pan & Zoom freely
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fitView({ duration: 600, padding: 0.15 })}
            className="px-3.5 py-1.5 rounded-xl border border-[#ded3eb] bg-white hover:bg-[#FAF8FC] text-[#292333] text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
            title="Auto-Align & Fit View"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#8064A9]" />
            <span>Reset View</span>
          </button>

          <button
            onClick={() => handleOpenAdd("father")}
            className="px-4 py-1.5 rounded-xl bg-[#452653] hover:bg-[#573068] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all hover:scale-102"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Member</span>
          </button>

          <Link
            href="/assess"
            className="px-4 py-1.5 rounded-xl bg-[#8064A9] hover:bg-[#6e5196] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all hover:scale-102"
          >
            <span>Screening</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Disease Pulse / Highlight Filter Strip */}
      <div className="relative z-10 px-6 py-2 bg-[#FAF8FC] border-b border-[#ded3eb] flex items-center justify-center gap-2 flex-wrap">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#5e546b] mr-1 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-[#8064A9]" />
          <span>Disease Pathway Glow:</span>
        </span>

        <button
          onClick={() => setPulseFilter("all")}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
            pulseFilter === "all"
              ? "bg-[#452653] text-white shadow-xs font-bold"
              : "bg-white text-[#5e546b] border border-[#ded3eb] hover:bg-[#EAE2F5]/40"
          }`}
        >
          All Members
        </button>
        <button
          onClick={() => setPulseFilter("diabetes")}
          className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
            pulseFilter === "diabetes"
              ? "bg-rose-600 text-white shadow-xs scale-102"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-rose-50 hover:text-rose-700"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span>Diabetes</span>
        </button>
        <button
          onClick={() => setPulseFilter("hypertension")}
          className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
            pulseFilter === "hypertension"
              ? "bg-blue-600 text-white shadow-xs scale-102"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-blue-50 hover:text-blue-700"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span>High BP</span>
        </button>
        <button
          onClick={() => setPulseFilter("heart")}
          className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
            pulseFilter === "heart"
              ? "bg-purple-600 text-white shadow-xs scale-102"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-purple-50 hover:text-purple-700"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-purple-600" />
          <span>Heart CAD</span>
        </button>
        <button
          onClick={() => setPulseFilter("stroke")}
          className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
            pulseFilter === "stroke"
              ? "bg-amber-600 text-white shadow-xs scale-102"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-amber-50 hover:text-amber-700"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>Stroke</span>
        </button>
        <button
          onClick={() => setPulseFilter("asthma")}
          className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
            pulseFilter === "asthma"
              ? "bg-teal-600 text-white shadow-xs scale-102"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-teal-50 hover:text-teal-700"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-teal-500" />
          <span>Asthma</span>
        </button>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MAIN CANVAS & SLIDE-OVER DETAIL DRAWER */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="relative flex-1 w-full min-h-[600px] h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.5}
          maxZoom={1.6}
          defaultEdgeOptions={{
            type: "smoothstep",
            animated: false,
          }}
          className="bg-[#FAF8FC]"
        >
          {/* Subtle Dot Grid Background */}
          <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} color="#ded3eb" />

          {/* Canvas Navigation Controls */}
          <Controls position="bottom-left" showInteractive={false} />

          {/* MiniMap */}
          <MiniMap
            position="bottom-left"
            className="!mb-16 !bg-white/90 !border !border-[#ded3eb] !rounded-xl overflow-hidden shadow-sm"
            nodeColor="#EAE2F5"
            maskColor="rgba(234, 226, 245, 0.4)"
          />
        </ReactFlow>

        {/* ─────────────────────────────────────────────────────────── */}
        {/* INTERACTIVE NODE DETAIL DRAWER (WHEN ANY NODE IS CLICKED) */}
        {/* ─────────────────────────────────────────────────────────── */}
        {selectedRelative && (
          <div className="absolute top-4 right-4 bottom-4 w-full max-w-sm z-30 bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-[#ded3eb] flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-4 duration-200">
            {/* Drawer Header */}
            <div className="p-5 border-b border-[#ded3eb] bg-[#FAF8FC] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8064A9]" />
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#452653]">
                  Node Details & Clinical Risk
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRelativeId(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-[#452653] hover:bg-[#EAE2F5]/50 transition-colors"
                title="Close Drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-slate-700">
              {/* Profile Card */}
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#FAF8FC] border border-[#ded3eb]">
                <div className="w-14 h-14 rounded-full bg-[#EAE2F5] border-2 border-[#8064A9] flex items-center justify-center shrink-0 font-extrabold text-base text-[#452653]">
                  {selectedRelative.relation === "self" ? "ME" : selectedRelative.relation[0].toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <h3 className="font-extrabold text-[#292333] text-base leading-tight truncate">
                    {selectedRelative.name}
                  </h3>
                  <p className="text-xs text-[#5e546b] uppercase tracking-wider font-semibold mt-0.5">
                    {selectedRelative.relation} • {selectedRelative.age} yrs
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {/* Living / Deceased 1-Click Toggle */}
                    <button
                      type="button"
                      onClick={() =>
                        updateRelative(selectedRelative.id, {
                          isAlive: !selectedRelative.isAlive,
                        })
                      }
                      className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border transition-colors ${
                        selectedRelative.isAlive
                          ? "bg-[#EAE2F5] border-[#ded3eb] text-[#452653]"
                          : "bg-slate-200 border-slate-400 text-slate-700"
                      }`}
                    >
                      {selectedRelative.isAlive ? "Living 🟢" : "Deceased ⧄"}
                    </button>

                    {/* Age Stepper */}
                    <div className="flex items-center border border-slate-300 rounded-md bg-white overflow-hidden text-xs">
                      <button
                        type="button"
                        onClick={() =>
                          updateRelative(selectedRelative.id, {
                            age: Math.max(1, selectedRelative.age - 1),
                          })
                        }
                        className="px-2 py-0.5 hover:bg-slate-100 text-slate-600"
                      >
                        -
                      </button>
                      <span className="px-2 font-bold text-slate-800">
                        {selectedRelative.age}y
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateRelative(selectedRelative.id, {
                            age: Math.min(120, selectedRelative.age + 1),
                          })
                        }
                        className="px-2 py-0.5 hover:bg-slate-100 text-slate-600"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hereditary Risk Analysis */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-900 mb-1.5">
                  <HeartPulse className="w-4 h-4 text-amber-600" />
                  <span>Hereditary Risk Impact</span>
                </div>
                {selectedRelative.relation === "father" || selectedRelative.relation === "mother" ? (
                  <div className="text-xs text-amber-950 space-y-1 leading-relaxed">
                    <p>
                      <strong>Direct Parental Contributor:</strong> Parental diabetes adds directly (+10
                      or +20 points) to the Indian Diabetes Risk Score (IDRS).
                    </p>
                    <p className="font-semibold text-rose-700">
                      {selectedRelative.hasDiabetes
                        ? "⚠️ Positive diabetes diagnosis: Adds +10/20 hereditary risk penalty."
                        : "✅ No diabetes reported: 0 hereditary penalty from this parent."}
                    </p>
                  </div>
                ) : selectedRelative.relation === "self" ? (
                  <div className="text-xs text-amber-950 leading-relaxed">
                    <p>
                      <strong>Primary Subject (Index Proband):</strong> Your health parameters will be
                      evaluated against the LASI survey models and ICMR standards in screening.
                    </p>
                  </div>
                ) : (
                  <div className="text-xs text-amber-950 leading-relaxed">
                    <p>
                      <strong>Kinship Lineage:</strong> Tracks familial clustering of early coronary
                      artery disease, stroke, and chronic asthma across generations.
                    </p>
                  </div>
                )}
              </div>

              {/* 1-Click Interactive Condition Toggles */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                    Diagnosed Conditions (Live Toggles)
                  </span>
                  <span className="text-[10px] text-slate-400">Click to switch</span>
                </div>

                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => toggleCondition(selectedRelative.id, "hasDiabetes")}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      selectedRelative.hasDiabetes
                        ? "bg-rose-50 border-rose-300 text-rose-800 shadow-xs"
                        : "bg-slate-50/70 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          selectedRelative.hasDiabetes ? "bg-rose-500" : "bg-slate-300"
                        }`}
                      />
                      <span>Type 2 Diabetes (मधुमेह)</span>
                    </div>
                    <span>{selectedRelative.hasDiabetes ? "YES ✓" : "NO"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleCondition(selectedRelative.id, "hasHypertension")}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      selectedRelative.hasHypertension
                        ? "bg-blue-50 border-blue-300 text-blue-800 shadow-xs"
                        : "bg-slate-50/70 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          selectedRelative.hasHypertension ? "bg-blue-500" : "bg-slate-300"
                        }`}
                      />
                      <span>Hypertension / High BP (रक्तदाब)</span>
                    </div>
                    <span>{selectedRelative.hasHypertension ? "YES ✓" : "NO"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleCondition(selectedRelative.id, "hasHeartDisease")}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      selectedRelative.hasHeartDisease
                        ? "bg-purple-50 border-purple-300 text-purple-800 shadow-xs"
                        : "bg-slate-50/70 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          selectedRelative.hasHeartDisease ? "bg-purple-600" : "bg-slate-300"
                        }`}
                      />
                      <span>Early CAD / Heart Attack (हृदयविकार)</span>
                    </div>
                    <span>{selectedRelative.hasHeartDisease ? "YES ✓" : "NO"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleCondition(selectedRelative.id, "hasStroke")}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      selectedRelative.hasStroke
                        ? "bg-amber-50 border-amber-300 text-amber-800 shadow-xs"
                        : "bg-slate-50/70 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          selectedRelative.hasStroke ? "bg-amber-500" : "bg-slate-300"
                        }`}
                      />
                      <span>Stroke / Paralysis (पक्षाघात)</span>
                    </div>
                    <span>{selectedRelative.hasStroke ? "YES ✓" : "NO"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleCondition(selectedRelative.id, "hasAsthma")}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      selectedRelative.hasAsthma
                        ? "bg-teal-50 border-teal-300 text-teal-800 shadow-xs"
                        : "bg-slate-50/70 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          selectedRelative.hasAsthma ? "bg-teal-500" : "bg-slate-300"
                        }`}
                      />
                      <span>Asthma / COPD (दमा)</span>
                    </div>
                    <span>{selectedRelative.hasAsthma ? "YES ✓" : "NO"}</span>
                  </button>
                </div>
              </div>

              {/* Notes display */}
              {selectedRelative.notes && (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700 mb-1">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Clinical Notes</span>
                  </div>
                  <p className="italic">&ldquo;{selectedRelative.notes}&rdquo;</p>
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-[#ded3eb] bg-[#FAF8FC] flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenEdit(selectedRelative)}
                className="flex-1 py-2.5 rounded-xl bg-[#452653] hover:bg-[#573068] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Full Edit Form</span>
              </button>

              {selectedRelative.relation !== "self" && (
                <button
                  type="button"
                  onClick={() => {
                    deleteRelative(selectedRelative.id);
                    setSelectedRelativeId(null);
                  }}
                  className="p-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors"
                  title="Remove from tree"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Relative Modal */}
      <AddRelativeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRelative(null);
        }}
        initialData={editingRelative}
        defaultRelation={defaultRelation}
      />
    </div>
  );
}

// Wrap in ReactFlowProvider for Next.js App Router
export default function PedigreeTreePage() {
  return (
    <ReactFlowProvider>
      <PedigreeFlowCanvas />
    </ReactFlowProvider>
  );
}
