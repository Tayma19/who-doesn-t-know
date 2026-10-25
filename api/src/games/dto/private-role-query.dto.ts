import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PrivateRoleQueryDto {
  @ApiProperty({
    example: 'p_a82f31c4d912',
    description: 'Private player ID requesting the role view',
  })
  @IsString()
  @IsNotEmpty()
  playerId: string;
}
