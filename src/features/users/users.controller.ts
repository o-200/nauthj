import { Controller, Delete, Get, HttpCode, Param, Query, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaginationDto } from './dto/pagination.dto';
import { SearchFilterDto } from './dto/search-filter.dto';

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

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.usersService.update(+id, updateUserDto);
  // }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  remove(@Req() req) {
    const userId = req.user["userId"];
    this.usersService.delete(userId);

    return { "message": "User was deleted" };
  }
}
