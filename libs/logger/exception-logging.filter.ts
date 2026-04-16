import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApplicationLogger } from './logger.service';
import { RequestWithId } from './interfaces/request-with-id';

@Catch()
export class ExceptionLoggingFilter implements ExceptionFilter {
  constructor(private readonly logger: ApplicationLogger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestWithId>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof Error ? exception.message : 'Internal server error';

    const requestId = request.requestId || '-';
    const method = request.method;
    const path = request.url;
    const ip = request.ip || 'unknown';

    const stack = exception instanceof Error ? exception.stack : undefined;

    this.logger.error(`Request failed: ${message}`, 'HTTP', {
      requestId,
      method,
      path,
      statusCode: status,
      ip,
      stack: status >= 500 ? stack : undefined,
    });

    response.status(status).json({
      statusCode: status,
      message: status >= 500 ? 'Internal server error' : message,
      requestId,
      timestamp: new Date().toISOString(),
      path,
    });
  }
}
