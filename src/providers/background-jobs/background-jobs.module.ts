import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { bullConfig } from 'src/config/bull.config';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => bullConfig(configService),
    }),
  ],
  exports: [BullModule],
})
export class BackgroundJobsModule {}
