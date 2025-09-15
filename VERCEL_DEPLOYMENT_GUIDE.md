# 🚀 Guia de Deploy no Vercel - Contabilease

Este guia fornece instruções completas para fazer o deploy do projeto Contabilease no Vercel.

## 📋 Pré-requisitos

- Conta no Vercel (gratuita)
- Projeto no GitHub/GitLab/Bitbucket
- Configurações de serviços externos (Supabase, Stripe, Google OAuth)

## 🔧 Configuração Inicial

### 1. Conectar Repositório

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com sua conta GitHub
3. Clique em "New Project"
4. Importe o repositório `Contabilease`
5. Configure o projeto:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (raiz do projeto)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next` (automático)

### 2. Configurar Variáveis de Ambiente

No dashboard do Vercel, vá para **Settings > Environment Variables** e adicione:

#### 🔐 Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_JWT_SECRET=your_supabase_jwt_secret
```

#### 🏢 Application Configuration
```
NEXT_PUBLIC_APP_URL=https://contabilease.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret_minimum_32_characters
NEXTAUTH_URL=https://contabilease.vercel.app
JWT_SECRET=your-super-secret-jwt-key-here-minimum-32-characters
```

#### 💳 Stripe Configuration (Production)
```
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_BASIC_PRICE_ID=price_your_basic_price_id
STRIPE_PROFESSIONAL_PRICE_ID=price_your_professional_price_id
STRIPE_OFFICE_PRICE_ID=price_your_office_price_id
```

#### 🔑 Google OAuth Configuration
```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

#### 🛡️ Security Configuration
```
ENABLE_ZERO_TRUST_AUTH=true
ENABLE_ENHANCED_SECURITY=true
ENABLE_ADVANCED_RATE_LIMITING=true
ENABLE_INPUT_VALIDATION=true
ENABLE_SECURITY_AUDIT=true
ENABLE_CSP=true
CSP_REPORT_ONLY=false
ENABLE_HSTS=true
HSTS_MAX_AGE=31536000
```

#### 🌐 CORS Configuration
```
CORS_ALLOWED_ORIGINS=https://contabilease.vercel.app,https://contabilease.com,https://www.contabilease.com
CORS_ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_ALLOWED_HEADERS=Content-Type,Authorization,X-Requested-With
```

#### 📊 Monitoring & Logging
```
SECURITY_LOG_LEVEL=medium
EXTERNAL_LOGGING_ENABLED=true
LOG_RETENTION_HOURS=168
NODE_ENV=production
SECURITY_DEBUG=false
SECURITY_VERBOSE_LOGGING=false
```

### 3. Configurar Domínio Personalizado (Opcional)

1. Vá para **Settings > Domains**
2. Adicione seu domínio personalizado
3. Configure os registros DNS conforme instruções do Vercel

## 🚀 Deploy

### Deploy Automático

O Vercel fará deploy automático sempre que você fizer push para a branch principal:

```bash
git add .
git commit -m "feat: prepare for production deployment"
git push origin main
```

### Deploy Manual

1. No dashboard do Vercel, clique em **Deployments**
2. Clique em **Redeploy** na última versão
3. Aguarde o processo de build

## 🔍 Verificação Pós-Deploy

### 1. Testes Básicos

- [ ] Site carrega corretamente
- [ ] Autenticação funciona
- [ ] Dashboard acessível
- [ ] Formulários funcionam
- [ ] APIs respondem

### 2. Testes de Funcionalidade

- [ ] Criação de contratos
- [ ] Cálculos IFRS16
- [ ] Integração Stripe
- [ ] Google OAuth
- [ ] MFA (Multi-Factor Authentication)

### 3. Testes de Performance

- [ ] Core Web Vitals dentro dos limites
- [ ] Tempo de carregamento < 3s
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1

## 🛠️ Configurações Avançadas

### 1. Webhooks do Stripe

Configure o webhook do Stripe para apontar para:
```
https://contabilease.vercel.app/api/stripe/webhook
```

### 2. Google OAuth

Configure as URLs autorizadas no Google Console:
- **Authorized JavaScript origins**: `https://contabilease.vercel.app`
- **Authorized redirect URIs**: `https://contabilease.vercel.app/auth/callback`

### 3. Supabase

Configure as URLs permitidas no Supabase:
- **Site URL**: `https://contabilease.vercel.app`
- **Redirect URLs**: `https://contabilease.vercel.app/auth/callback`

## 📊 Monitoramento

### 1. Analytics do Vercel

- Acesse **Analytics** no dashboard
- Monitore métricas de performance
- Configure alertas para downtime

### 2. Logs

- Acesse **Functions** para ver logs das APIs
- Configure integração com Sentry (opcional)
- Monitore erros em tempo real

### 3. Performance

- Use **Speed Insights** do Vercel
- Monitore Core Web Vitals
- Configure alertas de performance

## 🔧 Troubleshooting

### Problemas Comuns

#### Build Falha
```bash
# Verificar logs de build
# Verificar variáveis de ambiente
# Verificar dependências
```

#### Erro 500
```bash
# Verificar logs de função
# Verificar configurações de banco
# Verificar variáveis de ambiente
```

#### Problemas de CORS
```bash
# Verificar CORS_ALLOWED_ORIGINS
# Verificar configurações do Supabase
# Verificar headers no vercel.json
```

### Comandos Úteis

```bash
# Build local para testar
npm run build

# Verificar tipos
npm run type-check

# Testes
npm run test

# Lint
npm run lint
```

## 📈 Otimizações

### 1. Performance

- ✅ Bundle splitting configurado
- ✅ Image optimization ativada
- ✅ Compression habilitada
- ✅ Cache headers configurados

### 2. SEO

- ✅ Meta tags dinâmicas
- ✅ Sitemap automático
- ✅ Robots.txt configurado
- ✅ Schema markup

### 3. Segurança

- ✅ Headers de segurança
- ✅ Rate limiting
- ✅ Zero Trust Auth
- ✅ Input validation

## 🎯 Próximos Passos

1. **Configurar CI/CD**: Automatizar testes antes do deploy
2. **Monitoramento**: Implementar alertas avançados
3. **Backup**: Configurar backup automático do banco
4. **CDN**: Otimizar entrega de assets
5. **A/B Testing**: Implementar testes de funcionalidades

## 📞 Suporte

- **Documentação Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Status Page**: [vercel-status.com](https://vercel-status.com)
- **Community**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)

---

## ✅ Checklist de Deploy

- [ ] Repositório conectado ao Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] Domínio personalizado (opcional)
- [ ] Webhooks configurados
- [ ] OAuth configurado
- [ ] Testes básicos passando
- [ ] Performance dentro dos limites
- [ ] Monitoramento ativo
- [ ] Backup configurado
- [ ] Documentação atualizada

**🎉 Seu projeto Contabilease está pronto para produção no Vercel!**
