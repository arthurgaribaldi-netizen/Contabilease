# 🌍 Exemplos Práticos de Testes de Tradução

## 📋 Resumo da Implementação

✅ **Problema Resolvido:** Textos não encontrados em testes devido ao uso de traduções hardcoded em vez das traduções reais dos arquivos.

✅ **Solução Implementada:**
- Criado sistema de teste i18n com `TestI18nProvider`
- Helper `renderWithI18n()` para renderizar componentes com contexto i18n
- Helper `getTranslation()` para obter traduções reais em testes
- Atualizado setup de testes para usar traduções reais

## 🔧 Exemplos de Uso

### 1. Teste Básico de Componente

```typescript
import { renderWithI18n, getTranslation } from '../utils/test-i18n';

it('renders component with correct translations', () => {
  renderWithI18n(<MeuComponente />);
  
  expect(screen.getByText(getTranslation('common.loading'))).toBeInTheDocument();
  expect(screen.getByText(getTranslation('auth.login'))).toBeInTheDocument();
});
```

### 2. Teste de Formulário com Validação

```typescript
it('shows validation errors in correct language', async () => {
  renderWithI18n(<ContractForm />);
  
  const submitButton = screen.getByText(getTranslation('contracts.addContract'));
  fireEvent.click(submitButton);
  
  await waitFor(() => {
    expect(screen.getByText(getTranslation('errors.validationError'))).toBeInTheDocument();
  });
});
```

### 3. Teste de Estado de Loading

```typescript
it('shows loading state with correct text', () => {
  mockUseMagicLink.mockReturnValue({
    isLoading: true,
    // ... outros mocks
  });

  renderWithI18n(<MagicLinkForm />);
  
  expect(screen.getByText(getTranslation('auth.magicLink.sending'))).toBeInTheDocument();
});
```

### 4. Teste Multi-idioma

```typescript
it('renders correctly in different languages', () => {
  // Teste em Português
  const { rerender } = renderWithI18n(<MagicLinkForm />, 'pt-BR');
  expect(screen.getByText('Enviando...')).toBeInTheDocument();
  
  // Teste em Inglês
  rerender(
    <TestI18nProvider locale="en">
      <MagicLinkForm />
    </TestI18nProvider>
  );
  expect(screen.getByText('Sending...')).toBeInTheDocument();
  
  // Teste em Espanhol
  rerender(
    <TestI18nProvider locale="es">
      <MagicLinkForm />
    </TestI18nProvider>
  );
  expect(screen.getByText('Enviando...')).toBeInTheDocument();
});
```

### 5. Teste de Interação com Traduções

```typescript
it('handles form submission with translated messages', async () => {
  renderWithI18n(<MagicLinkForm />);
  
  const emailInput = screen.getByPlaceholderText(getTranslation('auth.magicLink.emailPlaceholder'));
  const submitButton = screen.getByText(getTranslation('auth.magicLink.sendButton'));
  
  fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
  fireEvent.click(submitButton);
  
  await waitFor(() => {
    expect(screen.getByText(getTranslation('auth.magicLink.successTitle'))).toBeInTheDocument();
  });
});
```

### 6. Teste de Componente com Múltiplas Traduções

```typescript
it('renders all translated elements', () => {
  renderWithI18n(<Dashboard />);
  
  // Verificar múltiplas traduções
  expect(screen.getByText(getTranslation('dashboard.welcome'))).toBeInTheDocument();
  expect(screen.getByText(getTranslation('dashboard.totalBalance'))).toBeInTheDocument();
  expect(screen.getByText(getTranslation('dashboard.monthlyIncome'))).toBeInTheDocument();
  expect(screen.getByText(getTranslation('dashboard.monthlyExpenses'))).toBeInTheDocument();
});
```

## 🚨 Problemas Comuns e Soluções

### 1. Chave de Tradução Não Encontrada

**Problema:**
```typescript
// ❌ Erro: chave não existe
expect(screen.getByText(getTranslation('auth.magicLink.nonExistentKey'))).toBeInTheDocument();
```

**Solução:**
```typescript
// ✅ Verificar se a chave existe no arquivo de tradução
// pt-BR.json deve ter: "auth": { "magicLink": { "nonExistentKey": "..." } }
```

### 2. Namespace Incorreto

**Problema:**
```typescript
// ❌ Erro: namespace incorreto
getTranslation('magicLink.title') // Deveria ser 'auth.magicLink.title'
```

**Solução:**
```typescript
// ✅ Usar namespace completo
getTranslation('auth.magicLink.title')
```

### 3. Componente Não Renderiza com i18n

**Problema:**
```typescript
// ❌ Erro: componente não tem contexto i18n
render(<MeuComponente />);
```

