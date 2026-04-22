import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  bearerAuthOptions,
  bearerAuthName,
} from './config/swagger/bearer-auth.config';
import { ApplicationLogger } from 'libs/logger/logger.service';
import { RequestLoggingInterceptor } from 'libs/logger/request-logging.interceptor';
import { ExceptionLoggingFilter } from 'libs/logger/exception-logging.filter';
import { ENV_KEYS } from '@common/constants/config.constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const logger = app.get(ApplicationLogger);
  app.useGlobalInterceptors(new RequestLoggingInterceptor(logger));
  app.useGlobalFilters(new ExceptionLoggingFilter(logger));

  const config = new DocumentBuilder()
    .setTitle('Nauthj')
    .setDescription('The Nauthj API description')
    .setVersion('1.0')
    .addTag('Nauthj')
    .addBearerAuth(bearerAuthOptions, bearerAuthName)
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env[ENV_KEYS.NAUTHJ_PORT] ?? 3000);
}

bootstrap().catch((err) => {
  console.error('Application failed to start:', err);
  process.exit(1);
});
