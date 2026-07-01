import { createPlan } from "@/lib/planner/planner";
import { PlanResult } from "@/lib/planner/types/planner";
import { buildPlanningContext } from "@/lib/domain/normalizer";
import { UnderstandingResult } from "@/types/understanding";
import { MemoryExtractionResult } from "@/lib/memory/types/memory";

interface TestCase {
  name: string;
  description: string;
  input: {
    understanding: UnderstandingResult;
    memory: MemoryExtractionResult;
    clarificationAnswers: Record<string, string>;
  };
  verify: (result: PlanResult) => boolean;
}

const emptyMemory = { memories: [], extractedCount: 0, timestamp: "2026-06-29T00:00:00Z" };
const emptyClarification = {};

const testCases: TestCase[] = [
  // 1. Executable item conversion
  {
    name: "TC1: Executable Task Conversion - Report",
    description: "Convert actionable priority 'Finish report' into task",
    input: {
      understanding: {
        extraction: { events: [], deadlines: [], goals: [], constraints: [], priorities: ["Finish report"], emotionalSignals: [], missingInformation: [] },
        clarification: { requiresClarification: false, questions: [] },
      },
      memory: emptyMemory,
      clarificationAnswers: emptyClarification,
    },
    verify: (res) => res.tasks.length === 1 && res.tasks[0].title === "Finish report" && res.tasks[0].estimatedMinutes === 180,
  },
  {
    name: "TC2: Executable Task Conversion - Portfolio",
    description: "Convert actionable priority 'Prepare portfolio' into task",
    input: {
      understanding: {
        extraction: { events: [], deadlines: [], goals: [], constraints: [], priorities: ["Prepare portfolio"], emotionalSignals: [], missingInformation: [] },
        clarification: { requiresClarification: false, questions: [] },
      },
      memory: emptyMemory,
      clarificationAnswers: emptyClarification,
    },
    verify: (res) => res.tasks.length === 1 && res.tasks[0].title === "Prepare portfolio" && res.tasks[0].estimatedMinutes === 300,
  },
  {
    name: "TC3: Executable Task Conversion - Study DSA",
    description: "Convert actionable priority 'Study DSA' into task",
    input: {
      understanding: {
        extraction: { events: [], deadlines: [], goals: [], constraints: [], priorities: ["Study DSA"], emotionalSignals: [], missingInformation: [] },
        clarification: { requiresClarification: false, questions: [] },
      },
      memory: emptyMemory,
      clarificationAnswers: emptyClarification,
    },
    verify: (res) => res.tasks.length === 1 && res.tasks[0].title === "Study DSA" && res.tasks[0].estimatedMinutes === 120,
  },

  // 2. Abstract Goals (Algorithm 2)
  {
    name: "TC4: Abstract Goal - Google Internship",
    description: "Goal 'Get Google internship' generates warning and unplanned item, not task",
    input: {
      understanding: {
        extraction: { events: [], deadlines: [], goals: ["Get Google internship"], constraints: [], priorities: [], emotionalSignals: [], missingInformation: [] },
        clarification: { requiresClarification: false, questions: [] },
      },
      memory: emptyMemory,
      clarificationAnswers: emptyClarification,
    },
    verify: (res) => res.tasks.length === 0 && res.warnings.length === 1 && res.unplannedItems.length === 1,
  },
  {
    name: "TC5: Abstract Goal - Become Rich",
    description: "Goal 'Become rich' placed in unplanned items with warning",
    input: {
      understanding: {
        extraction: { events: [], deadlines: [], goals: ["Become rich"], constraints: [], priorities: [], emotionalSignals: [], missingInformation: [] },
        clarification: { requiresClarification: false, questions: [] },
      },
      memory: emptyMemory,
      clarificationAnswers: emptyClarification,
    },
    verify: (res) => res.unplannedItems.length === 1 && res.unplannedItems[0].title === "Become rich",
  },
  {
    name: "TC6: Abstract Goal - Be Healthier",
    description: "Goal 'Be healthier' placed in unplanned items",
    input: {
      understanding: {
        extraction: { events: [], deadlines: [], goals: ["Be healthier"], constraints: [], priorities: [], emotionalSignals: [], missingInformation: [] },
        clarification: { requiresClarification: false, questions: [] },
      },
      memory: emptyMemory,
      clarificationAnswers: emptyClarification,
    },
    verify: (res) => res.unplannedItems.length === 1 && res.unplannedItems[0].title === "Be healthier",
  },

  // 3. Events are NOT tasks (Algorithm 3)
  {
    name: "TC7: Event Handling - Meeting at 3pm",
    description: "Event 'Meeting at 3pm' is recognized as schedule anchor, not created as work task",
    input: {
      understanding: {
        extraction: { events: ["Meeting at 3pm"], deadlines: [], goals: [], constraints: [], priorities: [], emotionalSignals: [], missingInformation: [] },
        clarification: { requiresClarification: false, questions: [] },
      },
      memory: emptyMemory,
      clarificationAnswers: emptyClarification,
    },
    verify: (res) => res.tasks.length === 0 && res.assumptions.some((a) => a.message.includes("fixed schedule anchor")),
  },
  {
    name: "TC8: Event Handling - Mom Visiting Saturday",
    description: "Event 'Mom visiting Saturday' treated as anchor",
    input: {
      understanding: {
        extraction: { events: ["Mom visiting Saturday"], deadlines: [], goals: [], constraints: [], priorities: [], emotionalSignals: [], missingInformation: [] },
        clarification: { requiresClarification: false, questions: [] },
      },
      memory: emptyMemory,
      clarificationAnswers: emptyClarification,
    },
    verify: (res) => res.tasks.length === 0 && res.assumptions.length >= 1,
  },

  // 4. Deadlines increase priority (Algorithm 4)
  {
    name: "TC9: Deadline Priority Escalation",
    description: "Task with deadline escalates priority to high",
    input: {
      understanding: {
        extraction: { events: [], deadlines: ["Submit assignment by Friday"], goals: [], constraints: [], priorities: [], emotionalSignals: [], missingInformation: [] },
        clarification: { requiresClarification: false, questions: [] },
      },
      memory: emptyMemory,
      clarificationAnswers: emptyClarification,
    },
    verify: (res) => res.tasks.length === 1 && res.tasks[0].priority === "high",
  },
  {
    name: "TC10: Missing Deadline Assumption",
    description: "Task without deadline creates assumption of medium urgency",
    input: {
      understanding: {
        extraction: { events: [], deadlines: [], goals: [], constraints: [], priorities: ["Code API"], emotionalSignals: [], missingInformation: [] },
        clarification: { requiresClarification: false, questions: [] },
      },
      memory: emptyMemory,
      clarificationAnswers: emptyClarification,
    },
    verify: (res) => res.tasks.length === 1 && res.assumptions.some((a) => a.message.includes("medium urgency")),
  },

  // 5. Clarification Answers (Algorithm 5)
  {
    name: "TC11: Clarification Answer Override",
    description: "Clarification answer overrides deadline and sets high priority",
    input: {
      understanding: {
        extraction: { events: [], deadlines: [], goals: [], constraints: [], priorities: ["Write docs"], emotionalSignals: [], missingInformation: [] },
        clarification: { requiresClarification: true, questions: [{ id: "Q1", question: "When is Write docs due?", reason: "Missing deadline" }] },
      },
      memory: emptyMemory,
      clarificationAnswers: { "Write docs": "Tomorrow 5pm" },
    },
    verify: (res) => res.tasks.length === 1 && res.tasks[0].deadline === "Tomorrow 5pm" && res.tasks[0].priority === "high",
  },

  // 6. Memory Influence & Buffers (Algorithm 6)
  {
    name: "TC12: Routine Memory Constraint",
    description: "Routine memory 'Morning gym' creates planner constraint assumption",
    input: {
      understanding: {
        extraction: { events: [], deadlines: [], goals: [], constraints: [], priorities: ["Fix bug"], emotionalSignals: [], missingInformation: [] },
        clarification: { requiresClarification: false, questions: [] },
      },
      memory: {
        memories: [{ id: "mem1", category: "routine", value: "Morning gym", confidence: 0.95, reason: "Routine detected" }],
        extractedCount: 1,
        timestamp: "2026-06-29T00:00:00Z",
      },
      clarificationAnswers: emptyClarification,
    },
    verify: (res) => res.assumptions.some((a) => a.message.includes("Morning gym")),
  },
  {
    name: "TC13: Behavior Procrastination Buffer",
    description: "Procrastination behavior memory applies +20% buffer to estimates",
    input: {
      understanding: {
        extraction: { events: [], deadlines: [], goals: [], constraints: [], priorities: ["Study DSA"], emotionalSignals: [], missingInformation: [] },
        clarification: { requiresClarification: false, questions: [] },
      },
      memory: {
        memories: [{ id: "mem2", category: "behavior", value: "I procrastinate", confidence: 0.91, reason: "Behavior habit" }],
        extractedCount: 1,
        timestamp: "2026-06-29T00:00:00Z",
      },
      clarificationAnswers: emptyClarification,
    },
    verify: (res) => res.tasks.length === 1 && res.tasks[0].estimatedMinutes === 144, // 120 * 1.2 = 144
  },

  // 7. Deterministic Duration Estimation Lookup (Algorithm 7)
  {
    name: "TC14: Estimation Lookup - Email",
    description: "Email task estimated at 15 minutes",
    input: {
      understanding: {
        extraction: { events: [], deadlines: [], goals: [], constraints: [], priorities: ["Send email to client"], emotionalSignals: [], missingInformation: [] },
        clarification: { requiresClarification: false, questions: [] },
      },
      memory: emptyMemory,
      clarificationAnswers: emptyClarification,
    },
    verify: (res) => res.tasks[0].estimatedMinutes === 15,
  },
  {
    name: "TC15: Estimation Lookup - Call",
    description: "Call task estimated at 30 minutes",
    input: {
      understanding: {
        extraction: { events: [], deadlines: [], goals: [], constraints: [], priorities: ["Sync call with mentor"], emotionalSignals: [], missingInformation: [] },
        clarification: { requiresClarification: false, questions: [] },
      },
      memory: emptyMemory,
      clarificationAnswers: emptyClarification,
    },
    verify: (res) => res.tasks[0].estimatedMinutes === 30,
  },
  {
    name: "TC16: Estimation Lookup - Fix Bug",
    description: "Bug fix task estimated at 45 minutes",
    input: {
      understanding: {
        extraction: { events: [], deadlines: [], goals: [], constraints: [], priorities: ["Fix login bug"], emotionalSignals: [], missingInformation: [] },
        clarification: { requiresClarification: false, questions: [] },
      },
      memory: emptyMemory,
      clarificationAnswers: emptyClarification,
    },
    verify: (res) => res.tasks[0].estimatedMinutes === 45,
  },
  {
    name: "TC17: Estimation Lookup - Default Fallback",
    description: "Unrecognized task falls back to 60 minutes",
    input: {
      understanding: {
        extraction: { events: [], deadlines: [], goals: [], constraints: [], priorities: ["Organize desk"], emotionalSignals: [], missingInformation: [] },
        clarification: { requiresClarification: false, questions: [] },
      },
      memory: emptyMemory,
      clarificationAnswers: emptyClarification,
    },
    verify: (res) => res.tasks[0].estimatedMinutes === 60,
  },

  // 8. Deterministic Execution Order (Algorithm 8)
  {
    name: "TC18: Execution Ordering by Priority and Deadline",
    description: "Tasks ordered deterministically (deadline first, then high priority)",
    input: {
      understanding: {
        extraction: {
          events: [],
          deadlines: ["Finish report by 5pm"],
          goals: [],
          constraints: [],
          priorities: ["Organize desk", "Finish report by 5pm", "Prepare portfolio"],
          emotionalSignals: [],
          missingInformation: [],
        },
        clarification: { requiresClarification: false, questions: [] },
      },
      memory: emptyMemory,
      clarificationAnswers: emptyClarification,
    },
    verify: (res) => res.executionOrder.length === 3 && res.tasks[0].title.includes("Finish report"),
  },

  // 9. Complex Mixed Inputs
  {
    name: "TC19: Complex Mixed Input Processing",
    description: "Processes goals, events, deadlines, and priorities simultaneously",
    input: {
      understanding: {
        extraction: {
          events: ["Meeting at 3pm"],
          deadlines: ["Submit project proposal by Friday"],
          goals: ["Get Google internship"],
          constraints: [],
          priorities: ["Study DSA", "Send email to team"],
          emotionalSignals: [],
          missingInformation: [],
        },
        clarification: { requiresClarification: false, questions: [] },
      },
      memory: emptyMemory,
      clarificationAnswers: emptyClarification,
    },
    verify: (res) => res.tasks.length === 3 && res.unplannedItems.length === 1 && res.assumptions.length >= 2,
  },
  {
    name: "TC20: Determinism and Idempotency",
    description: "Running createPlan twice on same input produces identical execution order and IDs",
    input: {
      understanding: {
        extraction: { events: [], deadlines: ["Finish report by Friday"], goals: [], constraints: [], priorities: ["Study DSA"], emotionalSignals: [], missingInformation: [] },
        clarification: { requiresClarification: false, questions: [] },
      },
      memory: emptyMemory,
      clarificationAnswers: emptyClarification,
    },
    verify: (res) => {
      const ctx2 = buildPlanningContext({
        understanding: {
          extraction: { events: [], deadlines: ["Finish report by Friday"], goals: [], constraints: [], priorities: ["Study DSA"], emotionalSignals: [], missingInformation: [] },
          clarification: { requiresClarification: false, questions: [] },
        },
        memory: emptyMemory,
        clarificationAnswers: emptyClarification,
      });
      const res2 = createPlan(ctx2);
      return JSON.stringify(res.executionOrder) === JSON.stringify(res2.executionOrder) && res.tasks[0].id === res2.tasks[0].id;
    },
  },
  {
    name: "TC21: Deduplication of Candidate Tasks",
    description: "Cleanly deduplicates duplicate items across priorities and text",
    input: {
      understanding: {
        rawText: "Finish report. Finish report.",
        extraction: { events: [], deadlines: [], goals: [], constraints: [], priorities: ["Finish report"], emotionalSignals: [], missingInformation: [] },
        clarification: { requiresClarification: false, questions: [] },
      },
      memory: emptyMemory,
      clarificationAnswers: emptyClarification,
    },
    verify: (res) => res.tasks.length === 1 && res.tasks[0].title === "Finish report",
  },
];

export function runPlannerTests(): boolean {
  console.log("=================================================");
  console.log("     RUNNING DETERMINISTIC PLANNER TEST SUITE    ");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  testCases.forEach((tc) => {
    try {
      const context = buildPlanningContext(tc.input);
      const res = createPlan(context);
      const ok = tc.verify(res);
      if (ok) {
        passed++;
        console.log(`[PASS] ${tc.name}: ${tc.description}`);
      } else {
        failed++;
        console.log(`[FAIL] ${tc.name}: ${tc.description}`);
        console.log(`       Output: ${JSON.stringify(res, null, 2)}`);
      }
    } catch (err) {
      failed++;
      console.log(`[ERROR] ${tc.name}: ${err instanceof Error ? err.message : String(err)}`);
    }
  });

  console.log("\n=================================================");
  console.log(`RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log("=================================================\n");

  return failed === 0;
}

runPlannerTests();
