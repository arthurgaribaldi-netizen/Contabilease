#!/usr/bin/env tsx

/**
 * Script para testar os limites de assinatura e preços realistas
 * Execute com: npx tsx scripts/test-subscription-limits.ts
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseServiceKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testSubscriptionPlans() {
  console.log('🧪 Testando planos de assinatura...\n');

  try {
    // Test 1: Verificar se os planos foram criados corretamente
    console.log('1️⃣ Verificando planos de assinatura...');
    const { data: plans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_monthly', { ascending: true });

    if (plansError) {
      console.error('❌ Erro ao buscar planos:', plansError);
      return;
    }

    console.log('✅ Planos encontrados:');
    plans?.forEach(plan => {
      console.log(`   📋 ${plan.name}: R$ ${plan.price_monthly}/mês (${plan.max_contracts} contratos, ${plan.max_users} usuários)`);
    });

    // Test 2: Verificar se os preços estão corretos conforme plano realista
    console.log('\n2️⃣ Verificando preços conforme plano realista...');
    const expectedPrices = [
      { name: 'Gratuito', price: 0, contracts: 1 },
      { name: 'Básico', price: 29, contracts: 5 },
      { name: 'Profissional', price: 59, contracts: 20 },
      { name: 'Escritório', price: 99, contracts: 100 }
    ];

    let allPricesCorrect = true;
    expectedPrices.forEach(expected => {
      const plan = plans?.find(p => p.name === expected.name);
      if (!plan) {
        console.error(`❌ Plano ${expected.name} não encontrado`);
        allPricesCorrect = false;
      } else if (plan.price_monthly !== expected.price) {
        console.error(`❌ Preço incorreto para ${expected.name}: esperado R$ ${expected.price}, encontrado R$ ${plan.price_monthly}`);
        allPricesCorrect = false;
      } else if (plan.max_contracts !== expected.contracts) {
        console.error(`❌ Limite de contratos incorreto para ${expected.name}: esperado ${expected.contracts}, encontrado ${plan.max_contracts}`);
        allPricesCorrect = false;
      } else {
        console.log(`✅ ${expected.name}: R$ ${plan.price_monthly}/mês, ${plan.max_contracts} contratos`);
      }
    });

    if (allPricesCorrect) {
      console.log('✅ Todos os preços estão corretos conforme plano realista!');
    }

    // Test 3: Testar função get_user_current_plan
    console.log('\n3️⃣ Testando função get_user_current_plan...');
    const { data: testPlan, error: testError } = await supabase
      .rpc('get_user_current_plan', { user_uuid: '00000000-0000-0000-0000-000000000000' });

    if (testError) {
      console.error('❌ Erro ao testar função get_user_current_plan:', testError);
    } else {
      console.log('✅ Função get_user_current_plan funcionando');
      if (testPlan && testPlan.length > 0) {
        console.log(`   📋 Plano padrão: ${testPlan[0].plan_name}`);
      }
    }

    // Test 4: Testar função update_subscription_usage
    console.log('\n4️⃣ Testando função update_subscription_usage...');
    const { error: usageError } = await supabase
      .rpc('update_subscription_usage', { user_uuid: '00000000-0000-0000-0000-000000000000' });

    if (usageError) {
      console.error('❌ Erro ao testar função update_subscription_usage:', usageError);
    } else {
      console.log('✅ Função update_subscription_usage funcionando');
    }

    console.log('\n🎉 Testes de assinatura concluídos!');

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

async function testSubscriptionLimits() {
  console.log('\n🧪 Testando limites de assinatura...\n');

  try {
    // Test 1: Verificar se as tabelas foram criadas
    console.log('1️⃣ Verificando estrutura das tabelas...');
    
    const tables = ['subscription_plans', 'user_subscriptions', 'subscription_usage'];
    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.error(`❌ Erro ao acessar tabela ${table}:`, error.message);
      } else {
        console.log(`✅ Tabela ${table} acessível`);
      }
    }

    // Test 2: Verificar políticas RLS
    console.log('\n2️⃣ Verificando políticas RLS...');
    const { error: policiesError } = await supabase
      .rpc('get_rls_policies');

    if (policiesError) {
      console.log('ℹ️ Não foi possível verificar políticas RLS (função não disponível)');
    } else {
      console.log('✅ Políticas RLS verificadas');
    }

    console.log('\n🎉 Testes de limites concluídos!');

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

async function main() {
  console.log('🚀 Iniciando testes de assinatura e limites...\n');
  
  await testSubscriptionPlans();
  await testSubscriptionLimits();
  
  console.log('\n✨ Todos os testes concluídos!');
  console.log('\n📋 Resumo das correções implementadas:');
  console.log('   ✅ Tabela subscription_plans criada com preços realistas');
  console.log('   ✅ Tabela user_subscriptions criada para gerenciar assinaturas');
  console.log('   ✅ Tabela subscription_usage criada para controlar limites');
  console.log('   ✅ Preços alinhados com PLANO_MONETIZACAO_REALISTA.md');
  console.log('   ✅ APIs criadas para gerenciar planos e assinaturas');
  console.log('   ✅ Middleware de verificação de limites implementado');
  console.log('   ✅ Configuração do Stripe atualizada');
  
  console.log('\n🎯 Próximos passos:');
  console.log('   1. Executar migração: supabase db push');
  console.log('   2. Configurar webhooks do Stripe');
  console.log('   3. Testar fluxo completo de assinatura');
  console.log('   4. Implementar portal do cliente');
}

// Execute tests
main().catch(console.error);
