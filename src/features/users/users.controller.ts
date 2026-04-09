import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Patch,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User as CurrentUser } from '../auth/decorators/user.decorator';

import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaginationDto } from './dto/pagination.dto';
import { SearchFilterDto } from './dto/search-filter.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Cache, CACHE_MANAGER, CacheInterceptor } from '@nestjs/cache-manager';
import { ActiveUsersDto } from './dto/active-users.dto';

@Controller('users')
@UseInterceptors(CacheInterceptor)
@ApiTags('Users')
@ApiBearerAuth()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get users list with pagination and filters' })
  @ApiBearerAuth('access-token')
  @ApiResponse({
    status: 200,
    description: 'Users list',
    type: [User],
  })
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query() searchFilterDto: SearchFilterDto,
  ) {
    return this.usersService.findAll(paginationDto, searchFilterDto);
  }

  @Get('active')
  @Get('active')
  @ApiOperation({
    summary: 'Get active users',
    description:
      'Returns users with non-null description and at least 2 avatars. Optional filtering by age range.',
  })
  @ApiQuery({
    name: 'ageMin',
    required: false,
    type: Number,
    example: 18,
    description: 'Minimum age (inclusive)',
  })
  @ApiQuery({
    name: 'ageMax',
    required: false,
    type: Number,
    example: 30,
    description: 'Maximum age (inclusive)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of active users',
    type: [User],
  })
  findActive(@Query() activeUsersDto: ActiveUsersDto) {
    return this.usersService.findActive(activeUsersDto);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update current user' })
  @ApiResponse({
    status: 200,
    description: 'User updated',
    type: User,
  })
  @ApiBody({ type: UpdateUserDto })
  update(
    @CurrentUser() user: { userId: string; email: string },
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(user.userId, updateUserDto);
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete current user' })
  @ApiResponse({
    status: 200,
    description: 'User deleted',
    schema: {
      example: { message: 'User was deleted' },
    },
  })
  async remove(@CurrentUser() user: { userId: string; email: string }) {
    await this.usersService.delete(user.userId);

    return { message: 'User was deleted' };
  }
}
