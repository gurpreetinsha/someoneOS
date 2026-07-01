import { UnderstandingResult } from "@/types/understanding";
import { MemoryExtractionResult, MemoryItem } from "@/lib/memory/types/memory";
import { PlanResult } from "@/lib/planner/types/planner";
import { extractMemory } from "@/lib/memory/memoryEngine";
import { createPlan } from "@/lib/planner/planner";
import { buildPlanningContext } from "@/lib/domain/normalizer";
import { calculateFailurePrediction, FailurePredictionResult } from "./failurePrediction";
import { generateNegotiation, ScheduleNegotiationResult } from "./scheduleNegotiator";

export interface SomeoneOSInput {
  understanding: UnderstandingResult;
  clarificationAnswers: Record<string, string>;
  historicalMemories?: MemoryItem[];
}

export interface SomeoneOSResult {
  understanding: UnderstandingResult;
  memory: MemoryExtractionResult;
  plan: PlanResult;
  failurePrediction?: FailurePredictionResult;
  negotiation?: ScheduleNegotiationResult;
}

/**
 * Main domain orchestrator for SomeoneOS.
 * Executes processing stages sequentially as a pure function.
 */
export function runSomeoneOS(input: SomeoneOSInput): SomeoneOSResult {
  // Stage 1: Memory Extraction
  const currentMemory = extractMemory(input.understanding);

  // Merge historical and new memories
  const allMemories = [...(input.historicalMemories || [])];
  const memoryMap = new Map<string, MemoryItem>();
  for (const m of allMemories) {
    memoryMap.set(m.id, m);
  }
  for (const m of currentMemory.memories) {
    const existing = memoryMap.get(m.id);
    if (!existing || m.confidence > existing.confidence) {
      memoryMap.set(m.id, m);
    }
  }
  const mergedMemories = Array.from(memoryMap.values());
  const memory: MemoryExtractionResult = {
    memories: mergedMemories,
    extractedCount: mergedMemories.length,
    timestamp: new Date().toISOString(),
  };

  // Stage 1.5: Build Upstream Domain PlanningContext
  const context = buildPlanningContext({
    understanding: input.understanding,
    memory,
    clarificationAnswers: input.clarificationAnswers,
  });

  // Stage 2: Planner Engine (Consumes PlanningContext only)
  const plan = createPlan(context);

  // Stage 2.5: Failure Prediction Engine
  const failurePrediction = calculateFailurePrediction(context, plan, input.clarificationAnswers);

  // Stage 2.7: AI Schedule Negotiator
  const negotiation = generateNegotiation(context, plan, failurePrediction);

  // Stage 3: Calendar (Extension point for future integration)
  // Stage 4: Execution (Extension point for future integration)
  // Stage 5: Research (Extension point for future integration)
  // Stage 6: Notifications (Extension point for future integration)

  return {
    understanding: input.understanding,
    memory,
    plan,
    failurePrediction,
    negotiation,
  };
}

