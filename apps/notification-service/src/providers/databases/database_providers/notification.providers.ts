import { NotificationSchema } from 'apps/notification-service/src/features/notifications/schemas/notification.schema';
import { Connection } from 'mongoose';
import { INJECTION_TOKENS } from '@common/constants/tokens.constants';
import { DATABASE_MODELS } from '@common/constants/db.constants';

export const NotificationProviders = [
  {
    provide: INJECTION_TOKENS.NOTIFICATION_MODEL,
    useFactory: (connection: Connection) =>
      connection.model(DATABASE_MODELS.NOTIFICATION, NotificationSchema),
    inject: [INJECTION_TOKENS.DATABASE_CONNECTION],
  },
];
