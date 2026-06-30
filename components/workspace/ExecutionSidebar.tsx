"use client";

import React from "react";
import { ExecutionState } from "@/types/extraction";
import { 
  Activity, 
  Cpu, 
  Calendar, 
  Search, 
  ListChecks, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ShieldAlert,
  Flame
} from "lucide-react";

interface ExecutionSidebarProps {
  state?: ExecutionState;
  cognitiveLoad?: number;
  warningsCount?: number;
  assumptionsCount?: number;
  hasHealthFactor?: boolean;
}

const defaultState: ExecutionState = {
  understanding: "Waiting...",
  planning: "Waiting...",
  calendar: "Waiting...",
  research: "Waiting...",
};

export const ExecutionSidebar: React.FC<ExecutionSidebarProps> = ({
  state = defaultState,
  cognitiveLoad = 0,
  warningsCount = 0,
  assumptionsCount = 0,
  hasHealthFactor = false,
}) => {
  const cards = [
    { id: "understanding", title: "Linguistic Parser", status: state.understanding, icon: Cpu },
    { id: "planning", title: "Plan Normalizer", status: state.planning, icon: ListChecks },
    { id: "calendar", title: "Timeline Sorter", status: state.calendar, icon: Calendar },
    { id: "research", title: "Auto-Agent Sync", status: state.research, icon: Search },
  ];

  const renderStatusBadge = (status: string) => {
    if (status === "Processing...") {
      return (
        <div className="flex items-center gap-1 text-amber-600 animate-pulse">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span className="text-[10px] font-mono font-bold">Processing</span>
        </div>
      );
    }
    if (status === "Completed") {
      return (
        <div className="flex items-center gap-1 text-emerald-600">
          <CheckCircle2 className="h-3 w-3" />
          <span className="text-[10px] font-mono font-bold">Active</span>
        </div>
      );
    }
    if (status === "Failed") {
      return (
        <div className="flex items-center gap-1 text-rose-600">
          <AlertCircle className="h-3 w-3" />
          <span className="text-[10px] font-mono font-bold">Error</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 text-neutral-400">
        <span className="h-1.5 w-1.5 rounded-full bg-neutral-300"></span>
        <span className="text-[10px] font-mono">Idle</span>
      </div>
    );
  };

  // Determine cognitive load text and color
  let loadLabel = "Low / Stable";
  let loadBg = "bg-emerald-500";
  let loadText = "text-emerald-700 border-emerald-200 bg-emerald-50/50";
  if (cognitiveLoad > 40 && cognitiveLoad <= 70) {
    loadLabel = "Moderate Load";
    loadBg = "bg-amber-500";
    loadText = "text-amber-700 border-amber-200 bg-amber-50/50";
  } else if (cognitiveLoad > 70) {
    loadLabel = "Fatigue & Overload Risk";
    loadBg = "bg-rose-500";
    loadText = "text-rose-700 border-rose-200 bg-rose-50/50";
  }

  return (
    <aside className="w-full flex flex-col gap-4">
      {/* Sidebar Header */}
      <div className="flex items-center gap-2 border-b border-neutral-200/80 pb-3">
        <Activity className="h-4 w-4 text-neutral-800" />
        <h2 className="text-sm font-bold text-neutral-900 tracking-tight uppercase">
          System Engine Status
        </h2>
      </div>

      {/* Flagship: System Operational Mode */}
      <div className="rounded-2xl border border-neutral-200/80 bg-white/70 backdrop-blur-md p-4 shadow-sm flex flex-col gap-2 hover:shadow-md transition-shadow duration-300">
        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
          System Operational Mode
        </span>
        {hasHealthFactor && cognitiveLoad > 60 ? (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 animate-pulse">
            <Flame className="h-4 w-4 text-rose-600 fill-rose-100" />
            <div className="flex flex-col">
              <span className="text-xs font-bold leading-tight">RECOVERY MODE</span>
              <span className="text-[9px] text-rose-600/90 leading-tight">Mitigating fatigue risk. High-cognitive tasks delayed. Stretches injected.</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <div className="flex flex-col">
              <span className="text-xs font-bold leading-tight">NORMAL OPERATIONS</span>
              <span className="text-[9px] text-emerald-600/90 leading-tight">Timeline sorted and balanced under standard criteria.</span>
            </div>
          </div>
        )}
      </div>

      {/* Flagship: Cognitive Load Gauge */}
      <div className="rounded-2xl border border-neutral-200/80 bg-white/70 backdrop-blur-md p-4 shadow-sm flex flex-col gap-2.5 hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
            Cognitive Load Index
          </span>
          <span className={`px-2 py-0.5 rounded-md border text-[9px] font-bold uppercase tracking-wider ${loadText}`}>
            {cognitiveLoad}%
          </span>
        </div>
        <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden border border-neutral-200/50">
          <div 
            className={`h-full ${loadBg} transition-all duration-500 rounded-full`}
            style={{ width: `${cognitiveLoad}%` }}
          />
        </div>
        <span className="text-[10px] text-neutral-500 font-medium leading-tight">
          Status: <strong className="text-neutral-800">{loadLabel}</strong>
        </span>
      </div>

      {/* Engine Status Grid */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-1">
          Cognitive Engines
        </span>
        <div className="grid grid-cols-1 gap-2">
          {cards.map((card) => {
            const IconComponent = card.icon;
            return (
              <div
                key={card.id}
                className="rounded-2xl border border-neutral-200/80 bg-white/70 backdrop-blur-md p-3 shadow-sm flex items-center justify-between gap-2 hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-neutral-50 border border-neutral-200/60">
                    <IconComponent className="h-3.5 w-3.5 text-neutral-500" />
                  </div>
                  <span className="text-xs font-semibold text-neutral-800">
                    {card.title}
                  </span>
                </div>
                <div>{renderStatusBadge(card.status)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4 shadow-sm flex items-center justify-between text-xs font-semibold text-neutral-700">
        <div className="flex items-center gap-1">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
          <span>Risks: <strong>{warningsCount}</strong></span>
        </div>
        <div className="h-4 w-px bg-neutral-200" />
        <div className="flex items-center gap-1">
          <Cpu className="h-3.5 w-3.5 text-blue-500" />
          <span>Heuristics: <strong>{assumptionsCount}</strong></span>
        </div>
      </div>
    </aside>
  );
};
