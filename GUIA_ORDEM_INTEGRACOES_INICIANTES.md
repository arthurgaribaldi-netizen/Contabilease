# 🚀 Guia Completo: Ordem das Integrações - Para Iniciantes

## 📋 Resumo: Ordem CORRETA das Integrações

> **IMPORTANTE**: Siga esta ordem exata! Cada integração depende da anterior.

### 🎯 **ORDEM OBRIGATÓRIA:**

1. **🔧 GIT + GitHub** (Base - Já feito ✅)
2. **🗄️ Supabase** (Banco de dados - FUNDAMENTAL)
3. **🌐 Vercel** (Deploy/Hospedagem)
4. **🔐 Google OAuth** (Login social)
5. **💳 Stripe** (Pagamentos)
6. **⚡ GitHub Actions** (Automação - Último)

---

## 📖 **EXPLICAÇÃO DETALHADA - PASSO A PASSO**

### **1. 🔧 GIT + GitHub** ✅ (JÁ CONFIGURADO)
**O que é:** Sistema de controle de versão
**Status:** ✅ Já funcionando
**Por que primeiro:** Tudo fica salvo na nuvem

---

### **2. 🗄️ SUPABASE** (PRIORIDADE MÁXIMA)
**O que é:** Banco de dados + Autenticação
**Por que primeiro:** É a BASE de tudo

#### ✅ **O que JÁ está configurado:**
- Projeto criado no Supabase
- Código preparado no projeto
- Migrações de banco prontas

#### 🎯 **O que VOCÊ precisa fazer:**

**Passo 1:** Acessar o Supabase
```
1. Vá para: https://supabase.com/dashboard
2. Entre na sua conta
3. Selecione seu projeto Contabilease
```

**Passo 2:** Obter as chaves
```
1. Vá em: Settings > API
2. Copie estas informações:
   - Project URL (já tem: https://hmuzaebxqnhwnzoczczo.supabase.co)
   - anon/public key
   - service_role key
```

**Passo 3:** Configurar no projeto
```
1. Abra o arquivo: .env.local
2. Cole as chaves (substitua os valores de exemplo)
```

**Passo 4:** Configurar o banco
```
1. No Supabase: SQL Editor
2. Execute os scripts em ordem:
   - 001_create_countries_table.sql
   - 002_profiles_contracts_and_rls.sql
   - 003_rls_and_policies.sql
   - 004_add_ifrs16_financial_fields.sql
   - 005_contract_modifications.sql
```

---

### **3. 🌐 VERCEL** (DEPLOY)
**O que é:** Hospedagem da aplicação
**Por que agora:** Precisa do Supabase funcionando

#### 🎯 **O que VOCÊ precisa fazer:**

**Passo 1:** Criar conta Vercel
```
1. Vá para: https://vercel.com
2. Faça login com GitHub
3. Importe o repositório Contabilease
```

**Passo 2:** Configurar variáveis de ambiente
```
No Vercel Dashboard > Settings > Environment Variables
Adicione TODAS as variáveis do .env.local
```

**Passo 3:** Primeiro deploy
```
1. Clique em "Deploy"
2. Aguarde o build
3. Teste se o site carrega
```

---

### **4. 🔐 GOOGLE OAUTH** (LOGIN SOCIAL)
**O que é:** Login com Google
**Por que agora:** Precisa do Vercel funcionando

#### 🎯 **O que VOCÊ precisa fazer:**

**Passo 1:** Google Cloud Console
```
1. Vá para: https://console.cloud.google.com
2. Crie um projeto novo
3. Ative a Google+ API
```

**Passo 2:** Criar credenciais OAuth
```
1. APIs & Services > Credentials
2. Create Credentials > OAuth 2.0 Client IDs
3. Configure:
   - Authorized redirect URIs: 
     * https://seu-projeto.vercel.app/auth/callback
     * http://localhost:3000/auth/callback
```

**Passo 3:** Configurar no Supabase
```
1. Supabase > Authentication > Providers
2. Enable Google
3. Cole Client ID e Client Secret
```

**Passo 4:** Atualizar Vercel
```
Adicione as variáveis no Vercel:
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
```

