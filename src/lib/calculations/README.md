# IFRS 16 Calculation Engine

Este documento descreve o engine de cálculos IFRS 16 implementado no Contabilease, que realiza todos os cálculos necessários para conformidade com a norma IFRS 16 (Leases).

## Visão Geral

O engine implementa os principais cálculos requeridos pelo IFRS 16:

- **Lease Liability**: Valor presente das obrigações de pagamento futuras
- **Right-of-use Asset**: Ativo de direito de uso
- **Amortização**: Depreciação linear do ativo ao longo do prazo
- **Interest Expense**: Despesa de juros sobre o lease liability
- **Cronograma de Amortização**: Detalhamento mês a mês

## Estrutura dos Arquivos

```
src/lib/
├── schemas/
│   └── ifrs16-lease.ts          # Schemas de validação Zod
├── calculations/
│   ├── ifrs16-engine.ts         # Engine principal de cálculos
│   └── README.md                # Esta documentação
└── contracts.ts                 # Funções de API para contratos IFRS 16
```

## Como Usar

### 1. Criando um Contrato IFRS 16

```typescript
import { createIFRS16LeaseContract } from '@/lib/contracts';
import { IFRS16LeaseFormData } from '@/lib/schemas/ifrs16-lease';

const leaseData: IFRS16LeaseFormData = {
  title: 'Leasing de Equipamento',
  status: 'active',
  currency_code: 'BRL',
  lease_start_date: '2024-01-01',
  lease_end_date: '2026-12-31',
  lease_term_months: 36,
  monthly_payment: 1500,
  payment_frequency: 'monthly',
  discount_rate_annual: 8.5,
  payment_timing: 'end',
  initial_payment: 5000,
  asset_fair_value: 60000,
  initial_direct_costs: 2000,
  lease_incentives: 1000,
  guaranteed_residual_value: 10000,
};

const contract = await createIFRS16LeaseContract(leaseData);
```

### 2. Executando Cálculos

```typescript
import { calculateIFRS16Lease } from '@/lib/contracts';

const calculationResult = await calculateIFRS16Lease(contractId);
```

### 3. Usando o Engine Diretamente

```typescript
import { IFRS16CalculationEngine } from '@/lib/calculations/ifrs16-engine';

const engine = new IFRS16CalculationEngine(leaseData);

// Validar dados
const validation = engine.validateLeaseData();
if (!validation.isValid) {
  console.error('Erros:', validation.errors);
  return;
}

// Executar cálculos
const result = engine.calculateAll();

// Ou cálculos individuais
const leaseLiability = engine.calculateInitialLeaseLiability();
const rightOfUseAsset = engine.calculateInitialRightOfUseAsset();
const schedule = engine.generateAmortizationSchedule();
```

## Campos do Contrato

### Campos Obrigatórios

- `title`: Título do contrato
- `lease_start_date`: Data de início do contrato
- `lease_end_date`: Data de fim do contrato
- `lease_term_months`: Prazo em meses
- `monthly_payment`: Pagamento mensal
- `discount_rate_annual`: Taxa de desconto anual (%)

### Campos Opcionais

- `initial_payment`: Pagamento inicial
- `annual_payment`: Pagamento anual (se diferente de mensal)
- `payment_frequency`: Frequência de pagamento (monthly, quarterly, semi-annual, annual)
- `payment_timing`: Momento do pagamento (beginning, end)
- `asset_fair_value`: Valor justo do ativo
- `asset_residual_value`: Valor residual do ativo
- `initial_direct_costs`: Custos diretos iniciais
- `lease_incentives`: Incentivos de leasing
- `escalation_rate`: Taxa de reajuste anual (%)
- `guaranteed_residual_value`: Valor residual garantido
- `purchase_option_price`: Preço da opção de compra
- `purchase_option_exercisable`: Se a opção de compra é exercível
- `variable_payments`: Array de pagamentos variáveis
- `renewal_options`: Array de opções de renovação

## Cálculos Implementados

### Lease Liability

O Lease Liability é calculado como o valor presente de todos os pagamentos futuros:

```typescript
// Pagamentos mensais regulares
const monthlyPV = monthlyPayment * ((1 - (1 + monthlyRate)^-termMonths) / monthlyRate);

// Pagamento inicial (se houver)
const initialPV = initialPayment || 0;

// Valor residual garantido (se houver)
const residualPV = guaranteedResidualValue * (1 + monthlyRate)^-termMonths;

// Total
const leaseLiability = monthlyPV + initialPV + residualPV;
```

### Right-of-use Asset

O Right-of-use Asset é calculado como:

