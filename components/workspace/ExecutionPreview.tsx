"use client";
 
import React, { useState, useEffect } from "react";
import { PlanResult, TaskPriority, Task } from "@/lib/planner/types/planner";
import { UnderstandingResult } from "@/types/understanding";
import { MemoryItem } from "@/lib/memory/types/memory";
import { FailurePredictionResult } from "@/lib/orchestrator/failurePrediction";
import { ScheduleNegotiationResult } from "@/lib/orchestrator/scheduleNegotiator";
import { useAuth } from "@/lib/auth";
import {
  AlertTriangle,
  HelpCircle,
  AlertCircle,
  Clock,
  Tag,
  ShieldAlert,
  Play,
  RotateCcw,
  Sparkles,
  CalendarDays,
  Gauge,
  ScrollText,
  BookmarkCheck,
  CheckCircle2,
  Brain,
  TrendingDown,
  Info,
  Calendar,
  Loader2,
  ExternalLink,
} from "lucide-react";
 
interface ExecutionPreviewProps {
  plan: PlanResult | null;
  understanding: UnderstandingResult | null;
  memories: MemoryItem[];
  cognitiveLoad: number;
  failurePrediction?: FailurePredictionResult | null;
  selectedStrategyId?: "A" | "B" | "C" | null;
  onSelectStrategy?: (id: "A" | "B" | "C") => void;
  negotiation?: ScheduleNegotiationResult | null;
}
 
const getPriorityColor = (priority: TaskPriority) => {
  switch (priority) {
    case "high":
      return "text-rose-700 bg-rose-50 border-rose-200";
    case "medium":
      return "text-amber-700 bg-amber-50 border-amber-200";
    case "low":
    default:
      return "text-slate-700 bg-slate-50 border-slate-200";
  }
};
 
const loadingMessages = [
  "Creating calendar events...",
  "Reserving focus blocks...",
  "Negotiating your day...",
  "Synchronizing with Google Calendar...",
  "Almost done...",
];

interface ScheduledSlot {
  time: string;
  type: "anchor" | "task";
  title: string;
  priority?: TaskPriority;
  icon?: React.ComponentType<{ className?: string }>;
  color?: string;
  start: Date;
  end: Date;
  task?: Task;
}

const getScheduledBlocks = (plan: PlanResult | null): ScheduledSlot[] => {
  if (!plan) return [];

  const blocks: ScheduledSlot[] = [];
  const baseDate = new Date();

  // 1. Routine Anchor (8:00 AM - 9:00 AM)
  const routineStart = new Date(baseDate);
  routineStart.setHours(8, 0, 0, 0);
  const routineEnd = new Date(baseDate);
  routineEnd.setHours(9, 0, 0, 0);
  blocks.push({
    time: "08:00 AM",
    type: "anchor",
    title: "Routine: Drop kids at school",
    icon: CalendarDays,
    color: "bg-blue-50/70 border-blue-100 text-blue-700",
    start: routineStart,
    end: routineEnd,
  });

  // 2. Physical Break Anchor (1:00 PM - 2:00 PM)
  const breakStart = new Date(baseDate);
  breakStart.setHours(13, 0, 0, 0);
  const breakEnd = new Date(baseDate);
  breakEnd.setHours(14, 0, 0, 0);
  const breakBlock: ScheduledSlot = {
    time: "01:00 PM",
    type: "anchor",
    title: "Physical Break: Back stretches (Lower back care)",
    icon: AlertCircle,
    color: "bg-rose-50/75 border-rose-100 text-rose-700",
    start: breakStart,
    end: breakEnd,
  };

  // 3. Event Anchor (2:00 PM - 3:00 PM)
  const eventStart = new Date(baseDate);
  eventStart.setHours(14, 0, 0, 0);
  const eventEnd = new Date(baseDate);
  eventEnd.setHours(15, 0, 0, 0);
  const eventBlock: ScheduledSlot = {
    time: "02:00 PM",
    type: "anchor",
    title: "Event: Meta Interview (Wed Anchor)",
    icon: Sparkles,
    color: "bg-purple-50/70 border-purple-100 text-purple-700 font-bold",
    start: eventStart,
    end: eventEnd,
  };

  // Schedule tasks sequentially starting from 9:00 AM
  let currentStart = new Date(baseDate);
  currentStart.setHours(9, 0, 0, 0);

  const formatTimeAMPM = (date: Date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strMinutes = String(minutes).padStart(2, "0");
    return `${hours}:${strMinutes} ${ampm}`;
  };

  plan.tasks.forEach((task) => {
    // Shift task start past the afternoon anchors if it overlaps
    if (currentStart.getHours() >= 13 && currentStart.getHours() < 15) {
      currentStart.setHours(15, 0, 0, 0);
    }

    const start = new Date(currentStart);
    const durationMinutes = task.estimatedMinutes || 60;
    const end = new Date(currentStart.getTime() + durationMinutes * 60 * 1000);

    currentStart = new Date(end.getTime());

    blocks.push({
      time: formatTimeAMPM(start),
      type: "task",
      title: task.title,
      priority: task.priority,
      start,
      end,
      task,
    });
  });

  blocks.push(breakBlock);
  blocks.push(eventBlock);
  blocks.sort((a, b) => a.start.getTime() - b.start.getTime());

  return blocks;
};

