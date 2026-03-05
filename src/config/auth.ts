import { JwtModuleOptions } from "@nestjs/jwt";

export const jwtConfig: JwtModuleOptions = {
  secret: process.env.JWT_SECRET ?? 'dev-secret',
  signOptions: { expiresIn: '15m' },
}