---

### **5. 💳 STRIPE** (PAGAMENTOS)
**O que é:** Sistema de pagamento
**Por que agora:** Precisa do Google OAuth funcionando

#### 🎯 **O que VOCÊ precisa fazer:**

**Passo 1:** Criar conta Stripe
```
1. Vá para: https://stripe.com
2. Crie uma conta
3. Complete a verificação
```

**Passo 2:** Criar produtos e preços
```
1. Dashboard Stripe > Products
2. Crie 3 produtos:
   - Básico (R$ 29/mês)
   - Profissional (R$ 59/mês)  
   - Escritório (R$ 99/mês)
3. Copie os Price IDs
```

**Passo 3:** Configurar webhook
```
1. Developers > Webhooks
2. Add endpoint: https://seu-projeto.vercel.app/api/stripe/webhook
3. Selecione eventos:
   - checkout.session.completed
   - customer.subscription.created
   - customer.subscription.updated
   - customer.subscription.deleted
```

**Passo 4:** Atualizar Vercel
```
Adicione no Vercel:
- STRIPE_SECRET_KEY
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- STRIPE_WEBHOOK_SECRET
- STRIPE_BASIC_PRICE_ID
- STRIPE_PROFESSIONAL_PRICE_ID
- STRIPE_OFFICE_PRICE_ID
```

---

### **6. ⚡ GITHUB ACTIONS** (AUTOMAÇÃO)
**O que é:** Deploy automático
**Por que por último:** Precisa de tudo funcionando

#### 🎯 **O que VOCÊ precisa fazer:**

**Passo 1:** Obter token Vercel
```
1. Vercel > Settings > Tokens
2. Create Token
3. Copie o token
```

**Passo 2:** Configurar no GitHub
```
1. GitHub > Settings > Secrets and variables > Actions
2. Adicione:
   - VERCEL_TOKEN
   - VERCEL_ORG_ID
   - VERCEL_PROJECT_ID
```

**Passo 3:** Ativar workflows
```
1. GitHub > Actions
2. Os workflows já estão prontos no projeto
3. Faça um commit para ativar
```

---

## 🚨 **CHECKLIST DE VERIFICAÇÃO**

### ✅ **Supabase**
- [ ] Projeto criado
- [ ] Chaves configuradas
- [ ] Banco de dados executado
- [ ] Teste de login funcionando

### ✅ **Vercel**
- [ ] Projeto importado
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy funcionando
- [ ] Site acessível

### ✅ **Google OAuth**
- [ ] Projeto Google criado
- [ ] Credenciais OAuth criadas
- [ ] Supabase configurado
- [ ] Login com Google funcionando

### ✅ **Stripe**
- [ ] Conta Stripe criada
- [ ] Produtos e preços criados
- [ ] Webhook configurado
- [ ] Pagamento funcionando

### ✅ **GitHub Actions**
- [ ] Token Vercel configurado
- [ ] Secrets no GitHub
- [ ] Deploy automático funcionando

---

## 🆘 **TROUBLESHOOTING RÁPIDO**

### **Erro: "Invalid API key"**
→ Verifique se copiou as chaves corretas

### **Erro: "redirect_uri_mismatch"**
→ Verifique se as URLs estão exatamente iguais

### **Erro: "Build failed"**
→ Verifique se todas as variáveis estão configuradas

### **Erro: "Webhook failed"**
→ Verifique se o endpoint está correto

---

## 📞 **PRÓXIMOS PASSOS**

1. **Comece pelo Supabase** (mais importante)
2. **Teste cada etapa** antes de prosseguir
3. **Se der erro, pare e resolva** antes de continuar
4. **Anote tudo** que você configurou

---

## 💡 **DICAS IMPORTANTES**

- **NÃO pule etapas** - cada uma depende da anterior
- **Teste sempre** depois de configurar
- **Salve as chaves** em local seguro
- **Use modo de teste** primeiro (Stripe test mode)
- **Leia as mensagens de erro** - elas ajudam muito

---

**🎯 LEMBRE-SE: Você não está sozinho! Cada passo é simples quando feito na ordem correta.**
