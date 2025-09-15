-- =====================================================
-- CONTABILEASE - TABELAS PRINCIPAIS (CORE TABLES)
-- =====================================================
-- Este script cria as tabelas principais do sistema
-- Execute APÓS o script base

-- =====================================================
-- 1. TABELA COUNTRIES
-- =====================================================

CREATE TABLE IF NOT EXISTS countries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    iso_code VARCHAR(2) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    currency_code VARCHAR(3) NOT NULL,
    date_format VARCHAR(20) NOT NULL DEFAULT 'DD/MM/YYYY',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para countries
CREATE INDEX IF NOT EXISTS idx_countries_iso_code ON countries(iso_code);
CREATE INDEX IF NOT EXISTS idx_countries_is_active ON countries(is_active);

-- Trigger para updated_at
CREATE TRIGGER trg_countries_updated_at
    BEFORE UPDATE ON countries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 2. TABELA PROFILES
-- =====================================================

CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email VARCHAR(255),
    full_name VARCHAR(255),
    country_id UUID REFERENCES countries(id),
    subscription_tier VARCHAR(20) DEFAULT 'free',
    avatar_url TEXT,
    phone VARCHAR(20),
    company_name VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para profiles
CREATE INDEX IF NOT EXISTS idx_profiles_country_id ON profiles(country_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON profiles(subscription_tier);

-- Trigger para updated_at
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 3. TABELA CONTRACTS (CONSOLIDADA - RESOLVE CONFLITO 4/5)
-- =====================================================

CREATE TABLE IF NOT EXISTS contracts (
    -- Campos básicos
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    contract_type VARCHAR(50) DEFAULT 'lease',
    contract_number VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    approval_status VARCHAR(20) DEFAULT 'draft',
    
    -- Informações das partes
    lessor_name VARCHAR(255),
    lessee_name VARCHAR(255),
    currency_code VARCHAR(3),
    
    -- Campos financeiros IFRS 16 (CONSOLIDADOS)
    contract_value DECIMAL(15,2),
    contract_term_months INTEGER,
    lease_start_date DATE,
    lease_end_date DATE,
    lease_term_months INTEGER,
    
    -- Pagamentos
    initial_payment DECIMAL(15,2),
    monthly_payment DECIMAL(15,2),
    annual_payment DECIMAL(15,2),
    payment_frequency VARCHAR(20) DEFAULT 'monthly',
    payment_timing VARCHAR(10) DEFAULT 'end',
    
    -- Taxas e cálculos
    implicit_interest_rate DECIMAL(5,4),
    discount_rate_annual DECIMAL(8,4),
    discount_rate_monthly DECIMAL(8,4),
    
    -- Valores do ativo
    asset_fair_value DECIMAL(15,2),
    asset_residual_value DECIMAL(15,2),
    guaranteed_residual_value DECIMAL(15,2),
    
    -- Custos e incentivos
    initial_direct_costs DECIMAL(15,2),
    lease_incentives DECIMAL(15,2),
    
    -- Opções
    purchase_option_price DECIMAL(15,2),
    purchase_option_exercise_date DATE,
    purchase_option_exercisable BOOLEAN DEFAULT FALSE,
    
    -- Classificação
    lease_classification VARCHAR(20),
    
    -- Taxa de escalação
    escalation_rate DECIMAL(8,4),
    
    -- Aprovação
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Constraints para contracts
ALTER TABLE contracts ADD CONSTRAINT chk_contract_value_positive 
    CHECK (contract_value IS NULL OR contract_value >= 0);

ALTER TABLE contracts ADD CONSTRAINT chk_contract_term_positive 
    CHECK (contract_term_months IS NULL OR (contract_term_months >= 1 AND contract_term_months <= 600));

ALTER TABLE contracts ADD CONSTRAINT chk_interest_rate_valid 
    CHECK (implicit_interest_rate IS NULL OR (implicit_interest_rate >= 0 AND implicit_interest_rate <= 1));

ALTER TABLE contracts ADD CONSTRAINT chk_payment_frequency_valid 
    CHECK (payment_frequency IN ('monthly', 'quarterly', 'semi-annual', 'annual'));

ALTER TABLE contracts ADD CONSTRAINT chk_payment_timing_valid 
    CHECK (payment_timing IN ('beginning', 'end'));

ALTER TABLE contracts ADD CONSTRAINT chk_lease_classification_valid 
    CHECK (lease_classification IN ('operating', 'finance'));

ALTER TABLE contracts ADD CONSTRAINT chk_contract_type_valid 
    CHECK (contract_type IN ('lease', 'financing', 'service', 'other'));

ALTER TABLE contracts ADD CONSTRAINT chk_approval_status_valid 
    CHECK (approval_status IN ('draft', 'pending', 'approved', 'rejected', 'active', 'terminated'));

-- Índices para contracts
CREATE INDEX IF NOT EXISTS idx_contracts_user_id ON contracts(user_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_contract_type ON contracts(contract_type);
CREATE INDEX IF NOT EXISTS idx_contracts_approval_status ON contracts(approval_status);
CREATE INDEX IF NOT EXISTS idx_contracts_lease_dates ON contracts(lease_start_date, lease_end_date);
CREATE INDEX IF NOT EXISTS idx_contracts_contract_value ON contracts(contract_value);
CREATE INDEX IF NOT EXISTS idx_contracts_payment_frequency ON contracts(payment_frequency);

-- Trigger para updated_at
CREATE TRIGGER trg_contracts_updated_at
    BEFORE UPDATE ON contracts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. TABELAS RELACIONADAS A CONTRATOS
-- =====================================================

-- Pagamentos variáveis
CREATE TABLE IF NOT EXISTS contract_variable_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    payment_date DATE NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Opções de renovação
CREATE TABLE IF NOT EXISTS contract_renewal_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    term_months INTEGER NOT NULL,
    monthly_payment DECIMAL(15,2) NOT NULL,
    probability DECIMAL(5,2), -- 0-100
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documentos de contratos
CREATE TABLE IF NOT EXISTS contract_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    file_path VARCHAR(500),
    file_size BIGINT,
    mime_type VARCHAR(100),
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para tabelas relacionadas
CREATE INDEX IF NOT EXISTS idx_contract_variable_payments_contract_id ON contract_variable_payments(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_renewal_options_contract_id ON contract_renewal_options(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_documents_contract_id ON contract_documents(contract_id);

-- Triggers para updated_at
CREATE TRIGGER trg_contract_variable_payments_updated_at
    BEFORE UPDATE ON contract_variable_payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_contract_renewal_options_updated_at
    BEFORE UPDATE ON contract_renewal_options
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_contract_documents_updated_at
    BEFORE UPDATE ON contract_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE countries IS 'Países suportados pelo sistema com códigos ISO e configurações';
COMMENT ON TABLE profiles IS 'Perfis de usuários vinculados ao auth.users';
COMMENT ON TABLE contracts IS 'Contratos IFRS 16 com todos os campos necessários';
COMMENT ON TABLE contract_variable_payments IS 'Pagamentos variáveis de contratos';
COMMENT ON TABLE contract_renewal_options IS 'Opções de renovação de contratos';
COMMENT ON TABLE contract_documents IS 'Documentos anexos aos contratos';

-- =====================================================
-- VERIFICAÇÕES DE INTEGRIDADE
-- =====================================================

DO $$
BEGIN
    -- Verificar se as tabelas foram criadas
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'countries') THEN
        RAISE EXCEPTION 'Table countries not created';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        RAISE EXCEPTION 'Table profiles not created';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contracts') THEN
        RAISE EXCEPTION 'Table contracts not created';
    END IF;
    
    RAISE NOTICE 'Core tables migration completed successfully';
END $$;
