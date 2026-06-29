import {
  PlannerInput,
  PlanResult,
  Task,
  PlanWarning,
  PlanAssumption,
  UnplannedItem,
} from "./types/planner";
import { PlanningContext } from "@/lib/domain/types";

function normalize(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, " ");
}

export function createPlan(input: PlanningContext | PlannerInput): PlanResult {
  const context: PlanningContext = "context" in input ? input.context : input;

  const tasks: Task[] = [];
  const warnings: PlanWarning[] = [];
  const assumptions: PlanAssumption[] = [];
  const unplannedItems: UnplannedItem[] = [];

  // 1. Buffer modifier from behavior factors
  let bufferMultiplier = 1.0;
  if (context.behaviorFactors && context.behaviorFactors.length > 0) {
    for (const bf of context.behaviorFactors) {
      if (bf.bufferMultiplier > 1.0) {
        bufferMultiplier = bf.bufferMultiplier;
        assumptions.push({
          id: `assump_behavior_${bf.id}`,
          target: bf.text,
          message: `Adjusted task time estimates (+20% buffer) based on behavior memory '${bf.text}'.`,
        });
      }
    }
  }

  // 2. Routine constraints assumptions
  if (context.routines && context.routines.length > 0) {
    const routineMsgs = context.routines
      .map((r) => `Routine detected: '${r.text}'. Planner constraints applied to avoid scheduling conflicts.`)
      .join(" ");
    assumptions.push({
      id: "assump_memory_routines",
      target: "Planner Schedule Constraints",
      message: routineMsgs,
    });
  }

  // 3. Process Fixed Event Anchors (Events are NOT tasks)
  if (context.events) {
    for (const event of context.events) {
      assumptions.push({
        id: `assump_event_${event.id}`,
        target: event.title,
        message: `Event '${event.title}' recognized as fixed schedule anchor. Not converted to executable work task.`,
      });
    }
  }

  // 4. Process Abstract Goals (Abstract goals are NOT tasks)
  if (context.goals) {
    for (const goal of context.goals) {
      warnings.push({
        id: `warn_${goal.id}`,
        target: goal.title,
        message: `Goal '${goal.title}' has no actionable tasks. Need actionable steps.`,
      });
      unplannedItems.push({
        id: `unplan_${goal.id}`,
        title: goal.title,
        reason: goal.reason,
      });
    }
  }

  // 5. Convert Actionable Items into Executable Tasks
  if (context.actionableItems) {
    for (const item of context.actionableItems) {
      const estimatedMinutes = Math.round(item.estimatedMinutes * bufferMultiplier);

      // Simple deterministic dependency check
      const dependsOn: string[] = [];
      const normTitle = normalize(item.title);
      if (normTitle.includes("after") || normTitle.includes("then")) {
        for (const t of tasks) {
          if (normTitle.includes(normalize(t.title))) {
            dependsOn.push(t.id);
          }
        }
      }

      if (!item.deadline) {
        assumptions.push({
          id: `assump_nodeadline_${item.id}`,
          target: item.title,
          message: `No explicit deadline supplied for '${item.title}'. Planner assumed medium urgency.`,
        });
      }

      tasks.push({
        id: item.id,
        title: item.title,
        priority: item.priority,
        estimatedMinutes,
        dependsOn,
        deadline: item.deadline,
        category: item.category,
        reason: item.reason,
      });
    }
  }

  // 6. Deterministic Execution Order Sort (Algorithm 8)
  const sortedTasks = [...tasks].sort((a, b) => {
    // 1. Deadline presence
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

    // 3. Dependency count
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
