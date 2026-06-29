"use client";

import React from "react";
import { Brain, Repeat, Sliders, FolderGit2, Calendar } from "lucide-react";

interface MemoryCategory {
  id: string;
  title: string;
  icon: React.ElementType;
}

const memoryCategories: MemoryCategory[] = [
  { id: "routine", title: "Routine", icon: Repeat },
  { id: "preferences", title: "Preferences", icon: Sliders },
  { id: "projects", title: "Projects", icon: FolderGit2 },
  { id: "upcoming", title: "Upcoming", icon: Calendar },
];

export const MemorySidebar: React.FC = () => {
  return (
    <aside className="w-full flex flex-col gap-4">
      <div className="flex items-center gap-2 border-b border-neutral-200/80 pb-3">
        <Brain className="h-4 w-4 text-neutral-500" />
        <h2 className="text-sm font-semibold text-neutral-900 tracking-tight uppercase">
          Memory
        </h2>
      </div>

      <div className="flex flex-col gap-3">
        {memoryCategories.map((cat) => {
          const IconComponent = cat.icon;
          return (
            <div
              key={cat.id}
              className="group rounded-xl border border-neutral-200/80 bg-white p-3.5 shadow-sm transition-all duration-200 hover:border-neutral-300 hover:shadow-md"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <IconComponent className="h-3.5 w-3.5 text-neutral-400 group-hover:text-neutral-700 transition-colors" />
                <h3 className="text-xs font-semibold text-neutral-800 tracking-tight">
                  {cat.title}
                </h3>
              </div>
              <p className="text-[11px] text-neutral-400 font-normal leading-relaxed italic">
                No memory collected yet.
              </p>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
