import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { usersProviders } from 'src/providers/databases/database_providers/users.providers';
import { DatabasesModule } from 'src/providers/databases/databases.module';
import { BullModule } from '@nestjs/bullmq';
import { UsersProcessor } from './users.processor';
import { ResetBalancesJob } from './jobs/reset-balances.job';

@Module({
  imports: [
    DatabasesModule,
    BullModule.registerQueue({
      name: 'users',
    }),
  ],
  controllers: [UsersController],
  providers: [
    ...usersProviders,
    UsersService,
    UsersProcessor,
    ResetBalancesJob,
  ],
  exports: [UsersService],
})
export class UsersModule {}
