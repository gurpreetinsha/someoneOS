"use client";

import React from "react";
import { PlanResult, Task, TaskPriority } from "@/lib/planner/types/planner";
import {
  ListChecks,
  ListOrdered,
  AlertTriangle,
  HelpCircle,
  AlertCircle,
  Clock,
  Tag,
  ShieldAlert,
} from "lucide-react";

interface ExecutionPreviewProps {
  plan: PlanResult | null;
}

const getPriorityBadge = (priority: TaskPriority) => {
  switch (priority) {
    case "high":
      return "bg-rose-50 text-rose-700 border-rose-200/80";
    case "medium":
      return "bg-amber-50 text-amber-700 border-amber-200/80";
    case "low":
    default:
      return "bg-slate-50 text-slate-700 border-slate-200/80";
  }
};

export const ExecutionPreview: React.FC<ExecutionPreviewProps> = ({ plan }) => {
  if (!plan) return null;

  const hasContent =
    plan.tasks.length > 0 ||
    plan.executionOrder.length > 0 ||
    plan.warnings.length > 0 ||
    plan.assumptions.length > 0 ||
    plan.unplannedItems.length > 0;

  if (!hasContent) return null;

  // Create lookup for execution order task mapping
  const taskMap = new Map<string, Task>();
  plan.tasks.forEach((t) => taskMap.set(t.id, t));

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Banner */}
      <div className="flex items-center gap-2.5 border-b border-neutral-200/80 pb-3">
        <div className="p-1.5 rounded-lg bg-neutral-900 text-white">
          <ListChecks className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-neutral-900 tracking-tight uppercase">
            Execution Preview
          </h2>
          <p className="text-xs text-neutral-500">
            Deterministic plan generated locally from understanding and memory extraction.
          </p>
        </div>
      </div>

      {/* 1. Tasks Section */}
      {plan.tasks.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-neutral-800">
            <ListChecks className="h-4 w-4 text-neutral-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
              Tasks ({plan.tasks.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {plan.tasks.map((task) => (
              <div
                key={task.id}
                className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm flex flex-col gap-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-neutral-900 leading-snug">
                      {task.title}
                    </span>
                    <p className="text-[11px] text-neutral-500 leading-relaxed">
                      {task.reason}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-md border text-[10px] font-semibold uppercase tracking-wider flex-shrink-0 ${getPriorityBadge(
                      task.priority
                    )}`}
                  >
                    {task.priority}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-neutral-100 text-[11px] text-neutral-600">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-neutral-400" />
                    <span>{task.estimatedMinutes} mins</span>
                  </div>

                  {task.category && (
                    <div className="flex items-center gap-1">
                      <Tag className="h-3.5 w-3.5 text-neutral-400" />
                      <span className="capitalize">{task.category}</span>
                    </div>
                  )}

                  {task.deadline && (
                    <div className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                      <ShieldAlert className="h-3 w-3" />
                      <span>Deadline: {task.deadline}</span>
                    </div>
                  )}

                  {task.dependsOn && task.dependsOn.length > 0 && (
                    <div className="flex items-center gap-1 text-neutral-500">
                      <span>Depends on: {task.dependsOn.length} item(s)</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 2. Execution Order Section */}
      {plan.executionOrder.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-neutral-800">
            <ListOrdered className="h-4 w-4 text-neutral-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
              Execution Order
            </h3>
          </div>
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm flex flex-col gap-2">
            {plan.executionOrder.map((taskId, index) => {
              const task = taskMap.get(taskId);
              return (
                <div
                  key={taskId}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-neutral-50/70 border border-neutral-100"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-neutral-200 text-neutral-700 text-xs font-bold flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-xs font-semibold text-neutral-800">
                      {task ? task.title : taskId}
                    </span>
                  </div>
                  {task && (
                    <span className="text-[11px] text-neutral-500 flex-shrink-0">
                      {task.estimatedMinutes} mins
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 3. Warnings Section */}
      {plan.warnings.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-amber-800">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Warnings ({plan.warnings.length})
            </h3>
          </div>
          <div className="flex flex-col gap-2.5">
            {plan.warnings.map((warning) => (
              <div
                key={warning.id}
                className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 flex items-start gap-3 text-amber-900 shadow-sm"
              >
                <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5 text-xs">
                  <span className="font-semibold">{warning.target}</span>
                  <span className="text-amber-800/90 leading-relaxed">{warning.message}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Assumptions Section */}
      {plan.assumptions.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-blue-800">
            <HelpCircle className="h-4 w-4 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Assumptions ({plan.assumptions.length})
            </h3>
          </div>
          <div className="flex flex-col gap-2.5">
            {plan.assumptions.map((assumption) => (
              <div
                key={assumption.id}
                className="rounded-xl border border-blue-200 bg-blue-50/60 p-3.5 flex items-start gap-3 text-blue-900 shadow-sm"
              >
                <HelpCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5 text-xs">
                  <span className="font-semibold">{assumption.target}</span>
                  <span className="text-blue-800/90 leading-relaxed">{assumption.message}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Unplanned Items Section */}
      {plan.unplannedItems.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-neutral-700">
            <ShieldAlert className="h-4 w-4 text-neutral-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-600">
              Unplanned Items ({plan.unplannedItems.length})
            </h3>
          </div>
          <div className="flex flex-col gap-2.5">
            {plan.unplannedItems.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-neutral-200 bg-neutral-50/80 p-3.5 flex items-start justify-between gap-3 text-neutral-800 shadow-sm"
              >
                <div className="flex flex-col gap-0.5 text-xs">
                  <span className="font-semibold text-neutral-900">{item.title}</span>
                  <span className="text-neutral-500 leading-relaxed">{item.reason}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
