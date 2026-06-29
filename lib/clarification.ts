import { ExtractionResult } from "@/types/extraction";
import { ClarificationQuestion, ClarificationResult } from "@/types/clarification";

const DAYS_OF_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
  "today",
  "tomorrow",
];

const EXECUTABLE_ACTION_VERBS = [
  "finish",
  "build",
  "write",
  "complete",
  "prepare",
  "create",
  "design",
  "develop",
  "draft",
  "make",
  "implement",
  "fix",
  "organize",
  "setup",
  "code",
  "deploy",
  "ship",
  "record",
  "submit",
];

function hasSpecificDay(text: string): boolean {
  const lower = text.toLowerCase();
  return DAYS_OF_WEEK.some((day) => lower.includes(day)) || /\b\d{1,2}[\/\.-]\d{1,2}\b/.test(lower);
}

function isExecutableGoal(goal: string): boolean {
  const lower = goal.toLowerCase();
  return EXECUTABLE_ACTION_VERBS.some((verb) => new RegExp(`\\b${verb}\\b`, "i").test(lower));
}

export function generateClarifications(extraction: ExtractionResult): ClarificationResult {
  const questions: ClarificationQuestion[] = [];
  const questionIds = new Set<string>();

  // Rule 1: Check for interview without a specific day/time
  const allTexts = [
    ...(extraction.events || []),
    ...(extraction.deadlines || []),
    ...(extraction.missingInformation || []),
  ];

  const interviewItem = allTexts.find((item) => item.toLowerCase().includes("interview"));
  if (interviewItem && !hasSpecificDay(interviewItem)) {
    const id = "interview-time";
    if (!questionIds.has(id)) {
      questionIds.add(id);
      questions.push({
        id,
        question: "When is your interview?",
        reason: "Interview timing is required to allocate space on your schedule.",
      });
    }
  }

  // Rule 2: Deadlines missing a specific date/day
  for (const deadline of extraction.deadlines || []) {
    if (!hasSpecificDay(deadline)) {
      const cleanName = deadline.replace(/deadline:?/i, "").trim();
      const id = `deadline-date-${cleanName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
      if (!questionIds.has(id)) {
        questionIds.add(id);
        questions.push({
          id,
          question: `What is the exact deadline date for ${cleanName}?`,
          reason: "An exact deadline is needed to prioritize execution before it is due.",
        });
      }
    }
  }

  // Rule 3: Executable work goals requiring effort estimation (excluding outcome-oriented goals like "Pass exams")
  for (const goal of extraction.goals || []) {
    if (isExecutableGoal(goal)) {
      const lower = goal.toLowerCase();
      const hasTimeEstimate = /\b\d+\s*(hours?|hrs?|mins?|minutes?|days?)\b/.test(lower);
      if (!hasTimeEstimate) {
        const id = `goal-effort-${lower.replace(/[^a-z0-9]/g, "-")}`;
        if (!questionIds.has(id)) {
          questionIds.add(id);
          questions.push({
            id,
            question: `About how many hours do you think "${goal}" will take?`,
            reason: "Time estimation is required to allocate adequate focus blocks in your plan.",
          });
        }
      }
    }
  }

  // Enforce maximum limit of 3 questions
  const finalQuestions = questions.slice(0, 3);

  return {
    requiresClarification: finalQuestions.length > 0,
    questions: finalQuestions,
  };
}
