#!/usr/bin/env node

/**
 * Script de Verificação Pré-Deploy para Vercel
 * Verifica se todas as configurações necessárias estão presentes
 */

const fs = require('fs');
const path = require('path');

// Cores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

// Função para log colorido
function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

// Verificações necessárias
const checks = [
  {
    name: 'Arquivo vercel.json',
    check: () => fs.existsSync('vercel.json'),
    fix: 'Criar arquivo vercel.json com configurações adequadas',
  },
  {
    name: 'Arquivo next.config.js',
    check: () => fs.existsSync('next.config.js'),
    fix: 'Verificar se next.config.js está configurado corretamente',
  },
  {
    name: 'Package.json com scripts de build',
    check: () => {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      return pkg.scripts && pkg.scripts.build;
    },
    fix: 'Verificar se package.json tem script de build configurado',
  },
  {
    name: 'Dependências críticas instaladas',
    check: () => {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const criticalDeps = ['next', 'react', 'react-dom'];
      return criticalDeps.every(dep => pkg.dependencies[dep]);
    },
    fix: 'Instalar dependências críticas: next, react, react-dom',
  },
  {
    name: 'Arquivo de exemplo de variáveis de ambiente',
    check: () => fs.existsSync('vercel-env-example.txt'),
    fix: 'Criar arquivo de exemplo com variáveis de ambiente necessárias',
  },
  {
    name: 'Configuração TypeScript',
    check: () => fs.existsSync('tsconfig.json'),
    fix: 'Verificar configuração do TypeScript',
  },
  {
    name: 'Middleware configurado',
    check: () => fs.existsSync('middleware.ts'),
    fix: 'Verificar se middleware.ts está configurado',
  },
  {
    name: 'Estrutura de pastas src/app',
    check: () => fs.existsSync('src/app'),
    fix: 'Verificar estrutura de pastas do Next.js 13+',
  },
];

// Variáveis de ambiente críticas
const criticalEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_APP_URL',
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
];

// Função principal
function main() {
  log(colors.bold + colors.blue, '🚀 Verificação Pré-Deploy Vercel - Contabilease\n');

  let allPassed = true;
  let passedChecks = 0;

  // Executar verificações
  log(colors.bold, '📋 Verificando Configurações do Projeto:');

  checks.forEach((check, index) => {
    const passed = check.check();
    if (passed) {
      log(colors.green, `✅ ${check.name}`);
      passedChecks++;
    } else {
      log(colors.red, `❌ ${check.name}`);
      log(colors.yellow, `   💡 ${check.fix}`);
      allPassed = false;
    }
  });

  log(colors.bold, '\n🔐 Verificando Variáveis de Ambiente Críticas:');

  // Verificar se arquivo .env.example existe
  const envExampleExists = fs.existsSync('env.example');
  if (envExampleExists) {
    log(colors.green, '✅ Arquivo env.example encontrado');
  } else {
    log(colors.red, '❌ Arquivo env.example não encontrado');
    allPassed = false;
  }

  // Verificar arquivo vercel-env-example.txt
  const vercelEnvExampleExists = fs.existsSync('vercel-env-example.txt');
  if (vercelEnvExampleExists) {
    log(colors.green, '✅ Arquivo vercel-env-example.txt encontrado');
  } else {
    log(colors.red, '❌ Arquivo vercel-env-example.txt não encontrado');
    allPassed = false;
  }

  log(colors.bold, '\n📊 Resumo da Verificação:');
  log(colors.blue, `Verificações passaram: ${passedChecks}/${checks.length}`);

  if (allPassed) {
    log(
      colors.green + colors.bold,
      '\n🎉 Todas as verificações passaram! Projeto pronto para deploy no Vercel.'
    );
    log(colors.blue, '\n📝 Próximos passos:');
    log(colors.blue, '1. Configure as variáveis de ambiente no dashboard do Vercel');
    log(colors.blue, '2. Conecte seu repositório ao Vercel');
    log(colors.blue, '3. Faça o deploy inicial');
    log(colors.blue, '4. Configure webhooks e integrações');
    process.exit(0);
  } else {
    log(
      colors.red + colors.bold,
      '\n⚠️  Algumas verificações falharam. Corrija os problemas antes do deploy.'
    );
    log(
      colors.yellow,
      '\n💡 Dica: Consulte o arquivo VERCEL_DEPLOYMENT_GUIDE.md para instruções detalhadas.'
    );
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { main, checks, criticalEnvVars };
