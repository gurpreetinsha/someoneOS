"use client";

import React from "react";
import { ExecutionState } from "@/types/extraction";
import { Activity, Cpu, Calendar, Search, ListChecks, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface ExecutionSidebarProps {
  state?: ExecutionState;
}

const defaultState: ExecutionState = {
  understanding: "Waiting...",
  planning: "Waiting...",
  calendar: "Waiting...",
  research: "Waiting...",
};

export const ExecutionSidebar: React.FC<ExecutionSidebarProps> = ({
  state = defaultState,
}) => {
  const cards = [
    { id: "understanding", title: "Understanding", status: state.understanding, icon: Cpu },
    { id: "planning", title: "Planning", status: state.planning, icon: ListChecks },
    { id: "calendar", title: "Calendar", status: state.calendar, icon: Calendar },
    { id: "research", title: "Research", status: state.research, icon: Search },
  ];

  const renderStatusBadge = (status: string) => {
    if (status === "Processing...") {
      return (
        <div className="flex items-center gap-1.5 text-amber-600">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span className="text-[11px] font-mono font-medium">Processing...</span>
        </div>
      );
    }
    if (status === "Completed") {
      return (
        <div className="flex items-center gap-1.5 text-emerald-600">
          <CheckCircle2 className="h-3 w-3" />
          <span className="text-[11px] font-mono font-medium">Completed</span>
        </div>
      );
    }
    if (status === "Failed") {
      return (
        <div className="flex items-center gap-1.5 text-rose-600">
          <AlertCircle className="h-3 w-3" />
          <span className="text-[11px] font-mono font-medium">Failed</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 text-neutral-400">
        <span className="relative flex h-2 w-2">
          <span className="relative inline-flex rounded-full h-2 w-2 bg-neutral-300"></span>
        </span>
        <span className="text-[11px] font-mono">Waiting...</span>
      </div>
    );
  };

  return (
    <aside className="w-full flex flex-col gap-4">
      <div className="flex items-center gap-2 border-b border-neutral-200/80 pb-3">
        <Activity className="h-4 w-4 text-neutral-500" />
        <h2 className="text-sm font-semibold text-neutral-900 tracking-tight uppercase">
          Execution Status
        </h2>
      </div>

      <div className="flex flex-col gap-3">
        {cards.map((card) => {
          const IconComponent = card.icon;
          return (
            <div
              key={card.id}
              className="rounded-xl border border-neutral-200/80 bg-white p-3.5 shadow-sm transition-all duration-200 hover:border-neutral-300"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <IconComponent className="h-3.5 w-3.5 text-neutral-400" />
                  <h3 className="text-xs font-semibold text-neutral-800 tracking-tight">
                    {card.title}
                  </h3>
                </div>
              </div>
              <div className="mt-2">{renderStatusBadge(card.status)}</div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
