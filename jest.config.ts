import type { Config } from 'jest';

const config: Config = {
  projects: [
    '<rootDir>/apps/*/jest.config.ts',
    '<rootDir>/libs/*/jest.config.ts',
  ],
};

export default config;
