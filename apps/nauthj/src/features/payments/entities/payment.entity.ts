import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'apps/nauthj/src/features/users/entities/user.entity';

@Entity('payments')
@Index('idx_payment_from_user', ['fromUser'])
@Index('idx_payment_to_user', ['toUser'])
@Index('idx_payment_created_at', ['createdAt'])
export class Payment {
  @ApiProperty({
    example: 'a1b2c3d4-61b6-4725-a796-51bf087522a50',
    description: 'Payment unique identifier',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    type: () => User,
    description: 'Sender user',
  })
  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'sender' })
  fromUser: User;

  @ApiProperty({
    type: () => User,
    description: 'Recipient user',
  })
  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'recipient' })
  toUser: User;

  @ApiProperty({
    example: 1500,
    description: 'Amount',
  })
  @Column({ type: 'bigint' })
  amount_cents: string;

  @ApiProperty({
    example: '2026-04-10T10:00:00.000Z',
    description: 'Payment creation date',
  })
  @CreateDateColumn()
  createdAt: Date;
}
