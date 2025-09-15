/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  projects: [
    {
      displayName: 'client',
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/__tests__/**/*.(test|spec).(ts|tsx)', '!<rootDir>/__tests__/**/*.api.(test|spec).(ts|tsx)'],
      transform: {
        '^.+\\.(ts|tsx)$': [
          'ts-jest',
          {
            tsconfig: {
              jsx: 'react-jsx',
              allowJs: true,
              esModuleInterop: true,
              allowSyntheticDefaultImports: true,
              strict: false,
              skipLibCheck: true,
            },
          },
        ],
      },
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
      setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
    },
    {
      displayName: 'server',
      preset: 'ts-jest',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/__tests__/**/*.api.(test|spec).(ts|tsx)', '<rootDir>/__tests__/**/stripe-webhook.test.ts'],
      transform: {
        '^.+\\.(ts|tsx)$': [
          'ts-jest',
          {
            tsconfig: {
              jsx: 'react-jsx',
              allowJs: true,
              esModuleInterop: true,
              allowSyntheticDefaultImports: true,
              strict: false,
              skipLibCheck: true,
            },
          },
        ],
      },
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
    },
  ],
  roots: ['<rootDir>/__tests__'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  testMatch: ['**/__tests__/**/*.(test|spec).(ts|tsx|js)', '**/*.(test|spec).(ts|tsx|js)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transformIgnorePatterns: ['node_modules/(?!(.*\\.mjs$))'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/**/layout.tsx',
    '!src/app/**/page.tsx',
    '!src/app/api/**/*.ts',
    '!src/app/**/route.ts',
    '!src/middleware/**/*.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // Thresholds específicos para arquivos críticos
    './src/lib/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    './src/components/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
};