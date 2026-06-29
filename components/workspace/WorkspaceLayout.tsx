"use client";

import React, { useState } from "react";
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
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export const WorkspaceLayout: React.FC = () => {
  const [latestBrainDump, setLatestBrainDump] = useState<string>("");
  const [result, setResult] = useState<SomeoneOSResult | null>(null);
  const { understanding, isExtracting, error, extract, clearError } = useExtraction();

  const executionState: ExecutionState = {
    understanding: isExtracting
      ? "Processing..."
      : understanding
      ? "Completed"
      : error
      ? "Failed"
      : "Waiting...",
    planning: result?.plan ? "Completed" : "Waiting...",
    calendar: "Waiting...",
    research: "Waiting...",
  };

  const handleBrainDumpSubmit = async (content: string) => {
    setLatestBrainDump(content);
    setResult(null);
    await extract(content);
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
    const res = runSomeoneOS(payload);
    setResult(res);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar (Memory) - 20% width (3 of 12 cols) */}
        <div className="lg:col-span-3 xl:col-span-3">
          <MemorySidebar />
        </div>

        {/* Center Area (Brain Dump) - 60% width (6 of 12 cols) */}
        <div className="lg:col-span-6 xl:col-span-6 flex flex-col gap-6">
          <BrainDumpInput
            onSubmitBrainDump={handleBrainDumpSubmit}
            isLoading={isExtracting}
          />

          {/* Friendly Error Banner with Retry */}
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
          <ExecutionPreview plan={result?.plan ?? null} />
        </div>

        {/* Right Sidebar (Execution Status) - 20% width (3 of 12 cols) */}
        <div className="lg:col-span-3 xl:col-span-3">
          <ExecutionSidebar state={executionState} />
        </div>
      </div>
    </div>
  );
};

