#!/usr/bin/env node

/**
 * Script para verificar a configuração do Supabase para produção
 * Execute: node scripts/verify-supabase-config.js
 */

const fs = require('fs');
const path = require('path');

// Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkEnvFile() {
  log('\n🔍 Verificando arquivo .env.local...', colors.blue);
  
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    log('❌ Arquivo .env.local não encontrado!', colors.red);
    log('   Crie o arquivo .env.local baseado no .env.production.example', colors.yellow);
    return false;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Verificar variáveis obrigatórias
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_APP_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
  ];
  
  const missingVars = [];
  const placeholderVars = [];
  
  requiredVars.forEach(varName => {
    if (!envContent.includes(`${varName}=`)) {
      missingVars.push(varName);
    } else if (envContent.includes(`${varName}=your_`) || 
               envContent.includes(`${varName}=sua_`) ||
               envContent.includes(`${varName}=seu_`)) {
      placeholderVars.push(varName);
    }
  });
  
  if (missingVars.length > 0) {
    log('❌ Variáveis de ambiente faltando:', colors.red);
    missingVars.forEach(varName => {
      log(`   - ${varName}`, colors.red);
    });
  }
  
  if (placeholderVars.length > 0) {
    log('⚠️  Variáveis com valores placeholder:', colors.yellow);
    placeholderVars.forEach(varName => {
      log(`   - ${varName}`, colors.yellow);
    });
  }
  
  if (missingVars.length === 0 && placeholderVars.length === 0) {
    log('✅ Arquivo .env.local configurado corretamente!', colors.green);
    return true;
  }
  
  return false;
}

function checkSupabaseUrl() {
  log('\n🌐 Verificando URL do Supabase...', colors.blue);
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  if (!supabaseUrl) {
    log('❌ NEXT_PUBLIC_SUPABASE_URL não definida!', colors.red);
    return false;
  }
  
  if (!supabaseUrl.includes('supabase.co')) {
    log('⚠️  URL do Supabase pode estar incorreta', colors.yellow);
    log(`   URL atual: ${supabaseUrl}`, colors.yellow);
  }
  
  log('✅ URL do Supabase configurada', colors.green);
  log(`   URL: ${supabaseUrl}`, colors.cyan);
  
  return true;
}

function checkPackageJson() {
  log('\n📦 Verificando dependências do Supabase...', colors.blue);
  
  const packagePath = path.join(process.cwd(), 'package.json');
  
  if (!fs.existsSync(packagePath)) {
    log('❌ package.json não encontrado!', colors.red);
    return false;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const requiredPackages = [
    '@supabase/supabase-js',
    '@supabase/auth-helpers-nextjs',
    '@supabase/auth-helpers-react',
  ];
  
  const missingPackages = [];
  
  requiredPackages.forEach(packageName => {
    if (!dependencies[packageName]) {
      missingPackages.push(packageName);
    }
  });
  
  if (missingPackages.length > 0) {
    log('❌ Pacotes do Supabase faltando:', colors.red);
    missingPackages.forEach(packageName => {
      log(`   - ${packageName}`, colors.red);
    });
    log('\n   Execute: npm install', colors.yellow);
    return false;
  }
  
  log('✅ Dependências do Supabase instaladas', colors.green);
  
  return true;
}

function checkMigrationFiles() {
  log('\n🗄️  Verificando arquivos de migração...', colors.blue);
  
  const migrationsPath = path.join(process.cwd(), 'supabase', 'migrations');
  
  if (!fs.existsSync(migrationsPath)) {
    log('❌ Diretório supabase/migrations não encontrado!', colors.red);
    return false;
  }
  
  const migrationFiles = fs.readdirSync(migrationsPath).filter(file => file.endsWith('.sql'));
  
  const requiredMigrations = [
    '001_create_countries_table.sql',
    '002_profiles_contracts_and_rls.sql',
    '003_rls_and_policies.sql',
    '008_security_tables.sql',
    '009_storage_security.sql',
  ];
  
  const missingMigrations = [];
  
  requiredMigrations.forEach(migrationFile => {
    if (!migrationFiles.includes(migrationFile)) {
      missingMigrations.push(migrationFile);
    }
  });
  
  if (missingMigrations.length > 0) {
    log('❌ Migrações obrigatórias faltando:', colors.red);
    missingMigrations.forEach(migrationFile => {
      log(`   - ${migrationFile}`, colors.red);
    });
    return false;
  }
  
  log('✅ Arquivos de migração encontrados', colors.green);
  log(`   Total de migrações: ${migrationFiles.length}`, colors.cyan);
  
  return true;
}

function checkSupabaseConfig() {
  log('\n⚙️  Verificando configuração do Supabase...', colors.blue);
  
  const supabaseConfigPath = path.join(process.cwd(), 'src', 'lib', 'supabase.ts');
  
  if (!fs.existsSync(supabaseConfigPath)) {
    log('❌ Arquivo src/lib/supabase.ts não encontrado!', colors.red);
    return false;
  }
  
  const configContent = fs.readFileSync(supabaseConfigPath, 'utf8');
  
  // Verificar se tem as configurações de produção
  const requiredConfigs = [
    'createServerClient',
    'autoRefreshToken',
    'persistSession',
    'detectSessionInUrl',
    'flowType',
  ];
  
  const missingConfigs = [];
  
  requiredConfigs.forEach(config => {
    if (!configContent.includes(config)) {
      missingConfigs.push(config);
    }
  });
  
  if (missingConfigs.length > 0) {
    log('❌ Configurações de produção faltando:', colors.red);
    missingConfigs.forEach(config => {
      log(`   - ${config}`, colors.red);
    });
    return false;
  }
  
  log('✅ Configuração do Supabase atualizada para produção', colors.green);
  
  return true;
}

function checkSecurityFiles() {
  log('\n🛡️  Verificando arquivos de segurança...', colors.blue);
  
  const securityFiles = [
    'src/lib/supabase/security.ts',
    'src/middleware/supabase-security.ts',
    'src/lib/supabase/auth-config.ts',
  ];
  
  const missingFiles = [];
  
  securityFiles.forEach(filePath => {
    const fullPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) {
      missingFiles.push(filePath);
    }
  });
  
  if (missingFiles.length > 0) {
    log('❌ Arquivos de segurança faltando:', colors.red);
    missingFiles.forEach(filePath => {
      log(`   - ${filePath}`, colors.red);
    });
    return false;
  }
  
  log('✅ Arquivos de segurança implementados', colors.green);
  
  return true;
}

