export const QUEUE_NAMES = {
  USERS: 'users',
} as const;

export const QUEUE_JOBS = {
  RESET_BALANCES: 'resetBalances',
} as const;

export const CRON_EXPRESSIONS = {
  EVERY_10_MINUTES: '*/10 * * * *',
} as const;
