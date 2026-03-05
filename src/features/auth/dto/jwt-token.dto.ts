import { IntersectionType } from '@nestjs/mapped-types'
import { AccessTokenDto } from './access-token.dto';
import { RefreshTokenDto } from './refresh-token.dto';

export class jwtTokenDto extends IntersectionType(
  AccessTokenDto,
  RefreshTokenDto
) { }