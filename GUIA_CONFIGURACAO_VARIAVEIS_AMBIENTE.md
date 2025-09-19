# 🔧 Guia Completo de Configuração de Variáveis de Ambiente

## 📋 Resumo das Variáveis Necessárias

O projeto Contabilease requer **47 variáveis de ambiente** organizadas em 8 categorias principais:

### 🚨 **OBRIGATÓRIAS** (sem essas o projeto não funciona)
- **Supabase**: 4 variáveis
- **Stripe**: 5 variáveis  
- **Segurança**: 1 variável (JWT_SECRET)

### ⚠️ **RECOMENDADAS** (funcionalidades importantes)
- **Google OAuth**: 2 variáveis
- **Configurações de Segurança**: 15 variáveis

### 🔧 **OPCIONAIS** (melhorias e monitoramento)
- **Monitoramento**: 8 variáveis
- **Redis**: 4 variáveis
- **Outros**: 8 variáveis

---

## 🚀 Configuração Passo a Passo

### 1️⃣ **Configuração Básica**

```bash
# Copie o arquivo de exemplo
cp env.complete.example .env.local

# Edite o arquivo
code .env.local  # ou seu editor preferido
```

### 2️⃣ **Supabase (OBRIGATÓRIO)**

#### Como obter as credenciais:

1. **Acesse o Supabase Dashboard**
   - URL: https://supabase.com/dashboard
   - Faça login ou crie uma conta

2. **Crie um novo projeto**
   - Clique em "New Project"
   - Escolha um nome (ex: "contabilease")
   - Escolha uma região próxima
   - Defina uma senha forte para o banco

3. **Obtenha as credenciais**
   - Vá para **Settings > API**
   - Copie a **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - Copie a **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copie a **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`
   - Vá para **Settings > API > JWT Settings** → `SUPABASE_JWT_SECRET`

#### Exemplo de configuração:
```env
NEXT_PUBLIC_SUPABASE_URL=https://hmuzaebxqnhwnzoczczo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=seu-jwt-secret-aqui
```

### 3️⃣ **Stripe (OBRIGATÓRIO para pagamentos)**

#### Como obter as credenciais:

1. **Acesse o Stripe Dashboard**
   - URL: https://dashboard.stripe.com/
   - Faça login ou crie uma conta

2. **Obtenha as chaves da API**
   - Vá para **Developers > API keys**
   - **Secret key** (começa com `sk_test_` ou `sk_live_`) → `STRIPE_SECRET_KEY`
   - **Publishable key** (começa com `pk_test_` ou `pk_live_`) → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - ⚠️ **IMPORTANTE**: Use chaves de **teste** (`sk_test_`, `pk_test_`) em desenvolvimento
   - Use chaves de **produção** (`sk_live_`, `pk_live_`) apenas em produção

3. **Configure Webhooks**
   - Vá para **Developers > Webhooks**
   - Clique em "Add endpoint"
   - URL: `https://seu-dominio.com/api/stripe/webhook`
   - Eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copie o **Signing secret** (começa com `whsec_`) → `STRIPE_WEBHOOK_SECRET`

4. **Crie produtos e preços**
   - Vá para **Products**
   - Crie 3 produtos: Basic, Professional, Office
   - Para cada produto, crie um preço
   - Copie os **Price IDs** gerados (começam com `price_`)

#### Exemplo de configuração:
```env
STRIPE_SECRET_KEY=sk_test_51...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_BASIC_PRICE_ID=price_1...
STRIPE_PROFESSIONAL_PRICE_ID=price_1...
STRIPE_OFFICE_PRICE_ID=price_1...
```

### 4️⃣ **Google OAuth (OPCIONAL)**

#### Como obter as credenciais:

1. **Acesse o Google Cloud Console**
   - URL: https://console.developers.google.com/
   - Faça login com sua conta Google

2. **Crie um projeto**
   - Clique em "Select a project" > "New Project"
   - Nome: "Contabilease"
   - Clique em "Create"

3. **Ative a Google+ API**
   - Vá para **APIs & Services > Library**
   - Procure por "Google+ API"
   - Clique em "Enable"

4. **Crie credenciais OAuth 2.0**
   - Vá para **APIs & Services > Credentials**
   - Clique em "Create Credentials" > "OAuth 2.0 Client IDs"
   - Tipo: "Web application"
   - Nome: "Contabilease Web Client"
   - **Authorized redirect URIs**: `http://localhost:3000/auth/callback`
   - Clique em "Create"
   - Copie o **Client ID** e **Client Secret**

#### Exemplo de configuração:
```env
GOOGLE_CLIENT_ID=123456789-abcdef.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdef123456
```

### 5️⃣ **Configuração de Segurança**

#### JWT Secret (OBRIGATÓRIO):
```bash
# Gere uma chave segura (mínimo 32 caracteres)
openssl rand -base64 32
```

