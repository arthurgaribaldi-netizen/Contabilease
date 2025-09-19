# 💳 Guia Completo de Configuração do Stripe

## 🎯 **Visão Geral**

O Stripe é usado para processar pagamentos no Contabilease. Este guia mostra como configurar todas as variáveis necessárias para que os pagamentos funcionem corretamente.

---

## 🔑 **Variáveis Necessárias**

### Obrigatórias:
- `STRIPE_SECRET_KEY` - Chave secreta da API
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Chave pública da API
- `STRIPE_WEBHOOK_SECRET` - Segredo do webhook
- `STRIPE_BASIC_PRICE_ID` - ID do preço do plano Basic
- `STRIPE_PROFESSIONAL_PRICE_ID` - ID do preço do plano Professional
- `STRIPE_OFFICE_PRICE_ID` - ID do preço do plano Office

---

## 🚀 **Configuração Passo a Passo**

### 1️⃣ **Criar Conta no Stripe**

1. Acesse: https://dashboard.stripe.com/
2. Clique em "Sign up" ou "Log in"
3. Complete o processo de registro

### 2️⃣ **Obter as Chaves da API**

1. No dashboard, vá para **Developers > API keys**
2. Você verá duas seções:
   - **Test mode** (para desenvolvimento)
   - **Live mode** (para produção)

#### Para Desenvolvimento (Recomendado):
- Copie a **Secret key** (começa com `sk_test_`)
- Copie a **Publishable key** (começa com `pk_test_`)

#### Para Produção:
- ⚠️ **ATENÇÃO**: Só use em produção real
- Copie a **Secret key** (começa com `sk_live_`)
- Copie a **Publishable key** (começa com `pk_live_`)

### 3️⃣ **Configurar Webhooks**

1. Vá para **Developers > Webhooks**
2. Clique em "Add endpoint"
3. Configure:
   - **URL**: `https://seu-dominio.com/api/stripe/webhook`
   - **Eventos**: Selecione:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
4. Clique em "Add endpoint"
5. Copie o **Signing secret** (começa com `whsec_`)

### 4️⃣ **Criar Produtos e Preços**

#### Criar Produto Basic:
1. Vá para **Products**
2. Clique em "Add product"
3. Configure:
   - **Name**: "Contabilease Basic"
   - **Description**: "Plano básico do Contabilease"
4. Clique em "Save product"
5. Na seção "Pricing", clique em "Add price"
6. Configure:
   - **Price**: R$ 29,90 (ou seu valor)
   - **Billing period**: Monthly
   - **Currency**: BRL
7. Clique em "Save price"
8. Copie o **Price ID** (começa com `price_`)

#### Repetir para Professional e Office:
- **Professional**: R$ 59,90/mês
- **Office**: R$ 99,90/mês

### 5️⃣ **Configurar Variáveis de Ambiente**

Execute o script de configuração:
```bash
npm run setup-env
```

Ou configure manualmente no `.env.local`:
```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_51...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs
STRIPE_BASIC_PRICE_ID=price_1...
STRIPE_PROFESSIONAL_PRICE_ID=price_1...
STRIPE_OFFICE_PRICE_ID=price_1...
```

---

## 🧪 **Testando a Configuração**

### Teste Automático:
```bash
npm run test-stripe
```

Este comando irá:
- ✅ Verificar se as chaves estão configuradas
- ✅ Validar o formato das chaves
- ✅ Testar conectividade com Stripe
- ✅ Verificar se os produtos existem
- ✅ Validar webhook

### Teste Manual:

1. **Verificar chaves**:
   ```bash
   npm run verify-env
   ```

2. **Testar pagamento**:
   - Acesse a aplicação
   - Tente fazer um pagamento de teste
   - Use cartão de teste: `4242 4242 4242 4242`

---

## 🔒 **Segurança**

### ⚠️ **IMPORTANTE**:

1. **NUNCA** commite chaves secretas
2. **NUNCA** compartilhe chaves em código público
3. Use chaves de **teste** em desenvolvimento
4. Use chaves de **produção** apenas em produção
5. Rotacione as chaves periodicamente

### Chaves de Teste vs Produção:

| Tipo | Prefixo | Uso |
|------|---------|-----|
| Secret Key (Teste) | `sk_test_` | Desenvolvimento |
| Secret Key (Produção) | `sk_live_` | Produção |
| Publishable Key (Teste) | `pk_test_` | Desenvolvimento |
| Publishable Key (Produção) | `pk_live_` | Produção |

---

## 🐛 **Solução de Problemas**

### ❌ "Invalid API Key"
- Verifique se a chave está correta
- Confirme se está usando chave de teste em desenvolvimento
- Verifique se não há espaços extras

### ❌ "Webhook signature verification failed"
- Verifique se o `STRIPE_WEBHOOK_SECRET` está correto
- Confirme se o webhook está configurado corretamente
- Verifique se a URL do webhook está acessível

### ❌ "Price not found"
- Verifique se os Price IDs estão corretos
- Confirme se os produtos foram criados no Stripe
- Verifique se está usando a conta correta

### ❌ "Test mode vs Live mode mismatch"
- Certifique-se de que todas as chaves são do mesmo modo
- Use chaves de teste em desenvolvimento
- Use chaves de produção apenas em produção

---

## 📋 **Checklist de Configuração**

### Configuração Básica:
- [ ] Conta Stripe criada
- [ ] Chaves de API obtidas
- [ ] Webhook configurado
- [ ] Produtos criados
- [ ] Preços configurados

### Variáveis de Ambiente:
- [ ] `STRIPE_SECRET_KEY` configurada
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` configurada
- [ ] `STRIPE_WEBHOOK_SECRET` configurada
- [ ] `STRIPE_BASIC_PRICE_ID` configurada
- [ ] `STRIPE_PROFESSIONAL_PRICE_ID` configurada
- [ ] `STRIPE_OFFICE_PRICE_ID` configurada

### Testes:
- [ ] `npm run test-stripe` executado com sucesso
- [ ] `npm run verify-env` executado com sucesso
- [ ] Pagamento de teste realizado

---

## 🎯 **Próximos Passos**

Após configurar o Stripe:

1. **Teste a aplicação**:
   ```bash
   npm run dev
   ```

2. **Teste pagamentos**:
   - Use cartões de teste do Stripe
   - Verifique se os webhooks funcionam

3. **Configure para produção**:
   - Use chaves de produção
   - Configure webhook para domínio de produção
   - Teste com cartões reais (em ambiente controlado)

---

## 📚 **Recursos Adicionais**

- **Documentação Stripe**: https://stripe.com/docs
- **Cartões de Teste**: https://stripe.com/docs/testing
- **Webhooks**: https://stripe.com/docs/webhooks
- **API Reference**: https://stripe.com/docs/api

---

## 🆘 **Suporte**

Se encontrar problemas:

1. **Execute os testes**:
   ```bash
   npm run test-stripe
   npm run verify-env
   ```

2. **Consulte a documentação**:
   - `GUIA_CONFIGURACAO_VARIAVEIS_AMBIENTE.md`
   - `RESUMO_CONFIGURACAO_VARIAVEIS_AMBIENTE.md`

3. **Verifique os logs**:
   - Console do navegador
   - Logs do servidor
   - Dashboard do Stripe

---

*Este guia cobre toda a configuração necessária para usar o Stripe no Contabilease.*

