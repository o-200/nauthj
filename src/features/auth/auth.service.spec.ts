import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/features/users/users.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: {
    signAsync: jest.Mock;
  };
  let userService: {
    findByEmail: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    findById: jest.Mock;
    findByLogin: jest.Mock;
  };

  const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

  beforeEach(async () => {
    jwtService = {
      signAsync: jest.fn(),
    };

    userService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findByLogin: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: jwtService,
        },
        {
          provide: UsersService,
          useValue: userService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should throw BadRequestException if email already exists', async () => {
      userService.findByEmail.mockResolvedValue({
        id: '1',
        email: 'alex@example.com',
      });

      await expect(
        service.register({
          login: 'alex',
          email: 'alex@example.com',
          password: '123456',
          age: 18,
          description: 'hello',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create user, generate tokens, hash refresh token and save it', async () => {
      userService.findByEmail.mockResolvedValue(null);

      const createUserDto = {
        login: 'alex',
        email: 'alex@example.com',
        password: '123456',
        age: 18,
        description: 'hello',
      };

      const createdUser = {
        id: 'user-1',
        login: 'alex',
        email: 'alex@example.com',
        password: 'hashed-password',
        age: 18,
        description: 'hello',
      };

      jest.spyOn(service, 'encrypt')
        .mockResolvedValueOnce('hashed-password')
        .mockResolvedValueOnce('hashed-refresh-token');

      userService.create.mockResolvedValue(createdUser);

      jest.spyOn(service, 'getTokens').mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      userService.update.mockResolvedValue({
        ...createdUser,
        refreshToken: 'hashed-refresh-token',
      });

      const result = await service.register(createUserDto);

      expect(userService.findByEmail).toHaveBeenCalledWith('alex@example.com');
      expect(userService.create).toHaveBeenCalledWith({
        ...createUserDto,
        password: 'hashed-password',
      });
      expect(userService.update).toHaveBeenCalledWith('user-1', {
        refreshToken: 'hashed-refresh-token',
      });
      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });
  });

  describe('signIn', () => {
    it('should return tokens and update refresh token', async () => {
      jest.spyOn(service, 'getTokens').mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      jest.spyOn(service, 'updateRefreshToken').mockResolvedValue(undefined);

      const result = await service.signIn('user-1', 'alex@example.com');

      expect(service.getTokens).toHaveBeenCalledWith('user-1', 'alex@example.com');
      expect(service.updateRefreshToken).toHaveBeenCalledWith('user-1', 'refresh-token');
      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });
  });

  describe('getMe', () => {
    it('should return user if found', async () => {
      const user = {
        id: 'user-1',
        login: 'alex',
        email: 'alex@example.com',
      };

      userService.findById.mockResolvedValue(user);

      const result = await service.getMe('user-1');

      expect(userService.findById).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user not found', async () => {
      userService.findById.mockResolvedValue(null);

      await expect(service.getMe('user-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateRefreshToken', () => {
    it('should hash refresh token and update user', async () => {
      jest.spyOn(service, 'encrypt').mockResolvedValue('hashed-refresh-token');
      userService.update.mockResolvedValue(undefined);

      await service.updateRefreshToken('user-1', 'plain-refresh-token');

      expect(service.encrypt).toHaveBeenCalledWith('plain-refresh-token');
      expect(userService.update).toHaveBeenCalledWith('user-1', {
        refreshToken: 'hashed-refresh-token',
      });
    });
  });

  describe('getTokens', () => {
    it('should generate access and refresh tokens', async () => {
      jwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await service.getTokens('user-1', 'alex@example.com');

      expect(jwtService.signAsync).toHaveBeenNthCalledWith(1, {
        sub: 'user-1',
        email: 'alex@example.com',
      });

      expect(jwtService.signAsync).toHaveBeenNthCalledWith(2,
        {
          sub: 'user-1',
          email: 'alex@example.com',
        },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: '7d',
        },
      );

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });
  });

  describe('validateUser', () => {
    it('should return null if user not found', async () => {
      userService.findByLogin.mockResolvedValue(null);

      const result = await service.validateUser({
        login: 'alex',
        password: '123456',
      });

      expect(result).toBeNull();
    });

    it('should return null if password does not match', async () => {
      const user = {
        id: 'user-1',
        login: 'alex',
        password: 'hashed-password',
      };

      userService.findByLogin.mockResolvedValue(user);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      const result = await service.validateUser({
        login: 'alex',
        password: 'wrong-password',
      });

      expect(result).toBeNull();
    });

    it('should return user if password matches', async () => {
      const user = {
        id: 'user-1',
        login: 'alex',
        password: 'hashed-password',
      };

      userService.findByLogin.mockResolvedValue(user);
      mockedBcrypt.compare.mockResolvedValue(true as never);

      const result = await service.validateUser({
        login: 'alex',
        password: '123456',
      });

      expect(result).toEqual(user);
    });
  });
});