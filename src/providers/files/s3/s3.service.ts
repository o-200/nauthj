import * as AWS from '@aws-sdk/client-s3';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { IFileService } from '../files.adapter';
import { S3Lib } from './constants/do-spaces-service-lib.constant';
import { RemoveException } from './exceptions/remove.exception';
import { UploadException } from './exceptions/upload.exception';
import { UploadFilePayloadDto } from './dto/upload-file-payload.dto';
import { UploadFileResultDto } from './dto/upload-file-result.dto';
import { RemoveFilePayloadDto } from './dto/remove-file-payload.dto';

@Injectable()
export class S3Service extends IFileService {
  private readonly logger = new Logger(S3Service.name);
  private readonly bucketName: string;

  constructor(
    @Inject(S3Lib) private readonly s3: AWS.S3,
    private readonly configService: ConfigService,
  ) {
    super();
    this.bucketName =
      this.configService.getOrThrow<string>('MINIO_BUCKET_NAME');
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === 'string') {
      return error;
    }

    return 'Unknown error';
  }

  async uploadFile(
    dto: UploadFilePayloadDto,
    file: Express.Multer.File,
  ): Promise<UploadFileResultDto> {
    const { folder, name } = dto;
    const path = `${folder}/${name}`;

    this.logger.log('📁 Beginning of uploading file to bucket');

    return new Promise((resolve, reject) => {
      this.s3.putObject(
        {
          Bucket: this.bucketName,
          Key: path,
          Body: file.buffer,
          ACL: 'public-read',
          ContentType: file.mimetype,
        },
        (error) => {
          if (!error) {
            this.logger.log('✅ Uploading was successful');
            resolve({ path });
            return;
          }

          this.logger.error(`❌ File upload error with path: ${path}`);
          reject(new UploadException(this.getErrorMessage(error)));
        },
      );
    });
  }

  async removeFile(dto: RemoveFilePayloadDto): Promise<void> {
    const { path } = dto;

    this.logger.log('🗑️ Beginning of removing file from bucket');

    return new Promise((resolve, reject) => {
      this.s3.deleteObject(
        {
          Bucket: this.bucketName,
          Key: path,
        },
        (error) => {
          if (!error) {
            this.logger.log('✅ Removing was successful');
            resolve();
            return;
          }

          this.logger.error(`❌ File remove error with path: ${path}`);
          reject(new RemoveException(this.getErrorMessage(error)));
        },
      );
    });
  }
}
