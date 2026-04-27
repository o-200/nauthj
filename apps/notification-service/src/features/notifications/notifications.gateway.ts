import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { DefaultEventsMap, Server, Socket } from 'socket.io';
import { SocketData } from './common/socket.data';
import { JwtVerifyService } from '@common/common/auth/jwt.service';
import { ERROR_MESSAGES } from '@common/constants/error.constants';
import { SOCKET_EVENTS } from '@common/constants/events.constants';
import { notificationDto } from './dto/notification.dto';

@WebSocketGateway()
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(private readonly jwtVerifyService: JwtVerifyService) {}

  @WebSocketServer() io: Server;

  afterInit() {
    this.logger.log('Initialized');
  }

  async handleConnection(
    client: Socket<
      DefaultEventsMap,
      DefaultEventsMap,
      DefaultEventsMap,
      SocketData
    >,
  ) {
    const { sockets } = this.io.sockets;

    try {
      const authHeader = client.handshake.headers.authorization;
      if (!authHeader) {
        throw new Error(ERROR_MESSAGES.NO_AUTHORIZATION_HEADER);
      }
      client.data.userId = await this.jwtVerifyService.verify(authHeader);
    } catch {
      client.disconnect();
      return;
    }

    this.logger.log(`Client id: ${client.id} connected`);
    this.logger.debug(`Number of connected clients: ${sockets.size}`);

    this.logger.debug(`User id: ${client.data.userId}`);
    await client.join(client.data.userId);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliend id:${client.id} disconnected`);
  }

  @SubscribeMessage(SOCKET_EVENTS.PING)
  handleMessage<T>(client: Socket, data: T) {
    this.logger.log(`Message received from client id: ${client.id}`);
    this.logger.debug(`Payload: ${JSON.stringify(data)}`);
    return {
      event: SOCKET_EVENTS.PONG,
      data: 'Wrong data that will make the test fail',
    };
  }

  sendNotification<T>(notification: notificationDto<T>) {
    this.logger.debug(
      `Sending notification to user id: ${notification.userId}`,
    );
    this.io
      .to(notification.userId)
      .emit(SOCKET_EVENTS.NOTIFICATION, { data: notification.data });
  }
}
