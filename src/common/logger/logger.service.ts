import { Injectable, Logger, LoggerService, LogLevel } from '@nestjs/common';
import { LogContext } from './interfaces/log-context';

@Injectable()
export class ApplicationLogger implements LoggerService {
  private readonly defaultContext = 'Nauthj';

  isLevelEnabled(level: LogLevel): boolean {
    return Logger.isLevelEnabled(level);
  }

  log(message: string, context?: string, meta?: LogContext): void {
    const resolvedContext = context ?? this.defaultContext;
    const formattedMessage = this.formatMessage(message, resolvedContext, meta);
    Logger.log(formattedMessage, resolvedContext);
  }

  error(message: string, context?: string, meta?: LogContext): void {
    const resolvedContext = context ?? this.defaultContext;
    const formattedMessage = this.formatMessage(message, resolvedContext, meta);
    Logger.error(formattedMessage, resolvedContext);
  }

  warn(message: string, context?: string, meta?: LogContext): void {
    const resolvedContext = context ?? this.defaultContext;
    const formattedMessage = this.formatMessage(message, resolvedContext, meta);
    Logger.warn(formattedMessage, resolvedContext);
  }

  debug(message: string, context?: string, meta?: LogContext): void {
    const resolvedContext = context ?? this.defaultContext;
    const formattedMessage = this.formatMessage(message, resolvedContext, meta);
    Logger.debug(formattedMessage, resolvedContext);
  }

  verbose(message: string, context?: string, meta?: LogContext): void {
    const resolvedContext = context ?? this.defaultContext;
    const formattedMessage = this.formatMessage(message, resolvedContext, meta);
    Logger.verbose(formattedMessage, resolvedContext);
  }

  private formatMessage(
    message: string,
    context: string,
    meta?: LogContext,
  ): string {
    const timestamp = new Date().toISOString();
    const requestId = meta?.requestId ?? '-';
    const prefix = `[${timestamp}] [${requestId}] [${context}]`;

    if (!meta) {
      return `${prefix} ${message}`;
    }

    const parts: string[] = [];

    if (meta.method && meta.path) {
      parts.push(`${meta.method} ${meta.path}`);
    }

    if (meta.statusCode !== undefined) {
      parts.push(`→ ${meta.statusCode}`);
    }

    if (meta.durationMs !== undefined) {
      parts.push(`(${meta.durationMs}ms)`);
    }

    if (meta.ip) {
      parts.push(`[${meta.ip}]`);
    }

    const metaInfo = parts.length > 0 ? `${parts.join(' ')} ` : '';

    return `${prefix} ${metaInfo}${message}`;
  }
}
