import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { AvatarsService } from './avatars.service';
import { CreateAvatarDto } from './dto/create-avatar.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('avatars')
export class AvatarsController {
  constructor(private readonly avatarsService: AvatarsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() createAvatarDto: CreateAvatarDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.avatarsService.create(createAvatarDto, file);
  }

  // @Get()
  // findAll() {
  //   return this.avatarsService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.avatarsService.findOne(+id);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.avatarsService.remove(+id);
  // }
}
