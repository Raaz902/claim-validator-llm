import { Body, Controller, Get, Post } from '@nestjs/common';
import { ClaimsService } from './claims.service';
import { AssessClaimDto } from './dto/assess-claim.dto';

@Controller('api/claims')
export class ClaimsController {
  constructor(private readonly claims: ClaimsService) {}

  @Post('assess')
  assess(@Body() dto: AssessClaimDto) {
    return this.claims.assess(dto);
  }

  @Get('assessments') // history for the UI, newest first
  list() {
    return this.claims.list();
  }
}
