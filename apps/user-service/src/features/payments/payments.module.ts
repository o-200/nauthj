import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { DatabasesModule } from 'apps/user-service/src/providers/databases/databases.module';
import { UsersModule } from '../users/users.module';
import { paymentsProviders } from 'apps/user-service/src/providers/databases/database_providers/payments.providers';
import { INJECTION_TOKENS } from '@common/constants/tokens.constants';
import {
  KAFKA_CLIENTS,
  KAFKA_CONSUMER_GROUPS,
} from '@common/constants/kafka.constants';
import { getKafkaTransportConfig } from '@common/config/kafka.config';

@Module({
  imports: [
    DatabasesModule,
    UsersModule,
    ClientsModule.registerAsync([
      {
        name: INJECTION_TOKENS.PAYMENT_SERVICE,
        useFactory: () =>
          getKafkaTransportConfig(
            KAFKA_CLIENTS.PAYMENTS,
            KAFKA_CONSUMER_GROUPS.PAYMENTS_CONSUMER,
          ),
      },
    ]),
  ],
  controllers: [PaymentsController],
  providers: [...paymentsProviders, PaymentsService],
})
export class PaymentsModule {}
