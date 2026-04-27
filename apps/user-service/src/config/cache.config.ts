import KeyvRedis, { Keyv } from '@keyv/redis';
import { registerAs } from '@nestjs/config';
import { CacheableMemory } from 'cacheable';
import {
  CONFIG_NAMESPACES,
  ENV_KEYS,
} from '@common/constants/config.constants';

export default registerAs(CONFIG_NAMESPACES.CACHE, () => {
  const ttl = Number(process.env[ENV_KEYS.REDIS_TTL]) || undefined;

  return {
    isGlobal: true,
    stores: [
      new Keyv({
        store: new CacheableMemory({
          ttl,
          lruSize: 5000,
        }),
      }),
      new KeyvRedis(process.env[ENV_KEYS.REDIS_ADDRESS]),
    ],
  };
});
