import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtVerifyService } from '@common/common/auth/jwt.service';
import { NotificationsGateway } from './notifications.gateway';
import { DefaultEventsMap, Server, Socket } from 'socket.io';
import { SocketData } from './common/socket.data';

type TestSocket = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  SocketData
>;

describe('NotificationsGateway', () => {
  let gateway: NotificationsGateway;
  let jwtVerifyService: { verify: jest.Mock };

  const createClient = (
    overrides?: Partial<
      TestSocket & {
        handshake: { headers: { authorization?: string } };
        disconnect: jest.Mock;
        join: jest.Mock<Promise<void>, [string]>;
      }
    >,
  ): TestSocket => {
    const client = {
      id: 'client-1',
      handshake: {
        headers: {
          authorization: 'Bearer token',
        },
      },
      data: {} as SocketData,
      disconnect: jest.fn(),
      join: jest.fn().mockResolvedValue(undefined),
      emit: jest.fn(),
      on: jest.fn(),
    };

    return {
      ...client,
      ...overrides,
    } as unknown as TestSocket;
  };

  beforeEach(async () => {
    jwtVerifyService = {
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsGateway,
        {
          provide: JwtVerifyService,
          useValue: jwtVerifyService,
        },
      ],
    }).compile();

    gateway = module.get<NotificationsGateway>(NotificationsGateway);

    gateway.io = {
      sockets: {
        sockets: new Map([
          ['client-1', {}],
          ['client-2', {}],
        ]),
      },
      to: jest.fn().mockReturnValue({
        emit: jest.fn(),
      }),
    } as unknown as Server;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('afterInit', () => {
    it('should log initialization', () => {
      const logSpy = jest
        .spyOn(Logger.prototype, 'log')
        .mockImplementation(() => undefined);

      gateway.afterInit();

      expect(logSpy).toHaveBeenCalledWith('Initialized');
    });
  });

  describe('handleConnection', () => {
    it('should verify token, save userId and join user room', async () => {
      const client = createClient();
      const logSpy = jest
        .spyOn(Logger.prototype, 'log')
        .mockImplementation(() => undefined);
      const debugSpy = jest
        .spyOn(Logger.prototype, 'debug')
        .mockImplementation(() => undefined);

      jwtVerifyService.verify.mockResolvedValue('user-123');

      await gateway.handleConnection(client);

      expect(jwtVerifyService.verify).toHaveBeenCalledWith('Bearer token');
      expect(client.data.userId).toBe('user-123');
      expect(client.join).toHaveBeenCalledWith('user-123');
      expect(logSpy).toHaveBeenCalledWith('Client id: client-1 connected');
      expect(debugSpy).toHaveBeenCalledWith('Number of connected clients: 2');
      expect(debugSpy).toHaveBeenCalledWith('User id: user-123');
      expect(client.disconnect).not.toHaveBeenCalled();
    });

    it('should disconnect client when authorization header is missing', async () => {
      const client = createClient({
        handshake: {
          headers: {},
        },
      });

      await gateway.handleConnection(client);

      expect(jwtVerifyService.verify).not.toHaveBeenCalled();
      expect(client.disconnect).toHaveBeenCalled();
      expect(client.join).not.toHaveBeenCalled();
    });

    it('should disconnect client when token verification fails', async () => {
      const client = createClient();

      jwtVerifyService.verify.mockRejectedValue(new Error('Invalid token'));

      await gateway.handleConnection(client);

      expect(jwtVerifyService.verify).toHaveBeenCalledWith('Bearer token');
      expect(client.disconnect).toHaveBeenCalled();
      expect(client.join).not.toHaveBeenCalled();
    });
  });

  describe('handleDisconnect', () => {
    it('should log disconnect', () => {
      const client = createClient();
      const logSpy = jest
        .spyOn(Logger.prototype, 'log')
        .mockImplementation(() => undefined);

      gateway.handleDisconnect(client);

      expect(logSpy).toHaveBeenCalledWith('Cliend id:client-1 disconnected');
    });
  });

  describe('handleMessage', () => {
    it('should log message and return pong event', () => {
      const client = createClient();
      const logSpy = jest
        .spyOn(Logger.prototype, 'log')
        .mockImplementation(() => undefined);
      const debugSpy = jest
        .spyOn(Logger.prototype, 'debug')
        .mockImplementation(() => undefined);

      const payload = { hello: 'world' };

      const result = gateway.handleMessage(client, payload);

      expect(logSpy).toHaveBeenCalledWith(
        'Message received from client id: client-1',
      );
      expect(debugSpy).toHaveBeenCalledWith('Payload: {"hello":"world"}');

      expect(result).toEqual({
        event: 'pong',
        data: 'Wrong data that will make the test fail',
      });
    });
  });

  describe('sendNotification', () => {
    it('should emit notification to user room', () => {
      const emit = jest.fn();
      const to = jest.fn().mockReturnValue({ emit });
      const debugSpy = jest
        .spyOn(Logger.prototype, 'debug')
        .mockImplementation(() => undefined);

      gateway.io = {
        to,
      } as unknown as Server;

      gateway.sendNotification('user-123', 'hello!');

      expect(debugSpy).toHaveBeenCalledWith(
        'Sending notification to user id: user-123',
      );
      expect(to).toHaveBeenCalledWith('user-123');
      expect(emit).toHaveBeenCalledWith('notification', { data: 'hello!' });
    });
  });
});
