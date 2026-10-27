import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
export class AskQuestionDto {
  @ApiProperty({ example: 'p_test1' })
   @IsString()
    @IsNotEmpty()
     playerId: string;

  @ApiProperty({ example: 900002 })
   @Type(() => Number) @IsInt() @Min(1) targetRef: number;
  @ApiProperty({ example: 'Where were you?' })
   @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
   @IsString()
   @IsNotEmpty()
    text: string;
}
