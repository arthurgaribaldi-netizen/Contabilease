# 🚀 Guia de Configuração do Supabase - Contabilease

## ✅ Configuração Atual

Sua configuração do Supabase já está seguindo as **melhores práticas**:

### 1. Arquivo de Configuração (`src/lib/supabase.ts`)
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 2. Variáveis de Ambiente (`.env.local`)
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://hmuzaebxqnhwnzoczczo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_aqui
```

## 🔧 Próximos Passos

### 1. Obter as Chaves do Supabase

1. Acesse seu projeto no [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá para **Settings > API**
3. Copie as seguintes chaves:
   - **Project URL**: `https://hmuzaebxqnhwnzoczczo.supabase.co` ✅ (já configurada)
   - **Anon/Public Key**: Cole em `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service Role Key**: Cole em `SUPABASE_SERVICE_ROLE_KEY`

### 2. Atualizar `.env.local`

Edite o arquivo `.env.local` e substitua:
```env
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # Sua chave real aqui
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # Sua chave service role aqui
```

### 3. Configurar Banco de Dados

Execute os scripts SQL na seguinte ordem:

1. **Países**: `supabase/migrations/001_create_countries_table.sql`
2. **Perfis e Contratos**: `supabase/migrations/002_profiles_contracts_and_rls.sql`
3. **RLS e Políticas**: `supabase/migrations/003_rls_and_policies.sql`
4. **Campos IFRS16**: `supabase/migrations/004_add_ifrs16_financial_fields.sql`
5. **Contratos IFRS16**: `supabase/migrations/004_ifrs16_lease_contracts.sql`
6. **Modificações**: `supabase/migrations/005_contract_modifications.sql`

## 🛡️ Melhores Práticas Implementadas

### ✅ Segurança
- [x] Variáveis de ambiente com prefixo `NEXT_PUBLIC_` para client-side
- [x] Service role key separada para operações server-side
- [x] `.env.local` no `.gitignore` (não commitado)
- [x] Client singleton exportado para reutilização

### ✅ Arquitetura
- [x] Configuração centralizada em `src/lib/supabase.ts`
- [x] Tipos TypeScript definidos
- [x] Separação entre client-side e server-side
- [x] Uso correto do `createServerComponentClient` para SSR

### ✅ Performance
- [x] Client singleton (uma instância por aplicação)
- [x] Configuração otimizada para Next.js
- [x] Suporte a SSR com cookies

## 🧪 Testando a Configuração

### 1. Verificar Conexão
```bash
npm run dev
```

### 2. Testar Autenticação
- Acesse: `http://localhost:3000/pt-BR/auth/login`
- Tente fazer login/registro

### 3. Verificar Console
- Abra DevTools (F12)
- Verifique se não há erros de conexão com Supabase

## 🚨 Troubleshooting

### Erro: "Invalid API key"
- Verifique se `NEXT_PUBLIC_SUPABASE_ANON_KEY` está correto
- Confirme se a chave não tem espaços extras

### Erro: "Failed to fetch"
- Verifique se `NEXT_PUBLIC_SUPABASE_URL` está correto
- Confirme se o projeto Supabase está ativo

### Erro: "RLS policy violation"
- Execute os scripts de migração na ordem correta
- Verifique se as políticas RLS estão configuradas

## 📚 Recursos Adicionais

- [Documentação Supabase](https://supabase.com/docs)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)

---

**Status**: ✅ Configuração seguindo melhores práticas  
**Próximo**: Obter as chaves reais do Supabase Dashboard
