import { Test, TestingModule } from '@nestjs/testing';

import { AvatarsController } from './avatars.controller';
import { AvatarsService } from './avatars.service';

describe('AvatarsController', () => {
  let controller: AvatarsController;

  const mockAvatarsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AvatarsController],
      providers: [
        {
          provide: AvatarsService,
          useValue: mockAvatarsService,
        },
      ],
    }).compile();

    controller = module.get<AvatarsController>(AvatarsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
