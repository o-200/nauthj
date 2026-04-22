import * as mongoose from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { ENV_KEYS } from '@common/constants/config.constants';
import { INJECTION_TOKENS } from '@common/constants/tokens.constants';

export const databaseProviders = [
  {
    provide: INJECTION_TOKENS.DATABASE_CONNECTION,
    inject: [ConfigService],
    useFactory: async (
      configService: ConfigService,
    ): Promise<typeof mongoose> => {
      const uri = configService.getOrThrow<string>(ENV_KEYS.MONGO_URI);

      return mongoose.connect(uri, {
        dbName: configService.getOrThrow<string>(ENV_KEYS.MONGO_DB),
      });
    },
  },
];
