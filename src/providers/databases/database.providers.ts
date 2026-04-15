import { ConfigService } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { TypeOrmCustomLogger } from '../../common/logger/typeorm-logger.service';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    inject: [ConfigService, TypeOrmCustomLogger],
    useFactory: async (
      configService: ConfigService,
      customLogger: TypeOrmCustomLogger,
    ) => {
      const dataSource = new DataSource({
        ...configService.getOrThrow<DataSourceOptions>('database'),
        logger: customLogger,
      });

      return dataSource.initialize();
    },
  },
];