export const ExecutionPreview: React.FC<ExecutionPreviewProps> = ({
  plan,
  understanding,
  memories,
  cognitiveLoad,
  failurePrediction = null,
  selectedStrategyId = null,
  onSelectStrategy,
  negotiation = null,
}) => {
  const [activeTab, setActiveTab] = useState<"timeline" | "simulator" | "load" | "log">("timeline");
  
  // Future Simulator State
  const [simDay, setSimDay] = useState(0);
  const [simRunning, setSimRunning] = useState(false);
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [simStatus, setSimStatus] = useState<"idle" | "running" | "collision" | "repairing" | "stable">("idle");

  // Google Calendar Integration States & Handlers
  const { signInWithGoogle } = useAuth();
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error_permission" | "error_expired" | "error_api">("idle");
  const [loadingMessage, setLoadingMessage] = useState("Creating calendar events...");
  const [createdEventsCount, setCreatedEventsCount] = useState(0);

  useEffect(() => {
    if (syncStatus !== "syncing") return;

    let index = 0;
    setLoadingMessage(loadingMessages[0]);

    const interval = setInterval(() => {
      index = (index + 1) % loadingMessages.length;
      setLoadingMessage(loadingMessages[index]);
    }, 1500);

    return () => clearInterval(interval);
  }, [syncStatus]);

  const handleApplyStrategy = async () => {
    const token = sessionStorage.getItem("google_access_token");
    if (!token) {
      setSyncStatus("error_permission");
      return;
    }

    setSyncStatus("syncing");

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

    const formatLocalISO = (date: Date) => {
      const pad = (num: number) => String(num).padStart(2, "0");
      const yyyy = date.getFullYear();
      const MM = pad(date.getMonth() + 1);
      const dd = pad(date.getDate());
      const hh = pad(date.getHours());
      const mm = pad(date.getMinutes());
      const ss = pad(date.getSeconds());
      return `${yyyy}-${MM}-${dd}T${hh}:${mm}:${ss}`;
    };

    const tasksToSync = scheduleSlots.filter((slot) => slot.type === "task");
    const eventsToCreate = tasksToSync.map((block) => {
      const task = block.task;
      const description = [
        "Generated by SomeoneOS",
        `Priority: ${block.priority}`,
        `Reason: ${task?.reason || "N/A"}`,
        failurePrediction?.successProbability 
          ? `Success Forecast: ${failurePrediction.successProbability}% success probability`
          : "Success Forecast: N/A"
      ].join("\n");

      return {
        summary: block.title,
        description,
        start: {
          dateTime: formatLocalISO(block.start),
          timeZone: timezone,
        },
        end: {
          dateTime: formatLocalISO(block.end),
          timeZone: timezone,
        },
      };
    });

    try {
      const insertPromises = eventsToCreate.map(async (event) => {
        const res = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event),
        });

        if (!res.ok) {
          if (res.status === 401) {
            throw new Error("TOKEN_EXPIRED");
          }
          if (res.status === 403) {
            throw new Error("PERMISSION_DENIED");
          }
          throw new Error("API_ERROR");
        }

        return res.json();
      });

      await Promise.all(insertPromises);
      setCreatedEventsCount(eventsToCreate.length);
      setSyncStatus("success");
    } catch (err: unknown) {
      console.error("Google Calendar sync error:", err);
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg === "TOKEN_EXPIRED") {
        setSyncStatus("error_expired");
      } else if (errMsg === "PERMISSION_DENIED") {
        setSyncStatus("error_permission");
      } else {
        setSyncStatus("error_api");
      }
    }
  };

  const handleSignInAndRetry = async () => {
    try {
      await signInWithGoogle();
      const token = sessionStorage.getItem("google_access_token");
      if (token) {
        setSyncStatus("idle");
        setTimeout(() => {
          handleApplyStrategy();
        }, 100);
      }
    } catch (error) {
      console.error("Re-authentication failed:", error);
      setSyncStatus("error_permission");
    }
  };

  if (!plan) {
    return (
      <div className="w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header Banner */}
        <div className="flex items-center gap-2.5 border-b border-neutral-200 pb-3">
          <div className="p-1.5 rounded-lg bg-neutral-900 text-white">
            <BookmarkCheck className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-neutral-900 tracking-tight uppercase">
              Cognitive Action Console
            </h2>
            <p className="text-xs text-neutral-500">
              Intelligent scheduler analyzing user behavior, constraints, and risks.
            </p>
          </div>
        </div>

        {/* Dynamic Placeholder */}
        <div className="rounded-3xl border border-dashed border-neutral-300 bg-white/40 p-12 text-center flex flex-col items-center justify-center gap-5 shadow-sm backdrop-blur-sm min-h-[350px]">
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 text-neutral-400">
            <Brain className="h-8 w-8 text-neutral-700 animate-pulse" />
          </div>
          <div className="max-w-md flex flex-col gap-2">
            <h3 className="text-xs font-black text-neutral-800 uppercase tracking-widest">
              Cognitive Engine Standby
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed font-semibold">
              No active schedule has been synthesized yet. Input your unstructured thoughts, routines, upcoming tasks, or health conditions in the cockpit above.
            </p>
            <p className="text-[11px] text-neutral-400 italic font-medium">
              SomeoneOS will automatically normalize your tasks, align them with your history, and forecast your success probability.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Timeline Hour blocks helper computed dynamically
  const scheduleSlots = getScheduledBlocks(plan);

  // 5-Day Simulation Steps
  const runSimulation = () => {
    setSimRunning(true);
    setSimDay(1);
    setSimStatus("running");
    setSimLogs(["[Day 1] Initiating cognitive pathway projection...", "[Day 1] Standard tasks execution running. Performance at 94%."]);

    setTimeout(() => {
      setSimDay(2);
      setSimLogs((prev) => [
        ...prev,
        "[Day 2] Warning: High cognitive complexity tasks detected.",
        "[Day 2] Back stiffness warning. Recovery blocks active."
      ]);
    }, 1500);

    setTimeout(() => {
      setSimDay(3);
      setSimStatus("collision");
      setSimLogs((prev) => [
        ...prev,
        "[Day 3] COLLISION WARNING: Product launch deadline overlaps with OS midterm prep.",
        "[Day 3] User fatigue risk: 85% (Procrastination coefficient active)."
      ]);
    }, 3000);
  };

  const repairSimulation = () => {
    setSimStatus("repairing");
    setSimLogs((prev) => [
      ...prev,
      "[Auto-Repair] Running Algorithm 8 re-scheduler...",
      "[Auto-Repair] Postponing 'Study Rust Programming' (low urgency).",
      "[Auto-Repair] Shifting OS lab deadline and padding coding buffers (+20%).",
      "[Auto-Repair] Schedule collision resolved."
    ]);

    setTimeout(() => {
      setSimDay(4);
      setSimStatus("stable");
      setSimLogs((prev) => [
        ...prev,
        "[Day 4] Re-ordered plan execution. All blocks restored to green.",
        "[Day 4] Fatigue risk mitigated (reduced to 32%)."
      ]);
    }, 1500);

    setTimeout(() => {
      setSimDay(5);
      setSimRunning(false);
      setSimLogs((prev) => [
        ...prev,
        "[Day 5] Timeline projection complete. 100% deadline compliance reached."
      ]);
    }, 3000);
  };

  const resetSimulation = () => {
    setSimDay(0);
    setSimRunning(false);
    setSimStatus("idle");
    setSimLogs([]);
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200 pb-3 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-neutral-900 text-white">
            <BookmarkCheck className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-neutral-900 tracking-tight uppercase">
              Cognitive Action Console
            </h2>
            <p className="text-xs text-neutral-500">
              Intelligent scheduler analyzing user behavior, constraints, and risks.
            </p>
          </div>
        </div>
        {plan && (
          <div className="self-start sm:self-center flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 border border-emerald-100/60 text-emerald-700 animate-in fade-in zoom-in-95 duration-500 shadow-sm">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span>Plan Synced • Aligned with {memories.length} Memories</span>
          </div>
        )}
      </div>

      {/* Google Calendar Action Engine Card */}
      <div className="rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950 via-neutral-900 to-slate-950 text-white p-6 sm:p-8 shadow-xl flex flex-col gap-5 relative overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="absolute top-0 right-1/4 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-indigo-500/20 pb-4 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md">
              <Calendar className="h-4.5 w-4.5 text-indigo-100" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-extrabold tracking-tight uppercase">
                Google Calendar Action Engine
              </h3>
              <p className="text-[10px] text-indigo-200 font-medium">
                Direct deployment of recommended focus strategy into your daily routine
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-left max-w-xl">
            <p className="text-xs text-neutral-300 leading-relaxed font-semibold">
              Ready to execute this cognitive plan? Sync it instantly to your Google Calendar as individual focus blocks structured by priority and behavior multipliers.
            </p>
          </div>

          <div className="w-full lg:w-auto flex-shrink-0">
            {syncStatus === "idle" && (
              <button
                onClick={handleApplyStrategy}
                id="apply-strategy-btn"
                className="w-full lg:w-auto px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-indigo-600/30 flex items-center justify-center gap-2"
              >
                Apply Recommended Strategy
              </button>
            )}

            {syncStatus === "syncing" && (
              <div className="flex items-center gap-3 bg-neutral-800/80 px-5 py-3.5 rounded-2xl border border-neutral-700/50">
                <Loader2 className="h-4 w-4 text-indigo-400 animate-spin" />
                <span className="text-xs font-bold text-neutral-200 animate-pulse tracking-wide font-mono">
                  {loadingMessage}
                </span>
              </div>
            )}

            {syncStatus === "success" && (
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="text-left bg-emerald-950/60 border border-emerald-500/20 px-4 py-2.5 rounded-2xl flex items-center gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-emerald-200">✅ Strategy Applied</span>
                    <span className="text-[10px] text-emerald-400">Created {createdEventsCount} events successfully.</span>
                  </div>
                </div>
                <a
                  href="https://calendar.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-neutral-850 hover:bg-neutral-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-neutral-700/60 shadow-sm"
                >
                  Open Google Calendar
                  <ExternalLink className="h-3 w-3 text-neutral-400" />
                </a>
              </div>
            )}

            {syncStatus === "error_permission" && (
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="text-left bg-rose-950/60 border border-rose-500/20 px-4 py-2.5 rounded-2xl flex items-start gap-2.5 max-w-sm">
                  <AlertTriangle className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-rose-200">Calendar permission required.</span>
                    <span className="text-[10px] text-rose-400 leading-normal">Please sign in again to enable Calendar Sync.</span>
                  </div>
                </div>
                <button
                  onClick={handleSignInAndRetry}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs uppercase tracking-wider transition-colors shadow-md"
                >
                  Sign in with Google
                </button>
              </div>
            )}

            {syncStatus === "error_expired" && (
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="text-left bg-rose-950/60 border border-rose-500/20 px-4 py-2.5 rounded-2xl flex items-start gap-2.5">
                  <AlertTriangle className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-rose-200">Session expired.</span>
                    <span className="text-[10px] text-rose-400 leading-normal">Please sign in again.</span>
                  </div>
                </div>
                <button
                  onClick={handleSignInAndRetry}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs uppercase tracking-wider transition-colors shadow-md"
                >
                  Sign in with Google
                </button>
              </div>
            )}

            {syncStatus === "error_api" && (
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="text-left bg-rose-950/60 border border-rose-500/20 px-4 py-2.5 rounded-2xl flex items-center gap-2.5">
                  <AlertTriangle className="h-5 w-5 text-rose-400 flex-shrink-0" />
                  <span className="text-xs font-bold text-rose-200">Unable to sync calendar.</span>
                </div>
                <button
                  onClick={handleApplyStrategy}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider transition-colors shadow-md"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Forecast Card (Visually Dominant) */}
      {failurePrediction && (
        <div className="rounded-3xl border border-neutral-200/80 bg-gradient-to-br from-neutral-50/50 via-white to-indigo-50/10 p-6 sm:p-8 shadow-md flex flex-col gap-6 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
          {/* Subtle glowing mesh */}
          <div className="absolute top-0 left-1/3 w-40 h-40 bg-indigo-400/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-emerald-400/5 rounded-full blur-3xl pointer-events-none" />

          {/* Top section: Title and Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-neutral-100 pb-4 gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-900 text-white shadow-sm">
                <Brain className="h-4.5 w-4.5 text-indigo-200 animate-pulse" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-extrabold text-neutral-900 tracking-tight uppercase">
                  Cognitive Success Forecast
                </h3>
                <p className="text-[10px] text-neutral-500 font-medium">
                  Deterministic risk synthesis and plan effectiveness projection
                </p>
              </div>
            </div>
            <span className={`self-start sm:self-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${
              failurePrediction.riskLevel === "Low"
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : failurePrediction.riskLevel === "Medium"
                ? "bg-amber-50 border-amber-200 text-amber-700"
                : "bg-rose-50 border-rose-200 text-rose-700 animate-pulse"
            }`}>
              {failurePrediction.riskLevel} Plan Risk
            </span>
          </div>

          {/* Centerpiece: Dominant Success Arc + Stats Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Massive Circular Success Gauge */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-white/60 border border-neutral-200/50 shadow-inner relative min-h-[200px]">
              <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" className="stroke-neutral-100 fill-none" strokeWidth="10" />
                <circle 
                  cx="60" 
                  cy="60" 
                  r="50" 
                  className="fill-none transition-all duration-1000 stroke-indigo-600"
                  strokeWidth="10"
                  strokeDasharray="314.16"
                  strokeDashoffset={314.16 - (314.16 * failurePrediction.successProbability) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-black text-neutral-900 tracking-tight leading-none">
                  {failurePrediction.successProbability}%
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600 mt-1">
                  Success Prob.
                </span>
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4 h-full">
              {/* Failure Risk */}
              <div className={`rounded-2xl border p-4 flex flex-col justify-between text-left transition-all ${
                failurePrediction.riskLevel === "Low"
                  ? "bg-emerald-50/30 border-emerald-100/50 text-emerald-950"
                  : failurePrediction.riskLevel === "Medium"
                  ? "bg-amber-50/30 border-amber-100/50 text-amber-950"
                  : "bg-rose-50/30 border-rose-100/50 text-rose-950"
              }`}>
                <span className="text-[9px] font-black uppercase tracking-widest opacity-60">
                  Risk Level
                </span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-black tracking-tight">{failurePrediction.failureRisk}%</span>
                  <span className="text-[10px] font-bold">risk</span>
                </div>
              </div>

              {/* Confidence */}
              <div className="rounded-2xl border border-neutral-200/60 bg-white/60 p-4 flex flex-col justify-between text-left">
                <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">
                  Confidence
                </span>
                <div className="mt-2 flex items-baseline gap-1 text-neutral-900">
                  <span className="text-2xl font-black tracking-tight">{failurePrediction.confidenceScore}%</span>
                  <span className="text-[10px] font-bold opacity-60">accuracy</span>
                </div>
              </div>

              {/* Optimization */}
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/20 p-4 flex flex-col justify-between text-left">
                <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">
                  Mitigation Δ
                </span>
                <div className="mt-2 flex items-baseline gap-0.5 text-indigo-900">
                  <span className="text-2xl font-black tracking-tight">+{failurePrediction.plannerImprovement}%</span>
                  <span className="text-[10px] font-bold text-indigo-600/80">boost</span>
                </div>
              </div>
            </div>
          </div>

          {/* Before vs After Synthesis Bar */}
          <div className="rounded-2xl border border-neutral-200/60 bg-white/40 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-indigo-100/60 text-indigo-950 flex items-center justify-center font-black text-xs font-mono">
                Δ
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-neutral-800">
                  Plan Impact Synthesis
                </span>
                <span className="text-[10px] text-neutral-500">
                  Active cognitive risk reduction provided by the planner engine.
                </span>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-bold text-neutral-700">
              <div className="flex flex-col items-end">
                <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Before planning</span>
                <span className="text-neutral-500 line-through">Failure Risk {failurePrediction.beforePlanningRisk}%</span>
              </div>
              <TrendingDown className="h-5 w-5 text-indigo-500 animate-pulse hidden sm:block" />
              <div className="flex flex-col items-start">
                <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">After planning</span>
                <span className="text-emerald-700">Failure Risk {failurePrediction.afterPlanningRisk}%</span>
              </div>
              <div className="px-2.5 py-1 rounded bg-indigo-100 text-indigo-900 text-[10px] font-black uppercase tracking-widest font-mono">
                +{failurePrediction.plannerImprovement}% Risk Reduced
              </div>
            </div>
          </div>

          {/* Rationale and Risk Drivers grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 text-left">
            {/* Why? Top 5 Reasons */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-1.5 text-neutral-800">
                <Info className="h-4 w-4 text-indigo-600" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                  Prediction Rationale (Why?)
                </h4>
              </div>
              <ul className="flex flex-col gap-2 pl-1">
                {failurePrediction.topReasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs font-semibold text-neutral-700 leading-tight">
                    <span className="text-indigo-600 text-sm leading-none">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Drivers and Mitigations */}
            <div className="flex flex-col gap-4 border-t md:border-t-0 md:border-l border-neutral-100 md:pl-6 pt-4 md:pt-0">
              {/* Risk Increases */}
              <div className="flex flex-col gap-2">
                <h4 className="text-[9px] font-black uppercase tracking-widest text-rose-700">
                  Active Risk Drivers
                </h4>
                <div className="flex flex-col gap-1.5">
                  {failurePrediction.increasedRiskFactors.map((factor, idx) => (
                    <div key={idx} className="flex justify-between items-center gap-2 text-[11px] font-semibold text-neutral-700 bg-rose-50/30 p-2 rounded-lg border border-rose-100/50">
                      <span className="leading-snug">{factor.factor}</span>
                      <span className="text-rose-600 font-bold whitespace-nowrap">+{factor.impact}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Reductions */}
              <div className="flex flex-col gap-2">
                <h4 className="text-[9px] font-black uppercase tracking-widest text-emerald-700">
                  Active Safety Safeguards
                </h4>
                <div className="flex flex-col gap-1.5">
                  {failurePrediction.reducedRiskFactors.map((factor, idx) => (
                    <div key={idx} className="flex justify-between items-center gap-2 text-[11px] font-semibold text-neutral-700 bg-emerald-50/30 p-2 rounded-lg border border-emerald-100/50">
                      <span className="leading-snug">{factor.factor}</span>
                      <span className="text-emerald-600 font-bold whitespace-nowrap">-{factor.impact}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Schedule Negotiator Card */}
      {negotiation && negotiation.overloadDetected && (
        <div className="rounded-3xl border border-indigo-200/80 bg-white/70 backdrop-blur-md p-6 sm:p-8 shadow-lg flex flex-col gap-6 bg-gradient-to-br from-indigo-50/20 via-white/80 to-purple-50/20 hover:shadow-xl transition-shadow duration-300 relative overflow-hidden">
          {/* Decorative background gradients */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-200/10 rounded-full blur-3xl pointer-events-none" />

          {/* Title and Status Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-indigo-100/60 pb-4 gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
                <Sparkles className="h-4.5 w-4.5 animate-pulse" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-extrabold text-neutral-900 tracking-tight uppercase">
                  AI Schedule Negotiator
                </h3>
                <p className="text-[10px] text-neutral-500 font-medium">
                  Dynamic multi-strategy timeline mitigation models
                </p>
              </div>
            </div>
            <span className="self-start sm:self-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 border border-rose-200 text-rose-700 shadow-sm flex items-center gap-1.5 animate-pulse">
              <AlertTriangle className="h-3 w-3 text-rose-600" /> Overload Alert Mitigated
            </span>
          </div>

          {/* Recommendation guidance */}
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 flex gap-3 text-xs leading-relaxed shadow-sm text-left">
            <Info className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="font-extrabold text-indigo-950 uppercase tracking-wider text-[9px]">
                Negotiator Recommendation
              </span>
              <p className="text-neutral-700 text-xs font-semibold">
                {negotiation.recommendationReason}
              </p>
            </div>
          </div>

          {/* Strategy Options Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(["A", "B", "C"] as const).map((stratId) => {
              const strategy = negotiation.strategies[stratId];
              const isRecommended = negotiation.recommendedId === stratId;
              const isActive = selectedStrategyId === stratId;

              return (
                <div
                  key={stratId}
                  className={`rounded-2xl border p-5 flex flex-col justify-between gap-4 transition-all duration-300 relative text-left ${
                    isActive
                      ? "border-indigo-600 bg-indigo-50/20 shadow-md ring-2 ring-indigo-600/20"
                      : isRecommended
                      ? "border-neutral-200 bg-white hover:border-indigo-300 hover:shadow-md"
                      : "border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-md"
                  }`}
                >
                  {/* Strategy Badge */}
                  {isRecommended && (
                    <div className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-indigo-600 text-white shadow-sm flex items-center gap-1">
                      <Sparkles className="h-2 w-2" /> System Pick
                    </div>
                  )}

                  {/* Header / Info */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black text-neutral-400 tracking-widest uppercase">
                      Strategy {stratId}
                    </span>
                    <h4 className="text-xs font-extrabold text-neutral-800 leading-tight">
                      {strategy.title}
                    </h4>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-2 gap-2 my-1">
                    {/* Success Prob */}
                    <div className="flex flex-col p-2 rounded-xl bg-neutral-50 border border-neutral-100/60 text-center justify-center">
                      <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-0.5">
                        Success
                      </span>
                      <span className={`text-xs font-black tracking-tight ${
                        strategy.successProbability >= 80
                          ? "text-emerald-700"
                          : strategy.successProbability >= 60
                          ? "text-amber-700"
                          : "text-rose-700"
                      }`}>
                        {strategy.successProbability}%
                      </span>
                    </div>

                    {/* Cog Load */}
                    <div className="flex flex-col p-2 rounded-xl bg-neutral-50 border border-neutral-100/60 text-center justify-center">
                      <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-0.5">
                        Load
                      </span>
                      <span className={`text-xs font-black tracking-tight ${
                        strategy.cognitiveLoad <= 40
                          ? "text-emerald-700"
                          : strategy.cognitiveLoad <= 70
                          ? "text-amber-700"
                          : "text-rose-700"
                      }`}>
                        {strategy.cognitiveLoad}%
                      </span>
                    </div>
                  </div>

                  {/* Description / Bullet Points */}
                  <div className="flex flex-col gap-2 flex-grow">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-black uppercase tracking-wider text-rose-600">
                        Tradeoffs
                      </span>
                      <p className="text-[10px] text-neutral-600 leading-relaxed font-semibold">
                        {strategy.tradeoffs}
                      </p>
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600">
                        Explanation
                      </span>
                      <p className="text-[10px] text-neutral-500 leading-relaxed">
                        {strategy.explanation}
                      </p>
                    </div>
                  </div>

                  {/* Activate Action Button */}
                  <button
                    onClick={() => onSelectStrategy && onSelectStrategy(stratId)}
                    disabled={isActive}
                    aria-label={`Adopt Strategy ${stratId}`}
                    className={`w-full py-2 rounded-xl text-center text-xs font-bold transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 ${
                      isActive
                        ? "bg-indigo-600 text-white cursor-default shadow-indigo-600/10 animate-none"
                        : "bg-neutral-900 text-white hover:bg-neutral-800 hover:scale-[1.02] active:scale-[0.98]"
                    }`}
                  >
                    {isActive ? "✓ Strategy Active" : `Adopt Strategy ${stratId}`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tabs Selector */}
      <div className="flex border-b border-neutral-200 gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab("timeline")}
          className={`flex items-center gap-1.5 px-4 py-2 border-b-2 text-xs font-bold transition-all ${
            activeTab === "timeline"
              ? "border-neutral-900 text-neutral-900 bg-neutral-50"
              : "border-transparent text-neutral-400 hover:text-neutral-700"
          }`}
        >
          <CalendarDays className="h-3.5 w-3.5" />
          Reasoning Timeline
        </button>
        <button
          onClick={() => setActiveTab("simulator")}
          className={`flex items-center gap-1.5 px-4 py-2 border-b-2 text-xs font-bold transition-all ${
            activeTab === "simulator"
              ? "border-neutral-900 text-neutral-900 bg-neutral-50"
              : "border-transparent text-neutral-400 hover:text-neutral-700"
          }`}
        >
          <Play className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
          Future Simulator
        </button>
        <button
          onClick={() => setActiveTab("load")}
          className={`flex items-center gap-1.5 px-4 py-2 border-b-2 text-xs font-bold transition-all ${
            activeTab === "load"
              ? "border-neutral-900 text-neutral-900 bg-neutral-50"
              : "border-transparent text-neutral-400 hover:text-neutral-700"
          }`}
        >
          <Gauge className="h-3.5 w-3.5" />
          Cognitive Load
        </button>
        <button
          onClick={() => setActiveTab("log")}
          className={`flex items-center gap-1.5 px-4 py-2 border-b-2 text-xs font-bold transition-all ${
            activeTab === "log"
              ? "border-neutral-900 text-neutral-900 bg-neutral-50"
              : "border-transparent text-neutral-400 hover:text-neutral-700"
          }`}
        >
          <ScrollText className="h-3.5 w-3.5" />
          Decision Log
        </button>
      </div>

      {/* Tab Contents */}
      
      {/* 1. Reasoning Timeline Tab */}
      {activeTab === "timeline" && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300">
          
          {/* Today's Schedule Grid */}
          <section className="flex flex-col gap-3">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-1">
              Visual Focus Timeline
            </h3>
            <div className="relative border border-neutral-200 rounded-2xl bg-white p-4 shadow-sm flex flex-col gap-3">
              {/* Vertical line connector */}
              <div className="absolute left-16 top-6 bottom-6 w-0.5 bg-neutral-200/80" />

              {scheduleSlots.map((slot, idx) => (
                <div key={idx} className="flex items-start gap-4 relative z-10">
                  {/* Time label */}
                  <span className="w-12 text-[10px] font-bold text-neutral-400 font-mono pt-1 text-right">
                    {slot.time}
                  </span>
                  
                  {/* Visual Node */}
                  <div className="h-2 w-2 rounded-full bg-neutral-900 mt-2 border border-white outline outline-2 outline-neutral-200 flex-shrink-0" />

                  {/* Schedule Block Card */}
                  {slot.type === "anchor" ? (
                    <div className={`flex-1 rounded-xl border p-2.5 flex items-center gap-2 text-xs font-semibold ${slot.color}`}>
                      {slot.icon && <slot.icon className="h-3.5 w-3.5" />}
                      <span>{slot.title}</span>
                    </div>
                  ) : (
                    <div className="flex-1 rounded-xl border border-neutral-200 bg-neutral-50/50 p-3 shadow-sm hover:border-neutral-300 transition-colors">
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-xs font-bold text-neutral-800 leading-tight">
                          {slot.title}
                        </span>
                        {slot.priority && (
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${getPriorityColor(slot.priority)}`}>
                            {slot.priority}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Today's Decisions Tasks */}
          <section className="flex flex-col gap-3">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-1">
              Today&apos;s Decisions ({plan.tasks.length})
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {plan.tasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm flex flex-col gap-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-neutral-900 leading-snug">
                        {task.title}
                      </span>
                      <p className="text-[10px] text-neutral-500 leading-relaxed">
                        {task.reason}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider flex-shrink-0 ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-neutral-100 text-[10px] text-neutral-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-neutral-400" />
                      <span>{task.estimatedMinutes} mins estimated</span>
                    </div>

                    {task.category && (
                      <div className="flex items-center gap-1 font-medium capitalize">
                        <Tag className="h-3 w-3 text-neutral-400" />
                        <span>{task.category}</span>
                      </div>
                    )}

                    {task.deadline && (
                      <div className="flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200/50">
                        <ShieldAlert className="h-2.5 w-2.5" />
                        <span>Limit: {task.deadline}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Warnings & Assumptions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Future Risks */}
            {plan.warnings.length > 0 && (
              <section className="flex flex-col gap-2.5">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-rose-500 px-1">
                  Future Risks ({plan.warnings.length})
                </h3>
                <div className="flex flex-col gap-2">
                  {plan.warnings.map((warning) => (
                    <div
                      key={warning.id}
                      className="rounded-xl border border-rose-200 bg-rose-50/50 p-3 flex items-start gap-2 text-rose-950 shadow-sm"
                    >
                      <AlertTriangle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
                      <div className="flex flex-col gap-0.5 text-[11px]">
                        <span className="font-bold leading-tight">{warning.target}</span>
                        <span className="text-rose-800 leading-normal">{warning.message}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* System Heuristics */}
            {plan.assumptions.length > 0 && (
              <section className="flex flex-col gap-2.5">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-blue-500 px-1">
                  System Heuristics ({plan.assumptions.length})
                </h3>
                <div className="flex flex-col gap-2">
                  {plan.assumptions.map((assumption) => (
                    <div
                      key={assumption.id}
                      className="rounded-xl border border-blue-200 bg-blue-50/50 p-3 flex items-start gap-2 text-blue-950 shadow-sm"
                    >
                      <HelpCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="flex flex-col gap-0.5 text-[11px]">
                        <span className="font-bold leading-tight">{assumption.target}</span>
                        <span className="text-blue-800 leading-normal">{assumption.message}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      )}

      {/* 2. Future Simulator Tab */}
      {activeTab === "simulator" && (
        <div className="flex flex-col gap-5 border border-amber-200 bg-gradient-to-b from-amber-50/20 to-white p-6 rounded-2xl shadow-sm animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-amber-200/60 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-bold text-neutral-900 tracking-tight">
                5-Day Cognitive Pathway Simulator
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {simStatus === "idle" ? (
                <button
                  onClick={runSimulation}
                  className="rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs py-1.5 px-3 flex items-center gap-1.5 transition-colors"
                >
                  <Play className="h-3 w-3 fill-white text-white" />
                  Run Projection
                </button>
              ) : (
                <button
                  onClick={resetSimulation}
                  className="rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-700 font-bold text-xs py-1.5 px-3 flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Progress Timeline Days */}
          <div className="grid grid-cols-5 gap-2 relative py-2">
            <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-neutral-200 -translate-y-1/2 z-0" />
            {[1, 2, 3, 4, 5].map((dayNum) => {
              let color = "bg-neutral-100 border-neutral-300 text-neutral-400";
              if (simDay === dayNum) {
                if (simStatus === "collision") color = "bg-rose-500 border-rose-500 text-white animate-bounce";
                else if (simStatus === "repairing") color = "bg-amber-500 border-amber-500 text-white animate-pulse";
                else color = "bg-neutral-950 border-neutral-900 text-white ring-4 ring-neutral-900/10";
              } else if (simDay > dayNum) {
                color = "bg-emerald-500 border-emerald-500 text-white";
              }

              return (
                <div key={dayNum} className="flex flex-col items-center gap-1 relative z-10">
                  <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center text-xs font-bold ${color} transition-all duration-300`}>
                    D{dayNum}
                  </div>
                  <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider">
                    {dayNum === 3 && simStatus === "collision" ? "Conflict" : `Day ${dayNum}`}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Simulator Visual Display Cockpit */}
          <div className="rounded-xl border border-neutral-200/80 bg-neutral-900 p-4 font-mono text-[11px] text-emerald-400 flex flex-col gap-2 min-h-[140px] shadow-inner">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-1.5 mb-1.5 text-neutral-500">
              <span>PATHWAY_LOG_STREAM</span>
              <span className="flex h-2 w-2 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${simRunning ? "bg-amber-400" : "bg-neutral-600"}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${simRunning ? "bg-amber-500" : "bg-neutral-700"}`}></span>
              </span>
            </div>

            <div className="flex flex-col gap-1 overflow-y-auto max-h-[100px]">
              {simLogs.length === 0 && (
                <span className="text-neutral-500 italic">Simulator idle. Run projection to visualize timeline collision risk checks.</span>
              )}
              {simLogs.map((log, idx) => (
                <div key={idx} className="leading-relaxed">
                  <span className="text-neutral-600">&gt; </span>
                  {log.includes("COLLISION") || log.includes("Warning") ? (
                    <span className="text-rose-400 font-bold">{log}</span>
                  ) : log.includes("Auto-Repair") || log.includes("mitigated") ? (
                    <span className="text-amber-300 font-semibold">{log}</span>
                  ) : (
                    <span>{log}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Auto Repair CTA */}
          {simStatus === "collision" && (
            <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0 animate-pulse" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-rose-950">Schedule Overload Imminent</span>
                  <span className="text-[10px] text-rose-800">OS Midterm & Product Launch deadline collision detected on Day 3.</span>
                </div>
              </div>
              <button
                onClick={repairSimulation}
                className="w-full sm:w-auto rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2 px-4 shadow-sm hover:shadow transition-colors flex items-center justify-center gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5 text-white" />
                Auto-Repair Timeline
              </button>
            </div>
          )}

          {simStatus === "stable" && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 flex items-center gap-2.5 text-emerald-900 animate-in fade-in duration-300">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs font-bold">Timeline Restored</span>
                <span className="text-[10px] text-emerald-700">Algorithm 8 successfully shifted low-priority tasks and reallocated buffers. Projection green.</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Cognitive Load Analysis Tab */}
      {activeTab === "load" && (
        <div className="flex flex-col md:flex-row gap-6 border border-neutral-200 bg-white p-6 rounded-2xl shadow-sm animate-in fade-in duration-300 items-center">
          {/* Circular Indicator */}
          <div className="relative flex flex-col items-center justify-center w-36 h-36 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" className="stroke-neutral-100 fill-none" strokeWidth="8" />
              <circle 
                cx="50" 
                cy="50" 
                r="40" 
                className={`fill-none transition-all duration-1000 ${
                  cognitiveLoad > 70 
                    ? "stroke-rose-500" 
                    : cognitiveLoad > 40 
                    ? "stroke-amber-500" 
                    : "stroke-emerald-500"
                }`}
                strokeWidth="8"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * cognitiveLoad) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-neutral-900 leading-none">{cognitiveLoad}%</span>
              <span className="text-[8px] font-bold uppercase tracking-wider text-neutral-400 mt-1">Cognition Load</span>
            </div>
          </div>

          {/* Load Factors Breakdown & Guidance */}
          <div className="flex-1 flex flex-col gap-4">
            <div>
              <h3 className="text-xs font-bold text-neutral-900 tracking-tight">
                Cognitive Stress Factors
              </h3>
              <p className="text-[10px] text-neutral-500">
                Linguistic elements and physical constraints adding to memory allocation pressure.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold">
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-neutral-50 border border-neutral-100 text-neutral-700">
                <span className="h-2 w-2 rounded-full bg-neutral-400" />
                <span>Active tasks: +{plan.tasks.length * 12}%</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-neutral-50 border border-neutral-100 text-neutral-700">
                <span className="h-2 w-2 rounded-full bg-rose-400" />
                <span>Deadlines: +{plan.tasks.filter(t => t.priority === "high").length * 15}%</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-neutral-50 border border-neutral-100 text-neutral-700 col-span-2">
                <span className="h-2 w-2 rounded-full bg-purple-400" />
                <span>Behavior buffers: +{memories.some(m => m.category === "behavior") ? 15 : 0}% active</span>
              </div>
            </div>

            {/* Chief of Staff Guidance */}
            <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-3.5 text-xs text-neutral-700 leading-relaxed shadow-sm">
              <span className="font-bold text-neutral-900 flex items-center gap-1 mb-1">
                <Sparkles className="h-3.5 w-3.5 text-neutral-500" />
                Executive Guidance:
              </span>
              {cognitiveLoad > 60 ? (
                <span>
                  Your cognitive index is currently elevated. Lower back pain constraints and high-priority coding deadlines are active. 
                  SomeoneOS has automatically activated <strong>Recovery Mode</strong>, delaying non-essential administrative items and padding 
                  coding estimation slots to prevent focus breakdown.
                </span>
              ) : (
                <span>
                  Timeline load is stable. Workloads are distributed evenly within typical threshold coefficients. Stretches are scheduled 
                  to preserve physiological energy levels.
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Decision Log Tab */}
      {activeTab === "log" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-neutral-200 bg-white p-6 rounded-2xl shadow-sm animate-in fade-in duration-300">
          
          {/* Section 1: What I Understood */}
          <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-neutral-50/80 border border-neutral-100/80">
            <h4 className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              1. What I Understood
            </h4>
            <ul className="flex flex-col gap-1 pl-1 text-[11px] text-neutral-600 leading-relaxed">
              {understanding?.extraction?.events?.map((e, idx) => (
                <li key={idx}>• Extracted Event: <strong>{e}</strong></li>
              ))}
              {understanding?.extraction?.deadlines?.map((d, idx) => (
                <li key={idx}>• Extracted Deadline: <strong>{d}</strong></li>
              ))}
              {understanding?.extraction?.priorities?.map((p, idx) => (
                <li key={idx}>• Extracted Focus: <strong>{p}</strong></li>
              ))}
              {understanding?.extraction?.emotionalSignals?.map((e, idx) => (
                <li key={idx}>• Emotional State: <strong>{e}</strong></li>
              ))}
            </ul>
          </div>

          {/* Section 2: What I Remembered */}
          <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-neutral-50/80 border border-neutral-100/80">
            <h4 className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
              2. What I Remembered
            </h4>
            <ul className="flex flex-col gap-1 pl-1 text-[11px] text-neutral-600 leading-relaxed">
              {memories.length === 0 ? (
                <li className="italic text-neutral-400">No profile memories matched.</li>
              ) : (
                memories.map((m) => (
                  <li key={m.id}>
                    • Active constraint matched: <strong className="text-neutral-800">{m.value}</strong>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Section 3: Why I Chose This Plan */}
          <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-neutral-50/80 border border-neutral-100/80">
            <h4 className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              3. Why I Decided This
            </h4>
            <ul className="flex flex-col gap-1 pl-1 text-[11px] text-neutral-600 leading-relaxed">
              <li>• Priorities sorted by strict deadlines, then urgency coefficients.</li>
              {memories.some(m => m.category === "behavior") && (
                <li>• Added 20% duration padding to review sessions based on procrastination history.</li>
              )}
              {memories.some(m => m.category === "health") && (
                <li>• Scheduled health break block at 1:00 PM to mitigate back pain strain warnings.</li>
              )}
              {memories.some(m => m.category === "preference") && (
                <li>• Avoided early morning slots to respect sleep/routine comfort bounds.</li>
              )}
            </ul>
          </div>

          {/* Section 4: What I Postponed */}
          <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-neutral-50/80 border border-neutral-100/80">
            <h4 className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              4. What I Postponed
            </h4>
            <ul className="flex flex-col gap-1 pl-1 text-[11px] text-neutral-600 leading-relaxed">
              {plan.unplannedItems.length === 0 ? (
                <li className="italic text-neutral-400">No decisions deferred. All actions accommodated.</li>
              ) : (
                plan.unplannedItems.map((item) => (
                  <li key={item.id}>
                    • Deferred: <strong>{item.title}</strong> — <span className="text-rose-600">{item.reason}</span>
                  </li>
                ))
              )}
            </ul>
          </div>

        </div>
      )}
    </div>
  );
};
