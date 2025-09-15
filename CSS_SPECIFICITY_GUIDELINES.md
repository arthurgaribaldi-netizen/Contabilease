# Diretrizes de Especificidade CSS - Contabilease

## 🎯 Objetivo
Implementar seletores CSS mais específicos para evitar conflitos futuros e garantir manutenibilidade do código.

## 📋 Problemas Identificados

### Seletores Genéricos Atuais
1. **`.container`** - Muito genérico, pode conflitar com bibliotecas externas
2. **`button`** - Seletores de elemento puro podem ser sobrescritos facilmente
3. **`h1, h2, h3, h4, h5, h6`** - Seletores de elemento sem contexto
4. **Classes de utilidade genéricas** - Como `.animate-shake`, `.tour-highlight`

### Áreas de Risco
- **Componentes UI**: Card, Button, Input podem ter conflitos
- **Layouts**: DashboardLayout, AuthForm com classes genéricas
- **Animações**: Classes de animação podem ser sobrescritas
- **Temas**: Modo escuro/claro com seletores genéricos

## 🛠️ Estratégia de Implementação

### 1. Prefixo de Namespace
```
.contabilease-{component}
```

### 2. Hierarquia de Especificidade
```
.contabilease-app .contabilease-{component} .contabilease-{element}
```

### 3. Contexto por Funcionalidade
```
.contabilease-auth .contabilease-form
.contabilease-dashboard .contabilease-card
.contabilease-contracts .contabilease-table
```

## 📝 Padrões Recomendados

### Componentes Base
```css
/* ❌ Genérico */
.container { }

/* ✅ Específico */
.contabilease-app .contabilease-container { }
```

### Elementos de Formulário
```css
/* ❌ Genérico */
button { }

/* ✅ Específico */
.contabilease-app .contabilease-button { }
.contabilease-auth .contabilease-form .contabilease-button { }
```

### Animações
```css
/* ❌ Genérico */
.animate-shake { }

/* ✅ Específico */
.contabilease-app .contabilease-animate-shake { }
```

### Estados de Tema
```css
/* ❌ Genérico */
.high-contrast .bg-white { }

/* ✅ Específico */
.contabilease-app.contabilease-high-contrast .contabilease-bg-white { }
```

## 🎨 Implementação por Componente

### 1. Layout Principal
```css
.contabilease-app {
  /* Estilos globais da aplicação */
}

.contabilease-app .contabilease-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}
```

### 2. Componentes de Autenticação
```css
.contabilease-auth {
  /* Container de autenticação */
}

.contabilease-auth .contabilease-form {
  /* Formulários de auth */
}

.contabilease-auth .contabilease-input {
  /* Inputs específicos de auth */
}
```

### 3. Dashboard
```css
.contabilease-dashboard {
  /* Container do dashboard */
}

.contabilease-dashboard .contabilease-card {
  /* Cards do dashboard */
}

.contabilease-dashboard .contabilease-metric {
  /* Métricas específicas */
}
```

### 4. Contratos IFRS 16
```css
.contabilease-contracts {
  /* Container de contratos */
}

.contabilease-contracts .contabilease-table {
  /* Tabelas de contratos */
}

.contabilease-contracts .contabilease-calculation {
  /* Cálculos específicos */
}
```

## 🔧 Migração Gradual

### Fase 1: Estilos Globais
- [ ] Atualizar `globals.css` com namespace
- [ ] Migrar seletores de elemento para classes específicas
- [ ] Implementar hierarquia de contexto

### Fase 2: Componentes UI
- [ ] Atualizar componentes base (Button, Card, Input)
- [ ] Implementar prefixos específicos
- [ ] Manter compatibilidade com Tailwind

### Fase 3: Componentes de Negócio
- [ ] Migrar componentes de autenticação
- [ ] Atualizar componentes de dashboard
- [ ] Implementar seletores específicos para contratos

### Fase 4: Animações e Estados
- [ ] Migrar animações para namespace específico
- [ ] Atualizar estados de tema
- [ ] Implementar seletores de contexto

## 📊 Benefícios Esperados

### Manutenibilidade
- ✅ Redução de conflitos CSS
- ✅ Melhor organização do código
- ✅ Facilidade para debugging

### Escalabilidade
- ✅ Suporte a múltiplos temas
- ✅ Integração com bibliotecas externas
- ✅ Reutilização de componentes

### Performance
- ✅ Redução de especificidade desnecessária
- ✅ Melhor cache de CSS
- ✅ Otimização de seletores

## 🚀 Próximos Passos

1. **Implementar namespace base** no `globals.css`
2. **Migrar componentes críticos** (Button, Card, Input)
3. **Atualizar componentes de layout** (DashboardLayout, AuthForm)
4. **Implementar seletores específicos** para contratos IFRS 16
5. **Testar compatibilidade** com Tailwind CSS
6. **Documentar padrões** para novos componentes

## 📚 Referências

- [CSS Specificity Calculator](https://specificity.keegan.st/)
- [BEM Methodology](https://getbem.com/)
- [Tailwind CSS Best Practices](https://tailwindcss.com/docs/reusing-styles)
- [CSS Architecture Guidelines](https://cssguidelin.es/)
