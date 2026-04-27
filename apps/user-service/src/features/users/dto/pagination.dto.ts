import { IsOptional, IsInt, Min, IsDate } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
  @ApiPropertyOptional({
    example: '2026-04-01T10:00:00.000Z',
    description:
      'Cursor for pagination. Returns records created before this date',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' || value instanceof Date
      ? new Date(value)
      : value,
  )
  @IsDate()
  createdAt?: Date;

  @ApiPropertyOptional({
    example: 10,
    description: 'Number of records to return',
    default: 10,
    minimum: 1,
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' || typeof value === 'number'
      ? Number(value)
      : value,
  )
  @IsInt()
  @Min(1)
  limit?: number;
}
