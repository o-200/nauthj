import { Injectable } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { PaymentsCreatedEventDto } from '@common/common/events/interfaces/payments.created';

@Injectable()
export class NotificationsService {
  constructor(private readonly notificationsGateway: NotificationsGateway) {}

  handlePaymentCreated(data: PaymentsCreatedEventDto) {
    console.log('payment event', data);

    this.notificationsGateway.sendNotification(data.fromUserId, data);
    this.notificationsGateway.sendNotification(data.toUserId, data);
  }
}
