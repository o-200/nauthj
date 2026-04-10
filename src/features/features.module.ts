import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AvatarsModule } from './avatars/avatars.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [UsersModule, AuthModule, AvatarsModule, PaymentsModule],
  providers: [],
})
export class FeaturesModule {}
