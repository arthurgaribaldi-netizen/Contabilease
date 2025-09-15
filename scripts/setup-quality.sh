#!/bin/bash

# Script de configuração de qualidade de código para Contabilease
# Este script instala e configura todas as ferramentas de qualidade

set -e

echo "🚀 Configurando ferramentas de qualidade de código..."

# Verifica se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale o Node.js primeiro."
    exit 1
fi

# Verifica se o npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado. Por favor, instale o npm primeiro."
    exit 1
fi

echo "📦 Instalando dependências..."

# Instala as dependências de desenvolvimento
npm install --save-dev \
    eslint-plugin-jsx-a11y \
    eslint-plugin-react \
    eslint-plugin-react-hooks \
    husky \
    lint-staged \
    prettier

echo "🔧 Configurando Husky..."

# Instala o Husky
npx husky install

# Cria o diretório .husky se não existir
mkdir -p .husky

# Configura o pre-commit hook
cat > .husky/pre-commit << 'EOF'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Executa verificações de qualidade antes do commit
echo "🔍 Executando verificações de qualidade de código..."

# Verifica se há arquivos staged
if [ -z "$(git diff --cached --name-only)" ]; then
  echo "❌ Nenhum arquivo staged para commit"
  exit 1
fi

# Executa lint-staged
npx lint-staged

# Verifica se lint-staged passou
if [ $? -ne 0 ]; then
  echo "❌ Verificações de qualidade falharam"
  exit 1
fi

echo "✅ Todas as verificações de qualidade passaram!"
EOF

# Torna o arquivo executável
chmod +x .husky/pre-commit

echo "🎨 Configurando Prettier..."

# Cria o arquivo .prettierignore se não existir
if [ ! -f .prettierignore ]; then
    cat > .prettierignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Production builds
.next/
out/
build/
dist/

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next

# Nuxt.js build / generate output
.nuxt

# Gatsby files
.cache/
public

# Storybook build outputs
.out
.storybook-out

# Temporary folders
tmp/
temp/

# Editor directories and files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Database files
*.db
*.sqlite
*.sqlite3

# Generated files
*.generated.*
*.d.ts

# Package lock files
package-lock.json
yarn.lock
pnpm-lock.yaml

# Documentation
*.md
EOF
fi

echo "🔍 Configurando ESLint..."

# Cria o arquivo .eslintrc.js se não existir
if [ ! -f .eslintrc.js ]; then
    cat > .eslintrc.js << 'EOF'
module.exports = {
  extends: [
    'next/core-web-vitals',
    '@typescript-eslint/recommended',
    '@typescript-eslint/recommended-requiring-type-checking'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: '.'
  },
  plugins: ['@typescript-eslint', 'jsx-a11y'],
  rules: {
    // Regras críticas (Error) - Prevenção de bugs
    'prefer-const': 'error',
    'no-var': 'error',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_'
    }],
    'no-console': 'error',
    'no-debugger': 'error',
    'no-alert': 'error',
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/no-empty-function': 'error',
    '@typescript-eslint/no-inferrable-types': 'error',
    '@typescript-eslint/prefer-as-const': 'error',
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    
    // Regras de qualidade de código (Warn)
    'complexity': ['warn', 8],
    'max-depth': ['warn', 4],
    'max-lines': ['warn', 250],
    'max-lines-per-function': ['warn', 40],
    'max-params': ['warn', 4],
    'max-nested-callbacks': ['warn', 3],
    'no-magic-numbers': ['warn', { 
      ignore: [0, 1, -1, 2, 10, 100, 1000], 
      ignoreArrayIndexes: true,
      ignoreDefaultValues: true,
      detectObjects: false
    }],
    'prefer-template': 'warn',
    'object-shorthand': 'warn',
    'prefer-arrow-callback': 'warn',
    'arrow-spacing': 'warn',
    'no-duplicate-imports': 'warn',
    'no-useless-rename': 'warn',
    'prefer-destructuring': ['warn', {
      array: true,
      object: true
    }],
    
    // Regras React específicas
    'react/jsx-key': 'error',
    'react/no-children-prop': 'error',
    'react/jsx-no-duplicate-props': 'error',
    'react/jsx-no-undef': 'error',
    'react/no-danger-with-children': 'error',
    'react/no-deprecated': 'error',
    'react/no-direct-mutation-state': 'error',
    'react/no-find-dom-node': 'error',
    'react/no-is-mounted': 'error',
    'react/no-render-return-value': 'error',
    'react/no-string-refs': 'error',
    'react/no-unescaped-entities': 'error',
    'react/no-unknown-property': 'error',
    'react/no-unsafe': 'error',
    'react/require-render-return': 'error',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/jsx-boolean-value': ['warn', 'never'],
    'react/jsx-curly-brace-presence': ['warn', 'never'],
    'react/jsx-fragments': ['warn', 'syntax'],
    'react/jsx-no-useless-fragment': 'warn',
    'react/jsx-pascal-case': 'warn',
    'react/no-array-index-key': 'warn',
    'react/no-unstable-nested-components': 'warn',
    'react/self-closing-comp': 'warn',
    
    // Regras de acessibilidade
    'jsx-a11y/alt-text': 'warn',
    'jsx-a11y/anchor-has-content': 'warn',
    'jsx-a11y/anchor-is-valid': 'warn',
    'jsx-a11y/aria-props': 'warn',
    'jsx-a11y/aria-proptypes': 'warn',
    'jsx-a11y/aria-unsupported-elements': 'warn',
    'jsx-a11y/click-events-have-key-events': 'warn',
    'jsx-a11y/heading-has-content': 'warn',
    'jsx-a11y/html-has-lang': 'warn',
    'jsx-a11y/img-redundant-alt': 'warn',
    'jsx-a11y/no-access-key': 'warn',
    'jsx-a11y/no-redundant-roles': 'warn',
    'jsx-a11y/role-has-required-aria-props': 'warn',
    'jsx-a11y/role-supports-aria-props': 'warn',
    'jsx-a11y/scope': 'warn',
    'jsx-a11y/tabindex-no-positive': 'warn'
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx', '**/__tests__/**/*'],
      rules: {
        'no-console': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        'no-magic-numbers': 'off',
        'max-lines-per-function': 'off',
        '@typescript-eslint/no-floating-promises': 'off'
      }
    },
    {
      files: ['**/*.config.js', '**/*.config.ts', 'jest.config.js', 'next.config.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        'no-console': 'off'
      }
    }
  ]
};
EOF
fi

