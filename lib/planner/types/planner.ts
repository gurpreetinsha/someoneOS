import { PlanningContext } from "@/lib/domain/types";

export type TaskPriority = "high" | "medium" | "low";

export interface Task {
  id: string;
  title: string;
  priority: TaskPriority;
  estimatedMinutes: number;
  dependsOn: string[];
  deadline: string | null;
  category: string;
  reason: string;
}

export interface PlanWarning {
  id: string;
  target: string;
  message: string;
}

export interface PlanAssumption {
  id: string;
  target: string;
  message: string;
}

export interface UnplannedItem {
  id: string;
  title: string;
  reason: string;
}

export interface PlannerInput {
  context: PlanningContext;
}

export interface PlanResult {
  tasks: Task[];
  executionOrder: string[];
  warnings: PlanWarning[];
  assumptions: PlanAssumption[];
  unplannedItems: UnplannedItem[];
  timestamp: string;
}
