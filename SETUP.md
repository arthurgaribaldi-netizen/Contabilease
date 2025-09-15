# 🚀 Guia de Configuração - Contabilease Fase 1

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta no Supabase (gratuita)
- Git instalado

## 🛠️ Passo a Passo

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto
2. Vá para **Settings > API** e copie:
   - Project URL
   - Anon/Public Key

### 3. Configurar Variáveis de Ambiente

```bash
cp env.example .env.local
```

Edite o arquivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
```

### 4. Configurar Banco de Dados

1. No Supabase, vá para **SQL Editor**
2. Execute o script completo de `supabase/migrations/001_create_countries_table.sql`
3. Verifique se a tabela `countries` foi criada com sucesso

### 5. Executar o Projeto

```bash
npm run dev
```

### 6. Testar a Aplicação

Acesse as URLs:
- **Português**: http://localhost:3000/pt-BR
- **Inglês**: http://localhost:3000/en  
- **Espanhol**: http://localhost:3000/es

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar em produção
npm start

# Linting
npm run lint
```

## 🐛 Solução de Problemas

### Erro de Conexão com Supabase
- Verifique se as variáveis de ambiente estão corretas
- Confirme se o projeto Supabase está ativo

### Erro de Locale
- Verifique se o middleware está configurado corretamente
- Confirme se os arquivos de dicionário existem

### Erro de Build
- Execute `npm run lint` para verificar erros
- Confirme se todas as dependências estão instaladas

## ✅ Verificação Final

A Fase 1 está completa quando:

- [ ] Projeto executa sem erros (`npm run dev`)
- [ ] Páginas carregam em todos os idiomas
- [ ] Autenticação funciona (login/registro)
- [ ] Tabela countries está populada no Supabase
- [ ] Internacionalização funciona corretamente

## 🎯 Próximo Passo

Após confirmar que tudo está funcionando, você pode prosseguir para a **Fase 2: Dashboard e Transações**.
