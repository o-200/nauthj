
import { forwardRef, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/features/users/users.service';
import * as bcrypt from 'bcrypt';
import { User } from 'src/features/users/entities/user.entity';
import { AccessTokenDto } from './dto/access-token.dto';
import { CreateUserDto } from 'src/features/users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    private jwtService: JwtService
  ) { }

  async register(user: CreateUserDto): Promise<AccessTokenDto> {
    // const existingUser = await this.usersService.findOneByEmail(user.email);
    // if (existingUser) {
    //   throw new BadRequestException('email already exists');
    // }

    const hashedPassword = await bcrypt.hash(user.password, 10);
    const newUser: CreateUserDto = { ...user, password: hashedPassword };
    const createdUser: User = await this.usersService.create(newUser);

    return this.login(createdUser);
  }

  async login(user: User): Promise<AccessTokenDto> {
    const payload = { email: user.email, id: user.id };
    return { access_token: this.jwtService.sign(payload) };
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
