import { registerAs } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';
import { User } from '../features/users/entities/user.entity';
import { Avatar } from '../features/avatars/entities/avatar.entity';
import { Payment } from '../features/payments/entities/payment.entity';

export default registerAs(
  'database',
  (): DataSourceOptions => ({
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    entities: [User, Avatar, Payment],
    synchronize: true,
    logging: ['query', 'error', 'schema', 'migration'],
  }),
);
