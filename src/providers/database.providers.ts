import { ConfigService } from '@nestjs/config';
import { databaseSourceOptions } from 'src/config/database.source.options';
import { DataSource } from 'typeorm';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => {
      const dataSource = new DataSource(databaseSourceOptions(configService))
      return dataSource.initialize();
    }
  },
];
