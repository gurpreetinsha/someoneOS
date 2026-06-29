import { UnderstandingResult } from "@/types/understanding";
import { MemoryCategory, MemoryItem, MemoryExtractionResult } from "./types/memory";

// --- Composable Pure String Utilities ---

export function normalizeText(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, " ");
}

export function tokenize(text: string): string[] {
  return normalizeText(text)
    .replace(/[^a-z0-9\s]/g, "")
    .split(" ")
    .filter(Boolean);
}

export function containsWord(text: string, word: string): boolean {
  const tokens = tokenize(text);
  return tokens.includes(word.toLowerCase());
}

export function startsWith(text: string, prefix: string): boolean {
  return normalizeText(text).startsWith(normalizeText(prefix));
}

export function containsPhrase(text: string, phrase: string): boolean {
  const normText = normalizeText(text);
  const normPhrase = normalizeText(phrase);
  return normText.includes(normPhrase);
}

export function cleanValue(text: string): string {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^[,\.\-:\s]+|[,\.\-:\s]+$/g, "");
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  return cleaned;
}

// --- Deterministic ID Generation ---

function djb2Hash(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}

export function generateMemoryId(category: MemoryCategory, value: string): string {
  const normalized = value.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
  const hash = djb2Hash(`${category}:${normalized}`);
  return `mem_${category}_${hash}`;
}

// --- Statement Extraction Utility ---

