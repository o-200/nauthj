import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { DatabasesModule } from 'apps/nauthj/src/providers/databases/databases.module';
import { UsersModule } from '../users/users.module';
import { paymentsProviders } from 'apps/nauthj/src/providers/databases/database_providers/payments.providers';

@Module({
  imports: [DatabasesModule, UsersModule],
  controllers: [PaymentsController],
  providers: [...paymentsProviders, PaymentsService],
})
export class PaymentsModule {}
