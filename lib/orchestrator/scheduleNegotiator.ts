import { PlanningContext } from "../domain/types";
import { PlanResult } from "../planner/types/planner";
import { calculateFailurePrediction, FailurePredictionResult } from "./failurePrediction";
import { createPlan } from "../planner/planner";

export interface ScheduleStrategy {
  id: "A" | "B" | "C";
  title: string;
  successProbability: number;
  cognitiveLoad: number;
  tradeoffs: string;
  explanation: string;
  plan: PlanResult;
  failurePrediction: FailurePredictionResult;
}

export interface ScheduleNegotiationResult {
  strategies: {
    A: ScheduleStrategy;
    B: ScheduleStrategy;
    C: ScheduleStrategy;
  };
  recommendedId: "A" | "B" | "C";
  recommendationReason: string;
  overloadDetected: boolean;
}

function calculateCognitiveLoad(plan: PlanResult, context: PlanningContext): number {
  let load = 0;
  load += plan.tasks.length * 12;
  load += plan.tasks.filter((t) => t.priority === "high").length * 15;
  load += plan.warnings.length * 18;
  if (context.healthFactors.length > 0) load += 20;
  if (context.behaviorFactors.length > 0) load += 15;
  return Math.min(load, 100);
}

export function detectScheduleOverload(
  context: PlanningContext,
  plan: PlanResult,
  failurePrediction: FailurePredictionResult
): boolean {
  const totalMinutes = plan.tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);
  const highPriorityTasks = plan.tasks.filter((t) => t.priority === "high");
  const deadlineTasks = plan.tasks.filter((t) => t.deadline);
  const load = calculateCognitiveLoad(plan, context);

  return (
    plan.tasks.length >= 3 ||
    totalMinutes >= 240 ||
    highPriorityTasks.length >= 2 ||
    deadlineTasks.length >= 2 ||
    failurePrediction.failureRisk >= 40 ||
    load >= 50 ||
    plan.warnings.length > 0
  );
}

