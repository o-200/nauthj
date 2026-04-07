import { DataSource } from 'typeorm';
import { Avatar } from 'src/features/avatars/entities/avatar.entity';

export const avatarProviders = [
  {
    provide: 'AVATAR_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Avatar),
    inject: ['DATA_SOURCE'],
  },
];
