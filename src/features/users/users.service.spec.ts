import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: jest.Mocked<Repository<User>>;

  const mockUserRepository = {
    createQueryBuilder: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    softDelete: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: 'USER_REPOSITORY',
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get('USER_REPOSITORY');

    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return users and nextCursor when there is next page', async () => {
      const user1 = {
        id: '1',
        login: 'alex',
        createdAt: new Date('2026-04-06T10:00:00.000Z'),
      } as User;

      const user2 = {
        id: '2',
        login: 'john',
        createdAt: new Date('2026-04-06T09:00:00.000Z'),
      } as User;

      const user3 = {
        id: '3',
        login: 'kate',
        createdAt: new Date('2026-04-06T08:00:00.000Z'),
      } as User;

      const queryBuilder = {
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([user1, user2, user3]),
      };

      userRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      const result = await service.findAll(
        { limit: 2, createdAt: undefined },
        { login: undefined },
      );

      expect(userRepository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(queryBuilder.orderBy).toHaveBeenCalledWith('user.createdAt', 'DESC');
      expect(queryBuilder.limit).toHaveBeenCalledWith(3);

      expect(result).toEqual({
        data: [user1, user2],
        nextCursor: user2.createdAt,
      });
    });

    it('should return users and null nextCursor when there is no next page', async () => {
      const user1 = {
        id: '1',
        login: 'alex',
        createdAt: new Date('2026-04-06T10:00:00.000Z'),
      } as User;

      const queryBuilder = {
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([user1]),
      };

      userRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      const result = await service.findAll(
        { limit: 2, createdAt: undefined },
        { login: undefined },
      );

      expect(result).toEqual({
        data: [user1],
        nextCursor: null,
      });
    });

    it('should add login filter when login is provided', async () => {
      const queryBuilder = {
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      userRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      await service.findAll(
        { limit: 10, createdAt: undefined },
        { login: 'al' },
      );

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'user.login ILIKE :login',
        { login: '%al%' },
      );
    });

    it('should add createdAt cursor filter when createdAt is provided', async () => {
      const createdAt = new Date('2026-04-06T10:00:00.000Z');

      const queryBuilder = {
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      userRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      await service.findAll(
        { limit: 10, createdAt },
        { login: undefined },
      );

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'user.createdAt < :cursor',
        { cursor: new Date(createdAt) },
      );
    });
  });

  describe('findById', () => {
    it('should return user by id', async () => {
      const user = { id: '1' } as User;
      userRepository.findOne.mockResolvedValue(user);

      const result = await service.findById('1');

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toBe(user);
    });
  });

  describe('findByLogin', () => {
    it('should return user by login', async () => {
      const user = { id: '1', login: 'alex' } as User;
      userRepository.findOne.mockResolvedValue(user);

      const result = await service.findByLogin('alex');

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { login: 'alex' },
      });
      expect(result).toBe(user);
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      const user = { id: '1', email: 'alex@example.com' } as User;
      userRepository.findOne.mockResolvedValue(user);

      const result = await service.findByEmail('alex@example.com');

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'alex@example.com' },
      });
      expect(result).toBe(user);
    });
  });

  describe('create', () => {
    it('should create and save user', async () => {
      const dto = {
        login: 'alex',
        email: 'alex@example.com',
        password: '123456',
      };

      const createdUser = { ...dto } as User;
      const savedUser = { id: '1', ...dto } as User;

      userRepository.create.mockReturnValue(createdUser);
      userRepository.save.mockResolvedValue(savedUser);

      const result = await service.create(dto as any);

      expect(userRepository.create).toHaveBeenCalledWith(dto);
      expect(userRepository.save).toHaveBeenCalledWith(createdUser);
      expect(result).toBe(savedUser);
    });
  });

  describe('delete', () => {
    it('should soft delete user', async () => {
      userRepository.softDelete.mockResolvedValue({ affected: 1 } as any);

      const result = await service.delete('1');

      expect(userRepository.softDelete).toHaveBeenCalledWith('1');
      expect(result).toEqual({ affected: 1 });
    });
  });

  describe('update', () => {
    it('should throw NotFoundException when user does not exist', async () => {
      userRepository.findOne.mockResolvedValueOnce(null);

      await expect(
        service.update('1', { login: 'new-login' }),
      ).rejects.toThrow(NotFoundException);

      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('should return user without update if no fields changed', async () => {
      const existingUser = {
        id: '1',
        login: 'alex',
        email: 'alex@example.com',
      } as User;

      userRepository.findOne.mockResolvedValue(existingUser);

      const result = await service.update('1', {
        login: 'alex',
        email: 'alex@example.com',
      });

      expect(userRepository.update).not.toHaveBeenCalled();
      expect(result).toBe(existingUser);
    });

    it('should update only changed fields', async () => {
      const existingUser = {
        id: '1',
        login: 'alex',
        email: 'alex@example.com',
        refreshToken: 'old-token',
      } as User;

      const updatedUser = {
        ...existingUser,
        login: 'alex-new',
      } as User;

      userRepository.findOne
        .mockResolvedValueOnce(existingUser)
        .mockResolvedValueOnce(updatedUser);

      userRepository.update.mockResolvedValue({ affected: 1 } as any);

      const result = await service.update('1', {
        login: 'alex-new',
        email: 'alex@example.com',
        refreshToken: undefined,
      });

      expect(userRepository.update).toHaveBeenCalledWith('1', {
        login: 'alex-new',
      });

      expect(userRepository.findOne).toHaveBeenNthCalledWith(2, {
        where: { id: '1' },
      });

      expect(result).toEqual(updatedUser);
    });

    it('should update refreshToken when it changed', async () => {
      const existingUser = {
        id: '1',
        refreshToken: 'old-token',
      } as User;

      const updatedUser = {
        id: '1',
        refreshToken: 'new-token',
      } as User;

      userRepository.findOne
        .mockResolvedValueOnce(existingUser)
        .mockResolvedValueOnce(updatedUser);

      userRepository.update.mockResolvedValue({ affected: 1 } as any);

      const result = await service.update('1', {
        refreshToken: 'new-token',
      });

      expect(userRepository.update).toHaveBeenCalledWith('1', {
        refreshToken: 'new-token',
      });
      expect(result).toEqual(updatedUser);
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});