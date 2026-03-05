import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class UsersService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,

    private readonly authService: AuthService
  ) { }

  register(createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  create(createUserDto: CreateUserDto) {
    const userData = this.userRepository.create(createUserDto);
    return this.userRepository.save(userData)
  }

  findAll() {
    return this.userRepository.find();
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} user`;
  // }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}
