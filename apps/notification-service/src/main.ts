import { NestFactory } from '@nestjs/core';
import { NotificationServiceModule } from './notification-service.module';
import { MicroserviceOptions } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { getKafkaTransportConfig } from '@common/config/kafka.config';
import {
  KAFKA_CLIENTS,
  KAFKA_CONSUMER_GROUPS,
} from '@common/constants/kafka.constants';
import { ENV_KEYS } from '@common/constants/config.constants';

async function bootstrap() {
  const app = await NestFactory.create(NotificationServiceModule);

  app.connectMicroservice<MicroserviceOptions>(
    getKafkaTransportConfig(
      KAFKA_CLIENTS.NOTIFICATIONS,
      KAFKA_CONSUMER_GROUPS.NOTIFICATIONS_CONSUMER,
    ),
  );

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.startAllMicroservices();
  await app.listen(process.env[ENV_KEYS.NOTIFICATION_SERVICE_PORT] ?? 3001);
}

bootstrap().catch((err) => {
  console.error('Application failed to start:', err);
  process.exit(1);
});
