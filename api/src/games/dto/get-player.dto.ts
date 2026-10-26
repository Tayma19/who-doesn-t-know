import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
export class GetPlayerDto {
     @ApiProperty({ example: 'p_test1' })
     @IsString()
     @IsNotEmpty()
     playerId: string; }
