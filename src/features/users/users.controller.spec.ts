import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PaginationDto } from './dto/pagination.dto';
import { SearchFilterDto } from './dto/search-filter.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ActiveUsersDto } from './dto/active-users.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: {
    findAll: jest.Mock;
    findActive: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    clear: jest.fn(),
  };

  beforeEach(async () => {
    usersService = {
      findAll: jest.fn(),
      findActive: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call usersService.findAll with paginationDto and searchFilterDto', async () => {
      const paginationDto: PaginationDto = {
        limit: 10,
        createdAt: new Date('2026-04-06T10:00:00.000Z'),
      };

      const searchFilterDto: SearchFilterDto = {
        login: 'alex',
      };

      const serviceResult = {
        data: [
          { id: '1', login: 'alex' },
          { id: '2', login: 'alexey' },
        ],
        nextCursor: new Date('2026-04-06T09:00:00.000Z'),
      };

      usersService.findAll.mockResolvedValue(serviceResult);

      const result = await controller.findAll(paginationDto, searchFilterDto);

      expect(usersService.findAll).toHaveBeenCalledWith(
        paginationDto,
        searchFilterDto,
      );
      expect(result).toEqual(serviceResult);
    });
  });

  describe('findActive', () => {
    it('should call usersService.findActive with activeUsersDto and return result', async () => {
      const activeUsersDto: ActiveUsersDto = {
        ageMin: 18,
        ageMax: 30,
      };

      const serviceResult = [
        {
          id: '1',
          login: 'alex',
          age: 20,
          description: 'active user',
        },
        {
          id: '2',
          login: 'john',
          age: 25,
          description: 'another active user',
        },
      ];

      usersService.findActive.mockResolvedValue(serviceResult);

      const result = await controller.findActive(activeUsersDto);

      expect(usersService.findActive).toHaveBeenCalledWith(activeUsersDto);
      expect(result).toEqual(serviceResult);
    });

    it('should call usersService.findActive with empty dto', async () => {
      const activeUsersDto: ActiveUsersDto = {};

      const serviceResult = [
        {
          id: '1',
          login: 'alex',
          age: 20,
          description: 'active user',
        },
      ];

      usersService.findActive.mockResolvedValue(serviceResult);

      const result = await controller.findActive(activeUsersDto);

      expect(usersService.findActive).toHaveBeenCalledWith(activeUsersDto);
      expect(result).toEqual(serviceResult);
    });
  });

  describe('update', () => {
    it('should call usersService.update with req.user.userId and dto', async () => {
      const req = {
        userId: 'user-123',
        email: 'mymail@my',
      };

      const updateUserDto: UpdateUserDto = {
        login: 'newlogin',
        email: 'new@email.com',
      };

      const updatedUser = {
        id: 'user-123',
        login: 'newlogin',
        email: 'new@email.com',
      };

      usersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(req, updateUserDto);

      expect(usersService.update).toHaveBeenCalledWith(
        'user-123',
        updateUserDto,
      );
      expect(result).toEqual(updatedUser);
    });
  });

  describe('remove', () => {
    it('should call usersService.delete with req.user.userId and return message', async () => {
      const req = {
        userId: 'user-123',
        email: 'mymail@a',
      };

      usersService.delete.mockResolvedValue({ affected: 1 });

      const result = await controller.remove(req);

      expect(usersService.delete).toHaveBeenCalledWith('user-123');
      expect(result).toEqual({ message: 'User was deleted' });
    });
  });
});
