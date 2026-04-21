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
    it('should delegate payment event to notifications service', () => {
      const payload = {
        fromUserId: 'user-1',
        toUserId: 'user-2',
        amount: 100,
      };

      controller.handlePaymentCreated(payload);

      expect(
        mockNotificationsService.handlePaymentCreated,
      ).toHaveBeenCalledTimes(1);
      expect(
        mockNotificationsService.handlePaymentCreated,
      ).toHaveBeenCalledWith(payload);
    });
  });
});
