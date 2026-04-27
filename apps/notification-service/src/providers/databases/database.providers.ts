import mongoose from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { ENV_KEYS } from '@common/constants/config.constants';
import { INJECTION_TOKENS } from '@common/constants/tokens.constants';
import { MongooseCustomLogger } from 'libs/logger/mongoose-logger.servise';

export const databaseProviders = [
  {
    provide: INJECTION_TOKENS.DATABASE_CONNECTION,
    inject: [ConfigService, MongooseCustomLogger],
    useFactory: async (
      configService: ConfigService,
      mongooseCustomLogger: MongooseCustomLogger,
    ): Promise<typeof mongoose> => {
      mongooseCustomLogger.enable();
      const uri = configService.getOrThrow<string>(ENV_KEYS.MONGO_URI);

      return mongoose.connect(uri, {
        dbName: configService.getOrThrow<string>(ENV_KEYS.MONGO_DB),
      });
    },
  },
];
