import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';
export class SubmitDecisionDto {
  @ApiProperty({ example: 'p_test1' })
   @IsString()
    @IsNotEmpty()
     playerId: string;
  @ApiProperty({ example: 'vote', enum: ['continue', 'vote'] })
   @IsIn(['continue', 'vote'])
    choice: 'continue' | 'vote';
}
