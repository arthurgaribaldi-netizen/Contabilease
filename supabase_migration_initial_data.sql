-- =====================================================
-- CONTABILEASE - DADOS INICIAIS E VALIDAÇÕES
-- =====================================================
-- Este script insere dados iniciais e cria validações
-- Execute APÓS as políticas RLS

-- =====================================================
-- DADOS INICIAIS - COUNTRIES
-- =====================================================

INSERT INTO countries (iso_code, name, currency_code, date_format, is_active) VALUES
-- América do Sul
('BR', 'Brasil', 'BRL', 'DD/MM/YYYY', true),
('AR', 'Argentina', 'ARS', 'DD/MM/YYYY', true),
('CL', 'Chile', 'CLP', 'DD/MM/YYYY', true),
('CO', 'Colômbia', 'COP', 'DD/MM/YYYY', true),
('PE', 'Peru', 'PEN', 'DD/MM/YYYY', true),
('UY', 'Uruguai', 'UYU', 'DD/MM/YYYY', true),
('PY', 'Paraguai', 'PYG', 'DD/MM/YYYY', true),
('BO', 'Bolívia', 'BOB', 'DD/MM/YYYY', true),
('EC', 'Equador', 'USD', 'DD/MM/YYYY', true),
('VE', 'Venezuela', 'VES', 'DD/MM/YYYY', true),
('GY', 'Guiana', 'GYD', 'DD/MM/YYYY', true),
('SR', 'Suriname', 'SRD', 'DD/MM/YYYY', true),
('GF', 'Guiana Francesa', 'EUR', 'DD/MM/YYYY', true),

-- América do Norte
('US', 'Estados Unidos', 'USD', 'MM/DD/YYYY', true),
('CA', 'Canadá', 'CAD', 'MM/DD/YYYY', true),
('MX', 'México', 'MXN', 'DD/MM/YYYY', true),

-- Europa
('ES', 'Espanha', 'EUR', 'DD/MM/YYYY', true),
('PT', 'Portugal', 'EUR', 'DD/MM/YYYY', true),
('FR', 'França', 'EUR', 'DD/MM/YYYY', true),
('DE', 'Alemanha', 'EUR', 'DD/MM/YYYY', true),
('IT', 'Itália', 'EUR', 'DD/MM/YYYY', true),
('GB', 'Reino Unido', 'GBP', 'DD/MM/YYYY', true),
('IE', 'Irlanda', 'EUR', 'DD/MM/YYYY', true),
('NL', 'Holanda', 'EUR', 'DD/MM/YYYY', true),
('BE', 'Bélgica', 'EUR', 'DD/MM/YYYY', true),
('CH', 'Suíça', 'CHF', 'DD/MM/YYYY', true),
('AT', 'Áustria', 'EUR', 'DD/MM/YYYY', true),
('SE', 'Suécia', 'SEK', 'YYYY-MM-DD', true),
('NO', 'Noruega', 'NOK', 'DD/MM/YYYY', true),
('DK', 'Dinamarca', 'DKK', 'DD/MM/YYYY', true),
('FI', 'Finlândia', 'EUR', 'DD/MM/YYYY', true),
('PL', 'Polônia', 'PLN', 'DD/MM/YYYY', true),
('CZ', 'República Tcheca', 'CZK', 'DD/MM/YYYY', true),
('HU', 'Hungria', 'HUF', 'YYYY-MM-DD', true),
('RO', 'Romênia', 'RON', 'DD/MM/YYYY', true),
('BG', 'Bulgária', 'BGN', 'DD/MM/YYYY', true),
('HR', 'Croácia', 'EUR', 'DD/MM/YYYY', true),
('SI', 'Eslovênia', 'EUR', 'DD/MM/YYYY', true),
('SK', 'Eslováquia', 'EUR', 'DD/MM/YYYY', true),
('LT', 'Lituânia', 'EUR', 'YYYY-MM-DD', true),
('LV', 'Letônia', 'EUR', 'YYYY-MM-DD', true),
('EE', 'Estônia', 'EUR', 'DD/MM/YYYY', true),
('GR', 'Grécia', 'EUR', 'DD/MM/YYYY', true),
('CY', 'Chipre', 'EUR', 'DD/MM/YYYY', true),
('MT', 'Malta', 'EUR', 'DD/MM/YYYY', true),
('LU', 'Luxemburgo', 'EUR', 'DD/MM/YYYY', true),

