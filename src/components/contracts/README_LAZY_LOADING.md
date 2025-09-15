# Lazy Loading para Tabelas de Amortização

Este documento descreve a implementação de lazy loading para tabelas de amortização IFRS 16, incluindo três abordagens diferentes para otimizar a performance e experiência do usuário.

## 🚀 Componentes Implementados

### 1. AmortizationScheduleTable (Atualizado)
**Componente tradicional com suporte a lazy loading**

**Características:**
- ✅ Paginação tradicional (12 meses por página)
- ✅ Carregamento sob demanda via API
- ✅ Estados de loading e erro
- ✅ Compatibilidade com código existente
- ✅ Cache opcional

**Uso:**
```tsx
<AmortizationScheduleTable
  contractId="contract-id"
  currencyCode="BRL"
  enableLazyLoading={true}
  itemsPerPage={12}
/>
```

### 2. VirtualAmortizationTable
**Renderização virtual para grandes volumes de dados**

**Características:**
- ✅ Virtual scrolling com react-window
- ✅ Renderização eficiente de milhares de itens
- ✅ Scroll suave e responsivo
- ✅ Loading states integrados
- ✅ Cache automático

**Uso:**
```tsx
<VirtualAmortizationTable
  contractId="contract-id"
  currencyCode="BRL"
  height={600}
  itemHeight={50}
/>
```

### 3. OptimizedAmortizationTable
**Versão otimizada com cache inteligente**

**Características:**
- ✅ Cache inteligente com TTL
- ✅ Memoização de componentes
- ✅ Loading states avançados
- ✅ Indicadores de cache
- ✅ Controles de refresh

**Uso:**
```tsx
<OptimizedAmortizationTable
  contractId="contract-id"
  currencyCode="BRL"
  itemsPerPage={12}
  enableCache={true}
/>
```

## 🔧 API Endpoints

### GET /api/contracts/[id]/amortization
Retorna dados paginados da tabela de amortização.

**Parâmetros:**
- `page`: Número da página (padrão: 1)
- `limit`: Itens por página (padrão: 12)

**Resposta:**
```json
{
  "data": [...],
  "pagination": {
    "totalItems": 120,
    "totalPages": 10,
    "currentPage": 1,
    "itemsPerPage": 12,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### POST /api/contracts/[id]/amortization/summary
Retorna dados resumidos da amortização.

**Resposta:**
```json
{
  "summary": {
    "lease_liability_initial": 100000,
    "right_of_use_asset_initial": 100000,
    "total_interest_expense": 15000,
    "total_principal_payments": 85000,
    "total_lease_payments": 100000,
    "effective_interest_rate_annual": 0.05,
    "effective_interest_rate_monthly": 0.0041
  }
}
```

## 🗄️ Sistema de Cache

### AmortizationCache
Sistema de cache em memória com TTL configurável.

**Características:**
- ✅ Cache automático com TTL de 5 minutos
- ✅ Limpeza automática de entradas expiradas
- ✅ Chaves de cache estruturadas
- ✅ Estatísticas de uso

**Uso:**
```typescript
import { amortizationCache } from '@/lib/cache/amortization-cache';

// Definir cache
amortizationCache.set('key', data, 300000); // 5 minutos

// Obter cache
const cachedData = amortizationCache.get('key');

// Verificar se existe
const exists = amortizationCache.has('key');
```

## 🎣 Hook Personalizado

### useAmortizationData
Hook React para gerenciar dados de amortização com cache.

**Características:**
- ✅ Carregamento assíncrono
- ✅ Estados de loading e erro
- ✅ Cache automático
- ✅ Refresh manual
- ✅ Paginação integrada

**Uso:**
```typescript
const {
  data,
  summary,
  pagination,
  loading,
  error,
  fetchData,
  refresh,
  clearCache,
  isCached
} = useAmortizationData({
  contractId: 'contract-id',
  page: 1,
  limit: 12,
  enableCache: true,
  autoFetch: true
});
```

## 📊 Comparação de Performance

| Abordagem | Tempo de Carregamento | Uso de Memória | UX | Complexidade |
|-----------|----------------------|----------------|----|--------------| 
| Tradicional | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| Virtual | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Otimizado | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

## 🎯 Quando Usar Cada Abordagem

### Tradicional
- ✅ Datasets pequenos (< 100 itens)
- ✅ Compatibilidade com código existente
- ✅ Implementação rápida

### Virtual
- ✅ Datasets grandes (> 1000 itens)
- ✅ Performance crítica
- ✅ Scroll infinito necessário

### Otimizado
- ✅ Uso frequente dos mesmos dados
- ✅ UX premium necessária
- ✅ Cache inteligente desejado

## 🔧 Configuração

### Variáveis de Ambiente
```env
# Cache TTL em minutos
AMORTIZATION_CACHE_TTL=5

# Limpeza automática em minutos
CACHE_CLEANUP_INTERVAL=10
```

### Constantes
```typescript
export const AMORTIZATION_CONSTANTS = {
  DEFAULT_ITEMS_PER_PAGE: 12,
  MAX_PAGINATION_BUTTONS: 5,
  PAGINATION_OFFSET: 4,
  DECIMAL_PLACES: 4,
  CACHE_TTL_MINUTES: 5,
  CLEANUP_INTERVAL_MINUTES: 10,
} as const;
```

## 🚀 Exemplo Completo

Veja o componente `LazyLoadingExample` para uma demonstração completa de todas as abordagens:

```tsx
import LazyLoadingExample from '@/components/contracts/LazyLoadingExample';

<LazyLoadingExample
  contractId="your-contract-id"
  currencyCode="BRL"
/>
```

## 📈 Benefícios

1. **Performance**: Redução significativa no tempo de carregamento
2. **UX**: Estados de loading e erro bem definidos
3. **Escalabilidade**: Suporte a grandes volumes de dados
4. **Flexibilidade**: Múltiplas abordagens para diferentes cenários
5. **Manutenibilidade**: Código bem estruturado e documentado

## 🔮 Próximos Passos

- [ ] Implementar infinite scroll
- [ ] Adicionar filtros e busca
- [ ] Exportação de dados
- [ ] Métricas de performance
- [ ] Testes automatizados
