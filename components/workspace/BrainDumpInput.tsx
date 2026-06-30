"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";

interface BrainDumpInputProps {
  onSubmitBrainDump: (content: string) => void;
  isLoading?: boolean;
}

const DEFAULT_PLACEHOLDER = `I have exams Wednesday...
Mom is visiting Saturday...
Hackathon submission Sunday...
Interview this week...
Don't ruin my morning gym...`;

const CONTEXTUAL_LOAD_MESSAGES = [
  "Parsing cognitive load stream...",
  "Analyzing task vectors and priority anchors...",
  "Synchronizing constraints with memory bank...",
  "Resolving potential schedule collisions...",
  "Calibrating focus-switching thresholds...",
  "Synthesizing optimal daily pathway..."
];

export const BrainDumpInput: React.FC<BrainDumpInputProps> = ({
  onSubmitBrainDump,
  isLoading = false,
}) => {
  const [text, setText] = useState("");
  const [messageIdx, setMessageIdx] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setMessageIdx(0);
      return;
    }
    const interval = setInterval(() => {
      setMessageIdx((prev) => (prev + 1) % CONTEXTUAL_LOAD_MESSAGES.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;
    onSubmitBrainDump(text);
  };

  return (
    <div className="w-full rounded-2xl border border-neutral-200/80 bg-white p-6 sm:p-8 shadow-sm backdrop-blur-xl">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
          What&apos;s on your mind?
        </h1>
        <p className="mt-1 text-sm text-neutral-500 font-normal">
          Dump everything you&apos;re thinking. Don&apos;t organize it.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="relative rounded-xl border border-neutral-200 bg-neutral-50/50 p-3 transition-all focus-within:border-neutral-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-neutral-900/5">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={DEFAULT_PLACEHOLDER}
            rows={6}
            disabled={isLoading}
            className="w-full bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none leading-relaxed disabled:opacity-60 resize-y min-h-[120px]"
            aria-label="Brain dump text input"
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            size="lg"
            disabled={!text.trim() || isLoading}
            className="rounded-xl px-6 py-5 text-sm font-medium shadow-sm transition-all hover:shadow-md disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
            aria-label="Build My Week Button"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-neutral-400" />
                <span className="animate-pulse">{CONTEXTUAL_LOAD_MESSAGES[messageIdx]}</span>
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4 text-neutral-200" />
                Build My Week
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

