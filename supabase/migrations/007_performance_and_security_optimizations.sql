-- =====================================================
-- CONTABILEASE - OTIMIZAÇÕES DE PERFORMANCE E SEGURANÇA
-- =====================================================
-- Este script implementa otimizações críticas de performance
-- e melhorias de segurança adicionais
-- Versão: 7.0.0
-- Data: 2025-01-27

-- Iniciar transação para garantir atomicidade
BEGIN;

-- =====================================================
-- 1. VERIFICAÇÕES PRÉ-MIGRAÇÃO
-- =====================================================

-- Verificar se migrações anteriores foram executadas
DO $$
DECLARE
    required_migrations TEXT[] := ARRAY['0.0.0', '1.0.0', '2.0.0', '3.0.0', '4.0.0', '5.0.0', '6.0.0'];
    missing_migrations TEXT[] := ARRAY[]::TEXT[];
    migration_version TEXT;
BEGIN
    FOREACH migration_version IN ARRAY required_migrations LOOP
        IF NOT EXISTS (
            SELECT 1 FROM schema_migrations 
            WHERE version = migration_version
        ) THEN
            missing_migrations := array_append(missing_migrations, migration_version);
        END IF;
    END LOOP;
    
    IF array_length(missing_migrations, 1) > 0 THEN
        RAISE EXCEPTION 'Required migrations missing: %', array_to_string(missing_migrations, ', ');
    END IF;
    
    RAISE NOTICE 'Pre-migration dependency checks completed';
END $$;

-- =====================================================
-- 2. OTIMIZAÇÕES DE PERFORMANCE
-- =====================================================

-- Índices compostos otimizados para queries frequentes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contracts_user_status_type 
ON contracts(user_id, status, contract_type) 
WHERE status IN ('active', 'draft', 'pending');

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contracts_financial_values 
ON contracts(contract_value, monthly_payment, lease_term_months) 
WHERE contract_value IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_logs_recent_critical 
ON security_logs(created_at, severity, event_type) 
WHERE severity IN ('critical', 'high') 
AND created_at >= NOW() - INTERVAL '30 days';

-- Índices parciais para dados específicos
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_permissions_active_contracts 
ON user_permissions(user_id, resource_id) 
WHERE resource_type = 'contract' 
AND is_active = true 
AND (expires_at IS NULL OR expires_at > NOW());

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contracts_lease_dates_active 
ON contracts(lease_start_date, lease_end_date) 
WHERE status = 'active' 
AND lease_start_date IS NOT NULL;

-- =====================================================
-- 3. FUNÇÕES DE PERFORMANCE MELHORADAS
-- =====================================================

