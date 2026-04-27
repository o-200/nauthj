export interface ErrorLogContext {
  requestId?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  message: string;
  stack?: string;
  context?: string;
}
