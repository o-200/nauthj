export const KAFKA_TOPICS = {
  PAYMENTS_CREATED: 'payments.created',
} as const;

export const KAFKA_CLIENTS = {
  PAYMENTS: 'payments',
  NOTIFICATION: 'notification',
  NOTIFICATIONS: 'notifications',
} as const;

export const KAFKA_CONSUMER_GROUPS = {
  PAYMENTS_CONSUMER: 'payments-consumer',
  NOTIFICATION_SERVICE: 'notification-service',
  NOTIFICATIONS_CONSUMER: 'notifications-consumer',
} as const;

export const KAFKA_BROKERS = {
  LOCALHOST: 'localhost:9092',
} as const;
