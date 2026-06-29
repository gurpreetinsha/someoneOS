import {
  PlannerInput,
  PlanResult,
  Task,
  TaskPriority,
  PlanWarning,
  PlanAssumption,
  UnplannedItem,
} from "./types/planner";

// --- Deterministic Pure Hashing Utility ---

function djb2Hash(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}

function generateId(prefix: string, value: string): string {
  const norm = value.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
  return `${prefix}_${djb2Hash(norm)}`;
}

// --- Helper Utilities ---

function normalize(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, " ");
}

function cleanTitle(text: string): string {
  let cleaned = text.trim().replace(/^[,\.\-:\s]+|[,\.\-:\s]+$/g, "");
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  return cleaned;
}

// --- Algorithm 7: Deterministic Effort Estimation Lookup ---

const ESTIMATION_TABLE: Array<{ keywords: string[]; minutes: number }> = [
  { keywords: ["email", "mail", "message", "slack", "tweet"], minutes: 15 },
  { keywords: ["call", "sync", "standup", "checkin"], minutes: 30 },
  { keywords: ["fix", "bug", "patch", "review", "refactor"], minutes: 45 },
  { keywords: ["study", "learn", "read", "dsa", "algorithm", "course"], minutes: 120 },
  { keywords: ["report", "doc", "document", "essay", "article", "paper"], minutes: 180 },
  { keywords: ["portfolio", "app", "project", "build", "code", "system", "feature"], minutes: 300 },
];

export function estimateDuration(title: string): number {
  const norm = normalize(title);
  for (const entry of ESTIMATION_TABLE) {
    if (entry.keywords.some((kw) => norm.includes(kw))) {
      return entry.minutes;
    }
  }
  return 60; // Default fallback estimate
}

// --- Keyword Classification Helpers ---

const ABSTRACT_GOAL_INDICATORS = [
  "get into", "internship", "become", "be healthier", "learn happiness",
  "rich", "millionaire", "get job", "pass exam", "successful", "wealthy", "promotion"
];

const EVENT_INDICATORS = [
  "meeting at", "call at", "conference", "webinar", "mom visiting",
  "dentist at", "doctor appointment", "party at", "flight at", "event"
];

export function isAbstractGoal(text: string): boolean {
  const norm = normalize(text);
  return ABSTRACT_GOAL_INDICATORS.some((ind) => norm.includes(ind));
}

export function isEventAnchor(text: string): boolean {
  const norm = normalize(text);
  if (EVENT_INDICATORS.some((ind) => norm.includes(ind))) return true;
  // Match patterns like "at 3pm", "at 10am"
  return /\bat\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)\b/i.test(norm);
}

// --- Main Engine Orchestrator ---

