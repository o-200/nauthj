import { ConfigService } from '@nestjs/config';

export const cacheConfig = (configService: ConfigService) => ({
  ttl: configService.getOrThrow<number>('CACHE_TTL'),
  isGlobal: configService.getOrThrow<boolean>('CACHE_IS_GLOBAL'),
});
