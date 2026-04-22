import { NestFactory } from '@nestjs/core';
import { NotificationServiceModule } from './notification-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { ENV_KEYS } from '@common/constants/config.constants';
import {
  KAFKA_BROKERS,
  KAFKA_CLIENTS,
  KAFKA_CONSUMER_GROUPS,
} from '@common/constants/kafka.constants';

async function bootstrap() {
  const app = await NestFactory.create(NotificationServiceModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: KAFKA_CLIENTS.NOTIFICATIONS,
        brokers: [KAFKA_BROKERS.LOCALHOST],
      },
      consumer: {
        groupId: KAFKA_CONSUMER_GROUPS.NOTIFICATIONS_CONSUMER,
      },
    },
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.startAllMicroservices();
  await app.listen(process.env[ENV_KEYS.NOTIFICATION_SERVICE_PORT] ?? 3001);
}

bootstrap().catch((err) => {
  console.error('Application failed to start:', err);
  process.exit(1);
});