#### Configurações recomendadas:
```env
JWT_SECRET=sua-chave-jwt-super-secreta-aqui-minimo-32-caracteres
ENABLE_ZERO_TRUST_AUTH=true
ENABLE_ENHANCED_SECURITY=true
ENABLE_ADVANCED_RATE_LIMITING=true
ENABLE_INPUT_VALIDATION=true
ENABLE_SECURITY_AUDIT=true
```

### 6️⃣ **Monitoramento (OPCIONAL)**

#### Sentry (para monitoramento de erros):
1. Acesse: https://sentry.io/
2. Crie uma conta e projeto
3. Copie o DSN

#### Google Analytics:
1. Acesse: https://analytics.google.com/
2. Crie uma propriedade
3. Copie o Measurement ID

---

## ✅ Verificação da Configuração

### Teste básico:
```bash
# Instale dependências
npm install

# Execute o projeto
npm run dev

# Acesse: http://localhost:3000
```

### Scripts de verificação disponíveis:
```bash
# Verificar configuração do Supabase
npm run verify:supabase

# Verificar configuração do Stripe
npm run verify:stripe

# Verificar todas as variáveis
npm run verify:env
```

---

## 🚨 Problemas Comuns

### ❌ "Supabase connection failed"
- Verifique se `NEXT_PUBLIC_SUPABASE_URL` está correto
- Confirme se `NEXT_PUBLIC_SUPABASE_ANON_KEY` está correto
- Verifique se o projeto Supabase está ativo

### ❌ "Stripe keys not found"
- Verifique se as chaves do Stripe estão corretas
- Confirme se está usando chaves de teste em desenvolvimento

### ❌ "JWT Secret too short"
- Gere uma nova chave com pelo menos 32 caracteres
- Use: `openssl rand -base64 32`

### ❌ "Google OAuth error"
- Verifique se as URLs de redirecionamento estão corretas
- Confirme se a Google+ API está ativada

---

## 📝 Checklist de Configuração

### Obrigatórias:
- [ ] `NEXT_PUBLIC_SUPABASE_URL` configurada
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurada
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurada
- [ ] `SUPABASE_JWT_SECRET` configurada
- [ ] `STRIPE_SECRET_KEY` configurada
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` configurada
- [ ] `STRIPE_WEBHOOK_SECRET` configurada
- [ ] `STRIPE_BASIC_PRICE_ID` configurada
- [ ] `STRIPE_PROFESSIONAL_PRICE_ID` configurada
- [ ] `STRIPE_OFFICE_PRICE_ID` configurada
- [ ] `JWT_SECRET` configurada (mínimo 32 caracteres)

### Recomendadas:
- [ ] `GOOGLE_CLIENT_ID` configurada
- [ ] `GOOGLE_CLIENT_SECRET` configurada
- [ ] Configurações de segurança ativadas

### Opcionais:
- [ ] `SENTRY_DSN` configurada
- [ ] `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` configurada
- [ ] Configurações de Redis (se necessário)

---

## 🔒 Segurança

### ⚠️ **IMPORTANTE:**
- **NUNCA** commite o arquivo `.env.local`
- **NUNCA** compartilhe chaves secretas
- Use chaves de **teste** em desenvolvimento
- Use chaves de **produção** apenas em produção
- Rotacione as chaves periodicamente

### Para produção:
- Configure as variáveis no Vercel Dashboard
- Use valores diferentes para produção
- Ative todas as configurações de segurança

---

## 📞 Suporte

Se encontrar problemas:

1. **Verifique os logs**: `npm run dev` mostra erros detalhados
2. **Execute os scripts de verificação**: `npm run verify:*`
3. **Consulte a documentação**: README.md e outros guias
4. **Verifique o status dos serviços**: Supabase, Stripe, Google Cloud

---

## 🎯 Próximos Passos

Após configurar as variáveis:

1. **Execute o projeto**: `npm run dev`
2. **Teste as funcionalidades**: Login, pagamentos, etc.
3. **Configure o banco de dados**: Execute as migrações do Supabase
4. **Teste em produção**: Deploy no Vercel
5. **Configure monitoramento**: Sentry, Analytics, etc.

---

## 📚 **Documentação Relacionada**

- **`GUIA_CONFIGURACAO_STRIPE.md`** - Guia específico para configuração do Stripe
- **`env.complete.example`** - Arquivo com todas as variáveis e comentários
- **`scripts/setup-env.js`** - Script de configuração interativa
- **`scripts/verify-env.js`** - Script de verificação das variáveis
- **`scripts/test-stripe-connection.js`** - Script de teste do Stripe
- **`RESUMO_CONFIGURACAO_VARIAVEIS_AMBIENTE.md`** - Resumo executivo

---

*Este guia cobre todas as variáveis de ambiente necessárias para o projeto Contabilease funcionar completamente.*
