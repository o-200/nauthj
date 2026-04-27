import { registerAs } from '@nestjs/config';
import {
  CONFIG_NAMESPACES,
  ENV_KEYS,
} from '@common/constants/config.constants';

export default registerAs(CONFIG_NAMESPACES.FILE_STORAGE, () => ({
  endpoint: process.env[ENV_KEYS.MINIO_ENDPOINT],
  region: process.env[ENV_KEYS.MINIO_REGION],
  credentials: {
    accessKeyId: process.env[ENV_KEYS.MINIO_ACCESS_KEY],
    secretAccessKey: process.env[ENV_KEYS.MINIO_SECRET_KEY],
  },
}));
