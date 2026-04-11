import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import {
  DeleteResult,
  Repository,
  SelectQueryBuilder,
  UpdateResult,
} from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { RefreshTokenDto } from '../auth/dto/refresh-token.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ActiveUsersDto } from './dto/active-users.dto';

type MockUserRepository = Pick<
  Repository<User>,
  'createQueryBuilder' | 'findOne' | 'create' | 'save' | 'softDelete' | 'update'
>;

type MockQueryBuilder = Pick<
  SelectQueryBuilder<User>,
  | 'where'
  | 'leftJoin'
  | 'groupBy'
  | 'having'
  | 'orderBy'
  | 'limit'
  | 'andWhere'
  | 'getMany'
>;

const createMockQueryBuilder = (
  users: User[],
): jest.Mocked<MockQueryBuilder> => {
  const queryBuilder: jest.Mocked<MockQueryBuilder> = {
    where: jest.fn(),
    leftJoin: jest.fn(),
    groupBy: jest.fn(),
    having: jest.fn(),
    orderBy: jest.fn(),
    limit: jest.fn(),
    andWhere: jest.fn(),
    getMany: jest.fn(),
  };

  queryBuilder.where.mockReturnValue(
    queryBuilder as unknown as SelectQueryBuilder<User>,
  );
  queryBuilder.leftJoin.mockReturnValue(
    queryBuilder as unknown as SelectQueryBuilder<User>,
  );
  queryBuilder.groupBy.mockReturnValue(
    queryBuilder as unknown as SelectQueryBuilder<User>,
  );
  queryBuilder.having.mockReturnValue(
    queryBuilder as unknown as SelectQueryBuilder<User>,
  );
  queryBuilder.orderBy.mockReturnValue(
    queryBuilder as unknown as SelectQueryBuilder<User>,
  );
  queryBuilder.limit.mockReturnValue(
    queryBuilder as unknown as SelectQueryBuilder<User>,
  );
  queryBuilder.andWhere.mockReturnValue(
    queryBuilder as unknown as SelectQueryBuilder<User>,
  );
  queryBuilder.getMany.mockResolvedValue(users);

  return queryBuilder;
};

