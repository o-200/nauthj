import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { ApplicationLogger } from './logger.service';
import type { Request, Response } from 'express';

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: ApplicationLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const method = request.method;
    const path = request.url;
    const ip = request.ip || request.socket?.remoteAddress || 'unknown';
    const requestId = this.generateRequestId();

    // Attach request ID to the request object for potential use downstream
    (request as Request & { requestId?: string }).requestId = requestId;

    const startTime = Date.now();

    this.logger.log('Request started', 'HTTP', {
      requestId,
      method,
      path,
      ip,
    });

    return next.handle().pipe(
      tap(() => {
        const durationMs = Date.now() - startTime;
        const statusCode = response.statusCode;

        this.logger.log('Request completed', 'HTTP', {
          requestId,
          method,
          path,
          statusCode,
          durationMs,
          ip,
        });
      }),
    );
  }

  private generateRequestId(): string {
    return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
  }
}
