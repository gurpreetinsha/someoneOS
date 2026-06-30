"use client";

import React from "react";
import { FileText, Clock } from "lucide-react";

interface LatestBrainDumpProps {
  content: string;
}

export const LatestBrainDump: React.FC<LatestBrainDumpProps> = ({ content }) => {
  if (!content) return null;

  return (
    <div className="w-full rounded-3xl border border-neutral-200/80 bg-white/70 backdrop-blur-md p-6 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-neutral-500" />
          <h3 className="text-sm font-semibold text-neutral-900 tracking-tight">
            Latest Brain Dump
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 font-mono">
          <Clock className="h-3 w-3" />
          <span>Just now</span>
        </div>
      </div>

      <div className="rounded-xl bg-neutral-50 p-4 border border-neutral-100">
        <p className="whitespace-pre-wrap text-sm text-neutral-800 leading-relaxed font-mono">
          {content}
        </p>
      </div>
    </div>
  );
};
