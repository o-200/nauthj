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
        throw new Error('No authorization header');
      }
      console.log(authHeader);
      client.data.userId = await this.jwtVerifyService.verify(authHeader);
    } catch {
      client.disconnect();
      return;
    }

    this.logger.log(`Client id: ${client.id} connected`);
    this.logger.debug(`Number of connected clients: ${sockets.size}`);

    await client.join(client.data.userId);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliend id:${client.id} disconnected`);
  }

  @SubscribeMessage('ping')
  handleMessage(client: Socket, data: any) {
    this.logger.log(`Message received from client id: ${client.id}`);
    this.logger.debug(`Payload: ${data}`);
    return {
      event: 'pong',
      data: 'Wrong data that will make the test fail',
    };
  }
}
