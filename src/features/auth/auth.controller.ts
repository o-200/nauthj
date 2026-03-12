import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/features/users/dto/create-user.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('sign_in')
  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  login(@Req() req) {
    const user = req.user;
    return this.authService.signIn(user.id, user.email);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req) {
    const userId = req.user["userId"];
    return this.authService.getMe(userId);
  }
}
