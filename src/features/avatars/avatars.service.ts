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

@Injectable()
export class AvatarsService {
  constructor(
    @Inject('AVATAR_REPOSITORY') private avatarRepository: Repository<Avatar>,
    private readonly s3Service: S3Service,
    private readonly usersService: UsersService,
  ) {}

  async create(
    createAvatarDto: CreateAvatarDto,
    file: Express.Multer.File,
    user_id: string,
  ) {
    const { ...uploadDto } = createAvatarDto;

    const user = await this.usersService.findById(user_id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const avatarsCount = await this.avatarRepository.count({
      where: {
        user: {
          id: user_id,
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

    return this.avatarRepository.save(avatar);
  }

  findAll(userId: string) {
    return this.avatarRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} avatar`;
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

    // await this.cacheManager.clear();
    await this.avatarRepository.softDelete(avatarId);

    return { message: 'done' };
  }
}
