import { ConfigService } from '@nestjs/config';
import { TypeOrmCustomLogger } from 'libs/logger/typeorm-logger.service';
import { DataSource, DataSourceOptions } from 'typeorm';
import { INJECTION_TOKENS } from '@common/constants/tokens.constants';
import { CONFIG_KEYS } from '@common/constants/config.constants';

export const databaseProviders = [
  {
    provide: INJECTION_TOKENS.DATA_SOURCE,
    inject: [ConfigService, TypeOrmCustomLogger],
    useFactory: async (
      configService: ConfigService,
      customLogger: TypeOrmCustomLogger,
    ) => {
      const dataSource = new DataSource({
        ...configService.getOrThrow<DataSourceOptions>(CONFIG_KEYS.DATABASE),
        logger: customLogger,
      });

      return dataSource.initialize();
    },
  },
];
