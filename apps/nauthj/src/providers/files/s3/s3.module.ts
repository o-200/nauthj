import * as AWS from '@aws-sdk/client-s3';
import { Module } from '@nestjs/common';

import { S3Lib } from './constants/do-spaces-service-lib.constant';
import { S3Service } from './s3.service';
import { ConfigService } from '@nestjs/config';
import { CONFIG_KEYS } from '@common/constants/config.constants';

@Module({
  providers: [
    S3Service,
    {
      provide: S3Lib,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const fsConfig = configService.getOrThrow<AWS.S3ClientConfig>(
          CONFIG_KEYS.FILE_STORAGE,
        );
        return new AWS.S3(fsConfig);
      },
    },
  ],
  exports: [S3Service, S3Lib],
})
export class S3Module {}
