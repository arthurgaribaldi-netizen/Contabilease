#!/usr/bin/env node

/**
 * Script para testar a conectividade com o Stripe
 * Execute: node scripts/test-stripe-connection.js
 */

const fs = require('fs');

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

async function testStripeConnection() {
  log('🧪 TESTE DE CONECTIVIDADE COM STRIPE', colors.bright);
  log('='.repeat(50), colors.cyan);

  // Carregar variáveis de ambiente
  const envVars = loadEnvFile('.env.local');

  if (Object.keys(envVars).length === 0) {
    log('❌ Arquivo .env.local não encontrado!', colors.red);
    log('Execute: npm run setup-env', colors.blue);
    process.exit(1);
  }

  const secretKey = envVars.STRIPE_SECRET_KEY;
  const publishableKey = envVars.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  if (!secretKey || !publishableKey) {
    log('❌ Chaves do Stripe não configuradas!', colors.red);
    log('Execute: npm run setup-env', colors.blue);
    process.exit(1);
  }

  // Verificar formato das chaves
  log('\n🔍 VERIFICAÇÃO DAS CHAVES', colors.yellow);

  if (!secretKey.startsWith('sk_')) {
    log('❌ STRIPE_SECRET_KEY: Formato inválido', colors.red);
    log('   Deve começar com sk_test_ ou sk_live_', colors.red);
    process.exit(1);
  }

  if (!publishableKey.startsWith('pk_')) {
    log('❌ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: Formato inválido', colors.red);
    log('   Deve começar com pk_test_ ou pk_live_', colors.red);
    process.exit(1);
  }

  // Detectar modo
  const isTestMode = secretKey.startsWith('sk_test_');
  const mode = isTestMode ? 'TESTE' : 'PRODUÇÃO';
  const modeColor = isTestMode ? colors.blue : colors.green;

  log(`✅ Modo detectado: ${mode}`, modeColor);
  log(`✅ Secret Key: ${secretKey.substring(0, 20)}...`, colors.green);
  log(`✅ Publishable Key: ${publishableKey.substring(0, 20)}...`, colors.green);

  // Testar conectividade
  log('\n🌐 TESTANDO CONECTIVIDADE', colors.yellow);

  try {
    // Importar Stripe dinamicamente
    const Stripe = require('stripe');
    const stripe = Stripe(secretKey);

    // Teste básico - listar produtos
    log('📦 Testando listagem de produtos...', colors.blue);
    const products = await stripe.products.list({ limit: 1 });

    log('✅ Conectividade com Stripe confirmada!', colors.green);
    log(`ℹ️ Encontrados ${products.data.length} produto(s)`, colors.blue);

    // Verificar se há produtos configurados
    log('\n📋 VERIFICAÇÃO DOS PRODUTOS', colors.yellow);

    const basicPriceId = envVars.STRIPE_BASIC_PRICE_ID;
    const professionalPriceId = envVars.STRIPE_PROFESSIONAL_PRICE_ID;
    const officePriceId = envVars.STRIPE_OFFICE_PRICE_ID;

    const priceIds = [basicPriceId, professionalPriceId, officePriceId];
    const priceNames = ['Basic', 'Professional', 'Office'];

    for (let i = 0; i < priceIds.length; i++) {
      const priceId = priceIds[i];
      const name = priceNames[i];

      if (!priceId || priceId.includes('your_') || priceId.includes('price_your_')) {
        log(`❌ STRIPE_${name.toUpperCase()}_PRICE_ID: Não configurado`, colors.red);
      } else {
        try {
          const price = await stripe.prices.retrieve(priceId);
          log(
            `✅ ${name} Price ID: ${priceId} (${price.unit_amount ? `$${(price.unit_amount / 100).toFixed(2)}` : 'N/A'})`,
            colors.green
          );
        } catch (error) {
          log(`❌ ${name} Price ID: ${priceId} (inválido)`, colors.red);
        }
      }
    }

    // Verificar webhook
    log('\n🔗 VERIFICAÇÃO DO WEBHOOK', colors.yellow);
    const webhookSecret = envVars.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret || webhookSecret.includes('your_')) {
      log('❌ STRIPE_WEBHOOK_SECRET: Não configurado', colors.red);
      log('   Configure em: https://dashboard.stripe.com/webhooks', colors.blue);
    } else if (!webhookSecret.startsWith('whsec_')) {
      log('⚠️ STRIPE_WEBHOOK_SECRET: Formato pode estar incorreto', colors.yellow);
      log('   Deve começar com whsec_', colors.yellow);
    } else {
      log('✅ STRIPE_WEBHOOK_SECRET: Configurado', colors.green);
    }

    // Resumo final
    log('\n🎯 RESUMO DO TESTE', colors.bright);
    log('='.repeat(30), colors.cyan);
    log('✅ Conectividade: OK', colors.green);
    log(`✅ Modo: ${mode}`, modeColor);
    log('✅ Chaves: Válidas', colors.green);

    const configuredPrices = priceIds.filter(id => id && !id.includes('your_')).length;
    log(
      `✅ Produtos configurados: ${configuredPrices}/3`,
      configuredPrices === 3 ? colors.green : colors.yellow
    );

    const webhookConfigured =
      webhookSecret && !webhookSecret.includes('your_') && webhookSecret.startsWith('whsec_');
    log(
      `✅ Webhook: ${webhookConfigured ? 'OK' : 'Pendente'}`,
      webhookConfigured ? colors.green : colors.yellow
    );

    if (configuredPrices === 3 && webhookConfigured) {
      log('\n🎉 Stripe totalmente configurado!', colors.green);
      log('🚀 Você pode usar pagamentos na aplicação', colors.blue);
    } else {
      log('\n⚠️ Configuração incompleta', colors.yellow);
      log('📖 Consulte o GUIA_CONFIGURACAO_VARIAVEIS_AMBIENTE.md', colors.blue);
    }
  } catch (error) {
    log('❌ Erro ao conectar com Stripe:', colors.red);

    if (error.type === 'StripeAuthenticationError') {
      log('   Chave secreta inválida ou expirada', colors.red);
      log('   Verifique se a STRIPE_SECRET_KEY está correta', colors.red);
    } else if (error.type === 'StripeAPIError') {
      log('   Erro na API do Stripe:', colors.red);
      log(`   ${error.message}`, colors.red);
    } else {
      log(`   ${error.message}`, colors.red);
    }

    log('\n🔧 SOLUÇÕES:', colors.yellow);
    log('1. Verifique se a chave secreta está correta', colors.blue);
    log('2. Verifique sua conexão com a internet', colors.blue);
    log('3. Execute: npm run setup-env', colors.blue);

    process.exit(1);
  }
}

// Executar teste
testStripeConnection().catch(error => {
  log('❌ Erro durante o teste:', colors.red);
  log(error.message, colors.red);
  process.exit(1);
});

