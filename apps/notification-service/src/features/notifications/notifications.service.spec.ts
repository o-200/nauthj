import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { PaymentsCreatedEventDto } from '@common/common/events/interfaces/payments.created';

describe('NotificationsService', () => {
  let service: NotificationsService;

  const mockNotificationsGateway = {
    sendNotification: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
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
    it('should send notification to sender and recipient', () => {
      const event: PaymentsCreatedEventDto = {
        fromUserId: 'user-1',
        toUserId: 'user-2',
        amount: 100,
      };

      const consoleSpy = jest
        .spyOn(console, 'log')
        .mockImplementation(() => undefined);

      service.handlePaymentCreated(event);

      expect(consoleSpy).toHaveBeenCalledWith('payment event', event);
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
    });
  });
});
