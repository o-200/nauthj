import { ConfigService } from '@nestjs/config';

export const fileStorageConfig = (configService: ConfigService) => ({
  endpoint: configService.getOrThrow<string>('MINIO_ENDPOINT'),
  region: configService.getOrThrow<string>('MINIO_REGION'),
  credentials: {
    accessKeyId: configService.getOrThrow<string>('MINIO_ACCESS_KEY'),
    secretAccessKey: configService.getOrThrow<string>('MINIO_SECRET_KEY'),
  },
});
