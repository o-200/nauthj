import { Module } from '@nestjs/common';
import { databaseProviders } from 'src/config/database';

@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabasesModule { }
