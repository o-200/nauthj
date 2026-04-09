import { Global, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { cacheConfig } from 'src/config/cache.config';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => cacheConfig(configService),
    }),
  ],
  exports: [CacheModule],
})
export class AppCacheModule {}
