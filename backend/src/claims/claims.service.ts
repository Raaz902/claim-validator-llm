import { Injectable } from '@nestjs/common';
import { OpenAIService } from '../openai/openai.service';
import { AssessmentDbService } from './assessment-db.service';
import { AssessClaimDto } from './dto/assess-claim.dto';

// Orchestration only: ask the LLM, then save.
@Injectable()
export class ClaimsService {
  constructor(
    private readonly openAI: OpenAIService,
    private readonly db: AssessmentDbService,
  ) {}

  async assess({ claim, evidence }: AssessClaimDto) {
    const { result, model } = await this.openAI.assessClaim(claim, evidence);
    return this.db.saveAssessment({ claim, evidence, result, model });
  }

  list() {
    return this.db.listAssessments();
  }
}
