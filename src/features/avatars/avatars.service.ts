import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAvatarDto } from './dto/create-avatar.dto';
import { Avatar } from './entities/avatar.entity';
import { Repository } from 'typeorm';
import { S3Service } from 'src/providers/files/s3/s3.service';
import { UsersService } from '../users/users.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AvatarsService {
  constructor(
    @Inject('AVATAR_REPOSITORY') private avatarRepository: Repository<Avatar>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,

    private readonly s3Service: S3Service,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async create(
    createAvatarDto: CreateAvatarDto,
    file: Express.Multer.File,
    userId: string,
  ) {
    const { ...uploadDto } = createAvatarDto;

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const avatarsCount = await this.avatarRepository.count({
      where: {
        user: {
          id: userId,
        },
      },
    });

    if (avatarsCount >= 5) {
      throw new BadRequestException('User can only have maximum 5 avatars');
    }

    const uploadFileResult = await this.s3Service.uploadFile(uploadDto, file);

    const avatar = this.avatarRepository.create({
      filepath: uploadFileResult.path,
      user,
    });

    await this.cacheManager.del(this.userAvatarsCacheKey(userId));

    return this.avatarRepository.save(avatar);
  }

  async findAll(userId: string) {
    const cachedAvatars = await this.cacheManager.get<Avatar[]>(
      this.userAvatarsCacheKey(userId),
    );

    if (cachedAvatars) {
      return cachedAvatars;
    }

    const avatars = this.avatarRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });

    await this.cacheManager.set(
      this.userAvatarsCacheKey(userId),
      avatars,
      this.configService.getOrThrow<number>('cache.ttl'),
    );
    return avatars;
  }

  async remove(userId: string, avatarId: string) {
    const avatar = await this.avatarRepository.findOne({
      where: { id: avatarId },
    });
    if (!avatar) {
      throw new NotFoundException('Avatar not found');
    }
    if (avatar.user_id !== userId) {
      throw new BadRequestException('That avatar isnt created by current user');
    }

    if (avatar.filepath) {
      await this.s3Service.removeFile({ path: avatar.filepath });
    }

    await this.avatarRepository.softDelete(avatarId);
    await this.cacheManager.del(this.userAvatarsCacheKey(userId));

    return { message: 'done' };
  }

  userAvatarsCacheKey(userId: string) {
    return `user:${userId}:avatars`;
  }
}
