import { PlanningContext } from "../domain/types";
import { PlanResult } from "../planner/types/planner";

export interface FailurePredictionResult {
  successProbability: number;
  failureRisk: number;
  beforePlanningRisk: number;
  afterPlanningRisk: number;
  plannerImprovement: number;
  riskLevel: "Low" | "Medium" | "High";
  confidenceScore: number;
  topReasons: string[];
  increasedRiskFactors: { factor: string; impact: number }[];
  reducedRiskFactors: { factor: string; impact: number }[];
}

export function calculateFailurePrediction(
  context: PlanningContext,
  plan: PlanResult,
  clarificationAnswers: Record<string, string> = {}
): FailurePredictionResult {
  const increasedRiskFactors: { factor: string; impact: number }[] = [];
  const reducedRiskFactors: { factor: string; impact: number }[] = [];

  // --- 1. RISK FACTOR CALCULATION (Before Planning) ---
  const BASELINE_RISK = 30; // 30% baseline human error / uncertainty

  // Cognitive Load
  let prePlanningCognitiveLoad = 0;
  prePlanningCognitiveLoad += context.actionableItems.length * 12;
  prePlanningCognitiveLoad += context.actionableItems.filter(item => item.priority === "high").length * 15;
  prePlanningCognitiveLoad += context.goals.length * 18;
  if (context.healthFactors.length > 0) prePlanningCognitiveLoad += 20;
  if (context.behaviorFactors.length > 0) prePlanningCognitiveLoad += 15;
  prePlanningCognitiveLoad = Math.min(prePlanningCognitiveLoad, 100);

  const cognitiveLoadImpact = Math.round(prePlanningCognitiveLoad * 0.4);
  if (cognitiveLoadImpact > 0) {
    increasedRiskFactors.push({
      factor: `High cognitive load (Index: ${Math.round(prePlanningCognitiveLoad)})`,
      impact: cognitiveLoadImpact,
    });
  }

  // Abstract Goals
  const abstractGoalsCount = context.goals.length;
  const abstractGoalsImpact = Math.min(abstractGoalsCount * 8, 24);
  if (abstractGoalsImpact > 0) {
    increasedRiskFactors.push({
      factor: `Unplanned goals: ${abstractGoalsCount} abstract objective(s) need actionable breakdown`,
      impact: abstractGoalsImpact,
    });
  }

  // Procrastination Memory
  const procrastinationFactors = context.behaviorFactors.filter(b => 
    /procrastinat|forget|late|distract|struggle/i.test(b.text)
  );
  const procrastinationImpact = Math.min(procrastinationFactors.length * 12, 24);
  if (procrastinationImpact > 0) {
    increasedRiskFactors.push({
      factor: `Procrastination behavior memory active (+20% time multiplier)`,
      impact: procrastinationImpact,
    });
  }

  // Urgent Deadlines
  let urgentDeadlinesCount = 0;
  let generalDeadlinesCount = 0;
  context.actionableItems.forEach(item => {
    if (item.deadline) {
      if (/today|tonight|tomorrow|48\s*h|48\s*hours|2\s*days|soon|urgent/i.test(item.deadline)) {
        urgentDeadlinesCount++;
      } else {
        generalDeadlinesCount++;
      }
    }
  });

  const deadlineImpact = Math.min((urgentDeadlinesCount * 12) + (generalDeadlinesCount * 6), 30);
  if (deadlineImpact > 0) {
    const message = urgentDeadlinesCount > 0 
      ? `Urgent deadline in less than 48 hours (${urgentDeadlinesCount} task(s))`
      : `Pending task deadlines (${generalDeadlinesCount} task(s))`;
    increasedRiskFactors.push({
      factor: message,
      impact: deadlineImpact,
    });
  }

  // Health / Physical Constraints
  const healthCount = context.healthFactors.length;
  const healthImpact = Math.min(healthCount * 10, 20);
  if (healthImpact > 0) {
    increasedRiskFactors.push({
      factor: `Physical or fatigue constraints active (${healthCount} factor(s))`,
      impact: healthImpact,
    });
  }

  // Context Switching
  const categories = Array.from(new Set(context.actionableItems.map(item => item.category || "general").filter(Boolean)));
  const contextSwitchImpact = categories.length > 1 ? Math.min((categories.length - 1) * 5, 15) : 0;
  if (contextSwitchImpact > 0) {
    increasedRiskFactors.push({
      factor: `High context switching across ${categories.length} distinct domains`,
      impact: contextSwitchImpact,
    });
  }

  // Complexity Factor
  const hasCodingTask = context.actionableItems.some(item => 
    /code|coding|develop|program|build|compiler|frontend|backend/i.test(item.title)
  );
  const complexityImpact = hasCodingTask ? 8 : 0;
  if (complexityImpact > 0) {
    increasedRiskFactors.push({
      factor: "Coding tasks historically take longer and require deep focus",
      impact: complexityImpact,
    });
  }

  // Compute Before Planning Risk
  const totalRiskIncreases = increasedRiskFactors.reduce((acc, curr) => acc + curr.impact, 0);
  const beforePlanningRisk = Math.min(BASELINE_RISK + totalRiskIncreases, 95);


  // --- 2. MITIGATION CALCULATION (After Planning) ---
  const answeredClarifications = Object.values(clarificationAnswers).filter(Boolean).length;
  if (plan.tasks.length > 0) {
    // Behavior Buffers
    const hasBuffersApplied = context.behaviorFactors.some(b => b.bufferMultiplier > 1.0);
    if (hasBuffersApplied) {
      reducedRiskFactors.push({
        factor: "Planner padded task estimates (+20% buffer) for behavior memory",
        impact: 15,
      });
    }

    // Routine Alignment
    const hasRoutines = context.routines.length > 0;
    if (hasRoutines) {
      reducedRiskFactors.push({
        factor: "Planner aligned tasks with routine constraints to avoid conflicts",
        impact: 8,
      });
    }

    // Deterministic Sorting (Algorithm 8)
    reducedRiskFactors.push({
      factor: "Deterministic sorting (Algorithm 8) optimized high-urgency tasks first",
      impact: 12,
    });

    // Clarifications Answered
    const clarificationReduction = Math.min(answeredClarifications * 8, 16);
    if (clarificationReduction > 0) {
      reducedRiskFactors.push({
        factor: "Resolved task ambiguity via clarification responses",
        impact: clarificationReduction,
      });
    }

    // Goal Warnings (Decomposition)
    const hasGoalWarnings = plan.warnings.some(w => w.id.startsWith("warn_"));
    if (hasGoalWarnings) {
      reducedRiskFactors.push({
        factor: "Flagged abstract goals for future actionable decomposition",
        impact: 5,
      });
    }

    // Health recovery breaks
    const hasHealthFactors = context.healthFactors.length > 0;
    if (hasHealthFactors) {
      reducedRiskFactors.push({
        factor: "Scheduled recovery breaks for physical/health constraints",
        impact: 10,
      });
    }
  }

  // Compute After Planning Risk
  const totalRiskReductions = reducedRiskFactors.reduce((acc, curr) => acc + curr.impact, 0);
  let afterPlanningRisk = beforePlanningRisk - totalRiskReductions;
  if (totalRiskReductions > 0) {
    afterPlanningRisk = Math.max(Math.min(afterPlanningRisk, 90), 5);
  }

  const successProbability = 100 - afterPlanningRisk;
  const failureRisk = afterPlanningRisk;
  const plannerImprovement = beforePlanningRisk - afterPlanningRisk;


  // --- 3. RISK LEVEL & CONFIDENCE SCORE ---
  let riskLevel: "Low" | "Medium" | "High" = "Medium";
  if (failureRisk < 30) {
    riskLevel = "Low";
  } else if (failureRisk >= 60) {
    riskLevel = "High";
  }

  // Confidence Score
  let confidenceScore = 50;
  if (context.behaviorFactors.length > 0 || context.healthFactors.length > 0) {
    confidenceScore += 15;
  }
  if (context.actionableItems.some(t => t.deadline)) {
    confidenceScore += 15;
  }
  if (answeredClarifications > 0) {
    confidenceScore += Math.min(answeredClarifications * 10, 20);
  }
  if (plan.warnings.length === 0 && plan.unplannedItems.length === 0) {
    confidenceScore += 10;
  }
  confidenceScore = Math.min(confidenceScore, 98);


  // --- 4. TOP REASONS FOR PREDICTION (Max 5) ---
  const sortedIncreases = [...increasedRiskFactors].sort((a, b) => b.impact - a.impact);
  const sortedReductions = [...reducedRiskFactors].sort((a, b) => b.impact - a.impact);

  const topReasons: string[] = [];
  
  // Fill with risk increases first (they show the source of friction)
  for (const item of sortedIncreases) {
    if (topReasons.length < 5) {
      topReasons.push(item.factor);
    }
  }
  // Fill remaining slots with key mitigations
  for (const item of sortedReductions) {
    if (topReasons.length < 5) {
      topReasons.push(item.factor);
    }
  }

  // Fallback if no specific factors are active
  if (topReasons.length === 0) {
    topReasons.push("Standard daily baseline uncertainty");
  }

  return {
    successProbability,
    failureRisk,
    beforePlanningRisk,
    afterPlanningRisk,
    plannerImprovement,
    riskLevel,
    confidenceScore,
    topReasons,
    increasedRiskFactors,
    reducedRiskFactors,
  };
}
