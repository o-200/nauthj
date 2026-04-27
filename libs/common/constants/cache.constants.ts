export const CACHE_KEYS = {
  AUTH_ME: (userId: string) => `auth:me:${userId}`,
  USER: (userId: string) => `user:${userId}`,
  USER_AVATARS: (userId: string) => `user:${userId}:avatars`,
  USERS_ACTIVE: 'users:active',
} as const;

export const CACHE_TTL = {
  ONE_MINUTE_MS: 60000,
} as const;
