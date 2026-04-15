import KeyvRedis, { Keyv } from '@keyv/redis';
import { registerAs } from '@nestjs/config';
import { CacheableMemory } from 'cacheable';

export default registerAs('cache', () => ({
  isGlobal: true,
  stores: [
    new Keyv({
      store: new CacheableMemory({
        ttl: Number(process.env.REDIS_TTL),
        lruSize: 5000,
      }),
    }),
    new KeyvRedis(process.env.REDIS_ADDRESS),
  ],
}));
