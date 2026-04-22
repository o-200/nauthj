import { User } from 'apps/nauthj/src/features/users/entities/user.entity';
import { DataSource } from 'typeorm';
import { INJECTION_TOKENS } from '@common/constants/tokens.constants';

export const usersProviders = [
  {
    provide: INJECTION_TOKENS.USER_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(User),
    inject: [INJECTION_TOKENS.DATA_SOURCE],
  },
];
