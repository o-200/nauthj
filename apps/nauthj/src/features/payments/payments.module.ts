import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { DatabasesModule } from 'apps/nauthj/src/providers/databases/databases.module';
import { UsersModule } from '../users/users.module';
import { paymentsProviders } from 'apps/nauthj/src/providers/databases/database_providers/payments.providers';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { INJECTION_TOKENS } from '@common/constants/tokens.constants';
import {
  KAFKA_BROKERS,
  KAFKA_CLIENTS,
  KAFKA_CONSUMER_GROUPS,
} from '@common/constants/kafka.constants';

@Module({
  imports: [
    DatabasesModule,
    UsersModule,
    ClientsModule.register([
      {
        name: INJECTION_TOKENS.PAYMENT_SERVICE,
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: KAFKA_CLIENTS.PAYMENTS,
            brokers: [KAFKA_BROKERS.LOCALHOST],
          },
          consumer: {
            groupId: KAFKA_CONSUMER_GROUPS.PAYMENTS_CONSUMER,
          },
        },
      },
    ]),
  ],
  controllers: [PaymentsController],
  providers: [...paymentsProviders, PaymentsService],
})
export class PaymentsModule {}
