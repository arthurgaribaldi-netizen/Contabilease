# 🚀 Guia Completo de Configuração do Stripe Webhook - Contabilease

## 📋 Visão Geral

Este guia fornece instruções completas para configurar e testar os webhooks do Stripe no Contabilease. Os webhooks são essenciais para manter a sincronização entre o Stripe e nosso sistema de assinaturas.

## 🔧 Configuração Inicial

### 1. Variáveis de Ambiente

Adicione as seguintes variáveis ao seu arquivo `.env.local`:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Stripe Price IDs (create these in Stripe Dashboard)
STRIPE_BASIC_PRICE_ID=price_your_basic_price_id
STRIPE_PROFESSIONAL_PRICE_ID=price_your_professional_price_id
STRIPE_OFFICE_PRICE_ID=price_your_office_price_id
```

### 2. Configuração no Stripe Dashboard

1. **Acesse o Stripe Dashboard**
   - Vá para [dashboard.stripe.com](https://dashboard.stripe.com)
   - Faça login na sua conta

2. **Configure o Webhook Endpoint**
   - Navegue para **Developers > Webhooks**
   - Clique em **"Add endpoint"**
   - URL do endpoint: `https://seu-dominio.com/api/stripe/webhook`
   - Para desenvolvimento local: `https://seu-ngrok-url.ngrok.io/api/stripe/webhook`

3. **Selecione os Eventos**
   Selecione os seguintes eventos:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.trial_will_end`
   - `invoice.payment_action_required`

4. **Copie o Webhook Secret**
   - Após criar o endpoint, copie o **Signing secret**
   - Adicione ao arquivo `.env.local` como `STRIPE_WEBHOOK_SECRET`

## 🧪 Testando os Webhooks

### 1. Usando o Endpoint de Teste

O Contabilease inclui um endpoint de teste completo:

```bash
# Verificar configuração
curl -X POST http://localhost:3000/api/stripe/webhook/test \
  -H "Content-Type: application/json" \
  -d '{"action": "validate-config"}'

# Verificar status do endpoint
curl -X POST http://localhost:3000/api/stripe/webhook/test \
  -H "Content-Type: application/json" \
  -d '{"action": "check-status", "baseUrl": "http://localhost:3000"}'

# Executar todos os testes
curl -X POST http://localhost:3000/api/stripe/webhook/test \
  -H "Content-Type: application/json" \
  -d '{"action": "run-tests", "baseUrl": "http://localhost:3000"}'

# Listar eventos disponíveis
curl -X POST http://localhost:3000/api/stripe/webhook/test \
  -H "Content-Type: application/json" \
  -d '{"action": "list-events"}'
```

### 2. Usando o Stripe CLI (Recomendado)

```bash
# Instalar Stripe CLI
# macOS: brew install stripe/stripe-cli/stripe
# Windows: choco install stripe-cli
# Linux: snap install stripe

# Login no Stripe
stripe login

# Escutar webhooks localmente
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Em outro terminal, disparar evento de teste
stripe trigger checkout.session.completed
stripe trigger customer.subscription.created
stripe trigger invoice.payment_succeeded
```

### 3. Testando com Dados Reais

```bash
# Criar sessão de checkout de teste
curl -X POST http://localhost:3000/api/stripe/create-checkout-session \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{
    "planName": "Básico",
    "successUrl": "http://localhost:3000/success",
    "cancelUrl": "http://localhost:3000/cancel"
  }'
```

## 📊 Monitoramento e Logs

### 1. Logs do Sistema

Os webhooks geram logs detalhados:

```typescript
// Exemplo de log de webhook recebido
{
  "level": "info",
  "message": "Webhook received",
  "eventType": "checkout.session.completed",
  "eventId": "evt_1234567890",
  "timestamp": "2025-01-27T10:30:00.000Z"
}

// Exemplo de log de processamento bem-sucedido
{
  "level": "info", 
  "message": "Webhook processed successfully",
  "eventType": "checkout.session.completed",
  "eventId": "evt_1234567890",
  "duration": "245ms",
  "timestamp": "2025-01-27T10:30:00.245Z"
}
```

### 2. Verificação de Status

```bash
# Verificar se o endpoint está online
curl -X GET http://localhost:3000/api/health

