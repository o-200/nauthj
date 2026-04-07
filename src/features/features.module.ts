import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AvatarsModule } from './avatars/avatars.module';

@Module({
  imports: [UsersModule, AuthModule, AvatarsModule],
  providers: [],
})
export class FeaturesModule {}
