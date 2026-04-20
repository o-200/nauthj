import { Body, Controller, Post } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsGateway: NotificationsGateway) {}

  @Post()
  sendNotification(@Body() body: { userId: string }) {
    this.notificationsGateway.sendNotification(body.userId);
  }
}