function generateReport(results) {
  log('\n' + '='.repeat(60), colors.cyan);
  log('📊 RELATÓRIO DE VERIFICAÇÃO SUPABASE', colors.bright + colors.cyan);
  log('='.repeat(60), colors.cyan);
  
  const totalChecks = Object.keys(results).length;
  const passedChecks = Object.values(results).filter(Boolean).length;
  const failedChecks = totalChecks - passedChecks;
  
  log(`\n✅ Verificações aprovadas: ${passedChecks}/${totalChecks}`, colors.green);
  
  if (failedChecks > 0) {
    log(`❌ Verificações falharam: ${failedChecks}/${totalChecks}`, colors.red);
    
    log('\n📝 PRÓXIMOS PASSOS:', colors.yellow);
    log('1. Configure as variáveis de ambiente faltantes', colors.yellow);
    log('2. Execute as migrações no Supabase SQL Editor', colors.yellow);
    log('3. Instale as dependências faltantes com: npm install', colors.yellow);
    log('4. Execute este script novamente para verificar', colors.yellow);
  } else {
    log('\n🎉 CONFIGURAÇÃO COMPLETA!', colors.green + colors.bright);
    log('Seu projeto está pronto para produção!', colors.green);
    
    log('\n📝 PRÓXIMOS PASSOS:', colors.yellow);
    log('1. Execute as migrações no Supabase Dashboard', colors.yellow);
    log('2. Configure os buckets de storage', colors.yellow);
    log('3. Configure as políticas de autenticação', colors.yellow);
    log('4. Faça o deploy para produção', colors.yellow);
  }
  
  log('\n📚 Consulte o SUPABASE_PRODUCTION_SETUP_GUIDE.md para instruções detalhadas', colors.blue);
}

// Função principal
async function main() {
  log('🚀 VERIFICADOR DE CONFIGURAÇÃO SUPABASE PARA PRODUÇÃO', colors.bright + colors.blue);
  log('Versão: 1.0.0', colors.cyan);
  
  // Carregar variáveis de ambiente
  require('dotenv').config({ path: path.join(process.cwd(), '.env.local') });
  
  const results = {
    envFile: checkEnvFile(),
    supabaseUrl: checkSupabaseUrl(),
    packageJson: checkPackageJson(),
    migrationFiles: checkMigrationFiles(),
    supabaseConfig: checkSupabaseConfig(),
    securityFiles: checkSecurityFiles(),
  };
  
  generateReport(results);
  
  // Exit code baseado no resultado
  const allPassed = Object.values(results).every(Boolean);
  process.exit(allPassed ? 0 : 1);
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(error => {
    log(`❌ Erro durante a verificação: ${error.message}`, colors.red);
    process.exit(1);
  });
}

module.exports = {
  checkEnvFile,
  checkSupabaseUrl,
  checkPackageJson,
  checkMigrationFiles,
  checkSupabaseConfig,
  checkSecurityFiles,
};