echo "📝 Configurando lint-staged..."

# Cria o arquivo .lintstagedrc.json se não existir
if [ ! -f .lintstagedrc.json ]; then
    cat > .lintstagedrc.json << 'EOF'
{
  "*.{ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{js,jsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,md,yml,yaml}": [
    "prettier --write"
  ],
  "*.{css,scss,sass}": [
    "prettier --write"
  ],
  "src/**/*.{ts,tsx}": [
    "npm run type-check"
  ]
}
EOF
fi

echo "🎯 Configurando EditorConfig..."

# Cria o arquivo .editorconfig se não existir
if [ ! -f .editorconfig ]; then
    cat > .editorconfig << 'EOF'
# EditorConfig is awesome: https://EditorConfig.org

# top-most EditorConfig file
root = true

# All files
[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

# TypeScript and JavaScript files
[*.{ts,tsx,js,jsx}]
indent_style = space
indent_size = 2

# JSON files
[*.json]
indent_style = space
indent_size = 2

# Markdown files
[*.md]
trim_trailing_whitespace = false

# YAML files
[*.{yml,yaml}]
indent_style = space
indent_size = 2

# CSS files
[*.{css,scss,sass}]
indent_style = space
indent_size = 2

# Configuration files
[*.{config.js,config.ts}]
indent_style = space
indent_size = 2
EOF
fi

echo "🔧 Configurando VSCode..."

# Cria o diretório .vscode se não existir
mkdir -p .vscode

# Cria o arquivo settings.json se não existir
if [ ! -f .vscode/settings.json ]; then
    cat > .vscode/settings.json << 'EOF'
{
  "editor.formatOnSave": true,
  "editor.formatOnPaste": true,
  "editor.formatOnType": false,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  },
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.detectIndentation": false,
  "editor.trimAutoWhitespace": true,
  "editor.rulers": [100],
  "editor.wordWrap": "wordWrapColumn",
  "editor.wordWrapColumn": 100,
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always",
  "typescript.preferences.includePackageJsonAutoImports": "auto",
  "typescript.suggest.completeFunctionCalls": true,
  "typescript.suggest.includeAutomaticOptionalChainCompletions": true,
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "eslint.format.enable": true,
  "eslint.codeActionsOnSave.mode": "all",
  "prettier.requireConfig": true,
  "prettier.useEditorConfig": false,
  "files.associations": {
    "*.css": "tailwindcss",
    "*.scss": "tailwindcss"
  },
  "files.exclude": {
    "**/.git": true,
    "**/.svn": true,
    "**/.hg": true,
    "**/CVS": true,
    "**/.DS_Store": true,
    "**/Thumbs.db": true,
    "**/node_modules": true,
    "**/.next": true,
    "**/coverage": true,
    "**/.nyc_output": true
  },
  "files.watcherExclude": {
    "**/.git/objects/**": true,
    "**/.git/subtree-cache/**": true,
    "**/node_modules/**": true,
    "**/.next/**": true,
    "**/coverage/**": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/.next": true,
    "**/coverage": true,
    "**/.nyc_output": true,
    "**/dist": true,
    "**/build": true
  },
  "jest.jestCommandLine": "npm test --",
  "jest.autoRun": "off",
  "jest.showCoverageOnLoad": true,
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "terminal.integrated.defaultProfile.windows": "PowerShell",
  "terminal.integrated.profiles.windows": {
    "PowerShell": {
      "source": "PowerShell",
      "icon": "terminal-powershell"
    }
  },
  "git.enableSmartCommit": true,
  "git.confirmSync": false,
  "git.autofetch": true,
  "tailwindCSS.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"],
    ["classnames\\(([^)]*)\\)", "'([^']*)'"],
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
EOF
fi

# Cria o arquivo extensions.json se não existir
if [ ! -f .vscode/extensions.json ]; then
    cat > .vscode/extensions.json << 'EOF'
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json",
    "redhat.vscode-yaml",
    "ms-vscode.vscode-markdown",
    "eamodio.gitlens",
    "mhutchie.git-graph",
    "firsttris.vscode-jest-runner",
    "ms-vscode.test-adapter-converter",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "dsznajder.es7-react-js-snippets",
    "deque-systems.vscode-axe-linter",
    "yzhang.markdown-all-in-one",
    "shd101wyy.markdown-preview-enhanced",
    "pkief.material-icon-theme",
    "zhuangtongfa.material-theme"
  ],
  "unwantedRecommendations": [
    "ms-vscode.vscode-typescript",
    "hookyqr.beautify"
  ]
}
EOF
fi

echo "✅ Configuração concluída com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "1. Execute 'npm run quality-check' para verificar se tudo está funcionando"
echo "2. Configure seu editor para usar as extensões recomendadas"
echo "3. Leia o arquivo QUALITY_GUIDELINES.md para entender as regras"
echo "4. Execute 'npm run format' para formatar o código existente"
echo ""
echo "🎉 Ferramentas de qualidade configuradas com sucesso!"
