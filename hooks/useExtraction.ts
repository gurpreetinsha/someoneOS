"use client";

import { useState, useCallback } from "react";
import { UnderstandingResult } from "@/types/understanding";

export const useExtraction = () => {
  const [understanding, setUnderstanding] = useState<UnderstandingResult | null>(null);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const extract = useCallback(async (text: string): Promise<UnderstandingResult | null> => {
    setIsExtracting(true);
    setError(null);

    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to extract structured understanding.");
      }

      const data = await response.json();
      const understandingResult: UnderstandingResult =
        "extraction" in data && "clarification" in data
          ? (data as UnderstandingResult)
          : {
              extraction: "extraction" in data ? data.extraction : data,
              clarification: { requiresClarification: false, questions: [] },
            };

      setUnderstanding(understandingResult);
      return understandingResult;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred while communicating with Gemini.";
      setError(msg);
      return null;
    } finally {
      setIsExtracting(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    understanding,
    isExtracting,
    error,
    extract,
    clearError,
  };
};

