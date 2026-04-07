import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from 'src/features/users/entities/user.entity';
import { CreateUserDto } from 'src/features/users/dto/create-user.dto';
import { UsersService } from 'src/features/users/users.service';
import { jwtTokenDto } from './dto/jwt-token.dto';
import { SignInDto } from './dto/sign-in.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}

  async register(user: CreateUserDto): Promise<jwtTokenDto> {
    const existingUser = await this.userService.findByEmail(user.email);
    if (existingUser) {
      throw new BadRequestException('email already exists');
    }

    const hashedPassword = await this.hash(user.password);

    const newUser: CreateUserDto = { ...user, password: hashedPassword };
    const createdUser: User = await this.userService.create(newUser);

    const tokens = await this.getTokens(createdUser.id, user.email);
    const hashedRefreshToken = await this.hash(tokens['refreshToken']);

    await this.userService.update(createdUser.id, {
      refreshToken: hashedRefreshToken,
    });

    return tokens;
  }

  async signIn(id: string, email: string): Promise<jwtTokenDto> {
    const tokens = await this.getTokens(id, email);
    await this.updateRefreshToken(id, tokens.refreshToken);

    return tokens;
  }

  async getMe(userId: string): Promise<User> {
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await this.hash(refreshToken);
    await this.userService.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  async getTokens(userId: string, email: string): Promise<jwtTokenDto> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync({ sub: userId, email }),
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async validateUser(signInDto: SignInDto): Promise<User | null> {
    const user = await this.userService.findByLogin(signInDto.login);

    if (!user) {
      return null;
    }

    const isMatch = await bcrypt.compare(signInDto.password, user.password);
    if (!isMatch) {
      return null;
    }

    return user;
  }

  hash(data: string): Promise<string> {
    return bcrypt.hash(data, 10);
  }
}
