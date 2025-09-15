# Diretrizes de Acessibilidade - Contabilease

Este documento descreve os padrões e diretrizes de acessibilidade implementados nos componentes do Contabilease.

## Atributos ARIA Implementados

### 1. Componentes de Formulário

#### Button Component
```tsx
<Button
  aria-busy={loading}
  aria-describedby="button-description"
  aria-expanded={isExpanded}
  aria-pressed={isPressed}
>
  Conteúdo do Botão
</Button>
```

**Atributos ARIA:**
- `aria-busy`: Indica quando o botão está em estado de carregamento
- `aria-describedby`: Referencia elementos que descrevem o botão
- `aria-expanded`: Indica se um elemento controlado está expandido
- `aria-pressed`: Indica o estado de pressionamento de botões toggle

#### Input Component
```tsx
<Input
  id="email"
  label="Email"
  aria-required={true}
  aria-invalid={!!error}
  aria-describedby={error ? 'email-error' : 'email-helper'}
/>
```

**Atributos ARIA:**
- `aria-required`: Indica que o campo é obrigatório
- `aria-invalid`: Indica se o campo tem erro de validação
- `aria-describedby`: Referencia mensagens de erro ou texto de ajuda

#### Select Component
```tsx
<Select
  id="country"
  label="País"
  options={countryOptions}
  aria-required={true}
  aria-describedby="country-helper"
/>
```

**Atributos ARIA:**
- `aria-required`: Indica que o campo é obrigatório
- `aria-describedby`: Referencia texto de ajuda
- `aria-invalid`: Indica estado de erro

### 2. Componentes de Navegação

#### Navigation
```tsx
<nav role="navigation" aria-label="Menu principal">
  <ul>
    <li>
      <a href="/dashboard" aria-current="page">Dashboard</a>
    </li>
  </ul>
</nav>
```

**Atributos ARIA:**
- `role="navigation"`: Define a função do elemento
- `aria-label`: Fornece um rótulo descritivo
- `aria-current="page"`: Indica a página atual

### 3. Componentes de Conteúdo

#### Modal Component
```tsx
<Modal
  isOpen={isOpen}
  title="Título do Modal"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <p id="modal-description">Descrição do modal</p>
</Modal>
```

**Atributos ARIA:**
- `role="dialog"`: Define como um diálogo modal
- `aria-modal="true"`: Indica que é um modal
- `aria-labelledby`: Referencia o título do modal
- `aria-describedby`: Referencia a descrição do modal

#### Table Component
```tsx
<Table
  data={tableData}
  columns={columns}
  aria-label="Tabela de contratos"
  aria-describedby="table-description"
/>
```

**Atributos ARIA:**
- `role="table"`: Define como tabela
- `aria-label`: Rótulo descritivo da tabela
- `aria-describedby`: Referencia descrição adicional
- `role="columnheader"`: Para cabeçalhos de coluna
- `role="row"`: Para linhas da tabela
- `role="cell"`: Para células da tabela

#### Alert Component
```tsx
<Alert
  variant="error"
  title="Erro"
  description="Algo deu errado"
  aria-live="polite"
/>
```

**Atributos ARIA:**
- `role="alert"` ou `role="status"`: Define o tipo de alerta
- `aria-live`: Controla como mudanças são anunciadas
- `aria-label`: Rótulo descritivo

### 4. Estados de Carregamento

#### Loading States
```tsx
<LoadingSpinner
  size="md"
  label="Carregando dados..."
  aria-label="Carregando"
/>

<LoadingButton
  isLoading={loading}
  loadingText="Salvando..."
  aria-busy={loading}
>
  Salvar
</LoadingButton>
```

**Atributos ARIA:**
- `role="status"`: Para elementos de status
- `aria-label`: Descrição do estado de carregamento
- `aria-busy`: Indica que um elemento está ocupado

## Padrões de Implementação

### 1. Formulários

#### Estrutura de Formulário
```tsx
<form role="form" aria-label="Formulário de contrato">
  <fieldset>
    <legend>Informações Básicas</legend>
    {/* Campos do formulário */}
  </fieldset>
  
  <div role="group" aria-label="Ações do formulário">
    <button type="submit">Salvar</button>
    <button type="button">Cancelar</button>
  </div>
</form>
```

#### Mensagens de Erro
```tsx
{error && (
  <div
    id={`${fieldId}-error`}
    role="alert"
    aria-live="polite"
    className="text-red-600"
  >
    {error}
  </div>
)}
```