-- Função otimizada para buscar contratos do usuário
CREATE OR REPLACE FUNCTION get_user_contracts(
    p_user_id UUID,
    p_status VARCHAR(20) DEFAULT NULL,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
) RETURNS TABLE (
    id UUID,
    title VARCHAR(200),
    contract_type VARCHAR(50),
    status VARCHAR(20),
    contract_value DECIMAL(15,2),
    monthly_payment DECIMAL(15,2),
    lease_term_months INTEGER,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.title,
        c.contract_type,
        c.status,
        c.contract_value,
        c.monthly_payment,
        c.lease_term_months,
        c.created_at
    FROM contracts c
    WHERE c.user_id = p_user_id
    AND (p_status IS NULL OR c.status = p_status)
    ORDER BY c.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para estatísticas de contratos
CREATE OR REPLACE FUNCTION get_contract_statistics(p_user_id UUID)
RETURNS TABLE (
    total_contracts BIGINT,
    active_contracts BIGINT,
    total_value DECIMAL(15,2),
    average_monthly_payment DECIMAL(15,2),
    contracts_by_type JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_contracts,
        COUNT(*) FILTER (WHERE status = 'active') as active_contracts,
        SUM(contract_value) as total_value,
        AVG(monthly_payment) as average_monthly_payment,
        jsonb_object_agg(contract_type, type_count) as contracts_by_type
    FROM (
        SELECT 
            contract_type,
            COUNT(*) as type_count
        FROM contracts 
        WHERE user_id = p_user_id
        GROUP BY contract_type
    ) type_stats
    CROSS JOIN (
        SELECT COUNT(*) FROM contracts WHERE user_id = p_user_id
    ) total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. MELHORIAS DE SEGURANÇA
-- =====================================================

-- Função para verificar rate limiting
CREATE OR REPLACE FUNCTION check_rate_limit(
    p_identifier VARCHAR(255),
    p_endpoint VARCHAR(255),
    p_limit INTEGER DEFAULT 100,
    p_window_minutes INTEGER DEFAULT 60
) RETURNS BOOLEAN AS $$
DECLARE
    current_count INTEGER;
    window_start TIMESTAMPTZ;
BEGIN
    window_start := NOW() - INTERVAL '1 minute' * p_window_minutes;
    
    -- Contar requisições na janela atual
    SELECT COALESCE(SUM(request_count), 0) INTO current_count
    FROM rate_limits
    WHERE identifier = p_identifier
    AND endpoint = p_endpoint
    AND window_start >= window_start;
    
    -- Se excedeu o limite, retornar false
    IF current_count >= p_limit THEN
        -- Log do rate limit excedido
        PERFORM log_security_event(
            'rate_limit_exceeded',
            'medium',
            NULL,
            jsonb_build_object(
                'identifier', p_identifier,
                'endpoint', p_endpoint,
                'current_count', current_count,
                'limit', p_limit
            )
        );
        RETURN false;
    END IF;
    
    -- Registrar nova requisição
    INSERT INTO rate_limits (identifier, endpoint, request_count, window_start, window_end)
    VALUES (p_identifier, p_endpoint, 1, NOW(), NOW() + INTERVAL '1 minute' * p_window_minutes)
    ON CONFLICT (identifier, endpoint, window_start)
    DO UPDATE SET 
        request_count = rate_limits.request_count + 1,
        updated_at = NOW();
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para auditoria de mudanças críticas
CREATE OR REPLACE FUNCTION audit_critical_changes()
RETURNS TRIGGER AS $$
DECLARE
    old_values JSONB;
    new_values JSONB;
    critical_fields TEXT[] := ARRAY['contract_value', 'monthly_payment', 'lease_term_months', 'status'];
    field_name TEXT;
    has_critical_change BOOLEAN := false;
BEGIN
    -- Verificar se há mudanças em campos críticos
    FOREACH field_name IN ARRAY critical_fields LOOP
        IF TG_OP = 'UPDATE' AND (
            (OLD IS NOT NULL AND NEW IS NOT NULL AND 
             COALESCE(OLD::jsonb->>field_name, '') != COALESCE(NEW::jsonb->>field_name, '')) OR
            (OLD IS NULL AND NEW IS NOT NULL) OR
            (OLD IS NOT NULL AND NEW IS NULL)
        ) THEN
            has_critical_change := true;
            EXIT;
        END IF;
    END LOOP;
    
    -- Se há mudança crítica, registrar na auditoria
    IF has_critical_change THEN
        INSERT INTO audit_trail (
            user_id,
            table_name,
            record_id,
            action,
            old_values,
            new_values,
            ip_address
        ) VALUES (
            auth.uid(),
            TG_TABLE_NAME,
            COALESCE(NEW.id, OLD.id),
            TG_OP,
            CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
            CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END,
            inet_client_addr()
        );
        
        -- Log de segurança para mudanças críticas
        PERFORM log_security_event(
            'critical_data_change',
            'high',
            auth.uid(),
            jsonb_build_object(
                'table', TG_TABLE_NAME,
                'record_id', COALESCE(NEW.id, OLD.id),
                'action', TG_OP,
                'changed_fields', critical_fields
            )
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar trigger de auditoria crítica
DROP TRIGGER IF EXISTS trg_audit_critical_contracts ON contracts;
CREATE TRIGGER trg_audit_critical_contracts
    AFTER INSERT OR UPDATE OR DELETE ON contracts
    FOR EACH ROW EXECUTE FUNCTION audit_critical_changes();

-- =====================================================
-- 5. VIEWS OTIMIZADAS PARA RELATÓRIOS
-- =====================================================

-- View para contratos ativos com informações resumidas
CREATE OR REPLACE VIEW active_contracts_summary AS
SELECT 
    c.id,
    c.title,
    c.contract_type,
    c.contract_value,
    c.monthly_payment,
    c.lease_term_months,
    c.lease_start_date,
    c.lease_end_date,
    c.user_id,
    p.full_name as user_name,
    p.company_name,
    c.created_at,
    c.updated_at
FROM contracts c
JOIN profiles p ON c.user_id = p.id
WHERE c.status = 'active'
AND c.contract_value IS NOT NULL;

-- View para métricas de segurança
CREATE OR REPLACE VIEW security_dashboard AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    COUNT(*) as total_events,
    COUNT(*) FILTER (WHERE severity = 'critical') as critical_events,
    COUNT(*) FILTER (WHERE severity = 'high') as high_events,
    COUNT(*) FILTER (WHERE severity = 'medium') as medium_events,
    COUNT(*) FILTER (WHERE severity = 'low') as low_events,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT ip_address) as unique_ips
FROM security_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- =====================================================
-- 6. PERMISSÕES E COMENTÁRIOS
-- =====================================================

-- Conceder permissões
GRANT EXECUTE ON FUNCTION get_user_contracts TO authenticated;
GRANT EXECUTE ON FUNCTION get_contract_statistics TO authenticated;
GRANT EXECUTE ON FUNCTION check_rate_limit TO service_role;

GRANT SELECT ON active_contracts_summary TO authenticated;
GRANT SELECT ON security_dashboard TO service_role;

-- Comentários
COMMENT ON FUNCTION get_user_contracts IS 'Otimizada para buscar contratos do usuário com paginação';
COMMENT ON FUNCTION get_contract_statistics IS 'Retorna estatísticas agregadas dos contratos do usuário';
COMMENT ON FUNCTION check_rate_limit IS 'Verifica e aplica rate limiting para endpoints';
COMMENT ON FUNCTION audit_critical_changes IS 'Auditoria automática para mudanças em campos críticos';
COMMENT ON VIEW active_contracts_summary IS 'Resumo de contratos ativos com informações do usuário';
COMMENT ON VIEW security_dashboard IS 'Dashboard de métricas de segurança';

-- =====================================================
-- 7. VERIFICAÇÕES PÓS-MIGRAÇÃO
-- =====================================================

DO $$
DECLARE
    index_count INTEGER;
    function_count INTEGER;
    view_count INTEGER;
BEGIN
    -- Verificar índices criados
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes 
    WHERE tablename IN ('contracts', 'security_logs', 'user_permissions')
    AND indexname LIKE 'idx_%';
    
    IF index_count < 15 THEN
        RAISE WARNING 'Expected at least 15 indexes, got %', index_count;
    END IF;
    
    -- Verificar funções criadas
    SELECT COUNT(*) INTO function_count
    FROM pg_proc 
    WHERE proname IN ('get_user_contracts', 'get_contract_statistics', 'check_rate_limit', 'audit_critical_changes');
    
    IF function_count < 4 THEN
        RAISE EXCEPTION 'Not all performance functions were created. Expected 4, got %', function_count;
    END IF;
    
    -- Verificar views criadas
    SELECT COUNT(*) INTO view_count
    FROM information_schema.views 
    WHERE table_name IN ('active_contracts_summary', 'security_dashboard');
    
    IF view_count < 2 THEN
        RAISE EXCEPTION 'Not all views were created. Expected 2, got %', view_count;
    END IF;
    
    RAISE NOTICE 'Performance and security optimizations completed successfully';
END $$;

-- =====================================================
-- 8. REGISTRAR MIGRAÇÃO
-- =====================================================

-- Registrar esta migração
INSERT INTO schema_migrations (version, description, applied_at) 
VALUES ('7.0.0', 'Performance and security optimizations', NOW())
ON CONFLICT (version) DO UPDATE SET
    description = EXCLUDED.description,
    applied_at = EXCLUDED.applied_at;

-- Log da migração bem-sucedida
SELECT log_security_event(
    'migration_completed',
    'low',
    NULL,
    jsonb_build_object(
        'version', '7.0.0',
        'description', 'Performance and security optimizations',
        'indexes_created', 5,
        'functions_created', 4,
        'views_created', 2
    )
);

-- Finalizar transação
COMMIT;
