import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateTipDto {
  @ApiPropertyOptional({ example: 'Central library' })
  @IsOptional()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  text?: string;

  @ApiPropertyOptional({ enum: ['Places', 'Food', 'Jobs', 'Sports'] })
  @IsOptional()
  @IsIn(['Places', 'Food', 'Jobs', 'Sports'])
  category?: 'Places' | 'Food' | 'Jobs' | 'Sports';
}
