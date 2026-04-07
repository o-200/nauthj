import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

type JwtUser = {
  sub: string;
  email: string;
  userId?: string;
};

type RequestWithUser = Request & {
  user?: JwtUser;
};

export const User = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtUser => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user?.sub) {
      throw new UnauthorizedException('User not found in request');
    }

    if (!user.userId && !user.email) {
      throw new UnauthorizedException('User not found in request');
    }

    return user;
  },
);
