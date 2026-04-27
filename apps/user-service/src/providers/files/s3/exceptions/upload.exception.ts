import { BadRequestException } from '@nestjs/common';
import { ERROR_MESSAGES } from '@common/constants/error.constants';

export class UploadException extends BadRequestException {
  constructor(message?: string) {
    super(`${message || ERROR_MESSAGES.SOMETHING_WENT_WRONG}`);
  }
}
