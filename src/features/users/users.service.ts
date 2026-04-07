import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { PaginationDto } from './dto/pagination.dto';
import { SearchFilterDto } from './dto/search-filter.dto';
import { RefreshTokenDto } from '../auth/dto/refresh-token.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
  ) {}

  async findAll(
    paginationDto: PaginationDto,
    searchFilterDto: SearchFilterDto,
  ) {
    const { createdAt, limit = 10 } = paginationDto;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .orderBy('user.createdAt', 'DESC')
      .limit(limit + 1);

    if (searchFilterDto.login) {
      queryBuilder.andWhere('user.login ILIKE :login', {
        login: `%${searchFilterDto.login}%`,
      });
    }

    if (createdAt) {
      queryBuilder.andWhere('user.createdAt < :cursor', {
        cursor: new Date(createdAt),
      });
    }

    const users = await queryBuilder.getMany();
    const hasNextPage = users.length > limit;

    if (hasNextPage) {
      users.pop();
    }

    const lastUser = users[users.length - 1];

    return {
      data: users,
      nextCursor: hasNextPage && lastUser ? lastUser.createdAt : null,
    };
  }

  findById(userId: string) {
    return this.userRepository.findOne({ where: { id: userId } });
  }

  findByLogin(login: string) {
    return this.userRepository.findOne({ where: { login } });
  }

  findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  delete(userId: string) {
    return this.userRepository.softDelete(userId);
  }

  async update(userId: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const allowedFields = [
      'login',
      'email',
      'password',
      'age',
      'description',
    ] as const;

    type UpdatableField = (typeof allowedFields)[number];
    type ChangedFields = Partial<Pick<User, UpdatableField>>;

    const changedFields: ChangedFields = {};

    const setChangedField = <K extends UpdatableField>(
      key: K,
      value: User[K],
    ) => {
      changedFields[key] = value;
    };

    for (const key of allowedFields) {
      const value = updateUserDto[key];

      if (value !== undefined && user[key] !== value) {
        setChangedField(key, value);
      }
    }

    if (Object.keys(changedFields).length === 0) {
      return user;
    }

    await this.userRepository.update(userId, changedFields);

    const updatedUser = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!updatedUser) {
      throw new NotFoundException('User not found after update');
    }

    return updatedUser;
  }

  async updateRefreshToken(userId: string, refreshTokenDto: RefreshTokenDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.refreshToken === refreshTokenDto.refreshToken) {
      return user;
    }

    await this.userRepository.update(userId, {
      refreshToken: refreshTokenDto.refreshToken,
    });

    const updatedUser = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!updatedUser) {
      throw new NotFoundException('User not found after refresh token update');
    }

    return updatedUser;
  }
}
