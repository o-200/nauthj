import { DataSource } from 'typeorm';
import { Avatar } from 'apps/nauthj/src/features/avatars/entities/avatar.entity';

export const avatarsProviders = [
  {
    provide: 'AVATAR_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Avatar),
    inject: ['DATA_SOURCE'],
  },
];
