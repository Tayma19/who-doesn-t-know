import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
export class SubmitVoteDto {
  @ApiProperty({ example: 'p_test1' })
   @IsString() @IsNotEmpty() playerId: string;
  @ApiProperty({ example: 900004 })
   @Type(() => Number)
    @IsInt()
    @Min(1)
    suspectRef: number;
}
