import { ConfigService } from '@nestjs/config';
import { TypeOrmCustomLogger } from 'libs/logger/typeorm-logger.service';
import { DataSource, DataSourceOptions } from 'typeorm';

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