export function splitIntoStatements(input: string | string[]): string[] {
  if (Array.isArray(input)) {
    return input.flatMap((item) => splitIntoStatements(item));
  }
  if (!input || typeof input !== "string") return [];

  // Split by sentence terminators, newlines, and conjunctions (and, but)
  return input
    .split(/(?<=[\.\!\?\n])\s+|;\s+|\s+and\s+|\s+but\s+/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

// --- Modular Category Memory Extractors ---

export function extractRoutineMemory(input: string | string[]): MemoryItem[] {
  const statements = splitIntoStatements(input);
  const memories: MemoryItem[] = [];

  const highFreqPatterns = [
    "every morning", "every night", "every day", "every evening",
    "every afternoon", "every weekend", "every saturday", "every sunday",
    "every week", "every month", "daily", "nightly"
  ];
  const routineAdverbs = ["usually", "routinely", "habitually", "always wake up", "go gym every"];

  for (const stmt of statements) {
    const norm = normalizeText(stmt);

    // If it mentions a explicit relationship role, let relationship extractor take primary ownership
    if (containsPhrase(norm, "my mom") || containsPhrase(norm, "my manager") || containsPhrase(norm, "my dad")) {
      continue;
    }

    let matchedPattern: string | null = null;
    let confidence = 0;

    for (const pat of highFreqPatterns) {
      if (containsPhrase(norm, pat)) {
        matchedPattern = pat;
        confidence = 0.95;
        break;
      }
    }

    if (!matchedPattern) {
      for (const adv of routineAdverbs) {
        if (containsPhrase(norm, adv)) {
          matchedPattern = adv;
          confidence = 0.88;
          break;
        }
      }
    }

    if (matchedPattern) {
      const val = cleanValue(stmt);
      memories.push({
        id: generateMemoryId("routine", val),
        category: "routine",
        value: val,
        confidence,
        reason: `Detected routine indicator '${matchedPattern}'`,
      });
    }
  }

  return memories;
}

export function extractPreferenceMemory(input: string | string[]): MemoryItem[] {
  const statements = splitIntoStatements(input);
  const memories: MemoryItem[] = [];

  const strongPrefPatterns = ["i hate", "i love", "i prefer", "i dislike", "cant stand", "can't stand"];
  const moderatePrefPatterns = ["i like", "i enjoy", "my preference", "prefer mornings", "like working in"];

  for (const stmt of statements) {
    const norm = normalizeText(stmt);
    let matchedPattern: string | null = null;
    let confidence = 0;

    for (const pat of strongPrefPatterns) {
      if (containsPhrase(norm, pat)) {
        matchedPattern = pat;
        confidence = 0.92;
        break;
      }
    }

    if (!matchedPattern) {
      for (const pat of moderatePrefPatterns) {
        if (containsPhrase(norm, pat)) {
          matchedPattern = pat;
          confidence = 0.85;
          break;
        }
      }
    }

    if (matchedPattern) {
      const val = cleanValue(stmt);
      memories.push({
        id: generateMemoryId("preference", val),
        category: "preference",
        value: val,
        confidence,
        reason: `Detected preference indicator '${matchedPattern}'`,
      });
    }
  }

  return memories;
}

export function extractProjectMemory(input: string | string[]): MemoryItem[] {
  const statements = splitIntoStatements(input);
  const memories: MemoryItem[] = [];

  const projectPhrases = [
    "building", "making a", "working on", "developing", "side project", "portfolio", "someoneos"
  ];

  for (const stmt of statements) {
    const norm = normalizeText(stmt);
    
    const isBuildingOrMaking = containsPhrase(norm, "building") || containsPhrase(norm, "making") || containsPhrase(norm, "working on") || containsPhrase(norm, "developing");
    const mentionsProjectNoun = containsPhrase(norm, "portfolio") || containsPhrase(norm, "someoneos") || containsPhrase(norm, "project") || containsPhrase(norm, "app");

    if (isBuildingOrMaking || mentionsProjectNoun) {
      if (containsPhrase(norm, "making a call")) continue;

      let matchedPattern = "project keyword";
      let confidence = 0.85;

      for (const pat of projectPhrases) {
        if (containsPhrase(norm, pat)) {
          matchedPattern = pat;
          confidence = 0.90;
          break;
        }
      }

      const val = cleanValue(stmt);
      memories.push({
        id: generateMemoryId("project", val),
        category: "project",
        value: val,
        confidence,
        reason: `Detected project creation context '${matchedPattern}'`,
      });
    }
  }

  return memories;
}

export function extractGoalMemory(input: string | string[]): MemoryItem[] {
  const statements = splitIntoStatements(input);
  const memories: MemoryItem[] = [];

  const strongGoalPatterns = ["i want to", "my goal is", "aiming to", "aspire to"];
  const moderateGoalPatterns = ["planning to", "hoping to", "trying to", "target is"];

  for (const stmt of statements) {
    const norm = normalizeText(stmt);
    let matchedPattern: string | null = null;
    let confidence = 0;

    for (const pat of strongGoalPatterns) {
      if (containsPhrase(norm, pat)) {
        matchedPattern = pat;
        confidence = 0.93;
        break;
      }
    }

    if (!matchedPattern) {
      for (const pat of moderateGoalPatterns) {
        if (containsPhrase(norm, pat)) {
          matchedPattern = pat;
          confidence = 0.87;
          break;
        }
      }
    }

    if (matchedPattern) {
      const val = cleanValue(stmt);
      memories.push({
        id: generateMemoryId("goal", val),
        category: "goal",
        value: val,
        confidence,
        reason: `Detected goal orientation phrase '${matchedPattern}'`,
      });
    }
  }

  return memories;
}

export function extractRelationshipMemory(input: string | string[]): MemoryItem[] {
  const statements = splitIntoStatements(input);
  const memories: MemoryItem[] = [];

  const relationshipRoles = [
    "my mom", "my mother", "my dad", "my father", "my manager",
    "my boss", "my wife", "my husband", "my son", "my daughter",
    "my sister", "my brother", "my partner", "my friend"
  ];

  for (const stmt of statements) {
    const norm = normalizeText(stmt);
    let matchedRole: string | null = null;

    for (const role of relationshipRoles) {
      if (containsPhrase(norm, role)) {
        matchedRole = role;
        break;
      }
    }

    if (matchedRole) {
      const val = cleanValue(stmt);
      memories.push({
        id: generateMemoryId("relationship", val),
        category: "relationship",
        value: val,
        confidence: 0.94,
        reason: `Detected relationship entity '${matchedRole}'`,
      });
    }
  }

  return memories;
}

export function extractHealthMemory(input: string | string[]): MemoryItem[] {
  const statements = splitIntoStatements(input);
  const memories: MemoryItem[] = [];

  const healthTerms = [
    "adhd", "injured", "injury", "allergy", "allergic",
    "migraine", "back pain", "shoulder", "diagnosed",
    "insomnia", "diabetic", "asthma"
  ];

  for (const stmt of statements) {
    const norm = normalizeText(stmt);
    let matchedTerm: string | null = null;

    for (const term of healthTerms) {
      if (containsWord(norm, term) || containsPhrase(norm, term)) {
        matchedTerm = term;
        break;
      }
    }

    if (matchedTerm) {
      const val = cleanValue(stmt);
      const isDirectDeclaration = containsPhrase(norm, "i have") || containsPhrase(norm, "injured my");
      const confidence = isDirectDeclaration ? 0.96 : 0.88;

      memories.push({
        id: generateMemoryId("health", val),
        category: "health",
        value: val,
        confidence,
        reason: `Detected health condition indicator '${matchedTerm}'`,
      });
    }
  }

  return memories;
}

export function extractBehaviorMemory(input: string | string[]): MemoryItem[] {
  const statements = splitIntoStatements(input);
  const memories: MemoryItem[] = [];

  const explicitBehaviorPatterns = [
    "i procrastinate", "procrastinating", "forget deadlines",
    "i forget", "struggle with focus", "always late"
  ];
  const generalTendencyPatterns = ["i tend to", "habit of", "distracted easily"];

  for (const stmt of statements) {
    const norm = normalizeText(stmt);
    let matchedPattern: string | null = null;
    let confidence = 0;

    for (const pat of explicitBehaviorPatterns) {
      if (containsPhrase(norm, pat)) {
        matchedPattern = pat;
        confidence = 0.91;
        break;
      }
    }

    if (!matchedPattern) {
      for (const pat of generalTendencyPatterns) {
        if (containsPhrase(norm, pat)) {
          matchedPattern = pat;
          confidence = 0.84;
          break;
        }
      }
    }

    if (matchedPattern) {
      const val = cleanValue(stmt);
      memories.push({
        id: generateMemoryId("behavior", val),
        category: "behavior",
        value: val,
        confidence,
        reason: `Detected behavioral habit pattern '${matchedPattern}'`,
      });
    }
  }

  return memories;
}

// --- Main Engine Orchestrator ---

export function extractMemory(understanding: UnderstandingResult): MemoryExtractionResult {
  const candidateStatements: string[] = [];

  if (understanding.rawText) {
    candidateStatements.push(...splitIntoStatements(understanding.rawText));
  }

  if (understanding.extraction) {
    const ext = understanding.extraction;
    if (ext.events) candidateStatements.push(...ext.events);
    if (ext.deadlines) candidateStatements.push(...ext.deadlines);
    if (ext.goals) candidateStatements.push(...ext.goals);
    if (ext.constraints) candidateStatements.push(...ext.constraints);
    if (ext.priorities) candidateStatements.push(...ext.priorities);
    if (ext.emotionalSignals) candidateStatements.push(...ext.emotionalSignals);
    if (ext.missingInformation) candidateStatements.push(...ext.missingInformation);
  }

  // Run candidate statements through each category extractor
  const allExtracted: MemoryItem[] = [
    ...extractRoutineMemory(candidateStatements),
    ...extractPreferenceMemory(candidateStatements),
    ...extractProjectMemory(candidateStatements),
    ...extractGoalMemory(candidateStatements),
    ...extractRelationshipMemory(candidateStatements),
    ...extractHealthMemory(candidateStatements),
    ...extractBehaviorMemory(candidateStatements),
  ];

  // Deduplicate by ID and value, keeping highest confidence
  const memoryMap = new Map<string, MemoryItem>();
  for (const item of allExtracted) {
    const existing = memoryMap.get(item.id);
    if (!existing || item.confidence > existing.confidence) {
      memoryMap.set(item.id, item);
    }
  }

  const memories = Array.from(memoryMap.values());

  return {
    memories,
    extractedCount: memories.length,
    timestamp: new Date().toISOString(),
  };
}
