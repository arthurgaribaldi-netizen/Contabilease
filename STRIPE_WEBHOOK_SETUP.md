# Stripe Webhook Setup Guide

Este guia explica como configurar e testar os webhooks do Stripe para o Contabilease.

## 📋 Eventos Suportados

O sistema de webhooks do Contabilease suporta os seguintes eventos do Stripe:

### Eventos de Assinatura
- `checkout.session.completed` - Sessão de checkout concluída
- `customer.subscription.created` - Assinatura criada
- `customer.subscription.updated` - Assinatura atualizada
- `customer.subscription.deleted` - Assinatura cancelada
- `customer.subscription.trial_will_end` - Período de teste terminando

### Eventos de Pagamento
- `invoice.payment_succeeded` - Pagamento bem-sucedido
- `invoice.payment_failed` - Pagamento falhou
- `invoice.payment_action_required` - Ação de pagamento necessária

## 🔧 Configuração

### 1. Variáveis de Ambiente

Adicione as seguintes variáveis ao seu arquivo `.env.local`:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Stripe Price IDs (crie estes no Stripe Dashboard)
STRIPE_BASIC_PRICE_ID=price_your_basic_price_id
STRIPE_PROFESSIONAL_PRICE_ID=price_your_professional_price_id
STRIPE_OFFICE_PRICE_ID=price_your_office_price_id
```

### 2. Configuração no Stripe Dashboard

1. Acesse o [Stripe Dashboard](https://dashboard.stripe.com/)
2. Vá para **Developers > Webhooks**
3. Clique em **Add endpoint**
4. Configure:
   - **Endpoint URL**: `https://yourdomain.com/api/stripe/webhook`
   - **Events to send**: Selecione os eventos listados acima
5. Copie o **Signing secret** e adicione como `STRIPE_WEBHOOK_SECRET`

### 3. Criar Produtos e Preços

No Stripe Dashboard, crie os seguintes produtos:

#### Produto: Contabilease Básico
- **Nome**: Contabilease Básico
- **Preço**: R$ 29,00/mês
- **ID do Preço**: Copie para `STRIPE_BASIC_PRICE_ID`

#### Produto: Contabilease Profissional
- **Nome**: Contabilease Profissional
- **Preço**: R$ 59,00/mês
- **ID do Preço**: Copie para `STRIPE_PROFESSIONAL_PRICE_ID`

#### Produto: Contabilease Escritório
- **Nome**: Contabilease Escritório
- **Preço**: R$ 99,00/mês
- **ID do Preço**: Copie para `STRIPE_OFFICE_PRICE_ID`

## 🧪 Testando Webhooks

### 1. Endpoint de Teste

Use o endpoint de teste para verificar a funcionalidade:

```bash
POST /api/stripe/webhook/test
```

Exemplo de uso:

```javascript
// Testar evento de assinatura criada
const response = await fetch('/api/stripe/webhook/test', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ testType: 'subscription_created' })
});

// Testar evento de pagamento bem-sucedido
const response = await fetch('/api/stripe/webhook/test', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ testType: 'payment_succeeded' })
});
```

### 2. Teste com Stripe CLI

Instale o Stripe CLI e teste localmente:

```bash
# Instalar Stripe CLI
npm install -g @stripe/stripe-cli

# Login no Stripe
stripe login

# Escutar webhooks localmente
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Em outro terminal, disparar evento de teste
stripe trigger checkout.session.completed
```

### 3. Logs de Webhook

Os webhooks são logados automaticamente. Verifique os logs para debug:

```bash
# Ver logs do webhook
tail -f logs/webhook.log
```

## 🔍 Endpoints da API

### Webhook Principal
- **URL**: `/api/stripe/webhook`
- **Método**: `POST`
- **Descrição**: Recebe eventos do Stripe

### Endpoints de Assinatura

#### Obter Assinatura Atual
- **URL**: `/api/subscriptions/current`
- **Método**: `GET`
- **Descrição**: Retorna detalhes da assinatura atual do usuário

#### Cancelar Assinatura
- **URL**: `/api/subscriptions/cancel`
- **Método**: `POST`
- **Body**: `{ "cancelAtPeriodEnd": true }`
- **Descrição**: Cancela a assinatura (no final do período ou imediatamente)

#### Reativar Assinatura
- **URL**: `/api/subscriptions/reactivate`
- **Método**: `POST`
- **Descrição**: Reativa uma assinatura cancelada

#### Listar Planos
- **URL**: `/api/subscriptions/plans`
- **Método**: `GET`
- **Descrição**: Retorna todos os planos disponíveis

### Endpoints de Checkout

#### Criar Sessão de Checkout
- **URL**: `/api/stripe/create-checkout-session`
- **Método**: `POST`
- **Body**: `{ "priceId": "price_xxx", "planName": "Básico" }`
- **Descrição**: Cria uma sessão de checkout do Stripe

## 🛠️ Troubleshooting

### Problemas Comuns

#### 1. Webhook não recebido
- Verifique se a URL está correta
- Confirme que o endpoint está acessível publicamente
- Verifique os logs do Stripe Dashboard

#### 2. Erro de assinatura inválida
- Confirme que `STRIPE_WEBHOOK_SECRET` está correto
- Verifique se o webhook está configurado corretamente no Stripe

#### 3. Assinatura não criada no banco
- Verifique se o usuário existe
- Confirme se o plano existe na tabela `subscription_plans`
- Verifique os logs de erro

#### 4. Eventos não processados
- Confirme que os eventos estão habilitados no webhook
- Verifique se o handler está implementado
- Consulte os logs para detalhes

### Logs Importantes

```bash
# Webhook recebido
INFO: Webhook received: checkout.session.completed

# Assinatura criada
INFO: Checkout session completed for user xxx, plan Básico

# Erro de processamento
ERROR: Error creating subscription: [detalhes do erro]
```

## 📊 Monitoramento

### Métricas Importantes
- Taxa de sucesso dos webhooks
- Tempo de resposta dos endpoints
- Erros de processamento
- Assinaturas criadas/canceladas

### Alertas Recomendados
- Webhook falhando por mais de 5 minutos
- Taxa de erro acima de 5%
- Assinaturas não sendo criadas

## 🔒 Segurança

### Validação de Assinatura
Todos os webhooks são validados usando a assinatura do Stripe:

```typescript
const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
```

### Rate Limiting
Os webhooks têm rate limiting automático para prevenir spam.

### Logs Seguros
Informações sensíveis são removidas dos logs.

## 📚 Recursos Adicionais

- [Documentação do Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
- [Testando Webhooks](https://stripe.com/docs/webhooks/test)
- [Melhores Práticas](https://stripe.com/docs/webhooks/best-practices)
