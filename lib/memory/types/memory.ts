export type MemoryCategory =
  | "routine"
  | "preference"
  | "project"
  | "goal"
  | "relationship"
  | "health"
  | "behavior";

export interface MemoryItem {
  id: string;
  category: MemoryCategory;
  value: string;
  confidence: number;
  reason: string;
}

export interface MemoryExtractionResult {
  memories: MemoryItem[];
  extractedCount: number;
  timestamp: string;
}
