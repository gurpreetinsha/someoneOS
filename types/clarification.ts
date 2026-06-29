export interface ClarificationQuestion {
  id: string;
  question: string;
  reason: string;
}

export interface ClarificationResult {
  requiresClarification: boolean;
  questions: ClarificationQuestion[];
}
