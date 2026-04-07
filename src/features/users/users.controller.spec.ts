import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PaginationDto } from './dto/pagination.dto';
import { SearchFilterDto } from './dto/search-filter.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: {
    findAll: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(async () => {
    usersService = {
      findAll: jest.fn(),
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
