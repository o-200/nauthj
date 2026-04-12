import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, NotFoundException } from '@nestjs/common';

import { AvatarsService } from './avatars.service';
import { S3Service } from 'src/providers/files/s3/s3.service';
import { UsersService } from '../users/users.service';

describe('AvatarsService', () => {
  let service: AvatarsService;

  const mockAvatarRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    softDelete: jest.fn(),
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
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('remove', () => {
    it('should throw NotFoundException when avatar not found', async () => {
      mockAvatarRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('user-1', 'avatar-1')).rejects.toThrow(
        NotFoundException,
      );

      expect(mockS3Service.removeFile).not.toHaveBeenCalled();
      expect(mockAvatarRepository.softDelete).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when avatar belongs to another user', async () => {
      mockAvatarRepository.findOne.mockResolvedValue({
        id: 'avatar-1',
        user_id: 'another-user',
        filepath: 'profiles/avatars/avatar-1.png',
      });

      await expect(service.remove('user-1', 'avatar-1')).rejects.toThrow(
        BadRequestException,
      );

      expect(mockS3Service.removeFile).not.toHaveBeenCalled();
      expect(mockAvatarRepository.softDelete).not.toHaveBeenCalled();
    });

    it('should remove file from storage, soft delete avatar, and invalidate cache', async () => {
      mockAvatarRepository.findOne.mockResolvedValue({
        id: 'avatar-1',
        user_id: 'user-1',
        filepath: 'profiles/avatars/avatar-1.png',
      });
      mockS3Service.removeFile.mockResolvedValue(undefined);
      mockAvatarRepository.softDelete.mockResolvedValue({ affected: 1 });
      mockCacheManager.del.mockResolvedValue(undefined);

      const result = await service.remove('user-1', 'avatar-1');

      expect(mockS3Service.removeFile).toHaveBeenCalledWith({
        path: 'profiles/avatars/avatar-1.png',
      });
      expect(mockAvatarRepository.softDelete).toHaveBeenCalledWith('avatar-1');
      expect(mockCacheManager.del).toHaveBeenCalledWith('user:user-1:avatars');
      expect(result).toEqual({ message: 'done' });
    });

    it('should skip file removal when filepath is null', async () => {
      mockAvatarRepository.findOne.mockResolvedValue({
        id: 'avatar-1',
        user_id: 'user-1',
        filepath: null,
      });
      mockAvatarRepository.softDelete.mockResolvedValue({ affected: 1 });
      mockCacheManager.del.mockResolvedValue(undefined);

      await service.remove('user-1', 'avatar-1');

      expect(mockS3Service.removeFile).not.toHaveBeenCalled();
      expect(mockAvatarRepository.softDelete).toHaveBeenCalledWith('avatar-1');
      expect(mockCacheManager.del).toHaveBeenCalledWith('user:user-1:avatars');
    });
  });
});
