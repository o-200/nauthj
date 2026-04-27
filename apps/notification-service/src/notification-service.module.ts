import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationsModule } from './features/notifications/notifications.module';
import jwtConfig from 'libs/config/jwt.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [jwtConfig],
    }),
    NotificationsModule,
  ],
})
export class NotificationServiceModule {}
