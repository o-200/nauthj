import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { DatabasesModule } from 'apps/nauthj/src/providers/databases/databases.module';
import { UsersModule } from '../users/users.module';
import { paymentsProviders } from 'apps/nauthj/src/providers/databases/database_providers/payments.providers';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    DatabasesModule,
    UsersModule,
    ClientsModule.register([
      {
        name: 'PAYMENT_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'payments',
            brokers: ['localhost:9092'],
          },
          consumer: {
            groupId: 'payments-consumer',
          },
        },
      },
    ]),
  ],
  controllers: [PaymentsController],
  providers: [...paymentsProviders, PaymentsService],
})
export class PaymentsModule {}
