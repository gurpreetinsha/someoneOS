import { extractMemory } from "./memoryEngine";
import { UnderstandingResult } from "@/types/understanding";
import { MemoryExtractionResult } from "./types/memory";

interface TestCase {
  name: string;
  input: UnderstandingResult;
  expectedCategory?: string;
  expectedCount?: number;
  description: string;
}

const testCases: TestCase[] = [
  // Routine
  {
    name: "Routine Test 1",
    description: "Detect wake up routine",
    input: {
      rawText: "I usually wake up at 6.",
      extraction: { events: [], deadlines: [], goals: [], constraints: [], priorities: [], emotionalSignals: [], missingInformation: [] },
      clarification: { requiresClarification: false, questions: [] },
    },
    expectedCategory: "routine",
    expectedCount: 1,
  },
  {
    name: "Routine Test 2",
    description: "Detect gym recurring frequency",
    input: {
      rawText: "I go gym every morning.",
      extraction: { events: [], deadlines: [], goals: [], constraints: [], priorities: [], emotionalSignals: [], missingInformation: [] },
      clarification: { requiresClarification: false, questions: [] },
    },
    expectedCategory: "routine",
    expectedCount: 1,
  },
  {
    name: "Routine Test 3",
    description: "Detect night study routine",
    input: {
      rawText: "I study every night.",
      extraction: { events: [], deadlines: [], goals: [], constraints: [], priorities: [], emotionalSignals: [], missingInformation: [] },
      clarification: { requiresClarification: false, questions: [] },
    },
    expectedCategory: "routine",
    expectedCount: 1,
  },

  // Preference
  {
    name: "Preference Test 1",
    description: "Detect meeting hatred preference",
    input: {
      rawText: "I hate meetings.",
      extraction: { events: [], deadlines: [], goals: [], constraints: [], priorities: [], emotionalSignals: [], missingInformation: [] },
      clarification: { requiresClarification: false, questions: [] },
    },
    expectedCategory: "preference",
    expectedCount: 1,
  },
  {
    name: "Preference Test 2",
    description: "Detect morning work preference",
    input: {
      rawText: "I prefer mornings.",
      extraction: { events: [], deadlines: [], goals: [], constraints: [], priorities: [], emotionalSignals: [], missingInformation: [] },
      clarification: { requiresClarification: false, questions: [] },
    },
    expectedCategory: "preference",
    expectedCount: 1,
  },
  {
    name: "Preference Test 3",
    description: "Detect cafe preference",
    input: {
      rawText: "I like working in cafes.",
      extraction: { events: [], deadlines: [], goals: [], constraints: [], priorities: [], emotionalSignals: [], missingInformation: [] },
      clarification: { requiresClarification: false, questions: [] },
    },
    expectedCategory: "preference",
    expectedCount: 1,
  },

  // Project
  {
    name: "Project Test 1",
    description: "Detect SomeoneOS project creation",
    input: {
      rawText: "I'm building SomeoneOS.",
      extraction: { events: [], deadlines: [], goals: [], constraints: [], priorities: [], emotionalSignals: [], missingInformation: [] },
      clarification: { requiresClarification: false, questions: [] },
    },
    expectedCategory: "project",
    expectedCount: 1,
  },
  {
    name: "Project Test 2",
    description: "Detect portfolio project creation",
    input: {
      rawText: "I'm making a portfolio.",
      extraction: { events: [], deadlines: [], goals: [], constraints: [], priorities: [], emotionalSignals: [], missingInformation: [] },
      clarification: { requiresClarification: false, questions: [] },
    },
    expectedCategory: "project",
    expectedCount: 1,
  },

  // Goal
  {
    name: "Goal Test 1",
    description: "Detect Google career goal",
    input: {
      rawText: "I want to get into Google.",
      extraction: { events: [], deadlines: [], goals: [], constraints: [], priorities: [], emotionalSignals: [], missingInformation: [] },
      clarification: { requiresClarification: false, questions: [] },
    },
    expectedCategory: "goal",
    expectedCount: 1,
  },
  {
    name: "Goal Test 2",
    description: "Detect weight loss fitness goal",
    input: {
      rawText: "I want to lose 10kg.",
      extraction: { events: [], deadlines: [], goals: [], constraints: [], priorities: [], emotionalSignals: [], missingInformation: [] },
      clarification: { requiresClarification: false, questions: [] },
    },
    expectedCategory: "goal",
    expectedCount: 1,
  },

  // Relationship
  {
    name: "Relationship Test 1",
    description: "Detect mother Saturday visit relation",
    input: {
      rawText: "My mom visits every Saturday.",
      extraction: { events: [], deadlines: [], goals: [], constraints: [], priorities: [], emotionalSignals: [], missingInformation: [] },
      clarification: { requiresClarification: false, questions: [] },
    },
    expectedCategory: "relationship",
    expectedCount: 1,
  },
  {
    name: "Relationship Test 2",
    description: "Detect manager identity relation",
    input: {
      rawText: "My manager is Sarah.",
      extraction: { events: [], deadlines: [], goals: [], constraints: [], priorities: [], emotionalSignals: [], missingInformation: [] },
      clarification: { requiresClarification: false, questions: [] },
    },
    expectedCategory: "relationship",
    expectedCount: 1,
  },

  // Health
  {
    name: "Health Test 1",
    description: "Detect ADHD condition",
    input: {
      rawText: "I have ADHD.",
      extraction: { events: [], deadlines: [], goals: [], constraints: [], priorities: [], emotionalSignals: [], missingInformation: [] },
      clarification: { requiresClarification: false, questions: [] },
    },
    expectedCategory: "health",
    expectedCount: 1,
  },
  {
    name: "Health Test 2",
    description: "Detect shoulder injury",
    input: {
      rawText: "I injured my shoulder.",
      extraction: { events: [], deadlines: [], goals: [], constraints: [], priorities: [], emotionalSignals: [], missingInformation: [] },
      clarification: { requiresClarification: false, questions: [] },
    },
    expectedCategory: "health",
    expectedCount: 1,
  },

  // Behavior
  {
    name: "Behavior Test 1",
    description: "Detect procrastination tendency",
    input: {
      rawText: "I procrastinate.",
      extraction: { events: [], deadlines: [], goals: [], constraints: [], priorities: [], emotionalSignals: [], missingInformation: [] },
      clarification: { requiresClarification: false, questions: [] },
    },
    expectedCategory: "behavior",
    expectedCount: 1,
  },
  {
    name: "Behavior Test 2",
    description: "Detect deadline forgetting habit",
    input: {
      rawText: "I forget deadlines.",
      extraction: { events: [], deadlines: [], goals: [], constraints: [], priorities: [], emotionalSignals: [], missingInformation: [] },
      clarification: { requiresClarification: false, questions: [] },
    },
    expectedCategory: "behavior",
    expectedCount: 1,
  },

  // Negative tests (ephemeral tasks / events)
  {
    name: "Negative Test 1",
    description: "Ignore ephemeral task buy milk",
    input: {
      rawText: "Buy milk.",
      extraction: { events: [], deadlines: [], goals: [], constraints: [], priorities: [], emotionalSignals: [], missingInformation: [] },
      clarification: { requiresClarification: false, questions: [] },
    },
    expectedCount: 0,
  },
  {
    name: "Negative Test 2",
    description: "Ignore timed meeting event",
    input: {
      rawText: "Call Dave at 3pm.",
      extraction: { events: [], deadlines: [], goals: [], constraints: [], priorities: [], emotionalSignals: [], missingInformation: [] },
      clarification: { requiresClarification: false, questions: [] },
    },
    expectedCount: 0,
  },

  // Mixed Brain Dump Edge Case
  {
    name: "Mixed Brain Dump Edge Case",
    description: "Extract multiple durable memories while skipping ephemeral tasks",
    input: {
      rawText: "I have ADHD and I usually wake up at 6. Submit report today. I want to lose 10kg.",
      extraction: {
        events: [],
        deadlines: ["Submit report today"],
        goals: ["I want to lose 10kg"],
        constraints: [],
        priorities: [],
        emotionalSignals: [],
        missingInformation: [],
      },
      clarification: { requiresClarification: false, questions: [] },
    },
    expectedCount: 3, // health, routine, goal
  },
];

