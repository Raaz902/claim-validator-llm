import { BadGatewayException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { AssessmentResult } from '../claims/assessment-result';

const SYSTEM_PROMPT =
  'You are a cosmetic claim substantiation expert. Judge whether the evidence ' +
  'supports the claim. Consider sample size, control/placebo group, study duration ' +
  'vs. claimed duration, statistical significance, and whether the measured endpoint ' +
  'and effect size match the claim. If the evidence is insufficient or unrelated, the ' +
  'claim is not justified. "confidence" is how certain you are that YOUR VERDICT is ' +
  'correct (0 = pure guess, 1 = certain), whether the verdict is true or false. ' +
  'Clearly weak or irrelevant evidence means high confidence in a false verdict. ' +
  'Reply ONLY with JSON: ' +
  '{"justified": boolean, "confidence": number between 0 and 1, "reasoning": string}';

// The only class that talks to OpenAI.
@Injectable()
export class OpenAIService {
  private readonly openai: OpenAI | null;
  private readonly model: string;

  constructor(config: ConfigService) {
    const apiKey = config.get<string>('OPENAI_API_KEY');
    this.openai = apiKey ? new OpenAI({ apiKey, timeout: 60_000, maxRetries: 2 }) : null;
    this.model = config.get<string>('OPENAI_MODEL') || 'gpt-4o';
  }

  async assessClaim(claim: string, evidence: string): Promise<{ result: AssessmentResult; model: string }> {
    if (!this.openai) {
      throw new ServiceUnavailableException('OPENAI_API_KEY is not configured on the server');
    }

    let res: OpenAI.Chat.Completions.ChatCompletion;
    try {
      res = await this.openai.chat.completions.create({
        model: this.model,
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Claim: ${claim}\nEvidence: ${evidence}` },
        ],
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'unknown error';
      throw new BadGatewayException(`OpenAI request failed: ${message}`);
    }

    const result = this.parse(res.choices[0]?.message?.content);
    return { result, model: res.model };
  }

  private parse(content: string | null | undefined): AssessmentResult {
    let data: any;
    try {
      data = JSON.parse(content ?? '');
    } catch {
      throw new BadGatewayException('OpenAI returned invalid JSON');
    }
    if (typeof data?.justified !== 'boolean' || typeof data?.reasoning !== 'string') {
      throw new BadGatewayException('OpenAI response is missing required fields');
    }
    const confidence = Number(data.confidence);
    return {
      justified: data.justified,
      confidence: Number.isFinite(confidence) ? Math.min(1, Math.max(0, confidence)) : 0,
      reasoning: data.reasoning,
    };
  }
}
