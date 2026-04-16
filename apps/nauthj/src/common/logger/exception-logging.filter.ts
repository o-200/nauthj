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
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    const requestId = request.requestId || '-';
    const method = request.method;
    const path = request.url;
    const ip = request.ip || 'unknown';

    const errorContext = {
      requestId,
      method,
      path,
      statusCode: status,
      ip,
    };

    let stack: string | undefined;
    if (exception instanceof Error) {
      stack = exception.stack;
    }

    this.logger.error(`Request failed: ${message}`, 'HTTP', {
      ...errorContext,
      stack,
    });

    response.status(status).json({
      statusCode: status,
      message,
      requestId,
      timestamp: new Date().toISOString(),
      path,
    });
  }
}
