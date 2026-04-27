import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'apps/user-service/src/features/auth/common/interfaces/jwt.payload';
import { ERROR_MESSAGES } from '@common/constants/error.constants';
import { AUTH_SCHEMES } from '@common/constants/events.constants';

@Injectable()
export class JwtVerifyService {
  constructor(private readonly jwtService: JwtService) {}

  async verify(token?: string): Promise<string> {
    if (!token) {
      throw new UnauthorizedException(
        ERROR_MESSAGES.AUTHORIZATION_HEADER_MISSING,
      );
    }

    const [type, value] = token.split(' ');

    if (type !== AUTH_SCHEMES.BEARER || !value) {
      throw new UnauthorizedException(
        ERROR_MESSAGES.INVALID_AUTHORIZATION_HEADER,
      );
    }

    const payload = await this.jwtService.verifyAsync<JwtPayload>(value);

    return payload.sub;
  }
}
