import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { ERROR_MESSAGES } from '@common/constants/error.constants';

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
      throw new UnauthorizedException(ERROR_MESSAGES.USER_NOT_FOUND_IN_REQUEST);
    }

    return user;
  },
);
