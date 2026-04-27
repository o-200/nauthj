import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { usersProviders } from 'apps/user-service/src/providers/databases/database_providers/users.providers';
import { DatabasesModule } from 'apps/user-service/src/providers/databases/databases.module';
import { BullModule } from '@nestjs/bullmq';
import { UsersProcessor } from './users.processor';
import { ResetBalancesJob } from './jobs/reset-balances.job';
import { CommonService } from '@common/common';
import { QUEUE_NAMES } from '@common/constants/queue.constants';

@Module({
  imports: [
    DatabasesModule,
    BullModule.registerQueue({
      name: QUEUE_NAMES.USERS,
    }),
  ],
  controllers: [UsersController],
  providers: [
    ...usersProviders,
    UsersService,
    UsersProcessor,
    ResetBalancesJob,
    CommonService,
  ],
  exports: [UsersService],
})
export class UsersModule {}
