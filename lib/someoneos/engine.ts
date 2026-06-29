import { UnderstandingResult } from "@/types/understanding";
import { MemoryExtractionResult } from "@/lib/memory/types/memory";
import { PlanResult } from "@/lib/planner/types/planner";
import { extractMemory } from "@/lib/memory/memoryEngine";
import { createPlan } from "@/lib/planner/planner";

export interface SomeoneOSInput {
  understanding: UnderstandingResult;
  clarificationAnswers: Record<string, string>;
}

export interface SomeoneOSResult {
  understanding: UnderstandingResult;
  memory: MemoryExtractionResult;
  plan: PlanResult;
}

/**
 * Main domain orchestrator for SomeoneOS.
 * Executes processing stages sequentially as a pure function.
 */
export function runSomeoneOS(input: SomeoneOSInput): SomeoneOSResult {
  // Stage 1: Memory Extraction
  const memory = extractMemory(input.understanding);

  // Stage 2: Planner Engine
  const plan = createPlan({
    understanding: input.understanding,
    memory,
    clarificationAnswers: input.clarificationAnswers,
  });

  // Stage 3: Calendar (Extension point for future integration)
  // Stage 4: Execution (Extension point for future integration)
  // Stage 5: Research (Extension point for future integration)
  // Stage 6: Notifications (Extension point for future integration)

  return {
    understanding: input.understanding,
    memory,
    plan,
  };
}