-- Ásia
('JP', 'Japão', 'JPY', 'YYYY/MM/DD', true),
('KR', 'Coreia do Sul', 'KRW', 'YYYY-MM-DD', true),
('CN', 'China', 'CNY', 'YYYY-MM-DD', true),
('IN', 'Índia', 'INR', 'DD/MM/YYYY', true),

-- Oceania
('AU', 'Austrália', 'AUD', 'DD/MM/YYYY', true),
('NZ', 'Nova Zelândia', 'NZD', 'DD/MM/YYYY', true),

-- África
('ZA', 'África do Sul', 'ZAR', 'YYYY/MM/DD', true),
('EG', 'Egito', 'EGP', 'DD/MM/YYYY', true),
('NG', 'Nigéria', 'NGN', 'DD/MM/YYYY', true),
('KE', 'Quênia', 'KES', 'DD/MM/YYYY', true),
('MA', 'Marrocos', 'MAD', 'DD/MM/YYYY', true),
('TN', 'Tunísia', 'TND', 'DD/MM/YYYY', true),
('DZ', 'Argélia', 'DZD', 'DD/MM/YYYY', true),
('LY', 'Líbia', 'LYD', 'DD/MM/YYYY', true),
('SD', 'Sudão', 'SDG', 'DD/MM/YYYY', true),
('ET', 'Etiópia', 'ETB', 'DD/MM/YYYY', true),
('GH', 'Gana', 'GHS', 'DD/MM/YYYY', true),
('CI', 'Costa do Marfim', 'XOF', 'DD/MM/YYYY', true),
('SN', 'Senegal', 'XOF', 'DD/MM/YYYY', true),
('ML', 'Mali', 'XOF', 'DD/MM/YYYY', true),
('BF', 'Burkina Faso', 'XOF', 'DD/MM/YYYY', true),
('NE', 'Níger', 'XOF', 'DD/MM/YYYY', true),
('TD', 'Chade', 'XAF', 'DD/MM/YYYY', true),
('CM', 'Camarões', 'XAF', 'DD/MM/YYYY', true),
('CF', 'República Centro-Africana', 'XAF', 'DD/MM/YYYY', true),
('GA', 'Gabão', 'XAF', 'DD/MM/YYYY', true),
('CG', 'Congo', 'XAF', 'DD/MM/YYYY', true),
('CD', 'República Democrática do Congo', 'CDF', 'DD/MM/YYYY', true),
('AO', 'Angola', 'AOA', 'DD/MM/YYYY', true),
('ZM', 'Zâmbia', 'ZMW', 'DD/MM/YYYY', true),
('ZW', 'Zimbábue', 'ZWL', 'DD/MM/YYYY', true),
('BW', 'Botsuana', 'BWP', 'DD/MM/YYYY', true),
('NA', 'Namíbia', 'NAD', 'DD/MM/YYYY', true),
('SZ', 'Suazilândia', 'SZL', 'DD/MM/YYYY', true),
('LS', 'Lesoto', 'LSL', 'DD/MM/YYYY', true),
('MG', 'Madagascar', 'MGA', 'DD/MM/YYYY', true),
('MU', 'Maurício', 'MUR', 'DD/MM/YYYY', true),
('SC', 'Seicheles', 'SCR', 'DD/MM/YYYY', true),
('KM', 'Comores', 'KMF', 'DD/MM/YYYY', true),
('DJ', 'Djibuti', 'DJF', 'DD/MM/YYYY', true),
('SO', 'Somália', 'SOS', 'DD/MM/YYYY', true),
('ER', 'Eritreia', 'ERN', 'DD/MM/YYYY', true),
('UG', 'Uganda', 'UGX', 'DD/MM/YYYY', true),
('RW', 'Ruanda', 'RWF', 'DD/MM/YYYY', true),
('BI', 'Burundi', 'BIF', 'DD/MM/YYYY', true),
('TZ', 'Tanzânia', 'TZS', 'DD/MM/YYYY', true),
('MW', 'Malawi', 'MWK', 'DD/MM/YYYY', true),
('MZ', 'Moçambique', 'MZN', 'DD/MM/YYYY', true)
ON CONFLICT (iso_code) DO UPDATE SET
    name = EXCLUDED.name,
    currency_code = EXCLUDED.currency_code,
    date_format = EXCLUDED.date_format,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- =====================================================
