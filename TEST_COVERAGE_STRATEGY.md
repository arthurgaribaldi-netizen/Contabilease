# Estratégia para Melhorar Cobertura de Testes

## Situação Atual
- **Cobertura**: 11.13% statements (1086/9750)
- **Testes Falhando**: 54 testes com falhas
- **Thresholds Configurados**: 80-90% (muito altos para situação atual)

## Problemas Identificados

### 1. Testes Falhando por Internacionalização
- Testes esperam textos em inglês mas componentes renderizam em português
- Exemplo: `BackupCodeVerification` espera "Cancel" mas renderiza "Cancelar"

### 2. Arquivos Críticos Sem Cobertura
- **src/lib/calculations/**: Engine IFRS 16 (crítico para negócio)
- **src/lib/auth/**: Autenticação e segurança
- **src/lib/security/**: Segurança e validação
- **src/components/contracts/**: Componentes principais de contratos
- **src/components/auth/**: Componentes de autenticação

### 3. Configuração de Thresholds
- Thresholds muito altos (80-90%) para cobertura atual (11%)
- Deve ser ajustado gradualmente

## Plano de Ação

### Fase 1: Corrigir Testes Existentes (Prioridade Alta)
1. **Corrigir testes de internacionalização**
   - Atualizar testes para usar textos corretos (português)
   - Ou configurar mocks de i18n adequadamente

2. **Corrigir testes de componentes MFA**
   - BackupCodeVerification
   - GoogleLoginButton
   - Outros componentes de auth

3. **Corrigir testes de cache IFRS16**
   - Problemas de timing e expiração

### Fase 2: Implementar Testes Críticos (Prioridade Alta)
1. **src/lib/calculations/ifrs16-engine.ts**
   - Engine principal de cálculos IFRS 16
   - Testes de cálculos básicos e avançados
   - Validação de dados

2. **src/lib/auth/requireSession.ts**
   - Middleware de autenticação
   - Validação de sessão

3. **src/lib/security/rate-limiting.ts**
   - Rate limiting e segurança
   - Prevenção de ataques

### Fase 3: Testes de Componentes (Prioridade Média)
1. **src/components/contracts/IFRS16ContractForm.tsx**
   - Formulário principal de contratos
   - Validação de campos
   - Submissão de dados

2. **src/components/auth/AuthForm.tsx**
   - Formulário de autenticação
   - Validação de credenciais

3. **src/components/dashboard/IFRS16Dashboard.tsx**
   - Dashboard principal
   - Exibição de dados

### Fase 4: Ajustar Configuração (Prioridade Baixa)
1. **Reduzir thresholds gradualmente**
   - Começar com 30-40%
   - Aumentar conforme cobertura melhora

2. **Configurar cobertura por diretório**
   - Thresholds específicos por área
   - Priorizar arquivos críticos

## Arquivos Prioritários para Testes

### Alta Prioridade (Críticos para Negócio)
- `src/lib/calculations/ifrs16-engine.ts`
- `src/lib/calculations/ifrs16-basic.ts`
- `src/lib/auth/requireSession.ts`
- `src/lib/security/rate-limiting.ts`
- `src/lib/contracts.ts`

### Média Prioridade (Funcionalidade Core)
- `src/components/contracts/IFRS16ContractForm.tsx`
- `src/components/auth/AuthForm.tsx`
- `src/components/dashboard/IFRS16Dashboard.tsx`
- `src/lib/schemas/ifrs16-lease.ts`
- `src/lib/validation/schema-validator.ts`

### Baixa Prioridade (Melhorias)
- `src/components/ui/` (componentes básicos)
- `src/lib/utils.ts`
- `src/lib/logger.ts`

## Métricas de Sucesso

### Curto Prazo (1-2 semanas)
- Corrigir todos os testes falhando
- Atingir 30% de cobertura geral
- 80% de cobertura em arquivos críticos

### Médio Prazo (1 mês)
- Atingir 50% de cobertura geral
- 90% de cobertura em arquivos críticos
- Implementar testes para componentes principais

### Longo Prazo (2-3 meses)
- Atingir 70% de cobertura geral
- 95% de cobertura em arquivos críticos
- Implementar testes de integração

## Comandos Úteis

```bash
# Executar testes com cobertura
npm run test:coverage

# Executar testes específicos
npm test -- __tests__/ifrs16-calculations.test.ts

# Executar testes em modo watch
npm run test:watch

# Verificar cobertura de arquivo específico
npm test -- --coverage --testPathPattern=ifrs16-engine
```

## Próximos Passos

1. **Corrigir testes falhando** (Fase 1)
2. **Implementar testes para ifrs16-engine.ts** (Fase 2)
3. **Ajustar thresholds de cobertura** (Fase 4)
4. **Implementar testes de componentes críticos** (Fase 3)
