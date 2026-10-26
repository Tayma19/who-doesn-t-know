import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';
export class CreateTipDto {
  @ApiProperty({ example: 'Central library' }) 
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value) 
  @IsString() 
  @IsNotEmpty() 
  @MaxLength(120) 
  text: string;

  @ApiProperty({ enum: ['Places', 'Food', 'Jobs', 'Sports'] }) 
  @IsIn(['Places', 'Food', 'Jobs', 'Sports']) 
  category: 'Places' | 'Food' | 'Jobs' | 'Sports';
}
