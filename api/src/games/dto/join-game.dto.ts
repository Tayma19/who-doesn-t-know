import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class JoinGameDto {
  @ApiProperty({
    example: 'A7K2P',
    description: 'Five-character game room code',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z0-9]{5}$/, {
    message: 'roomCode must contain exactly 5 letters or digits',
  })
  roomCode: string;

  @ApiProperty({
    example: 'Mikdad',
    description: 'Display name of the joining player',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  displayName: string;
}
