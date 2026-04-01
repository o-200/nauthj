import { IsOptional, IsString, MaxLength } from 'class-validator';

export class SearchFilterDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  login?: string;
}