```typescript
let rightOfUseAsset = leaseLiability;

// Adicionar custos diretos iniciais
if (initialDirectCosts) {
  rightOfUseAsset += initialDirectCosts;
}

// Subtrair incentivos de leasing
if (leaseIncentives) {
  rightOfUseAsset -= leaseIncentives;
}
```

### Amortização

A amortização é calculada linearmente:

```typescript
const monthlyAmortization = rightOfUseAsset / leaseTermMonths;
```

### Interest Expense

A despesa de juros é calculada sobre o saldo do lease liability:

```typescript
const interestExpense = beginningLiability * monthlyDiscountRate;
const principalPayment = monthlyPayment - interestExpense;
```

## Exemplo Prático

```typescript
// Dados do exemplo
const exampleData = {
  title: 'Leasing de Equipamento Industrial',
  lease_start_date: '2024-01-01',
  lease_end_date: '2026-12-31',
  lease_term_months: 36,
  monthly_payment: 1500,
  discount_rate_annual: 8.5,
  payment_timing: 'end',
  initial_payment: 5000,
  initial_direct_costs: 2000,
  lease_incentives: 1000,
  guaranteed_residual_value: 10000,
};

// Executar cálculos
const engine = new IFRS16CalculationEngine(exampleData);
const result = engine.calculateAll();

console.log('Lease Liability:', result.lease_liability_initial);
console.log('Right-of-use Asset:', result.right_of_use_asset_initial);
console.log('Juros Mensais:', result.monthly_interest_expense);
console.log('Amortização Mensal:', result.monthly_amortization);
```

## Validação de Dados

O engine inclui validação automática dos dados:

```typescript
const validation = engine.validateLeaseData();

if (!validation.isValid) {
  console.error('Erros encontrados:', validation.errors);
  // Exemplo de erros:
  // - "Pagamento mensal deve ser maior que zero"
  // - "Taxa de desconto deve estar entre 0% e 100%"
  // - "Data de fim deve ser posterior à data de início"
}
```

## API Endpoints

### Criar Contrato IFRS 16

```http
POST /api/contracts
Content-Type: application/json

{
  "contract_type": "ifrs16_lease",
  "title": "Leasing de Equipamento",
  "lease_start_date": "2024-01-01",
  "lease_end_date": "2026-12-31",
  "lease_term_months": 36,
  "monthly_payment": 1500,
  "discount_rate_annual": 8.5,
  "payment_timing": "end"
}
```

### Executar Cálculos

```http
POST /api/contracts/{id}/calculate
```

### Obter Histórico de Cálculos

```http
GET /api/contracts/{id}/calculate
```

## Componentes de UI

### IFRS16LeaseForm

Formulário completo para criação de contratos IFRS 16:

```tsx
import IFRS16LeaseForm from '@/components/contracts/IFRS16LeaseForm';

<IFRS16LeaseForm
  onSubmit={handleSubmit}
  onCancel={handleCancel}
  isLoading={isLoading}
  initialData={existingData}
/>
```

### IFRS16CalculationResults

Exibição dos resultados dos cálculos:

```tsx
import IFRS16CalculationResults from '@/components/contracts/IFRS16CalculationResults';

<IFRS16CalculationResults
  calculation={calculationResult}
  currency="BRL"
/>
```

### IFRS16Example

Demonstração interativa do engine:

```tsx
import IFRS16Example from '@/components/contracts/IFRS16Example';

<IFRS16Example />
```

## Testes

O engine inclui testes abrangentes que cobrem:

- Cálculos básicos de lease liability
- Cálculos de right-of-use asset
- Cronograma de amortização
- Validação de dados
- Cenários complexos (pagamentos variáveis, valor residual, etc.)

Execute os testes com:

```bash
npm test -- __tests__/ifrs16-calculations.test.ts
```

## Conformidade IFRS 16

Este engine implementa os requisitos principais do IFRS 16:

- ✅ Reconhecimento inicial de lease liability e right-of-use asset
- ✅ Cálculo do valor presente usando taxa de desconto
- ✅ Amortização linear do right-of-use asset
- ✅ Despesa de juros sobre lease liability
- ✅ Cronograma detalhado de amortização
- ✅ Suporte a pagamentos variáveis e valor residual
- ✅ Tratamento de custos diretos iniciais e incentivos

## Limitações Atuais

- Não implementa modificações de contrato
- Não trata cenários de cessão antecipada
- Não inclui cálculos de impairment
- Não suporta contratos com múltiplos ativos

## Próximos Passos

- Implementar modificações de contrato
- Adicionar cálculos de impairment
- Suporte a contratos com múltiplos ativos
- Relatórios automatizados para auditoria
- Integração com sistemas contábeis externos
