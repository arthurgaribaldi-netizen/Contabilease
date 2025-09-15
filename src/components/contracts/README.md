# Componentes de Contratos

Este diretório contém os componentes relacionados à funcionalidade de contratos de leasing.

## Componentes

### ContractForm.tsx
Formulário para criação e edição de contratos.

**Props:**
- `contract?: Contract` - Contrato para edição (opcional)
- `onSubmit: (data) => Promise<void>` - Callback para submissão do formulário
- `onCancel: () => void` - Callback para cancelamento
- `isLoading?: boolean` - Estado de carregamento

**Funcionalidades:**
- Validação de campos obrigatórios
- Suporte a criação e edição
- Estados de loading
- Tratamento de erros

### ContractList.tsx
Lista de contratos com funcionalidades de CRUD.

**Props:**
- `contracts: Contract[]` - Array de contratos
- `onEdit: (contract) => void` - Callback para edição
- `onDelete: (contract) => void` - Callback para exclusão
- `onView: (contract) => void` - Callback para visualização
- `isLoading?: boolean` - Estado de carregamento

**Funcionalidades:**
- Exibição em tabela responsiva
- Badges de status coloridos
- Modal de confirmação para exclusão
- Estado vazio quando não há contratos
- Loading state com skeleton

### ContractModal.tsx
Modal para criação/edição de contratos.

**Props:**
- `isOpen: boolean` - Estado de abertura do modal
- `onClose: () => void` - Callback para fechamento
- `contract?: Contract` - Contrato para edição (opcional)
- `onSubmit: (data) => Promise<void>` - Callback para submissão
- `isLoading?: boolean` - Estado de carregamento

**Funcionalidades:**
- Modal responsivo
- Botão de fechamento
- Integração com ContractForm

## API Endpoints

### GET /api/contracts
Lista todos os contratos do usuário autenticado.

**Resposta:**
```json
{
  "contracts": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "title": "string",
      "status": "draft|active|completed|cancelled",
      "currency_code": "string|null",
      "created_at": "ISO string",
      "updated_at": "ISO string"
    }
  ]
}
```

### POST /api/contracts
Cria um novo contrato.

**Body:**
```json
{
  "title": "string (required)",
  "status": "string (optional, default: draft)",
  "currency_code": "string (optional)"
}
```

**Resposta:**
```json
{
  "contract": {
    "id": "uuid",
    "user_id": "uuid",
    "title": "string",
    "status": "string",
    "currency_code": "string|null",
    "created_at": "ISO string",
    "updated_at": "ISO string"
  }
}
```

### GET /api/contracts/[id]
Obtém um contrato específico.

**Resposta:**
```json
{
  "contract": {
    "id": "uuid",
    "user_id": "uuid",
    "title": "string",
    "status": "string",
    "currency_code": "string|null",
    "created_at": "ISO string",
    "updated_at": "ISO string"
  }
}
```

### PUT /api/contracts/[id]
Atualiza um contrato existente.

**Body:**
```json
{
  "title": "string (optional)",
  "status": "string (optional)",
  "currency_code": "string (optional)"
}
```

**Resposta:**
```json
{
  "contract": {
    "id": "uuid",
    "user_id": "uuid",
    "title": "string",
    "status": "string",
    "currency_code": "string|null",
    "created_at": "ISO string",
    "updated_at": "ISO string"
  }
}
```

### DELETE /api/contracts/[id]
Exclui um contrato.

**Resposta:**
```json
{
  "message": "Contract deleted successfully"
}
```

## Status dos Contratos

- **draft** - Rascunho (amarelo)
- **active** - Ativo (verde)
- **completed** - Concluído (azul)
- **cancelled** - Cancelado (vermelho)

## Segurança

- Todos os endpoints requerem autenticação
- Row Level Security (RLS) implementado no banco
- Usuários só podem acessar seus próprios contratos
- Validação de dados de entrada
- Tratamento de erros padronizado

## Testes

Os testes estão localizados em `__tests__/contracts.test.ts` e cobrem:
- Função de busca de contratos
- Cenários de erro
- Estados de autenticação
