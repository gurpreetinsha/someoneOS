"use client";

import { useState, useCallback } from "react";
import { ExtractionResult } from "@/types/extraction";
import { UnderstandingResult } from "@/types/understanding";

export const useExtraction = () => {
  const [extraction, setExtraction] = useState<ExtractionResult | null>(null);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const extract = useCallback(async (text: string): Promise<ExtractionResult | null> => {
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

      const data: UnderstandingResult | ExtractionResult = await response.json();
      const extractionResult: ExtractionResult = "extraction" in data ? data.extraction : data;
      setExtraction(extractionResult);
      return extractionResult;
    } catch (err: any) {
      const msg = err.message || "An error occurred while communicating with Gemini.";
      setError(msg);
      return null;
    } finally {
      setIsExtracting(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    extraction,
    isExtracting,
    error,
    extract,
    clearError,
  };
};
