import { ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER, CacheInterceptor } from '@nestjs/cache-manager';
import { Reflector } from '@nestjs/core';
import type { Cache } from 'cache-manager';
import type { Request } from 'express';

type RequestWithUser = Request & {
  user?: {
    sub?: string;
    email?: string;
  };
};

@Injectable()
export class AuthMeCacheInterceptor extends CacheInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) cacheManager: Cache,
    protected readonly reflector: Reflector,
  ) {
    super(cacheManager, reflector);
  }

  trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    const userId = request.user?.sub;

    if (!userId) {
      return undefined;
    }

    return `auth:me:${userId}`;
  }
}
