import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ERROR_MESSAGES } from '@common/constants/error.constants';

@Injectable()
export class AvatarFileValidationPipe implements PipeTransform<
  Express.Multer.File,
  Express.Multer.File
> {
  private readonly maxSizeInBytes = 10 * 1024 * 1024; // 10 MB

  private readonly allowedMimeTypes = ['image/jpeg', 'image/png'];

  transform(file: Express.Multer.File): Express.Multer.File {
    if (!file) {
      throw new BadRequestException(ERROR_MESSAGES.FILE_REQUIRED);
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${this.allowedMimeTypes.join(', ')}`,
      );
    }

    if (file.size > this.maxSizeInBytes) {
      throw new BadRequestException(ERROR_MESSAGES.FILE_TOO_LARGE_MAX_5MB);
    }

    return file;
  }
}
