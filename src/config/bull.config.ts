import { BullRootModuleOptions } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';

export const bullConfig = (
  configService: ConfigService,
): BullRootModuleOptions => ({
  connection: {
    host: configService.getOrThrow<string>('REDIS_HOST'),
    port: Number(configService.getOrThrow<string>('REDIS_PORT')),
    password: configService.getOrThrow<string>('REDIS_PASSWORD'),
  },
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 100,
  },
});
