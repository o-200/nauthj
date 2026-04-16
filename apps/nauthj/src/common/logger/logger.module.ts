import { Module, Global } from '@nestjs/common';
import { ApplicationLogger } from './logger.service';
import { RequestLoggingInterceptor } from './request-logging.interceptor';
import { ExceptionLoggingFilter } from './exception-logging.filter';
import { TypeOrmCustomLogger } from './typeorm-logger.service';

@Global()
@Module({
  providers: [
    ApplicationLogger,
    RequestLoggingInterceptor,
    ExceptionLoggingFilter,
    TypeOrmCustomLogger,
  ],
  exports: [
    ApplicationLogger,
    RequestLoggingInterceptor,
    ExceptionLoggingFilter,
    TypeOrmCustomLogger,
  ],
})
export class LoggerModule {}