#### Texto de Ajuda
```tsx
{helperText && (
  <p id={`${fieldId}-helper`} className="text-gray-500">
    {helperText}
  </p>
)}
```

### 2. Navegação

#### Breadcrumbs
```tsx
<nav aria-label="Breadcrumb">
  <ol>
    <li>
      <a href="/dashboard" aria-current="page">Dashboard</a>
    </li>
  </ol>
</nav>
```

#### Menu Principal
```tsx
<nav role="navigation" aria-label="Menu principal">
  <ul>
    <li>
      <a href="/contracts" aria-current={isActive ? 'page' : undefined}>
        Contratos
      </a>
    </li>
  </ul>
</nav>
```

### 3. Conteúdo Dinâmico

#### Regiões de Conteúdo
```tsx
<main role="main" aria-label="Conteúdo principal">
  <section aria-labelledby="section-title">
    <h2 id="section-title">Título da Seção</h2>
    {/* Conteúdo */}
  </section>
</main>
```

#### Conteúdo Atualizado
```tsx
<div
  role="status"
  aria-live="polite"
  aria-label="Status da operação"
>
  {statusMessage}
</div>
```

### 4. Interações Complexas

#### Wizards/Assistentes
```tsx
<div role="main" aria-label="Assistente de criação">
  <nav aria-label="Progresso do assistente">
    <ol>
      <li aria-current="step">Passo Atual</li>
    </ol>
  </nav>
  
  <div role="region" aria-labelledby="step-title">
    <h2 id="step-title">Passo 1 de 4: Título</h2>
    {/* Conteúdo do passo */}
  </div>
</div>
```

#### Tabelas Interativas
```tsx
<table role="table" aria-label="Dados dos contratos">
  <thead>
    <tr>
      <th
        role="columnheader"
        aria-sort="ascending"
        aria-label="Ordenar por nome"
        tabIndex={0}
      >
        Nome
      </th>
    </tr>
  </thead>
  <tbody>
    <tr role="row" tabIndex={0} onClick={handleRowClick}>
      <td role="cell">Valor da célula</td>
    </tr>
  </tbody>
</table>
```

## Boas Práticas

### 1. Sempre Use Labels
- Todos os campos de formulário devem ter labels associados
- Use `htmlFor` para associar labels aos inputs
- Para elementos sem texto visível, use `aria-label`

### 2. Estados de Erro
- Use `aria-invalid` para indicar campos com erro
- Use `role="alert"` para mensagens de erro
- Use `aria-describedby` para associar erros aos campos

### 3. Estados de Carregamento
- Use `aria-busy` para elementos em carregamento
- Use `role="status"` para indicadores de status
- Forneça texto alternativo para spinners

### 4. Navegação
- Use `role="navigation"` para menus
- Use `aria-current="page"` para indicar página atual
- Forneça `aria-label` descritivo para navegação

### 5. Conteúdo Dinâmico
- Use `aria-live` para conteúdo que muda
- Use `role="status"` para atualizações de status
- Use `role="alert"` para mensagens importantes

### 6. Modais e Diálogos
- Use `role="dialog"` e `aria-modal="true"`
- Forneça `aria-labelledby` e `aria-describedby`
- Gerencie o foco adequadamente

## Ferramentas de Teste

### 1. Jest-Axe
```tsx
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('should be accessible', async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### 2. Testing Library
```tsx
import { screen } from '@testing-library/react';

test('should have proper ARIA attributes', () => {
  render(<MyComponent />);
  
  expect(screen.getByRole('button')).toHaveAttribute('aria-busy');
  expect(screen.getByRole('textbox')).toHaveAttribute('aria-required');
});
```

### 3. Lighthouse
- Execute auditorias regulares de acessibilidade
- Verifique pontuação de acessibilidade
- Corrija problemas identificados

## Recursos Adicionais

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Resources](https://webaim.org/)
- [A11y Project](https://www.a11yproject.com/)

## Checklist de Acessibilidade

- [ ] Todos os campos de formulário têm labels
- [ ] Estados de erro são comunicados via ARIA
- [ ] Navegação tem roles e labels apropriados
- [ ] Modais gerenciam foco corretamente
- [ ] Conteúdo dinâmico usa aria-live
- [ ] Tabelas têm estrutura semântica
- [ ] Botões têm estados apropriados
- [ ] Estados de carregamento são comunicados
- [ ] Testes de acessibilidade passam
- [ ] Lighthouse acessibilidade > 90
