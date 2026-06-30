"use client";

import React from "react";
import { Brain, Repeat, Sliders, Activity, Clock, Target } from "lucide-react";
import { MemoryItem } from "@/lib/memory/types/memory";

interface MemorySidebarProps {
  memories?: MemoryItem[];
}

export const MemorySidebar: React.FC<MemorySidebarProps> = ({ memories = [] }) => {
  const getCategoryMemories = (category: string) => {
    return memories.filter((m) => m.category === category);
  };

  const categories = [
    {
      id: "routine",
      title: "Routines & Habits",
      icon: Repeat,
      color: "text-blue-600 bg-blue-50/50 border-blue-100",
      emptyMsg: "No routines established. Daily structure is automatically learned from your brain dumps.",
      items: getCategoryMemories("routine"),
    },
    {
      id: "preference",
      title: "System Preferences",
      icon: Sliders,
      color: "text-amber-600 bg-amber-50/50 border-amber-100",
      emptyMsg: "No system preferences learned yet. Adaptive timeline padding will calibrate to your pace.",
      items: getCategoryMemories("preference"),
    },
    {
      id: "health",
      title: "Physical Health Factors",
      icon: Activity,
      color: "text-rose-600 bg-rose-50/50 border-rose-100",
      emptyMsg: "No physical constraints logged. Share health factors (e.g. back pain) to protect physical stamina.",
      items: getCategoryMemories("health"),
    },
    {
      id: "behavior",
      title: "Behavioral Profiles",
      icon: Clock,
      color: "text-purple-600 bg-purple-50/50 border-purple-100",
      emptyMsg: "No behavioral patterns detected. Multipliers will adjust as task buffers calibrate.",
      items: getCategoryMemories("behavior"),
    },
    {
      id: "goal",
      title: "Long-term Focus Goals",
      icon: Target,
      color: "text-emerald-600 bg-emerald-50/50 border-emerald-100",
      emptyMsg: "No long-term focus goals active. Define overarching objectives to structure daily planning.",
      items: [...getCategoryMemories("goal"), ...getCategoryMemories("project")],
    },
  ];

  return (
    <aside className="w-full flex flex-col gap-4">
      <div className="flex items-center gap-2 border-b border-neutral-200/80 pb-3">
        <Brain className="h-4 w-4 text-neutral-800" />
        <h2 className="text-sm font-bold text-neutral-900 tracking-tight uppercase">
          What I Know About You
        </h2>
      </div>

      <div className="flex flex-col gap-3">
        {categories.map((cat) => {
          const IconComponent = cat.icon;
          const hasItems = cat.items.length > 0;

          return (
            <div
              key={cat.id}
              className={`group rounded-2xl border border-neutral-200/80 bg-white/70 backdrop-blur-sm p-4 shadow-sm transition-all duration-300 hover:border-neutral-300 hover:shadow-md ${
                hasItems ? "ring-1 ring-neutral-900/5 bg-gradient-to-br from-neutral-50/20 to-white/70" : ""
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1 rounded-md border ${cat.color}`}>
                  <IconComponent className="h-3.5 w-3.5" />
                </div>
                <h3 className="text-xs font-bold text-neutral-800 tracking-tight">
                  {cat.title}
                </h3>
              </div>

              {hasItems ? (
                <ul className="flex flex-col gap-1.5 pl-0.5">
                  {cat.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex flex-col gap-0.5 p-2 rounded-lg bg-neutral-50/50 border border-neutral-100/80 text-xs text-neutral-700 leading-normal animate-in fade-in slide-in-from-left-1 duration-200"
                    >
                      <span className="font-medium text-neutral-800">{item.value}</span>
                      <div className="flex items-center justify-between text-[9px] text-neutral-400 font-mono mt-1 pt-1 border-t border-neutral-100">
                        <span>Confidence: {Math.round(item.confidence * 100)}%</span>
                        <span className="truncate max-w-[120px] text-right" title={item.reason}>
                          {item.reason}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[10px] text-neutral-400 font-normal leading-normal italic pl-0.5">
                  {cat.emptyMsg}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};
