"use client";

import React, { useState, useEffect } from "react";
import { MemorySidebar } from "./MemorySidebar";
import { BrainDumpInput } from "./BrainDumpInput";
import { LatestBrainDump } from "./LatestBrainDump";
import { AiUnderstandingView } from "./AiUnderstandingView";
import { ClarificationPanel } from "./ClarificationPanel";
import { ExecutionPreview } from "./ExecutionPreview";
import { ExecutionSidebar } from "./ExecutionSidebar";
import { useExtraction } from "@/hooks/useExtraction";
import { ExecutionState } from "@/types/extraction";
import { UnderstandingResult } from "@/types/understanding";
import { runSomeoneOS, SomeoneOSResult } from "@/lib/someoneos/engine";
import { MemoryItem } from "@/lib/memory/types/memory";
import { useAuth } from "@/lib/auth";
import { AlertCircle, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const WorkspaceLayout: React.FC = () => {
  const [latestBrainDump, setLatestBrainDump] = useState<string>("");
  const [result, setResult] = useState<SomeoneOSResult | null>(null);
  const [historicalMemories, setHistoricalMemories] = useState<MemoryItem[]>([]);
  const { understanding, isExtracting, error, extract, clearError } = useExtraction();
  const { user } = useAuth();

  // Load and pre-seed memories
  useEffect(() => {
    const saved = localStorage.getItem("someoneos_memories");
    if (saved) {
      try {
        setHistoricalMemories(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    } else if (user?.uid === "hackathon-demo-user") {
      const mockMemories: MemoryItem[] = [
        {
          id: "mem_routine_drop_kids",
          category: "routine",
          value: "Drop kids at school every morning at 8:00 AM",
          confidence: 0.95,
          reason: "Demo pre-seed",
        },
        {
          id: "mem_preference_hate_early",
          category: "preference",
          value: "Avoid tasks during early morning hours",
          confidence: 0.95,
          reason: "Demo pre-seed",
        },
        {
          id: "mem_health_back_pain",
          category: "health",
          value: "Chronic lower back stiffness (requires movement breaks)",
          confidence: 0.95,
          reason: "Demo pre-seed",
        },
        {
          id: "mem_behavior_procrastinate",
          category: "behavior",
          value: "Tends to procrastinate on coding features (+20% buffer)",
          confidence: 0.95,
          reason: "Demo pre-seed",
        },
      ];
      setHistoricalMemories(mockMemories);
      localStorage.setItem("someoneos_memories", JSON.stringify(mockMemories));
    }
  }, [user]);

  const mergeMemories = (existing: MemoryItem[], newMems: MemoryItem[]): MemoryItem[] => {
    const memoryMap = new Map<string, MemoryItem>();
    for (const m of existing) {
      memoryMap.set(m.id, m);
    }
    for (const m of newMems) {
      const prev = memoryMap.get(m.id);
      if (!prev || m.confidence > prev.confidence) {
        memoryMap.set(m.id, m);
      }
    }
    return Array.from(memoryMap.values());
  };

  const handleBrainDumpSubmit = async (content: string) => {
    setLatestBrainDump(content);
    setResult(null);
    const und = await extract(content);
    
    // Auto-run scheduler if no clarifications are required
    if (und && !und.clarification?.requiresClarification) {
      const res = runSomeoneOS({
        understanding: und,
        clarificationAnswers: {},
        historicalMemories,
      });
      setResult(res);

      if (res.memory.memories.length > 0) {
        const merged = mergeMemories(historicalMemories, res.memory.memories);
        setHistoricalMemories(merged);
        localStorage.setItem("someoneos_memories", JSON.stringify(merged));
      }
    }
  };

  const handleRetry = async () => {
    if (latestBrainDump) {
      clearError();
      setResult(null);
      await extract(latestBrainDump);
    }
  };

  const handleContinuePlanning = (payload: {
    understanding: UnderstandingResult;
    clarificationAnswers: Record<string, string>;
  }) => {
    const res = runSomeoneOS({
      ...payload,
      historicalMemories,
    });
    setResult(res);

    if (res.memory.memories.length > 0) {
      const merged = mergeMemories(historicalMemories, res.memory.memories);
      setHistoricalMemories(merged);
      localStorage.setItem("someoneos_memories", JSON.stringify(merged));
    }
  };

  const clearMemoryBank = () => {
    localStorage.removeItem("someoneos_memories");
    setHistoricalMemories([]);
    setResult(null);
  };

  // Calculate dynamic cognitive load score (0 - 100)
  const calculateCognitiveLoad = () => {
    if (!result || !result.plan) return 0;
    let load = 0;
    load += result.plan.tasks.length * 12;
    load += result.plan.tasks.filter((t) => t.priority === "high").length * 15;
    load += result.plan.warnings.length * 18;
    if (historicalMemories.some((m) => m.category === "health")) load += 20;
    if (historicalMemories.some((m) => m.category === "behavior")) load += 15;
    return Math.min(load, 100);
  };

  const cognitiveLoad = calculateCognitiveLoad();

  const executionState: ExecutionState = {
    understanding: isExtracting
      ? "Processing..."
      : result?.understanding
      ? "Completed"
      : error
      ? "Failed"
      : "Waiting...",
    planning: result?.plan ? "Completed" : "Waiting...",
    calendar: result?.plan ? "Completed" : "Waiting...",
    research: result?.plan ? "Completed" : "Waiting...",
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column - What I Know About You */}
        <div className="lg:col-span-3 xl:col-span-3 flex flex-col gap-4">
          <MemorySidebar memories={historicalMemories} />
          {historicalMemories.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearMemoryBank}
              className="text-[11px] text-neutral-400 hover:text-rose-600 rounded-xl py-1 transition-colors flex items-center justify-center gap-1.5 border border-neutral-100 hover:border-rose-100"
            >
              <Trash2 className="h-3 w-3" />
              Reset Memory Bank
            </Button>
          )}
        </div>

        {/* Center Column - Interactive Cockpit */}
        <div className="lg:col-span-6 xl:col-span-6 flex flex-col gap-6">
          <BrainDumpInput
            onSubmitBrainDump={handleBrainDumpSubmit}
            isLoading={isExtracting}
          />

          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4 flex items-center justify-between gap-4 text-rose-900 shadow-sm animate-in fade-in duration-300">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
                <p className="text-xs font-medium leading-normal">
                  {error}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRetry}
                disabled={isExtracting}
                className="bg-white border-rose-200 text-rose-700 hover:bg-rose-100 flex-shrink-0 text-xs rounded-xl"
              >
                <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isExtracting ? "animate-spin" : ""}`} />
                Retry
              </Button>
            </div>
          )}

          <LatestBrainDump content={latestBrainDump} />
          <AiUnderstandingView data={understanding?.extraction ?? null} />
          
          <ClarificationPanel
            understanding={understanding}
            onContinue={handleContinuePlanning}
          />
          
          <ExecutionPreview 
            plan={result?.plan ?? null} 
            understanding={result?.understanding ?? null}
            memories={historicalMemories}
            cognitiveLoad={cognitiveLoad}
            failurePrediction={result?.failurePrediction ?? null}
          />
        </div>

        {/* Right Column - Cognition Monitor */}
        <div className="lg:col-span-3 xl:col-span-3">
          <ExecutionSidebar 
            state={executionState} 
            cognitiveLoad={cognitiveLoad}
            warningsCount={result?.plan?.warnings?.length ?? 0}
            assumptionsCount={result?.plan?.assumptions?.length ?? 0}
            hasHealthFactor={historicalMemories.some(m => m.category === "health")}
          />
        </div>
      </div>
    </div>
  );
};

