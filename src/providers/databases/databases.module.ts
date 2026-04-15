import { Module } from '@nestjs/common';
import { databaseProviders } from './database.providers';
import { LoggerModule } from 'src/common/logger/logger.module';

@Module({
  imports: [LoggerModule],
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabasesModule {}
