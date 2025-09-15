# 📋 Guia de Qualidade de Código - Contabilease

Este documento descreve as regras e padrões de qualidade de código implementados no projeto Contabilease.

## 🎯 Objetivos

- **Consistência**: Código uniforme e previsível
- **Manutenibilidade**: Fácil de entender e modificar
- **Confiabilidade**: Redução de bugs e erros
- **Performance**: Código otimizado e eficiente
- **Acessibilidade**: Interface acessível para todos os usuários

## 🛠️ Ferramentas de Qualidade

### ESLint
- **Configuração**: `.eslintrc.js`
- **Regras**: TypeScript, React, Acessibilidade
- **Comandos**:
  ```bash
  npm run lint          # Verificação básica
  npm run lint:fix      # Correção automática
  npm run lint:strict   # Verificação rigorosa
  ```

### Prettier
- **Configuração**: `.prettierrc`
- **Formatação**: Automática e consistente
- **Comandos**:
  ```bash
  npm run format        # Formatar código
  npm run format:check  # Verificar formatação
  ```

### TypeScript
- **Configuração**: `tsconfig.json`
- **Modo**: Strict com verificações rigorosas
- **Comandos**:
  ```bash
  npm run type-check    # Verificação de tipos
  ```

### Jest
- **Configuração**: `jest.config.js`
- **Cobertura**: Mínima de 80% global
- **Comandos**:
  ```bash
  npm run test          # Executar testes
  npm run test:coverage # Cobertura de testes
  ```

## 📏 Regras de Qualidade

### Complexidade
- **Máxima complexidade ciclomática**: 8
- **Profundidade máxima**: 4 níveis
- **Linhas por função**: Máximo 40
- **Parâmetros por função**: Máximo 4

### Código
- **Sem `console.log`** em produção
- **Sem `any`** explícito
- **Sem números mágicos** (exceto 0, 1, -1, 2, 10, 100, 1000)
- **Uso de template literals** preferido
- **Destructuring** obrigatório quando possível

### React
- **Keys únicas** em listas
- **Hooks** seguindo as regras
- **Componentes** com PascalCase
- **Props** tipadas corretamente
- **Fragmentos** sintáticos preferidos

### Acessibilidade
- **Alt text** em imagens
- **Labels** em formulários
- **ARIA** attributes quando necessário
- **Navegação** por teclado
- **Contraste** adequado

## 🔄 Workflow de Qualidade

### Pre-commit
1. **Lint-staged** executa verificações
2. **ESLint** corrige problemas automaticamente
3. **Prettier** formata o código
4. **TypeScript** verifica tipos
5. **Testes** executam se necessário

### CI/CD
1. **Type checking** rigoroso
2. **Linting** sem warnings
3. **Testes** com cobertura mínima
4. **Build** sem erros
5. **Audit** de segurança

## 📊 Métricas de Qualidade

### Cobertura de Testes
- **Global**: 80% mínimo
- **Bibliotecas críticas**: 90% mínimo
- **Componentes**: 85% mínimo

### Performance
- **Bundle size**: Máximo 500kb inicial
- **Chunk size**: Máximo 200kb
- **First Contentful Paint**: Máximo 2s
- **Largest Contentful Paint**: Máximo 2.5s

### Segurança
- **Audit** obrigatório
- **Dependências** atualizadas
- **Vulnerabilidades** bloqueiam deploy

## 🚀 Comandos Úteis

### Verificação Completa
```bash
npm run quality-check        # Verificação completa
npm run quality-check:quick  # Verificação rápida
npm run quality-check:fix    # Correção automática
```

### Desenvolvimento
```bash
npm run dev                  # Desenvolvimento
npm run type-check:watch     # Type checking contínuo
npm run test:watch          # Testes contínuos
```

### Manutenção
```bash
npm run audit               # Auditoria de segurança
npm run audit:fix           # Correção automática
npm run security-check      # Verificação rigorosa
```

## 📝 Padrões de Código

### Nomenclatura
- **Variáveis**: camelCase
- **Funções**: camelCase
- **Componentes**: PascalCase
- **Constantes**: UPPER_SNAKE_CASE
- **Interfaces**: PascalCase com prefixo I
- **Types**: PascalCase

### Estrutura
- **Imports**: Ordenados e agrupados
- **Exports**: Named exports preferidos
- **Comentários**: JSDoc para funções públicas
- **Arquivos**: Um componente por arquivo

### Tratamento de Erros
- **Try-catch** para operações assíncronas
- **Validação** de entrada com Zod
- **Logging** estruturado
- **Fallbacks** para UI

## 🔧 Configuração do Editor

### VSCode
- **Extensões**: Configuradas em `.vscode/extensions.json`
- **Settings**: Configurados em `.vscode/settings.json`
- **Formatação**: Automática ao salvar
- **Linting**: Em tempo real

### Outros Editores
- **EditorConfig**: Configuração universal
- **Prettier**: Formatação consistente
- **ESLint**: Linting padrão

## 📚 Recursos Adicionais

### Documentação
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)
- [TypeScript Config](https://www.typescriptlang.org/tsconfig)
- [Jest Configuration](https://jestjs.io/docs/configuration)

### Ferramentas
- [Husky](https://typicode.github.io/husky/)
- [lint-staged](https://github.com/okonet/lint-staged)
- [EditorConfig](https://editorconfig.org/)

## 🆘 Resolução de Problemas

### Erros Comuns
1. **ESLint errors**: Execute `npm run lint:fix`
2. **TypeScript errors**: Verifique tipos e imports
3. **Prettier conflicts**: Execute `npm run format`
4. **Test failures**: Verifique cobertura e mocks

### Contato
Para dúvidas sobre qualidade de código, consulte:
- **Documentação** do projeto
- **Issues** no repositório
- **Equipe** de desenvolvimento

---

**Última atualização**: Janeiro 2025
**Versão**: 1.0.0
