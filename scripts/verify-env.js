#!/usr/bin/env node

/**
 * Script para verificar se todas as variáveis de ambiente estão configuradas
 * Execute: node scripts/verify-env.js
 */

const fs = require('fs');
const path = require('path');

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

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const envVars = {};

  content.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });

  return envVars;
}

function validateSupabaseConfig(envVars) {
  log('\n🗄️ VERIFICAÇÃO DO SUPABASE', colors.yellow);

  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_JWT_SECRET',
  ];

  let allValid = true;

  required.forEach(varName => {
    const value = envVars[varName];
    if (!value || value === 'your_supabase_project_url' || value.includes('your_')) {
      log(`❌ ${varName}: Não configurada ou valor padrão`, colors.red);
      allValid = false;
    } else {
      log(`✅ ${varName}: Configurada`, colors.green);
    }
  });

  // Validação específica do Supabase
  if (
    envVars.NEXT_PUBLIC_SUPABASE_URL &&
    !envVars.NEXT_PUBLIC_SUPABASE_URL.includes('supabase.co')
  ) {
    log('⚠️ NEXT_PUBLIC_SUPABASE_URL: Formato pode estar incorreto', colors.yellow);
  }

  if (
    envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY.startsWith('eyJ')
  ) {
    log('⚠️ NEXT_PUBLIC_SUPABASE_ANON_KEY: Formato pode estar incorreto', colors.yellow);
  }

  return allValid;
}

function validateStripeConfig(envVars) {
  log('\n💳 VERIFICAÇÃO DO STRIPE', colors.yellow);

  const required = [
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'STRIPE_BASIC_PRICE_ID',
    'STRIPE_PROFESSIONAL_PRICE_ID',
    'STRIPE_OFFICE_PRICE_ID',
  ];

  let allValid = true;

  required.forEach(varName => {
    const value = envVars[varName];
    if (!value || value.includes('your_') || value.includes('price_your_')) {
      log(`❌ ${varName}: Não configurada ou valor padrão`, colors.red);
      allValid = false;
    } else {
      log(`✅ ${varName}: Configurada`, colors.green);
    }
  });

  // Validação específica do Stripe
  if (envVars.STRIPE_SECRET_KEY) {
    if (!envVars.STRIPE_SECRET_KEY.startsWith('sk_')) {
      log('⚠️ STRIPE_SECRET_KEY: Deve começar com sk_test_ ou sk_live_', colors.yellow);
    } else if (envVars.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
      log('ℹ️ STRIPE_SECRET_KEY: Modo de teste detectado', colors.blue);
    } else if (envVars.STRIPE_SECRET_KEY.startsWith('sk_live_')) {
      log('ℹ️ STRIPE_SECRET_KEY: Modo de produção detectado', colors.green);
    }
  }

  if (envVars.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    if (!envVars.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.startsWith('pk_')) {
      log(
        '⚠️ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: Deve começar com pk_test_ ou pk_live_',
        colors.yellow
      );
    } else if (envVars.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.startsWith('pk_test_')) {
      log('ℹ️ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: Modo de teste detectado', colors.blue);
    } else if (envVars.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.startsWith('pk_live_')) {
      log('ℹ️ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: Modo de produção detectado', colors.green);
    }
  }

  if (envVars.STRIPE_WEBHOOK_SECRET && !envVars.STRIPE_WEBHOOK_SECRET.startsWith('whsec_')) {
    log('⚠️ STRIPE_WEBHOOK_SECRET: Deve começar com whsec_', colors.yellow);
  }

  return allValid;
}

function validateSecurityConfig(envVars) {
  log('\n🔒 VERIFICAÇÃO DE SEGURANÇA', colors.yellow);

  const jwtSecret = envVars.JWT_SECRET;
  if (!jwtSecret || jwtSecret.length < 32) {
    log('❌ JWT_SECRET: Não configurada ou muito curta (mínimo 32 caracteres)', colors.red);
    return false;
  } else {
    log('✅ JWT_SECRET: Configurada corretamente', colors.green);
  }

  const securityFeatures = [
    'ENABLE_ZERO_TRUST_AUTH',
    'ENABLE_ENHANCED_SECURITY',
    'ENABLE_ADVANCED_RATE_LIMITING',
    'ENABLE_INPUT_VALIDATION',
    'ENABLE_SECURITY_AUDIT',
  ];

  securityFeatures.forEach(feature => {
    const value = envVars[feature];
    if (value === 'true') {
      log(`✅ ${feature}: Ativado`, colors.green);
    } else {
      log(`⚠️ ${feature}: Desativado`, colors.yellow);
    }
  });

  return true;
}

function validateGoogleOAuth(envVars) {
  log('\n🔐 VERIFICAÇÃO DO GOOGLE OAUTH', colors.yellow);

  const clientId = envVars.GOOGLE_CLIENT_ID;
  const clientSecret = envVars.GOOGLE_CLIENT_SECRET;

  if (!clientId && !clientSecret) {
    log('ℹ️ Google OAuth: Não configurado (opcional)', colors.blue);
    return true;
  }

  if (!clientId || !clientSecret) {
    log('❌ Google OAuth: Configuração incompleta', colors.red);
    return false;
  }

  if (!clientId.includes('.apps.googleusercontent.com')) {
    log('⚠️ GOOGLE_CLIENT_ID: Formato pode estar incorreto', colors.yellow);
  }

  if (!clientSecret.startsWith('GOCSPX-')) {
    log('⚠️ GOOGLE_CLIENT_SECRET: Formato pode estar incorreto', colors.yellow);
  }

  log('✅ Google OAuth: Configurado', colors.green);
  return true;
}

