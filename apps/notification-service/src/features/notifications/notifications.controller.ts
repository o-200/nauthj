import { Body, Controller, Get, Post } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NotificationsService } from './notifications.service';
import { PaymentsCreatedEventDto } from '@common/common/events/interfaces/payments.created';
import { KAFKA_TOPICS } from '@common/constants/kafka.constants';
import { Notification } from './interfaces/notification.interface';
import { notificationDto } from './dto/notification.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsGateway: NotificationsGateway,
    private readonly notificationService: NotificationsService,
  ) {}

  @Post()
  sendNotification<T>(@Body() body: notificationDto<T>) {
    this.notificationsGateway.sendNotification(body);
  }

  @EventPattern(KAFKA_TOPICS.PAYMENTS_CREATED)
  handlePaymentCreated(@Payload() data: PaymentsCreatedEventDto) {
    return this.notificationService.handlePaymentCreated(data);
  }

  @Get()
  findAll(): Promise<Notification[]> {
    return this.notificationService.findAll();
  }
}
