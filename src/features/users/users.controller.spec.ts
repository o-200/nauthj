import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { getQueueToken } from '@nestjs/bullmq';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;

  const mockUsersService = {
    findAll: jest.fn(),
    findActive: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    clear: jest.fn(),
  };

  const mockUsersQueue = {
    add: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
        {
          provide: getQueueToken('users'),
          useValue: mockUsersQueue,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('update', () => {
    it('should call usersService.update with req.user.userId and dto', async () => {
      const user = { userId: '1', email: 'alex@example.com' };
      const dto = { login: 'new-login' };
      const updatedUser = { id: '1', ...dto };

      usersService.update.mockResolvedValue(updatedUser as never);

      const result = await controller.update(user, dto);

      expect(usersService.update).toHaveBeenCalledWith('1', dto);
      expect(result).toEqual(updatedUser);
    });
  });

  describe('remove', () => {
    it('should call usersService.delete with req.user.userId and return message', async () => {
      const user = { userId: '1', email: 'alex@example.com' };

      usersService.delete.mockResolvedValue({ affected: 1 } as never);

      const result = await controller.remove(user);

      expect(usersService.delete).toHaveBeenCalledWith('1');
      expect(result).toEqual({ message: 'User was deleted' });
    });
  });

  describe('resetBalances', () => {
    it('should add resetBalances job to queue and return message', async () => {
      mockUsersQueue.add.mockResolvedValue(undefined);

      const result = await controller.resetBalances();

      expect(mockUsersQueue.add).toHaveBeenCalledWith('resetBalances', {});
      expect(result).toEqual({
        message: 'Reset Balances job added to queue',
      });
    });
  });
});
