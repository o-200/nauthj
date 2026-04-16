import { Injectable, Logger } from '@nestjs/common';
import { Logger as TypeOrmLogger } from 'typeorm';

@Injectable()
export class TypeOrmCustomLogger implements TypeOrmLogger {
  private readonly logger = new Logger('TypeORM');

  logQuery(query: string, parameters?: any[]): void {
    const params = parameters ? JSON.stringify(parameters) : '[]';
    this.logger.log(`SQL Query: ${query} -- Parameters: ${params}`);
  }

  logQueryError(error: string, query?: string, parameters?: any[]): void {
    const params = parameters ? JSON.stringify(parameters) : '[]';
    const context = {
      error,
      query: query ? `${query} -- Parameters: ${params}` : undefined,
    };
    this.logger.error('SQL Query Error', JSON.stringify(context));
  }

  logQuerySlow(time: number, query: string, parameters?: any[]): void {
    const params = parameters ? JSON.stringify(parameters) : '[]';
    this.logger.warn(
      `SQL Slow Query (${time}ms): ${query} -- Parameters: ${params}`,
    );
  }

  logSchemaBuild(message: string): void {
    this.logger.log(message);
  }

  logMigration(message: string): void {
    this.logger.log(message);
  }

  log(level: 'log' | 'info' | 'warn', message: any): void {
    if (level === 'warn') {
      this.logger.warn(String(message));
    } else if (level === 'info') {
      this.logger.log(String(message));
    } else {
      this.logger.log(String(message));
    }
  }
}
