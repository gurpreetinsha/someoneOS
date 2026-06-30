"use client";

import React, { useState } from "react";
import { UnderstandingResult } from "@/types/understanding";
import { Button } from "@/components/ui/button";
import { HelpCircle, ArrowRight } from "lucide-react";

interface ClarificationPanelProps {
  understanding: UnderstandingResult | null;
  onContinue: (payload: {
    understanding: UnderstandingResult;
    clarificationAnswers: Record<string, string>;
  }) => void;
}

export const ClarificationPanel: React.FC<ClarificationPanelProps> = ({
  understanding,
  onContinue,
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  if (!understanding || !understanding.clarification?.requiresClarification) {
    return null;
  }

  const questions = understanding.clarification.questions || [];
  if (questions.length === 0) {
    return null;
  }

  const handleInputChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const isComplete = questions.every(
    (q) => answers[q.id] && answers[q.id].trim().length > 0
  );

  const handleContinue = () => {
    if (!isComplete) return;
    const payload = {
      understanding,
      clarificationAnswers: answers,
    };
    onContinue(payload);
  };

  return (
    <div className="w-full flex flex-col gap-5 border border-amber-200/80 bg-gradient-to-b from-amber-50/40 to-white/70 backdrop-blur-md p-6 rounded-3xl shadow-sm animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div className="flex items-center gap-2.5 border-b border-amber-200/60 pb-3">
        <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
          <HelpCircle className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-neutral-900 tracking-tight">
            Clarification Needed
          </h2>
          <p className="text-xs text-neutral-500">
            Please answer these questions to help finalize your plan.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {questions.map((q) => (
          <div key={q.id} className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-neutral-800 leading-snug">
              {q.question}
            </label>
            {q.reason && (
              <p className="text-[11px] text-neutral-500 leading-relaxed italic">
                {q.reason}
              </p>
            )}
            <input
              type="text"
              value={answers[q.id] || ""}
              onChange={(e) => handleInputChange(q.id, e.target.value)}
              placeholder="Type your answer here..."
              className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 transition-colors"
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-2 border-t border-amber-100">
        <Button
          onClick={handleContinue}
          disabled={!isComplete}
          className="rounded-xl px-5 text-xs font-semibold shadow-sm flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <span>Continue Planning</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};
