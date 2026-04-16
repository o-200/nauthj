import KeyvRedis, { Keyv } from '@keyv/redis';
import { registerAs } from '@nestjs/config';
import { CacheableMemory } from 'cacheable';

export default registerAs('cache', () => {
  const ttl = Number(process.env.REDIS_TTL) || undefined;

  return {
    isGlobal: true,
    stores: [
      new Keyv({
        store: new CacheableMemory({
          ttl,
          lruSize: 5000,
        }),
      }),
      new KeyvRedis(process.env.REDIS_ADDRESS),
    ],
  };
});