# Verificar logs de webhook
# Os logs aparecem no console do servidor de desenvolvimento
```

## 🔒 Segurança

### 1. Validação de Assinatura

O sistema valida automaticamente a assinatura do Stripe:

```typescript
// Validação automática implementada
const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
```

### 2. Rate Limiting

Os webhooks incluem proteção contra spam:

- Máximo de 3 tentativas por evento
- Backoff exponencial entre tentativas
- Logs detalhados de falhas

### 3. Validação de Dados

Todos os dados são validados antes do processamento:

```typescript
// Validação de metadados obrigatórios
if (!userId || !planName) {
  throw new Error('Missing metadata in checkout session');
}
```

## 🚨 Solução de Problemas

### Problema: Webhook não está sendo recebido

**Soluções:**
1. Verifique se a URL está correta no Stripe Dashboard
2. Confirme se o servidor está rodando
3. Use ngrok para desenvolvimento local:
   ```bash
   ngrok http 3000
   ```

### Problema: Erro de assinatura inválida

**Soluções:**
1. Verifique se `STRIPE_WEBHOOK_SECRET` está correto
2. Confirme se está usando o secret correto do endpoint
3. Verifique se o corpo da requisição não está sendo modificado

### Problema: Evento não processado

**Soluções:**
1. Verifique se o tipo de evento está suportado
2. Confirme se os dados necessários estão presentes
3. Verifique os logs para detalhes do erro

### Problema: Falha na criação de assinatura

**Soluções:**
1. Verifique se o plano existe no banco de dados
2. Confirme se o usuário existe
3. Verifique se as tabelas do banco estão corretas

## 📈 Métricas e Monitoramento

### 1. Métricas Disponíveis

- Taxa de sucesso dos webhooks
- Tempo de resposta médio
- Número de tentativas por evento
- Eventos processados por tipo

### 2. Alertas Recomendados

- Webhook falhando por mais de 5 minutos
- Taxa de erro acima de 5%
- Tempo de resposta acima de 2 segundos

## 🔄 Fluxo de Eventos

### 1. Checkout Session Completed

```
1. Usuário completa checkout no Stripe
2. Stripe envia webhook checkout.session.completed
3. Sistema valida assinatura
4. Sistema cria/atualiza assinatura no banco
5. Sistema atualiza contadores de uso
6. Sistema retorna sucesso para Stripe
```

### 2. Subscription Updated

```
1. Assinatura é modificada no Stripe
2. Stripe envia webhook customer.subscription.updated
3. Sistema valida assinatura
4. Sistema atualiza status da assinatura
5. Sistema retorna sucesso para Stripe
```

### 3. Payment Failed

```
1. Pagamento falha no Stripe
2. Stripe envia webhook invoice.payment_failed
3. Sistema valida assinatura
4. Sistema atualiza status para 'past_due'
5. Sistema pode enviar notificação ao usuário
6. Sistema retorna sucesso para Stripe
```

## 🛠️ Desenvolvimento

### 1. Estrutura dos Arquivos

```
src/
├── app/api/stripe/webhook/
│   ├── route.ts              # Webhook principal
│   └── test/
│       └── route.ts          # Endpoint de teste
├── lib/
│   ├── stripe.ts             # Configuração do Stripe
│   └── stripe-webhook-testing.ts # Utilitários de teste
```

### 2. Adicionando Novos Eventos

```typescript
// 1. Adicione o caso no switch
case 'novo.evento':
  await handleNovoEvento(event.data.object as NovoEvento);
  break;

// 2. Implemente a função handler
async function handleNovoEvento(data: NovoEvento) {
  // Lógica de processamento
}

// 3. Adicione teste
{
  type: 'novo.evento',
  description: 'Test novo evento',
  data: { /* dados de teste */ }
}
```

## ✅ Checklist de Configuração

- [ ] Variáveis de ambiente configuradas
- [ ] Webhook endpoint criado no Stripe Dashboard
- [ ] Eventos selecionados no Stripe Dashboard
- [ ] Webhook secret copiado para .env.local
- [ ] Servidor rodando localmente
- [ ] Testes executados com sucesso
- [ ] Logs sendo gerados corretamente
- [ ] Validação de assinatura funcionando
- [ ] Banco de dados sincronizado
- [ ] Monitoramento configurado

## 📚 Recursos Adicionais

- [Documentação Oficial do Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Melhores Práticas de Webhooks](https://stripe.com/docs/webhooks/best-practices)
- [Testando Webhooks](https://stripe.com/docs/webhooks/test)

## 🆘 Suporte

Se você encontrar problemas:

1. Verifique os logs do servidor
2. Execute os testes de webhook
3. Confirme a configuração no Stripe Dashboard
4. Verifique as variáveis de ambiente
5. Consulte a documentação do Stripe

---

**Última atualização**: Janeiro 2025  
**Versão**: 1.0.0  
**Status**: ✅ Implementação Completa
