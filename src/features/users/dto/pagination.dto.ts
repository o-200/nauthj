import { IsOptional, IsInt, Min, IsDate } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
  @ApiPropertyOptional({
    example: '2026-04-01T10:00:00.000Z',
    description: 'Cursor for pagination. Returns records created before this date',
  })
  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  @IsDate()
  createdAt?: Date;

  @ApiPropertyOptional({
    example: 10,
    description: 'Number of records to return',
    default: 10,
    minimum: 1,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 10))
  @IsInt()
  @Min(1)
  limit?: number;
}