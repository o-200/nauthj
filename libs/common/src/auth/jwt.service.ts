import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'apps/nauthj/src/features/auth/common/interfaces/jwt.payload';

@Injectable()
export class JwtVerifyService {
  constructor(private readonly jwtService: JwtService) {}

  async verify(token?: string): Promise<string> {
    if (!token) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const [type, value] = token.split(' ');

    if (type !== 'Bearer' || !value) {
      throw new UnauthorizedException('Invalid authorization header');
    }

    const payload = await this.jwtService.verifyAsync<JwtPayload>(value);

    return payload.sub;
  }
}
