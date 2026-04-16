import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { usersProviders } from 'apps/nauthj/src/providers/databases/database_providers/users.providers';
import { DatabasesModule } from 'apps/nauthj/src/providers/databases/databases.module';
import { BullModule } from '@nestjs/bullmq';
import { UsersProcessor } from './users.processor';
import { ResetBalancesJob } from './jobs/reset-balances.job';
import { CommonService } from '@common/common';

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
    CommonService,
  ],
  exports: [UsersService],
})
export class UsersModule {}
