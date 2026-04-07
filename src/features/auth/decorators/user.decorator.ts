import { createParamDecorator, ExecutionContext, UnauthorizedException } from "@nestjs/common";

export const User = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const user = request.user;

  if (!user?.sub) {
    throw new UnauthorizedException('User not found in request');
  }

  if (!user?.userId && !user?.email) {
    throw new UnauthorizedException('User not found in request');
  }

  return user
});