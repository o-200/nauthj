import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { PaymentsCreatedEventDto } from '@common/common/events/interfaces/payments.created';

describe('NotificationsService', () => {
  let service: NotificationsService;

  const mockNotificationsGateway = {
    sendNotification: jest.fn(),
  };

  const saveMock = jest.fn<
    Promise<{
      _id: string;
      title: string;
      data: PaymentsCreatedEventDto;
    }>,
    []
  >();

  type NotificationModelPayload = {
    title: string;
    data: PaymentsCreatedEventDto;
  };

  const notificationModelMock = jest
    .fn()
    .mockImplementation((dto: NotificationModelPayload) => ({
      ...dto,
      save: saveMock,
    }));
  const findExecMock = jest.fn();
  notificationModelMock.find = jest.fn(() => ({
    exec: findExecMock,
  }));

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: 'NOTIFICATION_MODEL',
          useValue: notificationModelMock,
        },
        {
          provide: NotificationsGateway,
          useValue: mockNotificationsGateway,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handlePaymentCreated', () => {
    it('should send notification to sender and recipient and save notification', async () => {
      const event: PaymentsCreatedEventDto = {
        fromUserId: 'user-1',
        toUserId: 'user-2',
        amount: 100,
      };

      const savedNotification = {
        _id: 'notification-id',
        title: 'Payment Received',
        data: event,
      };

      saveMock.mockResolvedValue(savedNotification);

      const result = await service.handlePaymentCreated(event);

      expect(mockNotificationsGateway.sendNotification).toHaveBeenCalledTimes(
        2,
      );
      expect(mockNotificationsGateway.sendNotification).toHaveBeenNthCalledWith(
        1,
        'user-1',
        event,
      );
      expect(mockNotificationsGateway.sendNotification).toHaveBeenNthCalledWith(
        2,
        'user-2',
        event,
      );

      expect(notificationModelMock).toHaveBeenCalledTimes(1);
      expect(notificationModelMock).toHaveBeenCalledWith({
        title: 'Payment Received',
        data: event,
      });

      expect(saveMock).toHaveBeenCalledTimes(1);
      expect(result).toEqual(savedNotification);
    });
  });

  describe('findAll', () => {
    it('should return all notifications', async () => {
      const notifications = [
        { _id: 'n1', title: 'Payment Received', data: { amount: 1 } },
        { _id: 'n2', title: 'Payment Received', data: { amount: 2 } },
      ];

      findExecMock.mockResolvedValue(notifications);

      const result = await service.findAll();

      expect(notificationModelMock.find).toHaveBeenCalledTimes(1);
      expect(findExecMock).toHaveBeenCalledTimes(1);
      expect(result).toEqual(notifications);
    });
  });
});
