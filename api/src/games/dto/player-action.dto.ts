import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PlayerActionDto {
  @ApiProperty({
    example: 'p_a82f31c4d912',
    description: 'Private player ID of the player performing the action',
  })
  @IsString()
  @IsNotEmpty()
  playerId: string;
}
