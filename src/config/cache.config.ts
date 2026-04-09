import KeyvRedis, { Keyv } from '@keyv/redis';
import { ConfigService } from '@nestjs/config';
import { CacheableMemory } from 'cacheable';

export const cacheConfig = (configService: ConfigService) => ({
  isGlobal: configService.getOrThrow<boolean>('CACHE_IS_GLOBAL'),
  stores: [
    new Keyv({
      store: new CacheableMemory({
        ttl: configService.getOrThrow<string>('REDIS_TTL'),
        lruSize: 5000,
      }),
    }),
    new KeyvRedis(configService.getOrThrow<string>('REDIS_ADDRESS')),
  ],
});
