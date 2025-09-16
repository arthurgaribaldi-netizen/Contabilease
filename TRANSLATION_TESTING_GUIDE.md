# 🌍 Guia para Correção de Problemas de Tradução em Testes

## 🐛 Problema Identificado

Os testes estavam falhando porque usavam textos hardcoded em vez das traduções reais dos arquivos de tradução. Isso causava inconsistências entre o que o componente renderizava e o que o teste esperava.

## ✅ Solução Implementada

### 1. Criado Sistema de Teste i18n

**Arquivo:** `__tests__/utils/test-i18n.tsx`

```typescript
import { NextIntlClientProvider } from 'next-intl';
import { ReactElement } from 'react';
import ptBR from '@/lib/i18n/dictionaries/pt-BR.json';
import en from '@/lib/i18n/dictionaries/en.json';
import es from '@/lib/i18n/dictionaries/es.json';

// Provider para testes com traduções reais
export function TestI18nProvider({ children, locale = 'pt-BR' }) {
  const messages = translations[locale];
  
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}

// Helper para renderizar componentes com i18n
export function renderWithI18n(component, locale = 'pt-BR') {
  const { render } = require('@testing-library/react');
  
  return render(
    <TestI18nProvider locale={locale}>
      {component}
    </TestI18nProvider>
  );
}

// Helper para obter traduções em testes
export function getTranslation(key, locale = 'pt-BR') {
  const messages = translations[locale];
  const keys = key.split('.');
  
  let value = messages;
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
}
```

### 2. Atualizado Setup de Testes

**Arquivo:** `__tests__/setup.ts`

```typescript
// Mock next-intl para componentes que não usam TestI18nProvider
jest.mock('next-intl', () => ({
  useTranslations: (namespace: string) => (key: string) => {
    // Carrega traduções reais como fallback
    const ptBR = require('@/lib/i18n/dictionaries/pt-BR.json');
    const keys = `${namespace}.${key}`.split('.');
    
    let value: any = ptBR;
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  },
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => children,
}));
```

### 3. Exemplo de Correção de Teste

**Antes (❌ Problema):**
```typescript
it('renders magic link form correctly', () => {
  render(<MagicLinkForm />);
  
  expect(screen.getByText('Enviando...')).toBeInTheDocument();
  // Texto hardcoded pode não corresponder ao arquivo de tradução
});
```

**Depois (✅ Solução):**
```typescript
it('renders magic link form correctly', () => {
  renderWithI18n(<MagicLinkForm />);
  
  expect(screen.getByText(getTranslation('auth.magicLink.sending'))).toBeInTheDocument();
  // Usa tradução real do arquivo pt-BR.json
});
```

## 🔧 Como Usar

### Para Novos Testes

1. **Importe os helpers:**
```typescript
import { renderWithI18n, getTranslation } from '../utils/test-i18n';
```

2. **Use renderWithI18n em vez de render:**
```typescript
renderWithI18n(<MeuComponente />);
```

3. **Use getTranslation para textos:**
```typescript
expect(screen.getByText(getTranslation('auth.magicLink.title'))).toBeInTheDocument();
```

### Para Testes Existentes

1. **Substitua render por renderWithI18n**
2. **Substitua textos hardcoded por getTranslation**
3. **Verifique se as chaves de tradução existem nos arquivos**

## 📋 Checklist de Correção

- [ ] ✅ Criado `__tests__/utils/test-i18n.tsx`
- [ ] ✅ Atualizado `__tests__/setup.ts`
- [ ] ✅ Corrigido `__tests__/auth/magic-link.test.tsx`
- [ ] ⏳ Verificar outros testes com problemas similares
- [ ] ⏳ Atualizar documentação de testes

## 🎯 Benefícios

1. **Consistência:** Testes usam as mesmas traduções que a aplicação
2. **Manutenibilidade:** Mudanças nas traduções são refletidas automaticamente nos testes
3. **Confiabilidade:** Testes não quebram por diferenças entre textos hardcoded e traduções
4. **Flexibilidade:** Suporte a múltiplos idiomas nos testes

## 🚨 Problemas Comuns

### 1. Chave de Tradução Não Encontrada
```typescript
// ❌ Erro: chave não existe
getTranslation('auth.magicLink.nonExistentKey')

// ✅ Solução: verificar arquivo de tradução
// pt-BR.json deve ter: "auth": { "magicLink": { "nonExistentKey": "..." } }
```

### 2. Namespace Incorreto
```typescript
// ❌ Erro: namespace incorreto
getTranslation('magicLink.title') // Deveria ser 'auth.magicLink.title'

// ✅ Solução: usar namespace completo
getTranslation('auth.magicLink.title')
```

### 3. Componente Não Renderiza com i18n
```typescript
// ❌ Erro: componente não tem contexto i18n
render(<MeuComponente />);

// ✅ Solução: usar renderWithI18n
renderWithI18n(<MeuComponente />);
```

## 📚 Exemplos Práticos

### Teste de Formulário com Validação
```typescript
it('shows validation error message', async () => {
  renderWithI18n(<ContractForm />);
  
  const submitButton = screen.getByText(getTranslation('contracts.addContract'));
  fireEvent.click(submitButton);
  
  await waitFor(() => {
    expect(screen.getByText(getTranslation('errors.validationError'))).toBeInTheDocument();
  });
});
```

### Teste Multi-idioma
```typescript
it('renders in different languages', () => {
  // Português
  const { rerender } = renderWithI18n(<MagicLinkForm />, 'pt-BR');
  expect(screen.getByText('Enviando...')).toBeInTheDocument();
  
  // Inglês
  rerender(
    <TestI18nProvider locale="en">
      <MagicLinkForm />
    </TestI18nProvider>
  );
  expect(screen.getByText('Sending...')).toBeInTheDocument();
});
```

## 🔍 Verificação de Traduções

Para verificar se todas as chaves de tradução estão corretas:

```bash
# Executar testes específicos
npm test -- __tests__/auth/magic-link.test.tsx

# Verificar cobertura de traduções
npm run test:coverage
```

## 📝 Próximos Passos

1. **Aplicar correções em outros testes** que usam textos hardcoded
2. **Criar testes para diferentes idiomas** usando o sistema implementado
3. **Documentar padrões de teste** para novos desenvolvedores
4. **Implementar validação automática** de chaves de tradução em testes
