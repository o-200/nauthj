import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { CreateUserDto } from 'apps/nauthj/src/features/users/dto/create-user.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';
import { jwtTokenDto } from './dto/jwt-token.dto';
import { SignInDto } from './dto/sign-in.dto';
import { User } from './decorators/user.decorator';
import { AuthMeCacheInterceptor } from './common/interceptors/auth-me-cache.interceptor';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: jwtTokenDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Email already exists or invalid request data',
  })
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('sign_in')
  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  @ApiOperation({ summary: 'Sign in user' })
  @ApiBody({ type: SignInDto })
  @ApiResponse({
    status: 200,
    description: 'User successfully signed in',
    type: jwtTokenDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid login or password' })
  login(@User() user: { userId: string; email: string }) {
    return this.authService.signIn(user.userId, user.email);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(AuthMeCacheInterceptor)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Current user profile',
    type: CreateUserDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  me(@User() user: { userId: string; email: string }) {
    return this.authService.getMe(user.userId);
  }
}
