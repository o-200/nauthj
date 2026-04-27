import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtVerifyService } from '@common/common/auth/jwt.service';
import { NotificationsController } from './notifications.controller';
import { ClientsModule } from '@nestjs/microservices';
import { DatabasesModule } from '../../providers/databases/databases.module';
import { NotificationProviders } from '../../providers/databases/database_providers/notification.providers';
import { INJECTION_TOKENS } from '@common/constants/tokens.constants';
import {
  KAFKA_CLIENTS,
  KAFKA_CONSUMER_GROUPS,
} from '@common/constants/kafka.constants';
import { CONFIG_KEYS } from '@common/constants/config.constants';
import { getKafkaTransportConfig } from '@common/config/kafka.config';

@Module({
  imports: [
    DatabasesModule,
    ClientsModule.registerAsync([
      {
        name: INJECTION_TOKENS.NOTIFICATION_SERVICE,
        useFactory: () =>
          getKafkaTransportConfig(
            KAFKA_CLIENTS.NOTIFICATION,
            KAFKA_CONSUMER_GROUPS.NOTIFICATION_SERVICE,
          ),
      },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>(CONFIG_KEYS.JWT_SECRET),
      }),
    }),
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsGateway,
    JwtVerifyService,
    ...NotificationProviders,
  ],
})
export class NotificationsModule {}
