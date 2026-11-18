import { Module } from '@nestjs/common';
import { OpenAIService } from '../openai/openai.service';
import { PrismaService } from '../prisma/prisma.service';
import { AssessmentDbService } from './assessment-db.service';
import { ClaimsController } from './claims.controller';
import { ClaimsService } from './claims.service';

@Module({
  controllers: [ClaimsController],
  providers: [ClaimsService, OpenAIService, AssessmentDbService, PrismaService],
})
export class ClaimsModule {}
