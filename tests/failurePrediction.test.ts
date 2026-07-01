import { calculateFailurePrediction, FailurePredictionResult } from "@/lib/orchestrator/failurePrediction";
import { PlanningContext } from "@/lib/domain/types";
import { PlanResult } from "@/lib/planner/types/planner";

interface TestCase {
  name: string;
  context: PlanningContext;
  plan: PlanResult;
  clarifications: Record<string, string>;
  check: (res: FailurePredictionResult) => boolean;
}

const emptyPlan: PlanResult = {
  tasks: [],
  executionOrder: [],
  warnings: [],
  assumptions: [],
  unplannedItems: [],
  timestamp: new Date().toISOString(),
};

const testCases: TestCase[] = [
  {
    name: "Scenario 1: High Cognitive Load, No Planner Mitigations",
    context: {
      actionableItems: [
        { id: "t1", title: "Task 1", deadline: null, priority: "high", estimatedMinutes: 60, category: "work", source: "raw", reason: "" },
        { id: "t2", title: "Task 2", deadline: null, priority: "high", estimatedMinutes: 60, category: "life", source: "raw", reason: "" },
        { id: "t3", title: "Task 3", deadline: null, priority: "high", estimatedMinutes: 60, category: "study", source: "raw", reason: "" },
        { id: "t4", title: "Task 4", deadline: null, priority: "high", estimatedMinutes: 60, category: "admin", source: "raw", reason: "" },
      ],
      constraints: [],
      events: [],
      goals: [
        { id: "g1", title: "Abstract Goal 1", reason: "" },
        { id: "g2", title: "Abstract Goal 2", reason: "" },
      ],
      preferences: [],
      routines: [],
      healthFactors: [
        { id: "h1", text: "Chronic lower back stiffness" }
      ],
      behaviorFactors: [
        { id: "b1", text: "Procrastinates under pressure", bufferMultiplier: 1.2 }
      ],
      timestamp: new Date().toISOString(),
    },
    plan: emptyPlan,
    clarifications: {},
    check: (res) => {
      console.log(`      -> Base Risk: ${res.beforePlanningRisk}% | After Risk: ${res.afterPlanningRisk}% | Improvement: ${res.plannerImprovement}%`);
      return res.beforePlanningRisk > 70 && res.riskLevel === "High" && res.plannerImprovement === 0;
    },
  },
  {
    name: "Scenario 2: Low Load with Full Planner Mitigations",
    context: {
      actionableItems: [
        { id: "t1", title: "Study DSA algorithms", deadline: null, priority: "medium", estimatedMinutes: 60, category: "study", source: "raw", reason: "" }
      ],
      constraints: [],
      events: [],
      goals: [],
      preferences: [],
      routines: [
        { id: "r1", text: "Morning exercise" }
      ],
      healthFactors: [],
      behaviorFactors: [
        { id: "b1", text: "Procrastinates slightly", bufferMultiplier: 1.2 }
      ],
      timestamp: new Date().toISOString(),
    },
    plan: {
      tasks: [
        { id: "t1", title: "Study DSA algorithms", priority: "medium", estimatedMinutes: 72, dependsOn: [], deadline: null, category: "study", reason: "" }
      ],
      executionOrder: ["t1"],
      warnings: [],
      assumptions: [
        { id: "a1", target: "Procrastinates slightly", message: "Adjusted estimates (+20% buffer)" }
      ],
      unplannedItems: [],
      timestamp: new Date().toISOString(),
    },
    clarifications: { "What is your main target?": "Vite React Dashboard" },
    check: (res) => {
      console.log(`      -> Base Risk: ${res.beforePlanningRisk}% | After Risk: ${res.afterPlanningRisk}% | Improvement: ${res.plannerImprovement}%`);
      return res.afterPlanningRisk < 35 && res.riskLevel === "Low" && res.plannerImprovement > 20;
    },
  },
];

function runTests() {
  console.log("=================================================");
  console.log("   RUNNING DETERMINISTIC FAILURE PREDICTION TESTS ");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  testCases.forEach((tc, idx) => {
    console.log(`[TEST ${idx + 1}] ${tc.name}`);
    try {
      const result = calculateFailurePrediction(tc.context, tc.plan, tc.clarifications);
      const isOk = tc.check(result);
      if (isOk) {
        passed++;
        console.log(`  [PASS] Successfully evaluated correctly.\n`);
      } else {
        failed++;
        console.log(`  [FAIL] Evaluation check failed. Got result:`, JSON.stringify(result, null, 2), `\n`);
      }
    } catch (e) {
      failed++;
      console.error(`  [ERROR] Exception encountered:`, e, `\n`);
    }
  });

  console.log("=================================================");
  console.log(`RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log("=================================================\n");

  process.exit(failed === 0 ? 0 : 1);
}

runTests();