**Solução:**
```typescript
// ✅ Usar renderWithI18n
renderWithI18n(<MeuComponente />);
```

### 4. Mock de Tradução Inconsistente

**Problema:**
```typescript
// ❌ Mock hardcoded pode não corresponder às traduções reais
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations = {
      'sending': 'Enviando...', // Pode não corresponder ao arquivo real
    };
    return translations[key] || key;
  },
}));
```

**Solução:**
```typescript
// ✅ Usar traduções reais no mock
jest.mock('next-intl', () => ({
  useTranslations: (namespace: string) => (key: string) => {
    const ptBR = require('@/lib/i18n/dictionaries/pt-BR.json');
    const keys = `${namespace}.${key}`.split('.');
    
    let value: any = ptBR;
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  },
}));
```

## 📚 Padrões Recomendados

### 1. Estrutura de Teste Padrão

```typescript
import { renderWithI18n, getTranslation } from '../utils/test-i18n';

describe('MeuComponente', () => {
  beforeEach(() => {
    // Setup dos mocks
  });

  it('renders with correct translations', () => {
    renderWithI18n(<MeuComponente />);
    
    // Verificar traduções principais
    expect(screen.getByText(getTranslation('componente.titulo'))).toBeInTheDocument();
    expect(screen.getByText(getTranslation('componente.subtitulo'))).toBeInTheDocument();
  });

  it('handles interactions with translated text', async () => {
    renderWithI18n(<MeuComponente />);
    
    const button = screen.getByText(getTranslation('componente.botao'));
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(getTranslation('componente.mensagemSucesso'))).toBeInTheDocument();
    });
  });
});
```

### 2. Teste de Validação de Traduções

```typescript
it('validates all required translations exist', () => {
  const requiredKeys = [
    'auth.magicLink.title',
    'auth.magicLink.subtitle',
    'auth.magicLink.sendButton',
    'auth.magicLink.sending',
  ];

  requiredKeys.forEach(key => {
    const translation = getTranslation(key);
    expect(translation).not.toBe(key); // Não deve retornar a chave se não encontrar
    expect(translation).toBeTruthy(); // Deve ter um valor
  });
});
```

### 3. Teste de Consistência Entre Idiomas

```typescript
it('has consistent translations across languages', () => {
  const testKeys = [
    'auth.magicLink.title',
    'auth.magicLink.sendButton',
    'common.loading',
  ];

  testKeys.forEach(key => {
    const ptBR = getTranslation(key, 'pt-BR');
    const en = getTranslation(key, 'en');
    const es = getTranslation(key, 'es');

    // Todas as traduções devem existir
    expect(ptBR).toBeTruthy();
    expect(en).toBeTruthy();
    expect(es).toBeTruthy();

    // Não devem ser iguais (exceto para alguns casos específicos)
    expect(ptBR).not.toBe(en);
    expect(ptBR).not.toBe(es);
  });
});
```

## 🔍 Verificação e Debugging

### 1. Verificar Traduções Disponíveis

```typescript
// Debug: ver todas as traduções disponíveis
console.log('Traduções disponíveis:', getTranslation('auth.magicLink'));
```

### 2. Verificar Estrutura de Arquivo de Tradução

```typescript
// Debug: verificar estrutura do arquivo de tradução
const ptBR = require('@/lib/i18n/dictionaries/pt-BR.json');
console.log('Estrutura auth:', ptBR.auth);
console.log('Estrutura magicLink:', ptBR.auth?.magicLink);
```

### 3. Teste de Fallback

```typescript
it('handles missing translations gracefully', () => {
  // Teste com chave inexistente
  const missingTranslation = getTranslation('non.existent.key');
  expect(missingTranslation).toBe('non.existent.key'); // Deve retornar a chave
});
```

## 📝 Checklist para Novos Testes

- [ ] ✅ Importar `renderWithI18n` e `getTranslation`
- [ ] ✅ Usar `renderWithI18n` em vez de `render`
- [ ] ✅ Usar `getTranslation` para todos os textos
- [ ] ✅ Verificar se as chaves de tradução existem nos arquivos
- [ ] ✅ Testar interações com elementos traduzidos
- [ ] ✅ Verificar estados de loading/success/error com traduções
- [ ] ✅ Considerar testes multi-idioma se aplicável

## 🎯 Benefícios da Implementação

1. **Consistência:** Testes usam as mesmas traduções que a aplicação
2. **Manutenibilidade:** Mudanças nas traduções são refletidas automaticamente
3. **Confiabilidade:** Testes não quebram por diferenças entre textos hardcoded e traduções
4. **Flexibilidade:** Suporte a múltiplos idiomas nos testes
5. **Debugging:** Fácil identificação de problemas de tradução
6. **Padronização:** Padrão consistente para todos os testes de tradução
