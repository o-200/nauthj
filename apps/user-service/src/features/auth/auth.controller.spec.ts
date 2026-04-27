import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'apps/user-service/src/features/users/dto/create-user.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: {
    register: jest.Mock;
    signIn: jest.Mock;
    getMe: jest.Mock;
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    clear: jest.fn(),
  };

  beforeEach(async () => {
    authService = {
      register: jest.fn(),
      signIn: jest.fn(),
      getMe: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register with createUserDto', async () => {
      const createUserDto: CreateUserDto = {
        login: 'alex123',
        email: 'alex@example.com',
        password: 'strongPassword123',
        age: 18,
        description: 'hello',
      };

      const tokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      authService.register.mockResolvedValue(tokens);
      const result = await controller.register(createUserDto);

      expect(result).toEqual(tokens);
    });
  });

  describe('login', () => {
    it('should call authService.signIn with user id and email from req.user', async () => {
      const req = {
        user: {
          id: 'user-123',
          email: 'alex@example.com',
        },
      };

      const tokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      authService.signIn.mockResolvedValue(tokens);
      const result = await controller.login(req);

      expect(result).toEqual(tokens);
    });
  });

  describe('me', () => {
    it('should call authService.getMe with userId from req.user', async () => {
      const req = {
        user: {
          userId: 'user-123',
        },
      };

      const user = {
        id: 'user-123',
        login: 'alex123',
        email: 'alex@example.com',
      };

      authService.getMe.mockResolvedValue(user);
      const result = await controller.me(req);

      expect(result).toEqual(user);
    });
  });
});
