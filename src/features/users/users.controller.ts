import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaginationDto } from './dto/pagination.dto';
import { SearchFilterDto } from './dto/search-filter.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) { }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query() searchFilterDto: SearchFilterDto
  ) {
    return this.usersService.findAll(paginationDto, searchFilterDto);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  update(
    @Req() req,
    @Body() updateUserDto: UpdateUserDto
  ) {
    const userId = req.user["userId"];

    return this.usersService.update(userId, updateUserDto);
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  async remove(@Req() req) {
    const userId = req.user["userId"];
    await this.usersService.delete(userId);

    return { "message": "User was deleted" };
  }
}
