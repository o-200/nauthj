import { Inject, Injectable } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { PaymentsCreatedEventDto } from '@common/common/events/interfaces/payments.created';
import { Model } from 'mongoose';
import { Notification } from './interfaces/notification.interface';

@Injectable()
export class NotificationsService {
  constructor(
    @Inject('NOTIFICATION_MODEL')
    private notificationModel: Model<Notification>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  handlePaymentCreated(data: PaymentsCreatedEventDto) {
    this.notificationsGateway.sendNotification(data.fromUserId, data);
    this.notificationsGateway.sendNotification(data.toUserId, data);

    const notification = new this.notificationModel({
      title: 'Payment Received',
      data: data,
    });

    return notification.save();
  }
}
