import { NotificationSchema } from 'apps/notification-service/src/features/notifications/schemas/notification.schema';
import { Connection } from 'mongoose';

export const NotificationProviders = [
  {
    provide: 'NOTIFICATION_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('Notification', NotificationSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
