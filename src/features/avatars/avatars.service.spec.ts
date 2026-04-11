import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { AvatarsService } from './avatars.service';
import { S3Service } from 'src/providers/files/s3/s3.service';
import { UsersService } from '../users/users.service';

describe('AvatarsService', () => {
  let service: AvatarsService;

  const mockAvatarRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  const mockS3Service = {
    uploadFile: jest.fn(),
    removeFile: jest.fn(),
  };

  const mockUsersService = {
    findById: jest.fn(),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    clear: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvatarsService,
        {
          provide: 'AVATAR_REPOSITORY',
          useValue: mockAvatarRepository,
        },
        {
          provide: S3Service,
          useValue: mockS3Service,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<AvatarsService>(AvatarsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
