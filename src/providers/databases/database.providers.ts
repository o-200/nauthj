import { ConfigService } from '@nestjs/config';
import { databaseSourceOptions } from 'src/config/database.source.options';
import { DataSource } from 'typeorm';
import { TypeOrmCustomLogger } from '../../common/logger/typeorm-logger.service';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    inject: [ConfigService, TypeOrmCustomLogger],
    useFactory: (
      configService: ConfigService,
      customLogger: TypeOrmCustomLogger,
    ) => {
      const dataSource = new DataSource(
        databaseSourceOptions(configService, customLogger),
      );
      return dataSource.initialize();
    },
  },
];
