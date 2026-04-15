import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';

import { S3Service } from './s3.service';
import { S3Lib } from './constants/do-spaces-service-lib.constant';

describe('S3Service', () => {
  let service: S3Service;

  const mockS3 = {
    putObject: jest.fn(),
    deleteObject: jest.fn(),
  };

  const mockConfigService = {
    getOrThrow: jest.fn().mockReturnValue('test-bucket'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        S3Service,
        {
          provide: S3Lib,
          useValue: mockS3,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<S3Service>(S3Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
