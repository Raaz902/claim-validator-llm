import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SaveAssessmentInput } from './assessment-result';

// The only class that talks to Prisma.
@Injectable()
export class AssessmentDbService {
  constructor(private readonly prisma: PrismaService) {}

  saveAssessment({ claim, evidence, result, model }: SaveAssessmentInput) {
    return this.prisma.assessment.create({
      data: {
        claim: { create: { text: claim } },
        evidence,
        justified: result.justified,
        confidence: result.confidence,
        reasoning: result.reasoning,
        model,
        rawResponse: { ...result },
      },
      include: { claim: true },
    });
  }

  listAssessments() {
    return this.prisma.assessment.findMany({
      include: { claim: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
