#!/usr/bin/env node

/**
 * Script para configuração interativa das variáveis de ambiente
 * Execute: node scripts/setup-env.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function question(prompt) {
  return new Promise(resolve => {
    rl.question(prompt, resolve);
  });
}

async function generateJWTSecret() {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('base64');
}

async function setupEnvironment() {
  log('\n🚀 Configuração de Variáveis de Ambiente - Contabilease', colors.bright);
  log('='.repeat(60), colors.cyan);

  const envVars = {};

  // Configuração básica
  log('\n📋 CONFIGURAÇÃO BÁSICA', colors.yellow);
  envVars.NODE_ENV =
    (await question('Ambiente (development/production) [development]: ')) || 'development';
  envVars.NEXT_PUBLIC_APP_URL =
    (await question('URL da aplicação [http://localhost:3000]: ')) || 'http://localhost:3000';

  // Supabase
  log('\n🗄️ CONFIGURAÇÃO DO SUPABASE (OBRIGATÓRIO)', colors.red);
  log('Acesse: https://supabase.com/dashboard/project/[seu-projeto]/settings/api', colors.blue);

  envVars.NEXT_PUBLIC_SUPABASE_URL = await question('NEXT_PUBLIC_SUPABASE_URL: ');
  envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY = await question('NEXT_PUBLIC_SUPABASE_ANON_KEY: ');
  envVars.SUPABASE_SERVICE_ROLE_KEY = await question('SUPABASE_SERVICE_ROLE_KEY: ');
  envVars.SUPABASE_JWT_SECRET = await question('SUPABASE_JWT_SECRET: ');

  // Stripe
  log('\n💳 CONFIGURAÇÃO DO STRIPE (OBRIGATÓRIO)', colors.red);
  log('Acesse: https://dashboard.stripe.com/apikeys', colors.blue);
  log('• Secret Key deve começar com sk_test_ (teste) ou sk_live_ (produção)', colors.cyan);
  log('• Publishable Key deve começar com pk_test_ (teste) ou pk_live_ (produção)', colors.cyan);

  envVars.STRIPE_SECRET_KEY = await question('STRIPE_SECRET_KEY (sk_test_...): ');
  envVars.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = await question(
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (pk_test_...): '
  );
  envVars.STRIPE_WEBHOOK_SECRET = await question('STRIPE_WEBHOOK_SECRET (whsec_...): ');

  log('Configure os produtos no Stripe Dashboard:', colors.blue);
  envVars.STRIPE_BASIC_PRICE_ID = await question('STRIPE_BASIC_PRICE_ID: ');
  envVars.STRIPE_PROFESSIONAL_PRICE_ID = await question('STRIPE_PROFESSIONAL_PRICE_ID: ');
  envVars.STRIPE_OFFICE_PRICE_ID = await question('STRIPE_OFFICE_PRICE_ID: ');

  // Google OAuth
  log('\n🔐 CONFIGURAÇÃO DO GOOGLE OAUTH (OPCIONAL)', colors.yellow);
  log('Acesse: https://console.developers.google.com/', colors.blue);

  const useGoogle = await question('Configurar Google OAuth? (y/n) [n]: ');
  if (useGoogle.toLowerCase() === 'y') {
    envVars.GOOGLE_CLIENT_ID = await question('GOOGLE_CLIENT_ID: ');
    envVars.GOOGLE_CLIENT_SECRET = await question('GOOGLE_CLIENT_SECRET: ');
  }

  // Segurança
  log('\n🔒 CONFIGURAÇÃO DE SEGURANÇA', colors.red);
  const generateJWT = await question('Gerar JWT_SECRET automaticamente? (y/n) [y]: ');
  if (generateJWT.toLowerCase() !== 'n') {
    envVars.JWT_SECRET = await generateJWTSecret();
    log(`✅ JWT_SECRET gerado: ${envVars.JWT_SECRET}`, colors.green);
  } else {
    envVars.JWT_SECRET = await question('JWT_SECRET (mínimo 32 caracteres): ');
  }

  // Configurações de segurança padrão
  envVars.ENABLE_ZERO_TRUST_AUTH = 'true';
  envVars.ENABLE_ENHANCED_SECURITY = 'true';
  envVars.ENABLE_ADVANCED_RATE_LIMITING = 'true';
  envVars.ENABLE_INPUT_VALIDATION = 'true';
  envVars.ENABLE_SECURITY_AUDIT = 'true';

  // Monitoramento
  log('\n📊 CONFIGURAÇÃO DE MONITORAMENTO (OPCIONAL)', colors.yellow);
  const useSentry = await question('Configurar Sentry? (y/n) [n]: ');
  if (useSentry.toLowerCase() === 'y') {
    envVars.SENTRY_DSN = await question('SENTRY_DSN: ');
  }

  const useAnalytics = await question('Configurar Google Analytics? (y/n) [n]: ');
  if (useAnalytics.toLowerCase() === 'y') {
    envVars.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID = await question('NEXT_PUBLIC_GOOGLE_ANALYTICS_ID: ');
  }

  // Configurações padrão
  envVars.LOG_LEVEL = 'debug';
  envVars.SECURITY_LOG_LEVEL = 'medium';
  envVars.EXTERNAL_LOGGING_ENABLED = 'false';
  envVars.LOG_RETENTION_HOURS = '24';
  envVars.RATE_LIMIT_ENABLED = 'true';
  envVars.RATE_LIMIT_DISTRIBUTED = 'false';
  envVars.ENABLE_CSP = 'true';
  envVars.CSP_REPORT_ONLY = 'false';
  envVars.ENABLE_HSTS = 'true';
  envVars.HSTS_MAX_AGE = '31536000';
  envVars.DATA_VALIDATION_ENABLED = 'true';
  envVars.MAX_REQUEST_SIZE = '10485760';
  envVars.ALLOWED_CONTENT_TYPES = 'application/json,application/x-www-form-urlencoded';
  envVars.CORS_ALLOWED_ORIGINS =
    'http://localhost:3000,https://contabilease.vercel.app,https://contabilease.com';
  envVars.CORS_ALLOWED_METHODS = 'GET,POST,PUT,DELETE,OPTIONS';
  envVars.CORS_ALLOWED_HEADERS = 'Content-Type,Authorization,X-Requested-With';
  envVars.MAX_FILE_SIZE = '10485760';
  envVars.ALLOWED_FILE_TYPES = 'image/jpeg,image/png,image/gif,application/pdf';
  envVars.SECURITY_DEBUG = 'false';
  envVars.SECURITY_VERBOSE_LOGGING = 'false';

  // Gerar arquivo .env.local
  log('\n📝 Gerando arquivo .env.local...', colors.blue);

  const envContent = `# ===========================================
# CONFIGURAÇÃO DE VARIÁVEIS DE AMBIENTE
# Gerado automaticamente em ${new Date().toISOString()}
# ===========================================

# Configuração Básica
NODE_ENV=${envVars.NODE_ENV}
NEXT_PUBLIC_APP_URL=${envVars.NEXT_PUBLIC_APP_URL}

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=${envVars.NEXT_PUBLIC_SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${envVars.SUPABASE_SERVICE_ROLE_KEY}
SUPABASE_JWT_SECRET=${envVars.SUPABASE_JWT_SECRET}

# Stripe Configuration
STRIPE_SECRET_KEY=${envVars.STRIPE_SECRET_KEY}
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${envVars.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
STRIPE_WEBHOOK_SECRET=${envVars.STRIPE_WEBHOOK_SECRET}
STRIPE_BASIC_PRICE_ID=${envVars.STRIPE_BASIC_PRICE_ID}
STRIPE_PROFESSIONAL_PRICE_ID=${envVars.STRIPE_PROFESSIONAL_PRICE_ID}
STRIPE_OFFICE_PRICE_ID=${envVars.STRIPE_OFFICE_PRICE_ID}

# Google OAuth Configuration
${envVars.GOOGLE_CLIENT_ID ? `GOOGLE_CLIENT_ID=${envVars.GOOGLE_CLIENT_ID}` : '# GOOGLE_CLIENT_ID='}
${envVars.GOOGLE_CLIENT_SECRET ? `GOOGLE_CLIENT_SECRET=${envVars.GOOGLE_CLIENT_SECRET}` : '# GOOGLE_CLIENT_SECRET='}

# Security Configuration
JWT_SECRET=${envVars.JWT_SECRET}
ENABLE_ZERO_TRUST_AUTH=${envVars.ENABLE_ZERO_TRUST_AUTH}
ENABLE_ENHANCED_SECURITY=${envVars.ENABLE_ENHANCED_SECURITY}
ENABLE_ADVANCED_RATE_LIMITING=${envVars.ENABLE_ADVANCED_RATE_LIMITING}
ENABLE_INPUT_VALIDATION=${envVars.ENABLE_INPUT_VALIDATION}
ENABLE_SECURITY_AUDIT=${envVars.ENABLE_SECURITY_AUDIT}

# Rate Limiting
RATE_LIMIT_ENABLED=${envVars.RATE_LIMIT_ENABLED}
RATE_LIMIT_DISTRIBUTED=${envVars.RATE_LIMIT_DISTRIBUTED}
RATE_LIMIT_REDIS_URL=redis://localhost:6379

# Security Headers
ENABLE_CSP=${envVars.ENABLE_CSP}
CSP_REPORT_ONLY=${envVars.CSP_REPORT_ONLY}
ENABLE_HSTS=${envVars.ENABLE_HSTS}
HSTS_MAX_AGE=${envVars.HSTS_MAX_AGE}

# Zero Trust Configuration
ZERO_TRUST_SESSION_TIMEOUT=30
ZERO_TRUST_MAX_CONCURRENT_SESSIONS=3
ZERO_TRUST_TRUST_SCORE_THRESHOLD=50
ZERO_TRUST_ENABLE_MFA=true
ZERO_TRUST_ENABLE_DEVICE_TRUST=true
ZERO_TRUST_ENABLE_LOCATION_VERIFICATION=true
ZERO_TRUST_ENABLE_BEHAVIORAL_ANALYSIS=true

# Data Validation
DATA_VALIDATION_ENABLED=${envVars.DATA_VALIDATION_ENABLED}
MAX_REQUEST_SIZE=${envVars.MAX_REQUEST_SIZE}
ALLOWED_CONTENT_TYPES=${envVars.ALLOWED_CONTENT_TYPES}

# CORS Configuration
CORS_ALLOWED_ORIGINS=${envVars.CORS_ALLOWED_ORIGINS}
CORS_ALLOWED_METHODS=${envVars.CORS_ALLOWED_METHODS}
CORS_ALLOWED_HEADERS=${envVars.CORS_ALLOWED_HEADERS}

# Logging and Monitoring
LOG_LEVEL=${envVars.LOG_LEVEL}
SECURITY_LOG_LEVEL=${envVars.SECURITY_LOG_LEVEL}
EXTERNAL_LOGGING_ENABLED=${envVars.EXTERNAL_LOGGING_ENABLED}
LOG_RETENTION_HOURS=${envVars.LOG_RETENTION_HOURS}

# External Monitoring
${envVars.SENTRY_DSN ? `SENTRY_DSN=${envVars.SENTRY_DSN}` : '# SENTRY_DSN='}
${envVars.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID ? `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=${envVars.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}` : '# NEXT_PUBLIC_GOOGLE_ANALYTICS_ID='}

# File Upload Configuration
MAX_FILE_SIZE=${envVars.MAX_FILE_SIZE}
ALLOWED_FILE_TYPES=${envVars.ALLOWED_FILE_TYPES}

# Development Configuration
SECURITY_DEBUG=${envVars.SECURITY_DEBUG}
SECURITY_VERBOSE_LOGGING=${envVars.SECURITY_VERBOSE_LOGGING}
`;

  try {
    fs.writeFileSync('.env.local', envContent);
    log('✅ Arquivo .env.local criado com sucesso!', colors.green);
  } catch (error) {
    log('❌ Erro ao criar arquivo .env.local:', colors.red);
    log(error.message, colors.red);
  }

  // Verificação
  log('\n🔍 VERIFICAÇÃO DAS VARIÁVEIS', colors.yellow);
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'JWT_SECRET',
  ];

  const missingVars = requiredVars.filter(varName => !envVars[varName]);

  if (missingVars.length === 0) {
    log('✅ Todas as variáveis obrigatórias foram configuradas!', colors.green);
  } else {
    log('⚠️ Variáveis obrigatórias faltando:', colors.yellow);
    missingVars.forEach(varName => {
      log(`  - ${varName}`, colors.red);
    });
  }

  log('\n📋 PRÓXIMOS PASSOS:', colors.cyan);
  log('1. Execute: npm install', colors.blue);
  log('2. Execute: npm run dev', colors.blue);
  log('3. Acesse: http://localhost:3000', colors.blue);
  log('4. Configure o banco de dados no Supabase', colors.blue);
  log('5. Teste as funcionalidades', colors.blue);

  log('\n🎉 Configuração concluída!', colors.green);
  rl.close();
}

// Executar configuração
setupEnvironment().catch(error => {
  log('❌ Erro durante a configuração:', colors.red);
  log(error.message, colors.red);
  rl.close();
  process.exit(1);
});
