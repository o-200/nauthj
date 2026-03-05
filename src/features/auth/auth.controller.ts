import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/features/users/dto/create-user.dto';
import { AuthGuard } from './auth.guard';
import { UserResponseDto } from '../users/dto/user-response.dto';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  me(@Req() req: Request) {
    const userId = (req as any).user['sub'];
    return this.authService.getMe(userId);
  }
}