export function runTests(): boolean {
  console.log("=================================================");
  console.log("   RUNNING MEMORY EXTRACTION ENGINE TEST SUITE   ");
  console.log("=================================================\n");

  let passedCount = 0;
  let failedCount = 0;

  for (const tc of testCases) {
    const result: MemoryExtractionResult = extractMemory(tc.input);

    let passed = true;

    if (tc.expectedCount !== undefined && result.extractedCount !== tc.expectedCount) {
      passed = false;
    }

    if (tc.expectedCategory && passed && result.memories.length > 0) {
      if (result.memories[0].category !== tc.expectedCategory) {
        passed = false;
      }
    }

    if (passed) {
      passedCount++;
      console.log(`[PASS] ${tc.name}: ${tc.description}`);
      if (result.memories.length > 0) {
        console.log(`       Extracted (${result.memories.length}): ${result.memories.map(m => `[${m.category}] "${m.value}" (conf: ${m.confidence})`).join(", ")}`);
      } else {
        console.log(`       Extracted (0): No durable memories detected (Correct for negative test).`);
      }
    } else {
      failedCount++;
      console.log(`[FAIL] ${tc.name}: ${tc.description}`);
      console.log(`       Expected count: ${tc.expectedCount}, Got: ${result.extractedCount}`);
      if (tc.expectedCategory) console.log(`       Expected category: ${tc.expectedCategory}`);
      console.log(`       Got memories: ${JSON.stringify(result.memories, null, 2)}`);
    }
  }

  // Determinism & Idempotency Test
  console.log("\n-------------------------------------------------");
  console.log(" testing determinism & ID stability...");
  const testInput: UnderstandingResult = {
    rawText: "I usually wake up at 6.",
    extraction: { events: [], deadlines: [], goals: [], constraints: [], priorities: [], emotionalSignals: [], missingInformation: [] },
    clarification: { requiresClarification: false, questions: [] },
  };

  const res1 = extractMemory(testInput);
  const res2 = extractMemory(testInput);

  const id1 = res1.memories[0]?.id;
  const id2 = res2.memories[0]?.id;

  if (id1 && id1 === id2) {
    console.log(`[PASS] Determinism test verified. Same input produced identical ID: ${id1}`);
  } else {
    failedCount++;
    console.log(`[FAIL] Determinism test failed. ID1: ${id1}, ID2: ${id2}`);
  }

  console.log("=================================================");
  console.log(`RESULTS: ${passedCount} Passed, ${failedCount} Failed`);
  console.log("=================================================\n");

  return failedCount === 0;
}

// Execute tests if run directly via ts-node / npx tsx
runTests();
