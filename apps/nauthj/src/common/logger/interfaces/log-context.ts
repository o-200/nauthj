export interface LogContext {
  requestId?: string;
  ip?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  durationMs?: number;
  [key: string]: unknown;
}
