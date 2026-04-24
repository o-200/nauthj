import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsService } from './notifications.service';

describe('NotificationsController', () => {
  let controller: NotificationsController;

  const mockGateway = {
    sendNotification: jest.fn(),
  };

  const mockNotificationsService = {
    handlePaymentCreated: jest.fn(),
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsGateway,
          useValue: mockGateway,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('sendNotification', () => {
    it('should send notification through gateway', () => {
      const body = { userId: 'user-123' };

      controller.sendNotification(body);

      expect(mockGateway.sendNotification).toHaveBeenCalledTimes(1);
      expect(mockGateway.sendNotification).toHaveBeenCalledWith('user-123', {});
    });
  });

  describe('handlePaymentCreated', () => {
    it('should delegate payment event to notifications service', async () => {
      const payload = {
        fromUserId: 'user-1',
        toUserId: 'user-2',
        amount: 100,
      };

      await controller.handlePaymentCreated(payload);

      expect(
        mockNotificationsService.handlePaymentCreated,
      ).toHaveBeenCalledTimes(1);

      expect(
        mockNotificationsService.handlePaymentCreated,
      ).toHaveBeenCalledWith(payload);
    });
  });

  describe('findAll', () => {
    it('should return all notifications from service', async () => {
      const notifications = [
        { _id: 'n1', title: 'Payment Received', data: { amount: 1 } },
        { _id: 'n2', title: 'Payment Received', data: { amount: 2 } },
      ];

      mockNotificationsService.findAll.mockResolvedValue(notifications);

      const result = await controller.findAll();

      expect(mockNotificationsService.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(notifications);
    });
  });
});
