"use client";

import React from "react";
import { ExtractionResult } from "@/types/extraction";
import { 
  Sparkles, 
  CalendarDays, 
  Clock, 
  Target, 
  ShieldAlert, 
  Flame, 
  Heart, 
  HelpCircle 
} from "lucide-react";

interface AiUnderstandingViewProps {
  data: ExtractionResult | null;
}

interface CategoryConfig {
  key: keyof ExtractionResult;
  title: string;
  icon: React.ElementType;
  color: string;
}

const categories: CategoryConfig[] = [
  { key: "events", title: "Events", icon: CalendarDays, color: "text-blue-600 bg-blue-50" },
  { key: "deadlines", title: "Deadlines", icon: Clock, color: "text-amber-600 bg-amber-50" },
  { key: "goals", title: "Goals", icon: Target, color: "text-emerald-600 bg-emerald-50" },
  { key: "constraints", title: "Constraints", icon: ShieldAlert, color: "text-rose-600 bg-rose-50" },
  { key: "priorities", title: "Priorities", icon: Flame, color: "text-purple-600 bg-purple-50" },
  { key: "emotionalSignals", title: "Emotional Signals", icon: Heart, color: "text-pink-600 bg-pink-50" },
  { key: "missingInformation", title: "Missing Information", icon: HelpCircle, color: "text-indigo-600 bg-indigo-50" },
];

export const AiUnderstandingView: React.FC<AiUnderstandingViewProps> = ({ data }) => {
  if (!data) return null;

  const hasAnyData = categories.some((cat) => data[cat.key]?.length > 0);
  if (!hasAnyData) return null;

  return (
    <div className="w-full flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div className="flex items-center gap-2 border-b border-neutral-200/80 pb-3">
        <Sparkles className="h-4 w-4 text-neutral-700" />
        <h2 className="text-sm font-semibold text-neutral-900 tracking-tight uppercase">
          AI Understanding
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat) => {
          const items = data[cat.key];
          if (!items || items.length === 0) return null;
          const IconComponent = cat.icon;

          return (
            <div
              key={cat.key}
              className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={`p-1.5 rounded-lg ${cat.color}`}>
                  <IconComponent className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-bold text-neutral-800 tracking-tight">
                  {cat.title}
                </h3>
              </div>

              <ul className="flex flex-col gap-1.5 pl-1">
                {items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-neutral-700 leading-relaxed">
                    <span className="text-neutral-400 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};
