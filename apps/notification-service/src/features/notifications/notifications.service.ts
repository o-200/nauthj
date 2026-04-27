import { Inject, Injectable } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { PaymentsCreatedEventDto } from '@common/common/events/interfaces/payments.created';
import { Model } from 'mongoose';
import { Notification } from './interfaces/notification.interface';
import { INJECTION_TOKENS } from '@common/constants/tokens.constants';
import { NOTIFICATION_TITLES } from '@common/constants/events.constants';
import { notificationDto } from './dto/notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @Inject(INJECTION_TOKENS.NOTIFICATION_MODEL)
    private notificationModel: Model<Notification>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  handlePaymentCreated(data: PaymentsCreatedEventDto) {
    this.notificationsGateway.sendNotification({
      userId: data.fromUserId,
      data: data,
    });
    this.notificationsGateway.sendNotification({
      userId: data.toUserId,
      data: data,
    });

    const notification = new this.notificationModel({
      title: NOTIFICATION_TITLES.PAYMENT_RECEIVED,
      data: data,
    });

    return notification.save();
  }

  findAll(): Promise<Notification[]> {
    return this.notificationModel.find().exec();
  }
}
