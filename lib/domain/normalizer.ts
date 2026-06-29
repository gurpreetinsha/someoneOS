import { UnderstandingResult } from "@/types/understanding";
import { MemoryExtractionResult } from "@/lib/memory/types/memory";
import {
  PlanningContext,
  ActionableItem,
  DomainConstraint,
  EventAnchor,
  AbstractGoal,
  DomainPreference,
  DomainRoutine,
  HealthFactor,
  BehaviorFactor,
} from "./types";
import { TaskPriority } from "@/lib/planner/types/planner";

function djb2Hash(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}

function generateDomainId(prefix: string, value: string): string {
  const norm = value.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
  return `${prefix}_${djb2Hash(norm)}`;
}

function normalizeText(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, " ");
}

function cleanTitle(text: string): string {
  let cleaned = text.trim().replace(/^[,\.\-:\s]+|[,\.\-:\s]+$/g, "");
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  return cleaned;
}

const ESTIMATION_TABLE: Array<{ keywords: string[]; minutes: number }> = [
  { keywords: ["email", "mail", "message", "slack", "tweet"], minutes: 15 },
  { keywords: ["call", "sync", "standup", "checkin"], minutes: 30 },
  { keywords: ["fix", "bug", "patch", "review", "refactor"], minutes: 45 },
  { keywords: ["study", "learn", "read", "dsa", "algorithm", "course"], minutes: 120 },
  { keywords: ["report", "doc", "document", "essay", "article", "paper"], minutes: 180 },
  { keywords: ["portfolio", "app", "project", "build", "code", "system", "feature"], minutes: 300 },
];

function estimateDuration(title: string): number {
  const norm = normalizeText(title);
  for (const entry of ESTIMATION_TABLE) {
    if (entry.keywords.some((kw) => norm.includes(kw))) {
      return entry.minutes;
    }
  }
  return 60;
}

const ABSTRACT_GOAL_INDICATORS = [
  "get into", "internship", "become", "be healthier", "learn happiness",
  "rich", "millionaire", "get job", "pass exam", "successful", "wealthy", "promotion",
  "learn ai", "learn react", "want to learn", "aspire to", "goal is"
];

const EVENT_INDICATORS = [
  "meeting at", "call at", "conference", "webinar", "mom visiting", "mom is visiting",
  "dentist at", "doctor appointment", "party at", "flight at", "event", "science fair",
  "exam on", "exams wednesday", "hackathon sunday", "kickoff", "reunion dinner"
];

const ROUTINE_INDICATORS = [
  "every morning", "every night", "every day", "every evening", "every afternoon",
  "every weekend", "every saturday", "every sunday", "every week", "daily", "nightly",
  "gym every", "morning gym"
];

const PREFERENCE_INDICATORS = [
  "i hate", "i love", "i prefer", "i dislike", "cant stand", "can't stand", "like working"
];

const HEALTH_INDICATORS = [
  "burned out", "burnout", "migraine", "exhausted", "pain", "adhd", "injured", "injury",
  "sick", "illness", "mental health day"
];

const BEHAVIOR_INDICATORS = [
  "i procrastinate", "procrastinating", "forget deadlines", "i forget", "struggle with focus", "always late"
];

function isAbstractGoal(text: string): boolean {
  const norm = normalizeText(text);
  return ABSTRACT_GOAL_INDICATORS.some((ind) => norm.includes(ind));
}

function isEventAnchor(text: string): boolean {
  const norm = normalizeText(text);
  if (EVENT_INDICATORS.some((ind) => norm.includes(ind))) return true;
  return /\bat\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)\b/i.test(norm);
}

function isRoutine(text: string): boolean {
  const norm = normalizeText(text);
  return ROUTINE_INDICATORS.some((ind) => norm.includes(ind));
}

function isPreference(text: string): boolean {
  const norm = normalizeText(text);
  return PREFERENCE_INDICATORS.some((ind) => norm.includes(ind));
}