export function createPlan(input: PlannerInput): PlanResult {
  const tasks: Task[] = [];
  const warnings: PlanWarning[] = [];
  const assumptions: PlanAssumption[] = [];
  const unplannedItems: UnplannedItem[] = [];

  const { understanding, memory, clarificationAnswers } = input;
  const extraction = understanding.extraction || {
    events: [],
    deadlines: [],
    goals: [],
    constraints: [],
    priorities: [],
    emotionalSignals: [],
    missingInformation: [],
  };

  // Buffer modifier from memory (Algorithm 6)
  let bufferMultiplier = 1.0;
  const memoryConstraints: string[] = [];

  if (memory && memory.memories) {
    for (const mem of memory.memories) {
      if (mem.category === "routine") {
        memoryConstraints.push(`Routine detected: '${mem.value}'. Planner constraints applied to avoid scheduling conflicts.`);
      } else if (mem.category === "behavior" && (normalize(mem.value).includes("procrastinate") || normalize(mem.value).includes("forget"))) {
        bufferMultiplier = 1.2; // 20% buffer for procrastination habits
        assumptions.push({
          id: generateId("assump", `behavior_${mem.id}`),
          target: mem.value,
          message: `Adjusted task time estimates (+20% buffer) based on behavior memory '${mem.value}'.`,
        });
      }
    }
  }

  if (memoryConstraints.length > 0) {
    assumptions.push({
      id: generateId("assump", "memory_routines"),
      target: "Planner Schedule Constraints",
      message: memoryConstraints.join(" "),
    });
  }

  // Map candidate items from priorities, deadlines, goals, and events
  const rawCandidateItems: Array<{ source: string; text: string }> = [];

  if (extraction.priorities) {
    extraction.priorities.forEach((t) => rawCandidateItems.push({ source: "priorities", text: t }));
  }
  if (extraction.deadlines) {
    extraction.deadlines.forEach((t) => rawCandidateItems.push({ source: "deadlines", text: t }));
  }
  if (extraction.goals) {
    extraction.goals.forEach((t) => rawCandidateItems.push({ source: "goals", text: t }));
  }
  if (extraction.events) {
    extraction.events.forEach((t) => rawCandidateItems.push({ source: "events", text: t }));
  }
  if (understanding.rawText) {
    // Split sentences from rawText if present
    const sentences = understanding.rawText
      .split(/(?<=[\.\!\?\n])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    sentences.forEach((s) => rawCandidateItems.push({ source: "rawText", text: s }));
  }

  // Deduplicate candidate items by normalized title
  const processedTitles = new Set<string>();

  for (const item of rawCandidateItems) {
    const title = cleanTitle(item.text);
    const normTitle = normalize(title);
    if (!title || processedTitles.has(normTitle)) continue;
    processedTitles.add(normTitle);

    // Algorithm 3: Events are NOT tasks
    if (item.source === "events" || isEventAnchor(title)) {
      assumptions.push({
        id: generateId("assump", title),
        target: title,
        message: `Event '${title}' recognized as fixed schedule anchor. Not converted to executable work task.`,
      });
      continue;
    }

    // Algorithm 2: Abstract goals are NOT tasks
    if (item.source === "goals" || isAbstractGoal(title)) {
      warnings.push({
        id: generateId("warn", title),
        target: title,
        message: `Goal '${title}' has no actionable tasks. Need actionable steps.`,
      });
      unplannedItems.push({
        id: generateId("unplan", title),
        title,
        reason: "Planner cannot execute abstract goals directly without breakdown.",
      });
      continue;
    }

    // Algorithm 1: Convert executable items into tasks
    let priority: TaskPriority = "medium";
    let deadline: string | null = null;
    let reason = "Converted executable item into task.";

    // Algorithm 4: Deadlines increase priority
    const matchedDeadline = extraction.deadlines.find((d) => normalize(d).includes(normTitle) || normTitle.includes(normalize(d)));
    if (item.source === "deadlines" || matchedDeadline || normTitle.includes("by ") || normTitle.includes("deadline")) {
      priority = "high";
      deadline = matchedDeadline || "Attached Deadline";
      reason = `Priority escalated to high due to attached deadline ('${deadline}').`;
    } else {
      assumptions.push({
        id: generateId("assump", `nodeadline_${title}`),
        target: title,
        message: `No explicit deadline supplied for '${title}'. Planner assumed medium urgency.`,
      });
    }

    // Algorithm 5: Clarification answers override assumptions / deadlines
    for (const [qKey, answer] of Object.entries(clarificationAnswers)) {
      if (answer && (normalize(qKey).includes(normTitle) || normTitle.includes(normalize(qKey)) || normalize(answer).includes("deadline"))) {
        deadline = answer;
        priority = "high";
        reason = `Deadline and priority updated from user clarification response ('${answer}').`;
      }
    }

    // Algorithm 7: Estimate duration deterministically
    const baseEstimate = estimateDuration(title);
    const estimatedMinutes = Math.round(baseEstimate * bufferMultiplier);

    // Simple deterministic dependency check (e.g., if title refers to another task)
    const dependsOn: string[] = [];
    if (normTitle.includes("after") || normTitle.includes("then")) {
      // Find potential matching previous task
      for (const t of tasks) {
        if (normTitle.includes(normalize(t.title))) {
          dependsOn.push(t.id);
        }
      }
    }

    const taskId = generateId("task", title);

    tasks.push({
      id: taskId,
      title,
      priority,
      estimatedMinutes,
      dependsOn,
      deadline,
      category: item.source === "priorities" ? "work" : "general",
      reason,
    });
  }

  // Algorithm 8: Deterministic Execution Order Sort
  // Sort by: deadline (present/earliest first) -> priority (high > medium > low) -> dependency count -> title
  const sortedTasks = [...tasks].sort((a, b) => {
    // 1. Deadline presence (tasks with deadlines come first)
    if (a.deadline && !b.deadline) return -1;
    if (!a.deadline && b.deadline) return 1;
    if (a.deadline && b.deadline && a.deadline !== b.deadline) {
      return a.deadline.localeCompare(b.deadline);
    }

    // 2. Priority rank (high=3, medium=2, low=1)
    const pRank = { high: 3, medium: 2, low: 1 };
    if (pRank[a.priority] !== pRank[b.priority]) {
      return pRank[b.priority] - pRank[a.priority];
    }

    // 3. Dependency count (fewer dependencies first)
    if (a.dependsOn.length !== b.dependsOn.length) {
      return a.dependsOn.length - b.dependsOn.length;
    }

    // 4. Title alphabetical
    return a.title.localeCompare(b.title);
  });

  const executionOrder = sortedTasks.map((t) => t.id);

  return {
    tasks: sortedTasks,
    executionOrder,
    warnings,
    assumptions,
    unplannedItems,
    timestamp: new Date().toISOString(),
  };
}
