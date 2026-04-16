import { IsOptional, IsInt, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ActiveUsersDto {
  @ApiPropertyOptional({
    example: 18,
    description: 'Minimum age',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }): number | undefined =>
    value !== undefined ? Number(value) : undefined,
  )
  @IsInt()
  @Min(0)
  ageMin?: number;

  @ApiPropertyOptional({
    example: 60,
    description: 'Maximum age',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }): number | undefined =>
    value !== undefined ? Number(value) : undefined,
  )
  @IsInt()
  @Min(0)
  ageMax?: number;
}
