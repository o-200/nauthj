import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

type JwtUser = {
  sub: string;
  email: string;
};

type RequestWithUser = Request & {
  user?: JwtUser;
};

export const User = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtUser => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user?.sub || !user.email) {
      throw new UnauthorizedException('User not found in request');
    }

    return user;
  },
);