function isHealth(text: string): boolean {
  const norm = normalizeText(text);
  return HEALTH_INDICATORS.some((ind) => norm.includes(ind));
}

function isBehavior(text: string): boolean {
  const norm = normalizeText(text);
  return BEHAVIOR_INDICATORS.some((ind) => norm.includes(ind));
}

/**
 * Extracts core concepts to match duplicate statements (e.g., "Finish compiler assignment before Friday"
 * vs "Finish my compiler assignment").
 */
function getCoreConcept(text: string): string {
  return normalizeText(text)
    .replace(/\b(finish|need to|want to|prepare for|my|the|a|an|before|in|by|due|on|next|this|sometime|today|tomorrow|days|weeks|friday|monday|tuesday|wednesday|thursday|saturday|sunday)\b/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

function areSimilarStatements(a: string, b: string): boolean {
  const normA = normalizeText(a);
  const normB = normalizeText(b);
  if (normA === normB || normA.includes(normB) || normB.includes(normA)) return true;

  const conceptA = getCoreConcept(a);
  const conceptB = getCoreConcept(b);
  if (conceptA.length >= 4 && conceptB.length >= 4) {
    if (conceptA === conceptB || conceptA.includes(conceptB) || conceptB.includes(conceptA)) {
      return true;
    }
  }
  return false;
}

export interface BuildContextInput {
  understanding: UnderstandingResult;
  memory?: MemoryExtractionResult;
  clarificationAnswers?: Record<string, string>;
}

export function buildPlanningContext(input: BuildContextInput): PlanningContext {
  const { understanding, memory, clarificationAnswers = {} } = input;
  const extraction = understanding.extraction || {
    events: [],
    deadlines: [],
    goals: [],
    constraints: [],
    priorities: [],
    emotionalSignals: [],
    missingInformation: [],
  };

  const actionableItems: ActionableItem[] = [];
  const constraints: DomainConstraint[] = [];
  const events: EventAnchor[] = [];
  const goals: AbstractGoal[] = [];
  const preferences: DomainPreference[] = [];
  const routines: DomainRoutine[] = [];
  const healthFactors: HealthFactor[] = [];
  const behaviorFactors: BehaviorFactor[] = [];

  const processedStatements = new Set<string>();

  // Helper to register memory items upstream
  if (memory && memory.memories) {
    for (const mem of memory.memories) {
      const val = cleanTitle(mem.value);
      if (mem.category === "routine") {
        routines.push({ id: generateDomainId("routine", val), text: val });
      } else if (mem.category === "preference") {
        preferences.push({ id: generateDomainId("pref", val), text: val });
      } else if (mem.category === "health") {
        healthFactors.push({ id: generateDomainId("health", val), text: val });
      } else if (mem.category === "behavior") {
        behaviorFactors.push({
          id: generateDomainId("behavior", val),
          text: val,
          bufferMultiplier: normalizeText(val).includes("procrastinate") || normalizeText(val).includes("forget") ? 1.2 : 1.0,
        });
      }
    }
  }

  // Raw candidate statements extracted from understanding
  const rawCandidates: Array<{ text: string; source: string }> = [];

  if (extraction.events) extraction.events.forEach((t) => rawCandidates.push({ text: t, source: "events" }));
  if (extraction.deadlines) extraction.deadlines.forEach((t) => rawCandidates.push({ text: t, source: "deadlines" }));
  if (extraction.goals) extraction.goals.forEach((t) => rawCandidates.push({ text: t, source: "goals" }));
  if (extraction.constraints) extraction.constraints.forEach((t) => rawCandidates.push({ text: t, source: "constraints" }));
  if (extraction.priorities) extraction.priorities.forEach((t) => rawCandidates.push({ text: t, source: "priorities" }));
  if (understanding.rawText) {
    const sentences = understanding.rawText
      .split(/(?<=[\.\!\?\n])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    sentences.forEach((s) => rawCandidates.push({ text: s, source: "rawText" }));
  }

  // Process candidates into exactly ONE domain primitive
  for (const candidate of rawCandidates) {
    const title = cleanTitle(candidate.text);
    if (!title) continue;

    const norm = normalizeText(title);
    if (processedStatements.has(norm)) continue;

    // Check if statement is similar to an already processed statement concept
    let alreadyProcessed = false;
    for (const proc of Array.from(processedStatements)) {
      if (areSimilarStatements(title, proc)) {
        alreadyProcessed = true;
        break;
      }
    }
    if (alreadyProcessed) continue;
    processedStatements.add(norm);

    // 1. Routine classification
    if (isRoutine(title)) {
      if (!routines.some((r) => areSimilarStatements(r.text, title))) {
        routines.push({ id: generateDomainId("routine", title), text: title });
      }
      continue;
    }

    // 2. Preference classification
    if (isPreference(title)) {
      if (!preferences.some((p) => areSimilarStatements(p.text, title))) {
        preferences.push({ id: generateDomainId("pref", title), text: title });
      }
      continue;
    }

    // 3. Health / Emotional factor classification
    if (isHealth(title) || candidate.source === "emotionalSignals") {
      if (!healthFactors.some((h) => areSimilarStatements(h.text, title))) {
        healthFactors.push({ id: generateDomainId("health", title), text: title });
      }
      continue;
    }

    // 4. Behavior factor classification
    if (isBehavior(title)) {
      if (!behaviorFactors.some((b) => areSimilarStatements(b.text, title))) {
        behaviorFactors.push({
          id: generateDomainId("behavior", title),
          text: title,
          bufferMultiplier: norm.includes("procrastinate") || norm.includes("forget") ? 1.2 : 1.0,
        });
      }
      continue;
    }

    // 5. Event Anchor classification
    if (candidate.source === "events" || isEventAnchor(title)) {
      if (!events.some((e) => areSimilarStatements(e.title, title))) {
        events.push({ id: generateDomainId("event", title), title, source: candidate.source });
      }
      continue;
    }

    // 6. Abstract Goal classification
    if (candidate.source === "goals" || isAbstractGoal(title)) {
      if (!goals.some((g) => areSimilarStatements(g.title, title))) {
        goals.push({
          id: generateDomainId("goal", title),
          title,
          reason: "Planner cannot execute abstract goals directly without breakdown.",
        });
      }
      continue;
    }

    // 7. General Domain Constraint classification
    if (candidate.source === "constraints") {
      if (!constraints.some((c) => areSimilarStatements(c.text, title))) {
        constraints.push({ id: generateDomainId("constraint", title), text: title, source: candidate.source });
      }
      continue;
    }

    // 8. Actionable Item classification (Executable Work Tasks)
    let priority: TaskPriority = "medium";
    let deadline: string | null = null;
    let reason = "Converted executable item into task.";

    // Match deadline from extraction or clarification
    const matchedDeadline = (extraction.deadlines || []).find((d) => areSimilarStatements(d, title));
    if (candidate.source === "deadlines" || matchedDeadline || norm.includes("by ") || norm.includes("deadline") || norm.includes("before ")) {
      priority = "high";
      deadline = matchedDeadline || candidate.text;
      reason = `Priority escalated to high due to attached deadline ('${deadline}').`;
    }

    for (const [qKey, answer] of Object.entries(clarificationAnswers)) {
      if (answer && (areSimilarStatements(qKey, title) || normalizeText(answer).includes("deadline"))) {
        deadline = answer;
        priority = "high";
        reason = `Deadline and priority updated from user clarification response ('${answer}').`;
      }
    }

    const estimatedMinutes = estimateDuration(title);
    const category = candidate.source === "priorities" ? "work" : "general";

    actionableItems.push({
      id: generateDomainId("task", title),
      title,
      deadline,
      priority,
      estimatedMinutes,
      category,
      source: candidate.source,
      reason,
    });
  }

  return {
    actionableItems,
    constraints,
    events,
    goals,
    preferences,
    routines,
    healthFactors,
    behaviorFactors,
    timestamp: new Date().toISOString(),
  };
}
