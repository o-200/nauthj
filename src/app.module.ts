import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FeaturesModule } from './features/features.module';
import { ConfigModule } from '@nestjs/config';
import { AppCacheModule } from './providers/cache/app.cache.module';
import { BackgroundJobsModule } from './providers/background-jobs/background-jobs.module';
import { LoggerModule } from './common/logger/logger.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    FeaturesModule,
    AppCacheModule,
    BackgroundJobsModule,
    LoggerModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
