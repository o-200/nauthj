import { Body, Controller, Post } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NotificationsService } from './notifications.service';
import { PaymentsCreatedEventDto } from '@common/common/events/interfaces/payments.created';
import { KAFKA_TOPICS } from '@common/constants/kafka.constants';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsGateway: NotificationsGateway,
    private readonly notificationService: NotificationsService,
  ) {}

  @Post()
  sendNotification(@Body() body: { userId: string }) {
    this.notificationsGateway.sendNotification(body.userId, {});
  }

  @EventPattern(KAFKA_TOPICS.PAYMENTS_CREATED)
  handlePaymentCreated(@Payload() data: PaymentsCreatedEventDto) {
    return this.notificationService.handlePaymentCreated(data);
  }
}
