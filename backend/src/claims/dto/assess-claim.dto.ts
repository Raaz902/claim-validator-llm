import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AssessClaimDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  claim!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20000)
  evidence!: string;
}
