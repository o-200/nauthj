import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  DataSource,
  EntityManager,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { PaymentsService } from './payments.service';
import { Payment } from './entities/payment.entity';
import { User } from '../users/entities/user.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';

type MockUserRepository = Pick<Repository<User>, 'save'>;
type MockPaymentRepository = Pick<Repository<Payment>, 'create' | 'save'>;

type MockQueryBuilder = Pick<
  SelectQueryBuilder<User>,
  'setLock' | 'where' | 'getOne'
>;

describe('PaymentsService', () => {
  let service: PaymentsService;
  let dataSource: jest.Mocked<DataSource>;

  let userRepository: jest.Mocked<MockUserRepository>;
  let paymentRepository: jest.Mocked<MockPaymentRepository>;
  let manager: jest.Mocked<EntityManager>;

  let senderQueryBuilder: jest.Mocked<MockQueryBuilder>;
  let recipientQueryBuilder: jest.Mocked<MockQueryBuilder>;

  const senderId = 'sender-id';
  const recipientId = 'recipient-id';

  const createPaymentDto: CreatePaymentDto = {
    recipientId,
    amount: 10,
  };

  const createUser = (overrides: Partial<User> = {}): User =>
    ({
      id: 'user-id',
      balanceCents: '10000',
      ...overrides,
    }) as User;

  const createPaymentEntity = (overrides: Partial<Payment> = {}): Payment =>
    ({
      id: 'payment-id',
      amount_cents: '1000',
      ...overrides,
    }) as Payment;

  beforeEach(() => {
    senderQueryBuilder = {
      setLock: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    };

    recipientQueryBuilder = {
      setLock: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    };

    userRepository = {
      save: jest.fn(),
    };

    paymentRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };

    manager = {
      getRepository: jest.fn(),
    } as unknown as jest.Mocked<EntityManager>;

    dataSource = {
      transaction: jest.fn(),
    } as unknown as jest.Mocked<DataSource>;

    service = new PaymentsService(dataSource);

    let createQueryBuilderCall = 0;

    (manager.getRepository as jest.Mock).mockImplementation((entity) => {
      if (entity === User) {
        return {
          ...userRepository,
          createQueryBuilder: jest.fn().mockImplementation(() => {
            createQueryBuilderCall += 1;
            return createQueryBuilderCall === 1
              ? senderQueryBuilder
              : recipientQueryBuilder;
          }),
        };
      }

      if (entity === Payment) {
        return paymentRepository;
      }

      return null;
    });

    (dataSource.transaction as jest.Mock).mockImplementation(
      async (cb: (manager: EntityManager) => unknown) => await cb(manager),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create payment and transfer money', async () => {
    const sender = createUser({
      id: senderId,
      balanceCents: '5000',
    });

    const recipient = createUser({
      id: recipientId,
      balanceCents: '2000',
    });

    const payment = createPaymentEntity({
      fromUser: sender,
      toUser: recipient,
      amount_cents: '1000',
    });

    senderQueryBuilder.getOne.mockResolvedValue(sender);
    recipientQueryBuilder.getOne.mockResolvedValue(recipient);
    userRepository.save.mockResolvedValue([sender, recipient] as User[]);
    paymentRepository.create.mockReturnValue(payment);
    paymentRepository.save.mockResolvedValue(payment);

    const result = await service.create(createPaymentDto, senderId);

    expect(dataSource.transaction).toHaveBeenCalledTimes(1);

    expect(senderQueryBuilder.setLock).toHaveBeenCalledWith(
      'pessimistic_write',
    );
    expect(senderQueryBuilder.where).toHaveBeenCalledWith('user.id = :id', {
      id: senderId,
    });

    expect(recipientQueryBuilder.setLock).toHaveBeenCalledWith(
      'pessimistic_write',
    );
    expect(recipientQueryBuilder.where).toHaveBeenCalledWith('user.id = :id', {
      id: recipientId,
    });

    expect(sender.balanceCents).toBe('4000');
    expect(recipient.balanceCents).toBe('3000');

    expect(userRepository.save).toHaveBeenCalledWith([sender, recipient]);

    expect(paymentRepository.create).toHaveBeenCalledWith({
      fromUser: sender,
      toUser: recipient,
      amount_cents: '1000',
    });

    expect(paymentRepository.save).toHaveBeenCalledWith(payment);
    expect(result).toBe(payment);
  });

  it('should throw if sender tries to send payment to himself', async () => {
    const dto: CreatePaymentDto = {
      recipientId: senderId,
      amount: 10,
    };

    await expect(service.create(dto, senderId)).rejects.toThrow(
      new BadRequestException('Cannot send payment to yourself'),
    );

    expect(dataSource.transaction).not.toHaveBeenCalled();
  });

  it('should throw if amount is not greater than 0', async () => {
    const dto: CreatePaymentDto = {
      recipientId,
      amount: 0,
    };

    await expect(service.create(dto, senderId)).rejects.toThrow(
      new BadRequestException('Amount must be greater than 0'),
    );

    expect(dataSource.transaction).not.toHaveBeenCalled();
  });

  it('should throw if amount is not finite', async () => {
    const dto: CreatePaymentDto = {
      recipientId,
      amount: Number.NaN,
    };

    await expect(service.create(dto, senderId)).rejects.toThrow(
      new BadRequestException('Amount must be greater than 0'),
    );

    expect(dataSource.transaction).not.toHaveBeenCalled();
  });

  it('should throw if sender not found', async () => {
    senderQueryBuilder.getOne.mockResolvedValue(null);

    await expect(service.create(createPaymentDto, senderId)).rejects.toThrow(
      new NotFoundException('Sender not found'),
    );

    expect(recipientQueryBuilder.getOne).not.toHaveBeenCalled();
    expect(userRepository.save).not.toHaveBeenCalled();
    expect(paymentRepository.save).not.toHaveBeenCalled();
  });

  it('should throw if recipient not found', async () => {
    const sender = createUser({
      id: senderId,
      balanceCents: '5000',
    });

    senderQueryBuilder.getOne.mockResolvedValue(sender);
    recipientQueryBuilder.getOne.mockResolvedValue(null);

    await expect(service.create(createPaymentDto, senderId)).rejects.toThrow(
      new NotFoundException('Recipient not found'),
    );

    expect(userRepository.save).not.toHaveBeenCalled();
    expect(paymentRepository.save).not.toHaveBeenCalled();
  });

  it('should throw if sender balance is insufficient', async () => {
    const sender = createUser({
      id: senderId,
      balanceCents: '500',
    }); // 5.00

    const recipient = createUser({
      id: recipientId,
      balanceCents: '2000',
    });

    senderQueryBuilder.getOne.mockResolvedValue(sender);
    recipientQueryBuilder.getOne.mockResolvedValue(recipient);

    await expect(service.create(createPaymentDto, senderId)).rejects.toThrow(
      new BadRequestException(
        'Your balance is not sufficient to complete the transaction.',
      ),
    );

    expect(userRepository.save).not.toHaveBeenCalled();
    expect(paymentRepository.create).not.toHaveBeenCalled();
    expect(paymentRepository.save).not.toHaveBeenCalled();
  });
});
