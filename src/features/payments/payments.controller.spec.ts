import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let paymentsService: { create: jest.Mock };

  beforeEach(async () => {
    paymentsService = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        {
          provide: PaymentsService,
          useValue: paymentsService,
        },
      ],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call paymentsService.create with dto and current user id', async () => {
    const currentUser = {
      sub: 'sender-id',
      email: 'sender@mail.com',
    };

    const dto: CreatePaymentDto = {
      recipientId: 'recipient-id',
      amount: 10,
    };

    const expectedResult = {
      id: 'payment-id',
      amount_cents: '1000',
    };

    paymentsService.create.mockResolvedValue(expectedResult);

    const result = await controller.create(currentUser, dto);

    expect(paymentsService.create).toHaveBeenCalledWith(dto, currentUser.sub);
    expect(result).toBe(expectedResult);
  });
});
