import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
export class AnswerQuestionDto {
  @ApiProperty({ example: 'p_test2' }) @IsString() @IsNotEmpty() playerId: string;
  @ApiProperty({ example: 'I was in the library.' })
   @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
   @IsString()
   @IsNotEmpty() text: string;
}
