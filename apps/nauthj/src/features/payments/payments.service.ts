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

@Injectable()
export class PaymentsService {
  constructor(@Inject('DATA_SOURCE') private readonly dataSource: DataSource) {}

  async create(createPaymentDto: CreatePaymentDto, senderId: string) {
    const recipientId = createPaymentDto.recipientId;

    if (senderId === recipientId) {
      throw new BadRequestException('Cannot send payment to yourself');
    }

    if (
      !Number.isFinite(createPaymentDto.amount) ||
      createPaymentDto.amount <= 0
    ) {
      throw new BadRequestException('Amount must be greater than 0');
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
        throw new NotFoundException('Sender not found');
      }

      const recipient = await userRepository
        .createQueryBuilder('user')
        .setLock('pessimistic_write')
        .where('user.id = :id', { id: recipientId })
        .getOne();

      if (!recipient) {
        throw new NotFoundException('Recipient not found');
      }

      const senderBalance = BigInt(sender.balanceCents);

      if (senderBalance < amountCents) {
        throw new BadRequestException(
          'Your balance is not sufficient to complete the transaction.',
        );
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

      return paymentRepository.save(payment);
    });
  }
}
