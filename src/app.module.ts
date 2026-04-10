import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FeaturesModule } from './features/features.module';
import { ConfigModule } from '@nestjs/config';
import { AppCacheModule } from './providers/cache/app.cache.module';
import { BackgroundJobsModule } from './providers/background-jobs/background-jobs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    FeaturesModule,
    AppCacheModule,
    BackgroundJobsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
