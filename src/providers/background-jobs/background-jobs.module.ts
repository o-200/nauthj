import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BullModule, BullRootModuleOptions } from '@nestjs/bullmq';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.getOrThrow<BullRootModuleOptions>('bull'),
    }),
  ],
  exports: [BullModule],
})
export class BackgroundJobsModule {}
