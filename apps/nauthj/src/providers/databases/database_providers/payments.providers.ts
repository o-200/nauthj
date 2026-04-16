import { DataSource } from 'typeorm';
import { Payment } from 'apps/nauthj/src/features/payments/entities/payment.entity';

export const paymentsProviders = [
  {
    provide: 'PAYMENT_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Payment),
    inject: ['DATA_SOURCE'],
  },
];
