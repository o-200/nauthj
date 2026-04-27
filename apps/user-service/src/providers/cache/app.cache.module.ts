import { Global, Module } from '@nestjs/common';
import { CacheModule, CacheModuleAsyncOptions } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { CONFIG_KEYS } from '@common/constants/config.constants';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.getOrThrow<CacheModuleAsyncOptions>(CONFIG_KEYS.CACHE),
    }),
  ],
  exports: [CacheModule],
})
export class AppCacheModule {}
