/**
 * Configuração centralizada de qualidade de código para Contabilease
 * Este arquivo define padrões e regras de qualidade para todo o projeto
 */

module.exports = {
  // Configurações de ESLint
  eslint: {
    // Arquivos que devem ser ignorados pelo ESLint
    ignorePatterns: [
      'node_modules/',
      '.next/',
      'out/',
      'build/',
      'dist/',
      'coverage/',
      '*.config.js',
      '*.config.ts',
      'jest.config.js',
      'next.config.js',
      'postcss.config.js',
      'tailwind.config.js',
    ],

    // Regras críticas que devem sempre ser aplicadas
    criticalRules: [
      'no-console',
      'no-debugger',
      '@typescript-eslint/no-explicit-any',
      '@typescript-eslint/no-floating-promises',
      'react-hooks/rules-of-hooks',
    ],

    // Limites de complexidade
    complexityLimits: {
      maxComplexity: 8,
      maxDepth: 4,
      maxLines: 250,
      maxLinesPerFunction: 40,
      maxParams: 4,
      maxNestedCallbacks: 3,
    },
  },

  // Configurações de TypeScript
  typescript: {
    // Configurações rigorosas habilitadas
    strictSettings: [
      'noImplicitAny',
      'noImplicitReturns',
      'noImplicitThis',
      'noUnusedLocals',
      'noUnusedParameters',
      'exactOptionalPropertyTypes',
      'noImplicitOverride',
      'noPropertyAccessFromIndexSignature',
      'noUncheckedIndexedAccess',
      'strictBindCallApply',
      'strictFunctionTypes',
      'strictNullChecks',
      'strictPropertyInitialization',
      'useUnknownInCatchVariables',
    ],
  },

  // Configurações de Prettier
  prettier: {
    // Configurações padrão
    defaultConfig: {
      semi: true,
      trailingComma: 'es5',
      singleQuote: true,
      printWidth: 100,
      tabWidth: 2,
      useTabs: false,
      quoteProps: 'as-needed',
      bracketSpacing: true,
      bracketSameLine: false,
      arrowParens: 'avoid',
      endOfLine: 'lf',
      jsxSingleQuote: true,
    },
  },

  // Configurações de Jest/Testing
  testing: {
    // Thresholds de cobertura
    coverageThresholds: {
      global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
      critical: {
        // Arquivos críticos devem ter cobertura mais alta
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
    },

    // Arquivos que devem ser ignorados na cobertura
    coverageIgnorePatterns: [
      'src/**/*.d.ts',
      'src/app/**/layout.tsx',
      'src/app/**/page.tsx',
      'src/**/*.test.ts',
      'src/**/*.test.tsx',
      'src/**/*.spec.ts',
      'src/**/*.spec.tsx',
    ],
  },

  // Configurações de Pre-commit
  preCommit: {
    // Comandos que devem ser executados antes do commit
    commands: ['npm run type-check', 'npm run lint:strict', 'npm run test:ci'],

    // Arquivos que devem ser formatados automaticamente
    autoFormat: ['*.{ts,tsx,js,jsx}', '*.{json,md,yml,yaml}', '*.{css,scss,sass}'],
  },

  // Configurações de Performance
  performance: {
    // Limites de tamanho de bundle
    bundleSizeLimits: {
      maxInitialBundleSize: '500kb',
      maxChunkSize: '200kb',
      maxAssetSize: '1mb',
    },

    // Métricas de performance
    performanceMetrics: {
      maxFirstContentfulPaint: 2000,
      maxLargestContentfulPaint: 2500,
      maxFirstInputDelay: 100,
      maxCumulativeLayoutShift: 0.1,
    },
  },

  // Configurações de Segurança
  security: {
    // Padrões de segurança obrigatórios
    requiredPatterns: ['no-eval', 'no-implied-eval', 'no-new-func', 'no-script-url', 'no-alert'],

    // Bibliotecas que devem ser auditadas
    auditRequired: true,

    // Vulnerabilidades que devem bloquear o build
    blockOnVulnerabilities: true,
  },

  // Configurações de Acessibilidade
  accessibility: {
    // Regras de acessibilidade obrigatórias
    requiredRules: [
      'jsx-a11y/alt-text',
      'jsx-a11y/anchor-has-content',
      'jsx-a11y/anchor-is-valid',
      'jsx-a11y/aria-props',
      'jsx-a11y/aria-proptypes',
      'jsx-a11y/heading-has-content',
      'jsx-a11y/html-has-lang',
    ],
  },

  // Configurações de Documentação
  documentation: {
    // Arquivos que devem ter documentação
    requireDocumentation: ['src/lib/**/*.ts', 'src/components/**/*.tsx', 'src/hooks/**/*.ts'],

    // Padrões de comentários obrigatórios
    commentPatterns: {
      functions: 'JSDoc',
      classes: 'JSDoc',
      interfaces: 'JSDoc',
      types: 'JSDoc',
    },
  },
};
