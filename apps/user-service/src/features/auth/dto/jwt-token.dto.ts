import { IntersectionType } from '@nestjs/mapped-types';
import { ApiExtraModels } from '@nestjs/swagger';
import { AccessTokenDto } from './access-token.dto';
import { RefreshTokenDto } from './refresh-token.dto';

@ApiExtraModels(AccessTokenDto, RefreshTokenDto)
export class jwtTokenDto extends IntersectionType(
  AccessTokenDto,
  RefreshTokenDto,
) {}