-- FUNÇÕES DE VALIDAÇÃO
-- =====================================================

-- Função para validar dados de contrato
CREATE OR REPLACE FUNCTION validate_contract_data(
    p_contract_value DECIMAL(15,2),
    p_contract_term_months INTEGER,
    p_implicit_interest_rate DECIMAL(5,4),
    p_monthly_payment DECIMAL(15,2)
) RETURNS TABLE (
    is_valid BOOLEAN,
    error_message TEXT
) AS $$
DECLARE
    validation_errors TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Validar valor do contrato
    IF p_contract_value IS NOT NULL AND p_contract_value < 0 THEN
        validation_errors := array_append(validation_errors, 'Contract value cannot be negative');
    END IF;
    
    -- Validar prazo do contrato
    IF p_contract_term_months IS NOT NULL AND (p_contract_term_months < 1 OR p_contract_term_months > 600) THEN
        validation_errors := array_append(validation_errors, 'Contract term must be between 1 and 600 months');
    END IF;
    
    -- Validar taxa de juros
    IF p_implicit_interest_rate IS NOT NULL AND (p_implicit_interest_rate < 0 OR p_implicit_interest_rate > 1) THEN
        validation_errors := array_append(validation_errors, 'Interest rate must be between 0 and 1 (0% to 100%)');
    END IF;
    
    -- Validar pagamento mensal
    IF p_monthly_payment IS NOT NULL AND p_monthly_payment < 0 THEN
        validation_errors := array_append(validation_errors, 'Monthly payment cannot be negative');
    END IF;
    
    -- Validar consistência entre valor e pagamento
    IF p_contract_value IS NOT NULL AND p_monthly_payment IS NOT NULL AND p_contract_term_months IS NOT NULL THEN
        IF p_monthly_payment * p_contract_term_months > p_contract_value * 2 THEN
            validation_errors := array_append(validation_errors, 'Total payments exceed contract value by more than 100%');
        END IF;
    END IF;
    
    -- Retornar resultado
    IF array_length(validation_errors, 1) IS NULL THEN
        RETURN QUERY SELECT true, NULL::TEXT;
    ELSE
        RETURN QUERY SELECT false, array_to_string(validation_errors, '; ');
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Função para calcular valores IFRS 16
CREATE OR REPLACE FUNCTION calculate_ifrs16_values(
    p_monthly_payment DECIMAL(15,2),
    p_contract_term_months INTEGER,
    p_discount_rate_annual DECIMAL(8,4),
    p_initial_direct_costs DECIMAL(15,2) DEFAULT 0,
    p_lease_incentives DECIMAL(15,2) DEFAULT 0
) RETURNS TABLE (
    lease_liability DECIMAL(15,2),
    right_of_use_asset DECIMAL(15,2),
    monthly_discount_rate DECIMAL(8,4),
    total_payments DECIMAL(15,2)
) AS $$
DECLARE
    monthly_rate DECIMAL(8,4);
    pv_factor DECIMAL(15,6);
    total_payments DECIMAL(15,2);
    lease_liability DECIMAL(15,2);
    right_of_use_asset DECIMAL(15,2);
