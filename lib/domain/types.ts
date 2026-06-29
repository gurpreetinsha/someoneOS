import { TaskPriority } from "@/lib/planner/types/planner";

export interface ActionableItem {
  id: string;
  title: string;
  deadline: string | null;
  priority: TaskPriority;
  estimatedMinutes: number;
  category: string;
  source: string;
  reason: string;
}

export interface DomainConstraint {
  id: string;
  text: string;
  source: string;
}

export interface EventAnchor {
  id: string;
  title: string;
  source: string;
}

export interface AbstractGoal {
  id: string;
  title: string;
  reason: string;
}

export interface DomainPreference {
  id: string;
  text: string;
}

export interface DomainRoutine {
  id: string;
  text: string;
}

export interface HealthFactor {
  id: string;
  text: string;
}

export interface BehaviorFactor {
  id: string;
  text: string;
  bufferMultiplier: number;
}

export interface PlanningContext {
  actionableItems: ActionableItem[];
  constraints: DomainConstraint[];
  events: EventAnchor[];
  goals: AbstractGoal[];
  preferences: DomainPreference[];
  routines: DomainRoutine[];
  healthFactors: HealthFactor[];
  behaviorFactors: BehaviorFactor[];
  timestamp: string;
}
