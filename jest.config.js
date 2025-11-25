import { createDefaultPreset } from 'ts-jest'

const tsJestTransformCfg = createDefaultPreset().transform

const isCI = process.env.CI === 'true'

/** @type {import("jest").Config} **/
export default {
  verbose: true,
  collectCoverage: false,
  resetModules: true,
  restoreMocks: true,
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
  moduleNameMapper: {
    '^(\\.\\.?\\/.+)\\.js$': '$1',
  },
  transform: {
    ...tsJestTransformCfg,
  },
  collectCoverageFrom: ['<rootDir>/src/*.ts'],
  coveragePathIgnorePatterns: ['<rootDir>/dist/', '/node_modules/', '<rootDir>/scripts', '<rootDir>/tools'],
  coverageProvider: 'v8',
  coverageReporters: isCI ? ['json'] : ['text'],
}
