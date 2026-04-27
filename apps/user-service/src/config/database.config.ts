import { registerAs } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';
import { User } from '../features/users/entities/user.entity';
import { Avatar } from '../features/avatars/entities/avatar.entity';
import { Payment } from '../features/payments/entities/payment.entity';
import {
  CONFIG_NAMESPACES,
  ENV_KEYS,
} from '@common/constants/config.constants';

export default registerAs(
  CONFIG_NAMESPACES.DATABASE,
  (): DataSourceOptions => ({
    type: 'postgres',
    host: process.env[ENV_KEYS.POSTGRES_HOST],
    port: Number(process.env[ENV_KEYS.POSTGRES_PORT]),
    username: process.env[ENV_KEYS.POSTGRES_USER],
    password: process.env[ENV_KEYS.POSTGRES_PASSWORD],
    database: process.env[ENV_KEYS.POSTGRES_DB],
    entities: [User, Avatar, Payment], // instead must use migrations
    synchronize: true,
    logging: ['query', 'error', 'schema', 'migration'],
  }),
);
