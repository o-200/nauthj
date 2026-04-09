import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  Delete,
  Param,
  Get,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

import { AvatarsService } from './avatars.service';
import { CreateAvatarDto } from './dto/create-avatar.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User as CurrentUser } from '../auth/decorators/user.decorator';
import { AvatarFileValidationPipe } from './common/pipes/avatar.file.validation.pipe';

@ApiTags('Avatars')
@ApiBearerAuth()
@Controller('avatars')
export class AvatarsController {
  constructor(private readonly avatarsService: AvatarsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload avatar for current user' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Avatar upload payload',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Avatar file',
        },
        folder: {
          type: 'string',
          example: '/users/avatars',
        },
        name: {
          type: 'string',
          example: 'flyingCar.jpg',
        },
      },
      required: ['file'],
    },
  })
  //@ApiResponse({
  //  status: 201,
  //  description: 'Avatar uploaded successfully',
  //  type: Avatar,
  //})
  @ApiResponse({
    status: 400,
    description: 'Bad request: invalid file or avatar limit exceeded',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  create(
    @Body() createAvatarDto: CreateAvatarDto,
    @UploadedFile(new AvatarFileValidationPipe()) file: Express.Multer.File,
    @CurrentUser() user: { sub: string; email: string },
  ) {
    const userId = user.sub;
    return this.avatarsService.create(createAvatarDto, file, userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all avatars of current user' })
  //@ApiResponse({
  //  status: 200,
  //  description: 'List of user avatars',
  //  type: Avatar,
  //  isArray: true,
  //})
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  findAll(@CurrentUser() user: { sub: string; email: string }) {
    const userId = user.sub;
    return this.avatarsService.findAll(userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete user avatar by id' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Avatar ID',
    example: '948a75e8-2244-4dbf-8d76-7023aaec948c',
  })
  @ApiResponse({
    status: 200,
    description: 'Avatar deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Avatar not found',
  })
  remove(
    @CurrentUser() user: { sub: string; email: string },
    @Param('id') avatarId: string,
  ) {
    const userId = user.sub;
    return this.avatarsService.remove(userId, avatarId);
  }
}