const mockCacheManager = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  clear: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: jest.Mocked<MockUserRepository>;

  const mockUserRepository: jest.Mocked<MockUserRepository> = {
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
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository =
      module.get<jest.Mocked<MockUserRepository>>('USER_REPOSITORY');

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

      const queryBuilder = createMockQueryBuilder([user1, user2, user3]);

      userRepository.createQueryBuilder.mockReturnValue(
        queryBuilder as unknown as SelectQueryBuilder<User>,
      );

      const result = await service.findAll(
        { limit: 2, createdAt: undefined },
        { login: undefined },
      );

      expect(userRepository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(queryBuilder.orderBy).toHaveBeenCalledWith(
        'user.createdAt',
        'DESC',
      );
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

      const queryBuilder = createMockQueryBuilder([user1]);

      userRepository.createQueryBuilder.mockReturnValue(
        queryBuilder as unknown as SelectQueryBuilder<User>,
      );

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
      const queryBuilder = createMockQueryBuilder([]);

      userRepository.createQueryBuilder.mockReturnValue(
        queryBuilder as unknown as SelectQueryBuilder<User>,
      );

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
      const queryBuilder = createMockQueryBuilder([]);

      userRepository.createQueryBuilder.mockReturnValue(
        queryBuilder as unknown as SelectQueryBuilder<User>,
      );

      await service.findAll({ limit: 10, createdAt }, { login: undefined });

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'user.createdAt < :cursor',
        { cursor: new Date(createdAt) },
      );
    });
  });

  describe('findActive', () => {
    it('should return active users without age filters', async () => {
      const user1 = {
        id: '1',
        login: 'alex',
        age: 20,
        description: 'active user',
      } as User;

      const user2 = {
        id: '2',
        login: 'john',
        age: 25,
        description: 'another active user',
      } as User;

      const queryBuilder = createMockQueryBuilder([user1, user2]);

      userRepository.createQueryBuilder.mockReturnValue(
        queryBuilder as unknown as SelectQueryBuilder<User>,
      );

      const dto: ActiveUsersDto = {};

      const result = await service.findActive(dto);

      expect(userRepository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(queryBuilder.where).toHaveBeenCalledWith(
        'user.description IS NOT NULL',
      );
      expect(queryBuilder.leftJoin).toHaveBeenCalledWith(
        'user.avatars',
        'avatar',
      );
      expect(queryBuilder.groupBy).toHaveBeenCalledWith('user.id');
      expect(queryBuilder.having).toHaveBeenCalledWith(
        'COUNT(avatar.id) >= :minAvatars',
        { minAvatars: 2 },
      );
      expect(queryBuilder.orderBy).toHaveBeenCalledWith(
        'user.createdAt',
        'DESC',
      );
      expect(result).toEqual([user1, user2]);
    });

    it('should add ageMin filter when ageMin is provided', async () => {
      const queryBuilder = createMockQueryBuilder([]);

      userRepository.createQueryBuilder.mockReturnValue(
        queryBuilder as unknown as SelectQueryBuilder<User>,
      );

      const dto: ActiveUsersDto = {
        ageMin: 18,
      };

      await service.findActive(dto);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'user.age >= :ageMin',
        { ageMin: 18 },
      );
    });

    it('should add ageMax filter when ageMax is provided', async () => {
      const queryBuilder = createMockQueryBuilder([]);

      userRepository.createQueryBuilder.mockReturnValue(
        queryBuilder as unknown as SelectQueryBuilder<User>,
      );

      const dto: ActiveUsersDto = {
        ageMax: 30,
      };

      await service.findActive(dto);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'user.age <= :ageMax',
        { ageMax: 30 },
      );
    });

    it('should add both age filters when ageMin and ageMax are provided', async () => {
      const queryBuilder = createMockQueryBuilder([]);

      userRepository.createQueryBuilder.mockReturnValue(
        queryBuilder as unknown as SelectQueryBuilder<User>,
      );

      const dto: ActiveUsersDto = {
        ageMin: 18,
        ageMax: 30,
      };

      await service.findActive(dto);

      expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(
        1,
        'user.age >= :ageMin',
        { ageMin: 18 },
      );
      expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(
        2,
        'user.age <= :ageMax',
        { ageMax: 30 },
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
      const dto: CreateUserDto = {
        login: 'alex',
        email: 'alex@example.com',
        password: '123456',
        age: 20,
        description: 'test user',
      };

      const createdUser = { ...dto } as User;
      const savedUser = { id: '1', ...dto } as User;

      userRepository.create.mockReturnValue(createdUser);
      userRepository.save.mockResolvedValue(savedUser);

      const result = await service.create(dto);

      expect(userRepository.create).toHaveBeenCalledWith(dto);
      expect(mockCacheManager.set).toHaveBeenCalledTimes(1);
      expect(userRepository.save).toHaveBeenCalledWith(createdUser);
      expect(result).toBe(savedUser);
    });
  });

  describe('delete', () => {
    it('should soft delete user', async () => {
      const deleteResult: DeleteResult = {
        raw: [],
        affected: 1,
      };

      userRepository.softDelete.mockResolvedValue(deleteResult);

      const result = await service.delete('1');

      expect(mockCacheManager.del).toHaveBeenCalledTimes(1);
      expect(userRepository.softDelete).toHaveBeenCalledWith('1');
      expect(result).toEqual(deleteResult);
    });
  });

  describe('update', () => {
    it('should throw NotFoundException when user does not exist', async () => {
      userRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.update('1', { login: 'new-login' })).rejects.toThrow(
        NotFoundException,
      );

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
      expect(mockCacheManager.clear).not.toHaveBeenCalled();
      expect(result).toBe(existingUser);
    });

    it('should update only changed fields', async () => {
      const existingUser = {
        id: '1',
        login: 'alex',
        email: 'alex@example.com',
        age: 20,
        description: 'old description',
      } as User;

      const updatedUser = {
        ...existingUser,
        login: 'alex-new',
      } as User;

      const updateResult: UpdateResult = {
        raw: [],
        affected: 1,
        generatedMaps: [],
      };

      userRepository.findOne
        .mockResolvedValueOnce(existingUser)
        .mockResolvedValueOnce(updatedUser);

      userRepository.update.mockResolvedValue(updateResult);

      const result = await service.update('1', {
        login: 'alex-new',
        email: 'alex@example.com',
      });

      expect(userRepository.update).toHaveBeenCalledWith('1', {
        login: 'alex-new',
      });

      expect(userRepository.findOne).toHaveBeenNthCalledWith(2, {
        where: { id: '1' },
      });

      expect(mockCacheManager.del).toHaveBeenCalledTimes(1);
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException when user disappears after update', async () => {
      const existingUser = {
        id: '1',
        login: 'alex',
        email: 'alex@example.com',
      } as User;

      const updateResult: UpdateResult = {
        raw: [],
        affected: 1,
        generatedMaps: [],
      };

      userRepository.findOne
        .mockResolvedValueOnce(existingUser)
        .mockResolvedValueOnce(null);

      userRepository.update.mockResolvedValue(updateResult);

      await expect(
        service.update('1', {
          login: 'alex-new',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateRefreshToken', () => {
    it('should throw NotFoundException when user does not exist', async () => {
      const dto: RefreshTokenDto = {
        refreshToken: 'new-token',
      };

      userRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.updateRefreshToken('1', dto)).rejects.toThrow(
        NotFoundException,
      );

      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('should return user without update if refresh token did not change', async () => {
      const existingUser = {
        id: '1',
        refreshToken: 'same-token',
      } as User;

      const dto: RefreshTokenDto = {
        refreshToken: 'same-token',
      };

      userRepository.findOne.mockResolvedValue(existingUser);

      const result = await service.updateRefreshToken('1', dto);

      expect(userRepository.update).not.toHaveBeenCalled();
      expect(mockCacheManager.clear).not.toHaveBeenCalled();
      expect(result).toBe(existingUser);
    });

    it('should update refresh token when it changed', async () => {
      const existingUser = {
        id: '1',
        refreshToken: 'old-token',
      } as User;

      const updatedUser = {
        id: '1',
        refreshToken: 'new-token',
      } as User;

      const dto: RefreshTokenDto = {
        refreshToken: 'new-token',
      };

      const updateResult: UpdateResult = {
        raw: [],
        affected: 1,
        generatedMaps: [],
      };

      userRepository.findOne
        .mockResolvedValueOnce(existingUser)
        .mockResolvedValueOnce(updatedUser);

      userRepository.update.mockResolvedValue(updateResult);

      const result = await service.updateRefreshToken('1', dto);

      expect(userRepository.update).toHaveBeenCalledWith('1', {
        refreshToken: 'new-token',
      });

      expect(userRepository.findOne).toHaveBeenNthCalledWith(2, {
        where: { id: '1' },
      });

      expect(mockCacheManager.del).toHaveBeenCalledTimes(1);
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException when user disappears after refresh token update', async () => {
      const existingUser = {
        id: '1',
        refreshToken: 'old-token',
      } as User;

      const dto: RefreshTokenDto = {
        refreshToken: 'new-token',
      };

      const updateResult: UpdateResult = {
        raw: [],
        affected: 1,
        generatedMaps: [],
      };

      userRepository.findOne
        .mockResolvedValueOnce(existingUser)
        .mockResolvedValueOnce(null);

      userRepository.update.mockResolvedValue(updateResult);

      await expect(service.updateRefreshToken('1', dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
