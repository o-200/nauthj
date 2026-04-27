import { registerAs } from '@nestjs/config';
import {
  CONFIG_NAMESPACES,
  ENV_KEYS,
} from '@common/constants/config.constants';

export default registerAs(CONFIG_NAMESPACES.BULL, () => ({
  connection: {
    host: process.env[ENV_KEYS.REDIS_HOST],
    port: Number(process.env[ENV_KEYS.REDIS_PORT]),
    password: process.env[ENV_KEYS.REDIS_PASSWORD],
  },
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 100,
  },
}));
