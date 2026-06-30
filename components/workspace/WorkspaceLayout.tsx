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
  const [selectedStrategyId, setSelectedStrategyId] = useState<"A" | "B" | "C" | null>(null);
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
          reason: "Extracted from calendar synchronization logs",
        },
        {
          id: "mem_preference_hate_early",
          category: "preference",
          value: "Avoid tasks during early morning hours",
          confidence: 0.95,
          reason: "Learned from historical task delay patterns",
        },
        {
          id: "mem_health_back_pain",
          category: "health",
          value: "Chronic lower back stiffness (requires movement breaks)",
          confidence: 0.95,
          reason: "Self-reported in physical health profile settings",
        },
        {
          id: "mem_behavior_procrastinate",
          category: "behavior",
          value: "Tends to procrastinate on coding features (+20% buffer)",
          confidence: 0.95,
          reason: "Calibrated from task completion velocity metrics",
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
    setSelectedStrategyId(null);
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

      if (res.negotiation?.overloadDetected) {
        setSelectedStrategyId(res.negotiation.recommendedId);
      }
    }
  };

  const handleRetry = async () => {
    if (latestBrainDump) {
      clearError();
      setResult(null);
      setSelectedStrategyId(null);
      await extract(latestBrainDump);
    }
  };

  const handleContinuePlanning = (payload: {
    understanding: UnderstandingResult;
    clarificationAnswers: Record<string, string>;
  }) => {
    setSelectedStrategyId(null);
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

    if (res.negotiation?.overloadDetected) {
      setSelectedStrategyId(res.negotiation.recommendedId);
    }
  };

  const clearMemoryBank = () => {
    localStorage.removeItem("someoneos_memories");
    setHistoricalMemories([]);
    setResult(null);
    setSelectedStrategyId(null);
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

  const baseCognitiveLoad = calculateCognitiveLoad();

  const activePlan = result?.negotiation?.overloadDetected && selectedStrategyId
    ? result.negotiation.strategies[selectedStrategyId].plan
    : result?.plan ?? null;

  const activeFailurePrediction = result?.negotiation?.overloadDetected && selectedStrategyId
    ? result.negotiation.strategies[selectedStrategyId].failurePrediction
    : result?.failurePrediction ?? null;

  const activeCognitiveLoad = result?.negotiation?.overloadDetected && selectedStrategyId
    ? result.negotiation.strategies[selectedStrategyId].cognitiveLoad
    : baseCognitiveLoad;

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
        <div className="lg:col-span-3 xl:col-span-3 flex flex-col gap-4 order-2 lg:order-1">
          <MemorySidebar memories={historicalMemories} />
          {historicalMemories.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearMemoryBank}
              className="text-[11px] text-neutral-400 hover:text-rose-600 rounded-xl py-1 transition-colors flex items-center justify-center gap-1.5 border border-neutral-100 hover:border-rose-100"
              aria-label="Reset memory bank"
            >
              <Trash2 className="h-3 w-3" />
              Reset Memory Bank
            </Button>
          )}
        </div>

        {/* Center Column - Interactive Cockpit */}
        <div className="lg:col-span-6 xl:col-span-6 flex flex-col gap-6 order-1 lg:order-2">
          <BrainDumpInput
            onSubmitBrainDump={handleBrainDumpSubmit}
            isLoading={isExtracting}
          />

          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/90 p-5 flex flex-col gap-3.5 text-rose-950 shadow-sm animate-in fade-in duration-300">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 flex flex-col gap-1.5">
                    <h3 className="text-[11px] font-black uppercase tracking-wider text-rose-800">
                      Engine Processing Failure
                    </h3>
                    {error.includes("GEMINI_API_KEY") ? (
                      <div className="text-xs flex flex-col gap-2 font-medium">
                        <p>
                          <strong>API Configuration Missing:</strong> SomeoneOS was unable to reach Gemini because the API Key is not configured on the server.
                        </p>
                        <div className="bg-rose-100/50 rounded-xl p-3 border border-rose-200/60 font-mono text-[10px] leading-relaxed text-rose-900">
                          <div className="font-bold mb-1">To resolve this:</div>
                          1. Create a <code className="bg-rose-200/50 px-1 rounded font-bold">.env.local</code> file in your project root.<br />
                          2. Add: <code className="bg-rose-200/50 px-1 rounded font-bold">GEMINI_API_KEY=AIzaSy...</code><br />
                          3. Restart the Next.js dev server (<code className="bg-rose-200/50 px-1 rounded font-bold">npm run dev</code>).
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs font-semibold leading-relaxed">
                        {error}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRetry}
                  disabled={isExtracting}
                  className="bg-white border-rose-200 text-rose-700 hover:bg-rose-100 hover:text-rose-800 hover:scale-[1.02] active:scale-[0.98] transition-all flex-shrink-0 text-xs rounded-xl shadow-sm px-3.5 py-1.5 h-auto self-start"
                  aria-label="Retry extraction"
                >
                  <RefreshCw className={`h-3 w-3 mr-1.5 ${isExtracting ? "animate-spin" : ""}`} />
                  Retry
                </Button>
              </div>
            </div>
          )}

          <LatestBrainDump content={latestBrainDump} />
          <AiUnderstandingView data={understanding?.extraction ?? null} />
          
          <ClarificationPanel
            understanding={understanding}
            onContinue={handleContinuePlanning}
          />
          
          <ExecutionPreview 
            plan={activePlan} 
            understanding={result?.understanding ?? null}
            memories={historicalMemories}
            cognitiveLoad={activeCognitiveLoad}
            failurePrediction={activeFailurePrediction}
            selectedStrategyId={selectedStrategyId}
            onSelectStrategy={setSelectedStrategyId}
            negotiation={result?.negotiation ?? null}
          />
        </div>

        {/* Right Column - Cognition Monitor */}
        <div className="lg:col-span-3 xl:col-span-3 order-3 lg:order-3">
          <ExecutionSidebar 
            state={executionState} 
            cognitiveLoad={activeCognitiveLoad}
            warningsCount={activePlan?.warnings?.length ?? 0}
            assumptionsCount={activePlan?.assumptions?.length ?? 0}
            hasHealthFactor={historicalMemories.some(m => m.category === "health")}
          />
        </div>
      </div>
    </div>
  );
};

