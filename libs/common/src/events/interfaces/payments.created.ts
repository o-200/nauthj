import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class PaymentsCreatedEventDto {
  @IsString()
  fromUserId: string;

  @IsString()
  toUserId: string;

  @Type(() => Number)
  @IsNumber()
  amount: number;
}
