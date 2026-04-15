import { IsUUID, IsNotEmpty, IsInt, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({
    example: '512cf215-61b6-4725-a796-51bf087522a50',
    description: 'Recipient user id',
  })
  @IsUUID()
  @IsNotEmpty()
  recipientId: string;

  @ApiProperty({
    example: 1500,
    description: 'Amount in cents',
    minimum: 1,
  })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  amount: number;
}
