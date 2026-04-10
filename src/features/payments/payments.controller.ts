import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { User as CurrentUser } from '../auth/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @CurrentUser() currentUser: { sub: string; email: string },
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    const senderId = currentUser.sub;
    return this.paymentsService.create(createPaymentDto, senderId);
  }
}
