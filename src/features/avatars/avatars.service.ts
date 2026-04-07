import { Inject, Injectable, NotFoundException } from '@nestjs/common';
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

  async create(createAvatarDto: CreateAvatarDto, file: Express.Multer.File) {
    const { user_id, ...uploadDto } = createAvatarDto;

    const user = await this.usersService.findById(user_id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const uploadFileResult = await this.s3Service.uploadFile(uploadDto, file);

    const avatar = this.avatarRepository.create({
      filepath: uploadFileResult.path,
      user,
    });

    return this.avatarRepository.save(avatar);
  }

  findAll() {
    return this.avatarRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} avatar`;
  }

  remove(id: number) {
    return `This action removes a #${id} avatar`;
  }
}
