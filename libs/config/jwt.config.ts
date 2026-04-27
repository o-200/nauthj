import { registerAs } from '@nestjs/config';
import {
  CONFIG_NAMESPACES,
  ENV_KEYS,
} from '@common/constants/config.constants';

export default registerAs(CONFIG_NAMESPACES.JWT, () => ({
  secret: process.env[ENV_KEYS.JWT_SECRET],
  signOptions: {
    expiresIn: '15m',
  },
}));
