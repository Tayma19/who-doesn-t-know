import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class AskQuestionDto {
  @ApiProperty({ example: 'p_test1' })
  @IsString()
  @IsNotEmpty()
  playerId: string;

  @ApiProperty({ example: 'p_test2' })
  @IsString()
  @IsNotEmpty()
  targetRef: string;

  @ApiProperty({ example: 'Where were you?' })
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty()
  text: string;
}
