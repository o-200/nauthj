import { Avatar } from 'apps/nauthj/src/features/avatars/entities/avatar.entity';
import { DataSource } from 'typeorm';
import { INJECTION_TOKENS } from '@common/constants/tokens.constants';

export const avatarsProviders = [
  {
    provide: INJECTION_TOKENS.AVATAR_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Avatar),
    inject: [INJECTION_TOKENS.DATA_SOURCE],
  },
];
