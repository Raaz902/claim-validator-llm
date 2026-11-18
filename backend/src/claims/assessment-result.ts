export interface AssessmentResult {
  justified: boolean;
  confidence: number; // 0..1
  reasoning: string;
}

export interface SaveAssessmentInput {
  claim: string;
  evidence: string;
  result: AssessmentResult;
  model: string;
}
