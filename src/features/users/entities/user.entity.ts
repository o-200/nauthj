import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity()
export class User {
  @ApiProperty({
    example: '512cf215-61b6-4725-a796-51bf087522a50',
    description: 'User unique identifier',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'alex123',
    description: 'Unique user login',
    maxLength: 64,
  })
  @Column({ length: 64 })
  @Index({ unique: true })
  login: string;

  @ApiProperty({
    example: 'alex@example.com',
    description: 'Unique user email',
    maxLength: 64,
  })
  @Column({ length: 64 })
  @Index({ unique: true })
  email: string;

  @ApiProperty({
    example: 'hashed_password',
    description: 'User password hash',
  })
  @Column({ length: 64 })
  password: string;

  @ApiProperty({
    example: 25,
    description: 'User age',
  })
  @Column('int')
  age: number;

  @ApiProperty({
    example: 'Backend developer',
    description: 'User description',
    maxLength: 1000,
  })
  @Column('varchar', { length: 1000 })
  description: string;

  @ApiPropertyOptional({
    example: 'hashed_refresh_token',
    description: 'Hashed refresh token',
  })
  @Column({ type: 'text', nullable: true })
  refreshToken: string;

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