BEGIN
    -- Calcular taxa mensal
    monthly_rate := p_discount_rate_annual / 12;
    
    -- Calcular total de pagamentos
    total_payments := p_monthly_payment * p_contract_term_months;
    
    -- Calcular fator de valor presente
    IF monthly_rate = 0 THEN
        pv_factor := p_contract_term_months;
    ELSE
        pv_factor := (1 - POWER(1 + monthly_rate, -p_contract_term_months)) / monthly_rate;
    END IF;
    
    -- Calcular lease liability (valor presente dos pagamentos)
    lease_liability := p_monthly_payment * pv_factor;
    
    -- Calcular right of use asset (lease liability + custos diretos - incentivos)
    right_of_use_asset := lease_liability + COALESCE(p_initial_direct_costs, 0) - COALESCE(p_lease_incentives, 0);
    
    RETURN QUERY SELECT 
        lease_liability,
        right_of_use_asset,
        monthly_rate,
        total_payments;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS DE VALIDAÇÃO
-- =====================================================

-- Trigger para validar dados antes de inserir/atualizar contratos
CREATE OR REPLACE FUNCTION validate_contract_trigger()
RETURNS TRIGGER AS $$
DECLARE
    validation_result RECORD;
BEGIN
    -- Executar validação
    SELECT * INTO validation_result
    FROM validate_contract_data(
        NEW.contract_value,
        NEW.contract_term_months,
        NEW.implicit_interest_rate,
        NEW.monthly_payment
    );
    
    -- Se inválido, gerar erro
    IF NOT validation_result.is_valid THEN
        RAISE EXCEPTION 'Contract validation failed: %', validation_result.error_message;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger de validação
CREATE TRIGGER trg_validate_contract
    BEFORE INSERT OR UPDATE ON contracts
    FOR EACH ROW EXECUTE FUNCTION validate_contract_trigger();

-- =====================================================
-- FUNÇÕES DE AUDITORIA
-- =====================================================

-- Função para registrar mudanças em contratos
CREATE OR REPLACE FUNCTION audit_contract_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Registrar mudança na auditoria
    INSERT INTO audit_trail (
        user_id,
        table_name,
        record_id,
        action,
        old_values,
        new_values
    ) VALUES (
        auth.uid(),
        'contracts',
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger de auditoria
CREATE TRIGGER trg_audit_contract_changes
    AFTER INSERT OR UPDATE OR DELETE ON contracts
    FOR EACH ROW EXECUTE FUNCTION audit_contract_changes();

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON FUNCTION validate_contract_data IS 'Valida dados de contrato antes de inserir/atualizar';
COMMENT ON FUNCTION calculate_ifrs16_values IS 'Calcula valores IFRS 16 para contratos de leasing';
COMMENT ON FUNCTION audit_contract_changes IS 'Registra mudanças em contratos para auditoria';

-- =====================================================
-- VERIFICAÇÕES DE INTEGRIDADE
-- =====================================================

DO $$
DECLARE
    country_count INTEGER;
BEGIN
    -- Verificar se os países foram inseridos
    SELECT COUNT(*) INTO country_count FROM countries WHERE is_active = true;
    
    IF country_count < 50 THEN
        RAISE EXCEPTION 'Not enough countries inserted. Expected at least 50, got %', country_count;
    END IF;
    
    -- Verificar se as funções foram criadas
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'validate_contract_data') THEN
        RAISE EXCEPTION 'Function validate_contract_data not created';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'calculate_ifrs16_values') THEN
        RAISE EXCEPTION 'Function calculate_ifrs16_values not created';
    END IF;
    
    RAISE NOTICE 'Initial data migration completed successfully. Inserted % countries.', country_count;
END $$;
