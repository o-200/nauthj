import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchFilterDto {
  @ApiPropertyOptional({
    example: 'alex123',
    description: 'Filter users by login (exact match)',
    maxLength: 64,
  })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  login?: string;
}