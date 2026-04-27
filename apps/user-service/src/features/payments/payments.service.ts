import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Payment } from './entities/payment.entity';
import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { ClientKafka } from '@nestjs/microservices';
import { PaymentsCreatedEventDto } from '@common/common/events/interfaces/payments.created';
import { INJECTION_TOKENS } from '@common/constants/tokens.constants';
import { KAFKA_TOPICS } from '@common/constants/kafka.constants';
import { ERROR_MESSAGES } from '@common/constants/error.constants';

@Injectable()
export class PaymentsService {
  constructor(
    @Inject(INJECTION_TOKENS.DATA_SOURCE)
    private readonly dataSource: DataSource,
    @Inject(INJECTION_TOKENS.PAYMENT_SERVICE)
    private readonly paymentService: ClientKafka,
  ) {}

  async onModuleInit() {
    await this.paymentService.connect();
  }

  async create(createPaymentDto: CreatePaymentDto, senderId: string) {
    const recipientId = createPaymentDto.recipientId;

    if (senderId === recipientId) {
      throw new BadRequestException(
        ERROR_MESSAGES.CANNOT_SEND_PAYMENT_TO_YOURSELF,
      );
    }

    if (
      !Number.isFinite(createPaymentDto.amount) ||
      createPaymentDto.amount <= 0
    ) {
      throw new BadRequestException(
        ERROR_MESSAGES.AMOUNT_MUST_BE_GREATER_THAN_ZERO,
      );
    }

    const amountCents = BigInt(createPaymentDto.amount) * 100n;

    return this.dataSource.transaction(async (manager) => {
      const userRepository = manager.getRepository(User);
      const paymentRepository = manager.getRepository(Payment);

      const sender = await userRepository
        .createQueryBuilder('user')
        .setLock('pessimistic_write')
        .where('user.id = :id', { id: senderId })
        .getOne();

      if (!sender) {
        throw new NotFoundException(ERROR_MESSAGES.SENDER_NOT_FOUND);
      }

      const recipient = await userRepository
        .createQueryBuilder('user')
        .setLock('pessimistic_write')
        .where('user.id = :id', { id: recipientId })
        .getOne();

      if (!recipient) {
        throw new NotFoundException(ERROR_MESSAGES.RECIPIENT_NOT_FOUND);
      }

      const senderBalance = BigInt(sender.balanceCents);

      if (senderBalance < amountCents) {
        throw new BadRequestException(ERROR_MESSAGES.INSUFFICIENT_BALANCE);
      }

      sender.balanceCents = (senderBalance - amountCents).toString();
      recipient.balanceCents = (
        BigInt(recipient.balanceCents) + amountCents
      ).toString();

      await userRepository.save([sender, recipient]);

      const payment = paymentRepository.create({
        fromUser: sender,
        toUser: recipient,
        amount_cents: amountCents.toString(),
      });

      const savedPayment = await paymentRepository.save(payment);

      const paymentEvent: PaymentsCreatedEventDto = {
        fromUserId: sender.id,
        toUserId: recipient.id,
        amount: createPaymentDto.amount,
      };

      this.paymentService.emit(KAFKA_TOPICS.PAYMENTS_CREATED, paymentEvent);

      return savedPayment;
    });
  }
}
