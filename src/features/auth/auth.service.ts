
import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from 'src/features/users/entities/user.entity';
import { AccessTokenDto } from './dto/access-token.dto';
import { CreateUserDto } from 'src/features/users/dto/create-user.dto';
import { UsersService } from 'src/features/users/users.service';
import { jwtTokenDto } from './dto/jwt-token.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService
  ) { }

  async register(user: CreateUserDto): Promise<jwtTokenDto> {
    const existingUser = await this.userService.findByEmail(user.email);
    if (existingUser) {
      throw new BadRequestException('email already exists');
    }

    const hashedPassword = await this.encrypt(user.password);

    const newUser: CreateUserDto = { ...user, password: hashedPassword };
    const createdUser: User = await this.userService.create(newUser);

    const tokens = await this.getTokens(createdUser.id, user.email);
    await this.updateRefreshToken(createdUser.id, tokens.refreshToken);

    return tokens;
  }

  // async login(user: User): Promise<AccessTokenDto> {
  //   return {
  //     accessToken: this.jwtService.sign({ email: user.email, id: user.id })
  //   };
  // }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await this.encrypt(refreshToken);
    await this.userService.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  async getTokens(userId: string, email: string): Promise<jwtTokenDto> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync({ sub: userId, email }),
      this.jwtService.signAsync({ sub: userId, email }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  encrypt(data: string): string {
    return bcrypt.hash(data, 10)
  }

  // async signIn(
  //   username: string,
  //   pass: string,
  // ): Promise<{ access_token: string }> {
  //   const user = await this.usersService.findOne(username);
  //   if (user?.password !== pass) {
  //     throw new UnauthorizedException();
  //   }
  //   const payload = { sub: user.userId, username: user.username };
  //   return {
  //     access_token: await this.jwtService.signAsync(payload),
  //   };
  // }
}
