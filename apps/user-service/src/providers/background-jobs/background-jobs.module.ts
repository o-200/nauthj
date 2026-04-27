import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BullModule, BullRootModuleOptions } from '@nestjs/bullmq';
import { CONFIG_KEYS } from '@common/constants/config.constants';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.getOrThrow<BullRootModuleOptions>(CONFIG_KEYS.BULL),
    }),
  ],
  exports: [BullModule],
})
export class BackgroundJobsModule {}
