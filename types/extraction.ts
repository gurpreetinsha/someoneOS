export interface ExtractionResult {
  events: string[];
  deadlines: string[];
  goals: string[];
  constraints: string[];
  priorities: string[];
  emotionalSignals: string[];
  missingInformation: string[];
}

export type ExecutionStageStatus = "Waiting..." | "Processing..." | "Completed" | "Failed";

export interface ExecutionState {
  understanding: ExecutionStageStatus;
  planning: ExecutionStageStatus;
  calendar: ExecutionStageStatus;
  research: ExecutionStageStatus;
}