function validateMonitoring(envVars) {
  log('\n📊 VERIFICAÇÃO DE MONITORAMENTO', colors.yellow);

  const sentryDsn = envVars.SENTRY_DSN;
  const analyticsId = envVars.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

  if (sentryDsn) {
    if (sentryDsn.includes('sentry.io')) {
      log('✅ Sentry: Configurado', colors.green);
    } else {
      log('⚠️ SENTRY_DSN: Formato pode estar incorreto', colors.yellow);
    }
  } else {
    log('ℹ️ Sentry: Não configurado (opcional)', colors.blue);
  }

  if (analyticsId) {
    if (analyticsId.startsWith('G-')) {
      log('✅ Google Analytics: Configurado', colors.green);
    } else {
      log('⚠️ NEXT_PUBLIC_GOOGLE_ANALYTICS_ID: Formato pode estar incorreto', colors.yellow);
    }
  } else {
    log('ℹ️ Google Analytics: Não configurado (opcional)', colors.blue);
  }

  return true;
}

function validateAppConfig(envVars) {
  log('\n⚙️ VERIFICAÇÃO DA CONFIGURAÇÃO DA APLICAÇÃO', colors.yellow);

  const appUrl = envVars.NEXT_PUBLIC_APP_URL;
  const nodeEnv = envVars.NODE_ENV;

  if (appUrl) {
    log(`✅ NEXT_PUBLIC_APP_URL: ${appUrl}`, colors.green);
  } else {
    log('❌ NEXT_PUBLIC_APP_URL: Não configurada', colors.red);
  }

  if (nodeEnv) {
    log(`✅ NODE_ENV: ${nodeEnv}`, colors.green);
  } else {
    log('❌ NODE_ENV: Não configurada', colors.red);
  }

  return true;
}

async function verifyEnvironment() {
  log('🔍 VERIFICAÇÃO DE VARIÁVEIS DE AMBIENTE - Contabilease', colors.bright);
  log('='.repeat(60), colors.cyan);

  // Carregar variáveis de ambiente
  const envVars = loadEnvFile('.env.local');

  if (Object.keys(envVars).length === 0) {
    log('❌ Arquivo .env.local não encontrado!', colors.red);
    log('Execute: cp env.complete.example .env.local', colors.blue);
    log('Ou execute: node scripts/setup-env.js', colors.blue);
    process.exit(1);
  }

  log(
    `📁 Arquivo .env.local encontrado com ${Object.keys(envVars).length} variáveis`,
    colors.green
  );

  // Verificações
  const supabaseValid = validateSupabaseConfig(envVars);
  const stripeValid = validateStripeConfig(envVars);
  const securityValid = validateSecurityConfig(envVars);
  const googleValid = validateGoogleOAuth(envVars);
  const monitoringValid = validateMonitoring(envVars);
  const appValid = validateAppConfig(envVars);

  // Resumo
  log('\n📋 RESUMO DA VERIFICAÇÃO', colors.bright);
  log('='.repeat(40), colors.cyan);

  const checks = [
    { name: 'Supabase', valid: supabaseValid, required: true },
    { name: 'Stripe', valid: stripeValid, required: true },
    { name: 'Segurança', valid: securityValid, required: true },
    { name: 'Google OAuth', valid: googleValid, required: false },
    { name: 'Monitoramento', valid: monitoringValid, required: false },
    { name: 'Aplicação', valid: appValid, required: true },
  ];

  let allRequiredValid = true;
  let allValid = true;

  checks.forEach(check => {
    const status = check.valid ? '✅' : '❌';
    const required = check.required ? ' (OBRIGATÓRIO)' : ' (OPCIONAL)';
    log(`${status} ${check.name}${required}`, check.valid ? colors.green : colors.red);

    if (check.required && !check.valid) {
      allRequiredValid = false;
    }
    if (!check.valid) {
      allValid = false;
    }
  });

  log('\n🎯 RESULTADO FINAL', colors.bright);
  if (allRequiredValid) {
    log('✅ Todas as configurações obrigatórias estão corretas!', colors.green);
    log('🚀 Você pode executar: npm run dev', colors.blue);
  } else {
    log('❌ Algumas configurações obrigatórias estão faltando', colors.red);
    log('📖 Consulte o GUIA_CONFIGURACAO_VARIAVEIS_AMBIENTE.md', colors.blue);
  }

  if (!allValid) {
    log('\n⚠️ CONFIGURAÇÕES OPCIONAIS FALTANDO:', colors.yellow);
    log('• Google OAuth: Para login com Google', colors.blue);
    log('• Sentry: Para monitoramento de erros', colors.blue);
    log('• Google Analytics: Para análise de uso', colors.blue);
  }

  log('\n📚 DOCUMENTAÇÃO:', colors.cyan);
  log('• Guia completo: GUIA_CONFIGURACAO_VARIAVEIS_AMBIENTE.md', colors.blue);
  log('• Setup interativo: node scripts/setup-env.js', colors.blue);
  log('• Exemplo completo: env.complete.example', colors.blue);
}

// Executar verificação
verifyEnvironment().catch(error => {
  log('❌ Erro durante a verificação:', colors.red);
  log(error.message, colors.red);
  process.exit(1);
});
