import { Module } from '@nestjs/common';
import { AvatarsService } from './avatars.service';
import { AvatarsController } from './avatars.controller';
import { DatabasesModule } from 'apps/nauthj/src/providers/databases/databases.module';
import { S3Module } from 'apps/nauthj/src/providers/files/s3/s3.module';
import { UsersModule } from '../users/users.module';
import { avatarsProviders } from 'apps/nauthj/src/providers/databases/database_providers/avatars.providers';

@Module({
  imports: [DatabasesModule, S3Module, UsersModule],
  controllers: [AvatarsController],
  providers: [...avatarsProviders, AvatarsService],
})
export class AvatarsModule {}
