import { Module } from '@nestjs/common';
import { AvatarsService } from './avatars.service';
import { AvatarsController } from './avatars.controller';
import { DatabasesModule } from 'src/providers/databases/databases.module';
import { S3Module } from 'src/providers/files/s3/s3.module';
import { UsersModule } from '../users/users.module';
import { avatarProviders } from 'src/providers/databases/database_providers/avatar.providers';

@Module({
  imports: [DatabasesModule, S3Module, UsersModule],
  controllers: [AvatarsController],
  providers: [...avatarProviders, AvatarsService],
})
export class AvatarsModule {}
