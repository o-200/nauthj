import { Module, Global } from '@nestjs/common';
import { ApplicationLogger } from './logger.service';
import { RequestLoggingInterceptor } from './request-logging.interceptor';
import { ExceptionLoggingFilter } from './exception-logging.filter';
import { TypeOrmCustomLogger } from './typeorm-logger.service';
import { MongooseCustomLogger } from './mongoose-logger.servise';

@Global()
@Module({
  providers: [
    ApplicationLogger,
    RequestLoggingInterceptor,
    ExceptionLoggingFilter,
    TypeOrmCustomLogger,
    MongooseCustomLogger,
  ],
  exports: [
    ApplicationLogger,
    RequestLoggingInterceptor,
    ExceptionLoggingFilter,
    TypeOrmCustomLogger,
    MongooseCustomLogger,
  ],
})
export class LoggerModule {}
