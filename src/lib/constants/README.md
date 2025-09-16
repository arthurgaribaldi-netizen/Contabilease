# Constantes de Validação e Limites

Este diretório contém todas as constantes utilizadas no projeto Contabilease para substituir magic numbers e centralizar valores de configuração.

## Arquivo: `validation-limits.ts`

### CONTRACT_LIMITS
Constantes relacionadas à validação de contratos:
- **TITLE_MIN_LENGTH**: Comprimento mínimo do título (1)
- **TITLE_MAX_LENGTH**: Comprimento máximo do título (200)
- **CURRENCY_CODE_LENGTH**: Comprimento do código da moeda (3)
- **TERM_MIN_MONTHS**: Prazo mínimo em meses (1)
- **TERM_MAX_MONTHS**: Prazo máximo em meses (600 = 50 anos)
- **TERM_TYPICAL_MIN_MONTHS**: Prazo típico mínimo (12 meses)
- **TERM_TYPICAL_MAX_MONTHS**: Prazo típico máximo (120 meses)
- **INTEREST_RATE_MIN**: Taxa de juros mínima (0%)
- **INTEREST_RATE_MAX**: Taxa de juros máxima (100%)
- **DISCOUNT_RATE_TYPICAL_MIN**: Taxa de desconto típica mínima (1%)
- **DISCOUNT_RATE_TYPICAL_MAX**: Taxa de desconto típica máxima (25%)
- **PAYMENT_MIN**: Valor mínimo de pagamento (0)
- **PAYMENT_MAX_REASONABLE**: Valor máximo razoável (1.000.000)
- **RESIDUAL_VALUE_MAX_RATIO**: Razão máxima do valor residual (30%)
- **PURCHASE_OPTION_MAX_RATIO**: Razão máxima da opção de compra (50%)
- **PURCHASE_OPTION_FINANCE_LEASE_RATIO**: Razão para leasing financeiro (10%)
- **RENEWAL_PROBABILITY_THRESHOLD**: Limiar de probabilidade de renovação (50%)

### IFRS16_EXCEPTION_THRESHOLDS
Constantes para exceções do IFRS 16:
- **SHORT_TERM_MAX_MONTHS**: Máximo de meses para contrato de curto prazo (12)
- **LOW_VALUE_THRESHOLDS**: Limiares de baixo valor por moeda

### UI_CONSTANTS
Constantes de interface do usuário:
- **TOAST_DURATION**: Duração do toast (5000ms)
- **ANIMATION_DURATION_SHORT**: Duração curta de animação (100ms)
- **ANIMATION_DURATION_MEDIUM**: Duração média de animação (300ms)
- **ANIMATION_DURATION_LONG**: Duração longa de animação (500ms)
- **PROGRESS_BAR_MAX**: Valor máximo da barra de progresso (100)
- **Z_INDEX_TOAST**: Z-index do toast (50)
- **Z_INDEX_MODAL**: Z-index do modal (100)
- **Z_INDEX_DROPDOWN**: Z-index do dropdown (200)

### PERFORMANCE_CONSTANTS
Constantes de performance:
- **CACHE_MAX_SIZE**: Tamanho máximo do cache (100)
- **CACHE_TTL_MINUTES**: TTL do cache em minutos (5)
- **CACHE_MAX_AGE_MINUTES**: Idade máxima do cache em minutos (30)
- **TELEMETRY_BATCH_SIZE**: Tamanho do lote de telemetria (100)
- **TELEMETRY_COOLDOWN_SECONDS**: Cooldown da telemetria em segundos (600)
- **MEMORY_THRESHOLD_MB**: Limiar de memória em MB (100)
- **SEARCH_DEBOUNCE_MS**: Debounce da busca em ms (300)
- **FORM_DEBOUNCE_MS**: Debounce do formulário em ms (500)

