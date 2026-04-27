import type { Config } from 'jest';

const config: Config = {
  displayName: 'notification',
  rootDir: '.',
  testEnvironment: 'node',

  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },

  moduleFileExtensions: ['ts', 'js', 'json'],
  testRegex: 'src/.*\\.spec\\.ts$',

  collectCoverageFrom: ['src/**/*.(t|j)s'],
  coverageDirectory: 'coverage',

  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '^apps/user-service/src/(.*)$': '<rootDir>/src/$1',
    '^@common/common$': '<rootDir>/../../libs/common/src',
    '^@common/common/(.*)$': '<rootDir>/../../libs/common/src/$1',
    '^@common/constants$': '<rootDir>/../../libs/common/constants',
    '^@common/constants/(.*)$': '<rootDir>/../../libs/common/constants/$1',
  },
};

export default config;