export function generateNegotiation(
  context: PlanningContext,
  baselinePlan: PlanResult,
  baselineFp: FailurePredictionResult
): ScheduleNegotiationResult {
  const overloadDetected = detectScheduleOverload(context, baselinePlan, baselineFp);

  // --- STRATEGY A: AGGRESSIVE EXECUTION (Push Through) ---
  // Ignore health guidelines and behavior buffers to squeeze everything today.
  const contextA: PlanningContext = {
    ...context,
    healthFactors: [],
    behaviorFactors: [],
  };
  const planA = createPlan(contextA);
  const fpA = calculateFailurePrediction(contextA, planA);
  
  // Custom adjustments for Strategy A profile:
  const loadA = Math.min(calculateCognitiveLoad(planA, context) + 15, 95);
  const successA = Math.max(fpA.successProbability - 20, 35);
  const strategyA: ScheduleStrategy = {
    id: "A",
    title: "Aggressive Sprint (Push Through)",
    successProbability: successA,
    cognitiveLoad: loadA,
    tradeoffs: "Bypasses health recovery buffers and ignores procrastination multipliers. Forces 100% task inclusion.",
    explanation: "Forces all tasks into a single sequential timeline. Use only if missing a low-priority task carries extreme penalties and you are willing to risk burnout.",
    plan: planA,
    failurePrediction: {
      ...fpA,
      successProbability: successA,
      failureRisk: 100 - successA,
      riskLevel: 100 - successA >= 60 ? "High" : "Medium",
    },
  };

  // --- STRATEGY B: SUSTAINED VELOCITY (Balanced Shielding) ---
  // Defer Low priority items. Keep routines, health breaks, and behavior buffers active.
  const actionableItemsB = context.actionableItems.filter((t) => t.priority !== "low");
  const deferredItemsB = context.actionableItems.filter((t) => t.priority === "low");

  const contextB: PlanningContext = {
    ...context,
    actionableItems: actionableItemsB,
  };
  const planB = createPlan(contextB);
  
  // Inject deferred tasks into unplanned items list
  planB.unplannedItems = [
    ...planB.unplannedItems,
    ...deferredItemsB.map((t) => ({
      id: `defer_${t.id}`,
      title: t.title,
      reason: "Deferred to tomorrow to preserve focus buffers.",
    })),
  ];

  if (deferredItemsB.length > 0) {
    planB.assumptions.push({
      id: "assump_negotiator_defer_low",
      target: "Schedule Optimization",
      message: `Postponed ${deferredItemsB.length} low-priority task(s) to guarantee deadline safety.`,
    });
  }

  const fpB = calculateFailurePrediction(contextB, planB);
  const loadB = calculateCognitiveLoad(planB, contextB);
  const successB = Math.min(fpB.successProbability + 5, 88);
  const strategyB: ScheduleStrategy = {
    id: "B",
    title: "Adaptive Shielding (Sustained Velocity)",
    successProbability: successB,
    cognitiveLoad: loadB,
    tradeoffs: "Postpones low-priority work to protect focus buffers. Maintains physiological pacing breaks.",
    explanation: "Leverages routine and health memories to partition work. Defers low-urgency items, securing a highly reliable completion rate for core commitments.",
    plan: planB,
    failurePrediction: {
      ...fpB,
      successProbability: successB,
      failureRisk: 100 - successB,
      riskLevel: 100 - successB < 30 ? "Low" : "Medium",
    },
  };

  // --- STRATEGY C: CRITICAL PATH ISOLATION (Defensive Deferral) ---
  // Schedule ONLY High-priority items or those with deadlines. Apply additional safety buffer.
  const actionableItemsC = context.actionableItems.filter((t) => t.priority === "high" || t.deadline);
  const deferredItemsC = context.actionableItems.filter((t) => t.priority !== "high" && !t.deadline);

  const contextC: PlanningContext = {
    ...context,
    actionableItems: actionableItemsC.map((t) => ({
      ...t,
      estimatedMinutes: Math.round(t.estimatedMinutes * 1.2), // Additional 20% defensive safety padding
    })),
  };
  const planC = createPlan(contextC);
  
  // Inject deferred tasks into unplanned items list
  planC.unplannedItems = [
    ...planC.unplannedItems,
    ...deferredItemsC.map((t) => ({
      id: `defer_${t.id}`,
      title: t.title,
      reason: "Deferred to isolate high-priority critical path deadlines.",
    })),
  ];

  if (deferredItemsC.length > 0) {
    planC.assumptions.push({
      id: "assump_negotiator_defer_c",
      target: "Critical Path Shielding",
      message: `Deferred ${deferredItemsC.length} non-critical task(s) to guarantee zero failure of deadlines.`,
    });
  }

  const fpC = calculateFailurePrediction(contextC, planC);
  const loadC = Math.max(calculateCognitiveLoad(planC, contextC) - 10, 25);
  const successC = Math.min(fpC.successProbability + 15, 96);
  const strategyC: ScheduleStrategy = {
    id: "C",
    title: "Critical Path Isolation (Defensive Deferral)",
    successProbability: successC,
    cognitiveLoad: loadC,
    tradeoffs: "Defers all medium and low-priority tasks. Zero focus-switching allowed today.",
    explanation: "Minimizes schedule surface area to the absolute essentials. Recommended when schedule pressure is extreme or failure probability is unacceptably high.",
    plan: planC,
    failurePrediction: {
      ...fpC,
      successProbability: successC,
      failureRisk: 100 - successC,
      riskLevel: "Low",
    },
  };

  // --- RECOMMENDATION ENGINE ---
  // Recommend Strategy C if baseline risk is high. Otherwise recommend Strategy B.
  let recommendedId: "A" | "B" | "C" = "B";
  let recommendationReason = "Recommended Strategy B (Adaptive Shielding) as it balances task throughput with healthy cognitive pacing and memory buffers.";

  if (baselineFp.riskLevel === "High" || baselineFp.failureRisk >= 50) {
    recommendedId = "C";
    recommendationReason = "High baseline failure risk detected. Recommended Strategy C (Critical Path Isolation) to secure critical deadlines under a low cognitive load.";
  }

  return {
    strategies: {
      A: strategyA,
      B: strategyB,
      C: strategyC,
    },
    recommendedId,
    recommendationReason,
    overloadDetected,
  };
}