### BUSINESS_METRICS_CONSTANTS
Constantes de métricas de negócio:
- **PERCENTAGE_MULTIPLIER**: Multiplicador de porcentagem (100)
- **SCORE_EXCELLENT**: Score excelente (75)
- **SCORE_GOOD**: Score bom (50)
- **SCORE_WARNING**: Score de aviso (25)
- **MONTHS_PER_YEAR**: Meses por ano (12)
- **DAYS_PER_YEAR**: Dias por ano (365)
- **DAYS_PER_MONTH**: Dias por mês (30)
- **AUDIT_INTERVAL_DAYS**: Intervalo de auditoria em dias (90)

### ESG_CONSTANTS
Constantes ESG e sustentabilidade:
- **SCORE_MIN**: Score mínimo (0)
- **SCORE_MAX**: Score máximo (100)
- **SCORE_BASE**: Score base (50)
- **CARBON_INTENSITY_TARGET**: Meta de intensidade de carbono (50)
- **WATER_CONSERVATION_TARGET**: Meta de conservação de água (100)
- **CARBON_MULTIPLIER**: Multiplicador de carbono (1000)
- **PRECISION_DECIMALS**: Decimais de precisão (100)

### BLOCKCHAIN_CONSTANTS
Constantes de blockchain:
- **INTEGRITY_SCORE_MAX**: Score máximo de integridade (100)
- **INTEGRITY_SCORE_PERFECT**: Score perfeito de integridade (100)
- **VERIFICATION_THRESHOLD**: Limiar de verificação (0.8)

### AI_AUTOMATION_CONSTANTS
Constantes de automação IA:
- **CONFIDENCE_MAX**: Confiança máxima (100)
- **CONFIDENCE_HIGH**: Confiança alta (80)
- **CONFIDENCE_MEDIUM**: Confiança média (50)
- **RISK_SCORE_HIGH**: Score de risco alto (50)
- **RISK_SCORE_MEDIUM**: Score de risco médio (25)
- **RISK_SCORE_LOW**: Score de risco baixo (10)
- **MILLISECONDS_PER_DAY**: Milissegundos por dia
- **HIGH_VALUE_THRESHOLD**: Limiar de alto valor (100.000)

### SENSITIVITY_CONSTANTS
Constantes de análise de sensibilidade:
- **EARLY_TERMINATION_PROBABILITY**: Probabilidade de rescisão antecipada (5)
- **MARKET_CRASH_PROBABILITY**: Probabilidade de crash do mercado (3)
- **MARKET_CRASH_RATE_INCREASE**: Aumento da taxa de crash do mercado (5)
- **EARLY_TERMINATION_MONTHS**: Meses de rescisão antecipada (12)

### DATE_CONSTANTS
Constantes de data e tempo:
- **MILLISECONDS_PER_SECOND**: Milissegundos por segundo (1000)
- **MILLISECONDS_PER_MINUTE**: Milissegundos por minuto
- **MILLISECONDS_PER_HOUR**: Milissegundos por hora
- **MILLISECONDS_PER_DAY**: Milissegundos por dia
- **MILLISECONDS_PER_WEEK**: Milissegundos por semana
- **MILLISECONDS_PER_MONTH**: Milissegundos por mês
- **MILLISECONDS_PER_YEAR**: Milissegundos por ano
- **DATE_TOLERANCE_DAYS**: Tolerância de data em dias (1)

### VALIDATION_CONSTANTS
Constantes de validação:
- **DATE_TOLERANCE_MONTHS**: Tolerância de data em meses (1)
- **BUILDING_ASSET_TYPES**: Tipos de ativos imobiliários
- **THRESHOLD_DOUBLE_CHECK**: Verificação dupla de limiar (2)

## Como Usar

```typescript
import { CONTRACT_LIMITS, UI_CONSTANTS } from '@/lib/constants/validation-limits';

// Ou importar tudo
import { CONTRACT_LIMITS, UI_CONSTANTS, PERFORMANCE_CONSTANTS } from '@/lib/constants';
```

## Benefícios

1. **Manutenibilidade**: Valores centralizados facilitam mudanças
2. **Consistência**: Mesmos valores em todo o projeto
3. **Legibilidade**: Nomes descritivos em vez de números mágicos
4. **Testabilidade**: Fácil de mockar em testes
5. **Documentação**: Valores auto-documentados
6. **Type Safety**: Constantes tipadas com TypeScript
