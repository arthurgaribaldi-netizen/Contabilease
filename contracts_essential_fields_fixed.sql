-- Adicionar campos essenciais que faltam na tabela contracts
-- Este script adiciona campos básicos necessários para gestão de contratos

-- Adicionar campos essenciais
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS contract_type VARCHAR(50) DEFAULT 'lease';
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS lessor_name VARCHAR(255);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS lessee_name VARCHAR(255);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS contract_number VARCHAR(100);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'draft';
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- Adicionar constraints usando blocos DO $$ para verificar existência
DO $$
BEGIN
  -- Constraint para contract_type
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'check_contract_type'
  ) THEN
    ALTER TABLE contracts ADD CONSTRAINT check_contract_type 
      CHECK (contract_type IN ('lease', 'financing', 'service', 'other'));
  END IF;

  -- Constraint para approval_status
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'check_approval_status'
  ) THEN
    ALTER TABLE contracts ADD CONSTRAINT check_approval_status 
      CHECK (approval_status IN ('draft', 'pending', 'approved', 'rejected', 'active', 'terminated'));
  END IF;
END $$;

-- Criar índices para performance (apenas se não existirem)
DO $$
BEGIN
  -- Índice para contract_type
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_contracts_contract_type'
  ) THEN
    CREATE INDEX idx_contracts_contract_type ON contracts(contract_type);
  END IF;

  -- Índice para approval_status
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_contracts_approval_status'
  ) THEN
    CREATE INDEX idx_contracts_approval_status ON contracts(approval_status);
  END IF;

  -- Índice para contract_number (se for usado para busca)
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_contracts_contract_number'
  ) THEN
    CREATE INDEX idx_contracts_contract_number ON contracts(contract_number);
  END IF;

  -- Índice para approved_by
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_contracts_approved_by'
  ) THEN
    CREATE INDEX idx_contracts_approved_by ON contracts(approved_by);
  END IF;
END $$;

-- Comentários para documentação dos campos
COMMENT ON COLUMN contracts.contract_type IS 'Tipo do contrato: lease, financing, service, other';
COMMENT ON COLUMN contracts.lessor_name IS 'Nome do locador/fornecedor';
COMMENT ON COLUMN contracts.lessee_name IS 'Nome do locatário/cliente';
COMMENT ON COLUMN contracts.contract_number IS 'Número único do contrato';
COMMENT ON COLUMN contracts.description IS 'Descrição detalhada do contrato';
COMMENT ON COLUMN contracts.approval_status IS 'Status de aprovação do contrato';
COMMENT ON COLUMN contracts.approved_by IS 'ID do usuário que aprovou o contrato';
COMMENT ON COLUMN contracts.approved_at IS 'Data e hora da aprovação do contrato';
