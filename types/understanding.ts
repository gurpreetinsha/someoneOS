import { ExtractionResult } from "./extraction";
import { ClarificationResult } from "./clarification";

export interface UnderstandingResult {
  extraction: ExtractionResult;
  clarification: ClarificationResult;
}
