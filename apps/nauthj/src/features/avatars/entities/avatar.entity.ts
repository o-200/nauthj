import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Column,
  RelationId,
} from 'typeorm';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from 'apps/nauthj/src/features/users/entities/user.entity';

@Entity()
// @Index('idx_avatar_user_id_not_deleted', ['user_id'], {
//  where: '"deletedAt" IS NULL',
//})
export class Avatar {
  @ApiProperty({
    example: '512cf215-61b6-4725-a796-51bf087522a50',
    description: 'Avatar unique identifier',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // TODO: Убрать nullable: true и | null
  @ApiPropertyOptional({
    example: '/profiles/avatars/avatar-1.png',
    description: 'filepath',
    nullable: true,
  })
  @Column({ type: 'varchar', nullable: true })
  filepath: string | null;

  @ApiProperty({
    example: '512cf215-61b6-4725-a796-51bf087522a50',
    description: "User's unique identifier",
  })
  @ManyToOne(() => User, (user) => user.avatars, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @RelationId((avatar: Avatar) => avatar.user)
  user_id: string;

  @ApiProperty({
    example: '2026-04-02T10:00:00.000Z',
    description: 'User creation date',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiPropertyOptional({
    example: '2026-04-02T10:00:00.000Z',
    description: 'Soft delete date',
  })
  @DeleteDateColumn()
  deletedAt?: Date;

  @ApiProperty({
    example: '2026-04-02T10:00:00.000Z',
    description: 'Last update date',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}
