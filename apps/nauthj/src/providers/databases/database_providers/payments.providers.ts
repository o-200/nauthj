import { Payment } from 'apps/nauthj/src/features/payments/entities/payment.entity';
import { DataSource } from 'typeorm';
import { INJECTION_TOKENS } from '@common/constants/tokens.constants';

export const paymentsProviders = [
  {
    provide: INJECTION_TOKENS.PAYMENT_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Payment),
    inject: [INJECTION_TOKENS.DATA_SOURCE],
  },
];
