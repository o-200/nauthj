import { JwtModuleOptions } from "@nestjs/jwt";

export const jwtConfig: JwtModuleOptions = {
  secret: process.env.JWT_SECRET ?? 'dev-secret' as string,
  signOptions: { expiresIn: '15m' },
} as const