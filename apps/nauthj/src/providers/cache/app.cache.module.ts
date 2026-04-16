import { Global, Module } from '@nestjs/common';
import { CacheModule, CacheModuleAsyncOptions } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.getOrThrow<CacheModuleAsyncOptions>('cache'),
    }),
  ],
  exports: [CacheModule],
})
export class AppCacheModule {}
