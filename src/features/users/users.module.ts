import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { usersProviders } from 'src/providers/databases/user.providers';
import { DatabasesModule } from 'src/providers/databases.module';

@Module({
  imports: [DatabasesModule],
  controllers: [UsersController],
  providers: [...usersProviders, UsersService],
})
export class UsersModule { }
