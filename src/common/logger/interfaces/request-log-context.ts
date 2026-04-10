export interface RequestLogContext {
  requestId: string;
  method: string;
  path: string;
  status: number;
  durationMs: number;
  ip?: string;
  message: string;
}
