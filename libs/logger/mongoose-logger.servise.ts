import { Injectable, Logger } from '@nestjs/common';
import mongoose from 'mongoose';

@Injectable()
export class MongooseCustomLogger {
  private readonly logger = new Logger('Mongoose');

  private readonly slowQueryThreshold = 100; // ms

  enable() {
    this.setupQueryLogging();
    this.setupConnectionLogging();
    this.setupGlobalPlugin();
  }

  private setupQueryLogging() {
    mongoose.set(
      'debug',
      (
        collectionName: string,
        method: string,
        query: unknown,
        doc: unknown,
      ) => {
        const queryStr = this.safeStringify(query);
        const docStr = this.safeStringify(doc);

        this.logQuery(`${collectionName}.${method}`, queryStr, docStr);
      },
    );
  }

  private setupConnectionLogging() {
    mongoose.connection.on('error', (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logQueryError(errorMessage);
    });
  }

  private setupGlobalPlugin() {
    const logQuery = (
      operation: string,
      query?: string,
      doc?: string,
    ): void => {
      this.logQuery(operation, query, doc);
    };
    const logQuerySlow = (
      time: number,
      operation: string,
      query?: string,
    ): void => {
      this.logQuerySlow(time, operation, query);
    };
    const safeStringify = (data: unknown): string => {
      return this.safeStringify(data);
    };
    const slowQueryThreshold = this.slowQueryThreshold;
    const queryStartTimes = new WeakMap<object, number>();

    mongoose.plugin((schema) => {
      schema.pre(/^(find|update|delete|save)/, function () {
        if (typeof this === 'object' && this !== null) {
          queryStartTimes.set(this, Date.now());
        }
      });

      schema.post(
        /^(find|update|delete|save)/,
        function (this: { op?: string; getQuery?: () => unknown } | object) {
          let duration = 0;

          if (typeof this === 'object' && this !== null) {
            const startTime = queryStartTimes.get(this);

            if (typeof startTime === 'number') {
              duration = Date.now() - startTime;
            }
          }

          if (duration > 0) {
            const queryContext = this as {
              op?: string;
              getQuery?: () => unknown;
            };
            const query = queryContext.getQuery?.() ?? {};
            const queryStr = safeStringify(query);
            const operation = queryContext.op ?? 'unknown';

            if (duration > slowQueryThreshold) {
              logQuerySlow(duration, operation, queryStr);
            } else {
              logQuery(operation, queryStr);
            }
          }
        },
      );
    });
  }

  logQuery(operation: string, query?: string, doc?: string): void {
    this.logger.log(
      `Mongo Query: ${operation} -- Query: ${query ?? '{}'} -- Doc: ${doc ?? '{}'}`,
    );
  }

  logQueryError(error: string, operation?: string, query?: string): void {
    const context = {
      error,
      operation,
      query,
    };

    this.logger.error('Mongo Query Error', JSON.stringify(context));
  }

  logQuerySlow(time: number, operation: string, query?: string): void {
    this.logger.warn(
      `Mongo Slow Query (${time}ms): ${operation} -- Query: ${query ?? '{}'}`,
    );
  }

  logMigration(message: string): void {
    this.logger.log(`[Migration] ${message}`);
  }

  logSchemaBuild(message: string): void {
    this.logger.log(`[Schema] ${message}`);
  }

  log(level: 'log' | 'info' | 'warn', message: unknown): void {
    if (level === 'warn') {
      this.logger.warn(String(message));
    } else if (level === 'info') {
      this.logger.log(String(message));
    } else {
      this.logger.log(String(message));
    }
  }

  private safeStringify(data: unknown): string {
    try {
      return JSON.stringify(data);
    } catch {
      return '[Unserializable]';
    }
  }
}
