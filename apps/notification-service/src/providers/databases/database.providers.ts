import * as mongoose from 'mongoose';
import { ConfigService } from '@nestjs/config';

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    inject: [ConfigService],
    useFactory: async (
      configService: ConfigService,
    ): Promise<typeof mongoose> => {
      const uri = configService.getOrThrow<string>('MONGO_URI');

      return mongoose.connect(uri, {
        dbName: configService.getOrThrow<string>('MONGO_DB'),
      });
    },
  },
];
