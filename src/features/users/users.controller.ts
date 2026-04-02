import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaginationDto } from './dto/pagination.dto';
import { SearchFilterDto } from './dto/search-filter.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get users list with pagination and filters' })
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

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update current user' })
  @ApiResponse({
    status: 200,
    description: 'User updated',
    type: User,
  })
  update(
    @Req() req, 
    @Body() updateUserDto: UpdateUserDto
  ) {
    const userId = req.user['userId'];
    return this.usersService.update(userId, updateUserDto);
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete current user' })
  @ApiResponse({
    status: 200,
    description: 'User deleted',
    schema: {
      example: { message: 'User was deleted' },
    },
  })
  async remove(@Req() req) {
    const userId = req.user['userId'];
    await this.usersService.delete(userId);

    return { message: 'User was deleted' };
  }
}