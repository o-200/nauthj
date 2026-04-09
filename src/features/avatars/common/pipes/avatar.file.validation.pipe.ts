import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class AvatarFileValidationPipe implements PipeTransform<
  Express.Multer.File,
  Express.Multer.File
> {
  private readonly maxSizeInBytes = 5 * 1024 * 1024; // 5 MB

  private readonly allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

  transform(file: Express.Multer.File): Express.Multer.File {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${this.allowedMimeTypes.join(', ')}`,
      );
    }

    if (file.size > this.maxSizeInBytes) {
      throw new BadRequestException('File is too large. Max size is 5MB');
    }

    return file;
  }
}
