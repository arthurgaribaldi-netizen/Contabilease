-- =====================================================
-- CONTABILEASE - MELHORIAS DE SEGURANÇA E ROBUSTEZ
-- =====================================================
-- Este script implementa melhorias críticas de segurança
-- para evitar erros e queries destrutivas
-- Versão: 4.0.0
-- Data: 2025-01-27

-- Iniciar transação para garantir atomicidade
BEGIN;

-- =====================================================
-- 1. VERIFICAÇÕES PRÉ-MIGRAÇÃO
-- =====================================================

-- Verificar se migrações anteriores foram executadas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contracts') THEN
        RAISE EXCEPTION 'Previous migration required: contracts table not found';
    END IF;
    
    -- Verificar se a migração base foi executada
    IF NOT EXISTS (SELECT 1 FROM schema_migrations WHERE version = '0.0.0') THEN
        RAISE EXCEPTION 'Base migration (0.0.0) must be executed first';
    END IF;
    
    RAISE NOTICE 'Pre-migration checks passed';
END $$;

-- =====================================================
-- 2. TABELA DE CONTROLE DE MIGRAÇÕES (JÁ CRIADA NA MIGRAÇÃO BASE)
-- =====================================================

-- A tabela schema_migrations já foi criada na migração base (0.0.0)
-- Apenas criar índice se não existir
CREATE INDEX IF NOT EXISTS idx_schema_migrations_applied_at ON schema_migrations(applied_at);

-- =====================================================
-- 3. FUNÇÃO MELHORADA DE BACKUP SEGURO
-- =====================================================

CREATE OR REPLACE FUNCTION create_safe_backup(
    source_table TEXT,
    backup_suffix TEXT DEFAULT NULL
) RETURNS TEXT AS $$
DECLARE
    backup_table_name TEXT;
    row_count INTEGER;
BEGIN
    -- Gerar nome do backup
    IF backup_suffix IS NULL THEN
        backup_suffix := to_char(NOW(), 'YYYY_MM_DD_HH24_MI_SS');
    END IF;
    
    backup_table_name := source_table || '_backup_' || backup_suffix;
    
    -- Verificar se tabela existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = source_table) THEN
        RAISE EXCEPTION 'Source table % does not exist', source_table;
    END IF;
    
    -- Criar backup
    EXECUTE format('CREATE TABLE %I AS SELECT * FROM %I', backup_table_name, source_table);
    
    -- Verificar se backup foi criado
    EXECUTE format('SELECT COUNT(*) FROM %I', backup_table_name) INTO row_count;
    
    -- Log da operação
    PERFORM log_security_event(
        'safe_backup_created',
        'low',
        NULL,
        jsonb_build_object(
            'source_table', source_table,
            'backup_table', backup_table_name,
            'row_count', row_count
        )
    );
    
    RETURN backup_table_name;
    
EXCEPTION
    WHEN OTHERS THEN
        PERFORM log_security_event(
            'backup_failed',
            'critical',
            NULL,
            jsonb_build_object(
                'source_table', source_table,
                'error', SQLERRM
            )
        );
        RAISE EXCEPTION 'Backup failed for table %: %', source_table, SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. FUNÇÃO MELHORADA DE LIMPEZA SEGURA
-- =====================================================

CREATE OR REPLACE FUNCTION safe_cleanup_old_data()
RETURNS TABLE (
    table_name TEXT,
    deleted_count INTEGER,
    backup_created BOOLEAN,
    cleanup_type TEXT,
    execution_time INTERVAL
) AS $$
DECLARE
    result RECORD;
    start_time TIMESTAMPTZ;
    end_time TIMESTAMPTZ;
    backup_table_name TEXT;
BEGIN
    start_time := NOW();
    
    -- Limpeza de security_logs com backup
    BEGIN
        backup_table_name := create_safe_backup('security_logs', 'cleanup_' || to_char(NOW(), 'YYYY_MM_DD'));
        
        DELETE FROM security_logs 
        WHERE created_at < NOW() - INTERVAL '90 days';
        
        GET DIAGNOSTICS result.deleted_count = ROW_COUNT;
        result.table_name := 'security_logs';
        result.backup_created := true;
        result.cleanup_type := 'safe_logs_cleanup';
        result.execution_time := NOW() - start_time;
        
        RETURN NEXT result;
        
    EXCEPTION
        WHEN OTHERS THEN
            PERFORM log_security_event(
                'cleanup_error',
                'critical',
                NULL,
                jsonb_build_object('table', 'security_logs', 'error', SQLERRM)
            );
            RAISE;
    END;
    
    -- Limpeza de rate_limits (sem backup - dados temporários)
    BEGIN
        start_time := NOW();
        
        DELETE FROM rate_limits 
        WHERE window_end < NOW();
        
        GET DIAGNOSTICS result.deleted_count = ROW_COUNT;
        result.table_name := 'rate_limits';
        result.backup_created := false;
        result.cleanup_type := 'rate_limits_cleanup';
        result.execution_time := NOW() - start_time;
        
        RETURN NEXT result;
        
    EXCEPTION
        WHEN OTHERS THEN
            PERFORM log_security_event(
                'cleanup_error',
                'high',
                NULL,
                jsonb_build_object('table', 'rate_limits', 'error', SQLERRM)
            );
            RAISE;
    END;
    
    -- Limpeza de session_logs com backup
    BEGIN
        start_time := NOW();
        backup_table_name := create_safe_backup('session_logs', 'cleanup_' || to_char(NOW(), 'YYYY_MM_DD'));
        
        DELETE FROM session_logs 
        WHERE is_active = false AND logout_at < NOW() - INTERVAL '30 days';
        
        GET DIAGNOSTICS result.deleted_count = ROW_COUNT;
        result.table_name := 'session_logs';
        result.backup_created := true;
        result.cleanup_type := 'sessions_cleanup';
        result.execution_time := NOW() - start_time;
        
        RETURN NEXT result;
        
    EXCEPTION
        WHEN OTHERS THEN
            PERFORM log_security_event(
                'cleanup_error',
                'critical',
                NULL,
                jsonb_build_object('table', 'session_logs', 'error', SQLERRM)
            );
            RAISE;
    END;
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. FUNÇÃO DE VALIDAÇÃO DE DEPENDÊNCIAS MELHORADA
-- =====================================================

CREATE OR REPLACE FUNCTION validate_migration_dependencies()
RETURNS TABLE (
    dependency_name TEXT,
    status TEXT,
    details TEXT
) AS $$
DECLARE
    required_tables TEXT[] := ARRAY['user_permissions', 'contracts', 'profiles', 'countries', 'security_logs'];
    required_functions TEXT[] := ARRAY['log_security_event', 'update_updated_at_column'];
    table_name TEXT;
    func_name TEXT;
    table_exists BOOLEAN;
    func_exists BOOLEAN;
BEGIN
    -- Verificar tabelas obrigatórias
    FOREACH table_name IN ARRAY required_tables LOOP
        SELECT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = table_name AND table_schema = 'public'
        ) INTO table_exists;
        
        IF table_exists THEN
            RETURN QUERY SELECT table_name, 'OK', 'Table exists';
        ELSE
            RETURN QUERY SELECT table_name, 'ERROR', 'Table missing';
        END IF;
    END LOOP;
    
    -- Verificar funções obrigatórias
    FOREACH func_name IN ARRAY required_functions LOOP
        SELECT EXISTS (
            SELECT 1 FROM pg_proc 
            WHERE proname = func_name AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        ) INTO func_exists;
        
        IF func_exists THEN
            RETURN QUERY SELECT func_name, 'OK', 'Function exists';
        ELSE
            RETURN QUERY SELECT func_name, 'ERROR', 'Function missing';
        END IF;
    END LOOP;
    
    -- Verificar extensões
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto') THEN
        RETURN QUERY SELECT 'pgcrypto', 'OK', 'Extension enabled';
    ELSE
        RETURN QUERY SELECT 'pgcrypto', 'ERROR', 'Extension missing';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') THEN
        RETURN QUERY SELECT 'uuid-ossp', 'OK', 'Extension enabled';
    ELSE
        RETURN QUERY SELECT 'uuid-ossp', 'ERROR', 'Extension missing';
    END IF;
    
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. FUNÇÃO MELHORADA DE LOG DE SEGURANÇA
-- =====================================================

CREATE OR REPLACE FUNCTION log_security_event_enhanced(
    p_event_type VARCHAR(100),
    p_severity VARCHAR(20) DEFAULT 'medium',
    p_user_id UUID DEFAULT NULL,
    p_details JSONB DEFAULT '{}',
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_retry_count INTEGER DEFAULT 0
) RETURNS UUID AS $$
DECLARE
    log_id UUID;
    max_retries INTEGER := 3;
BEGIN
    -- Validar severidade
    IF p_severity NOT IN ('low', 'medium', 'high', 'critical') THEN
        RAISE EXCEPTION 'Invalid severity level: %. Must be one of: low, medium, high, critical', p_severity;
    END IF;
    
    -- Validar event_type
    IF p_event_type IS NULL OR LENGTH(TRIM(p_event_type)) = 0 THEN
        RAISE EXCEPTION 'Event type cannot be null or empty';
    END IF;
    
    -- Tentar inserir log com retry
    BEGIN
        INSERT INTO security_logs (
            user_id, event_type, severity, details, ip_address, user_agent
        ) VALUES (
            p_user_id, p_event_type, p_severity, p_details, p_ip_address, p_user_agent
        ) RETURNING id INTO log_id;
        
        RETURN log_id;
        
    EXCEPTION
        WHEN OTHERS THEN
            -- Se ainda temos tentativas, tentar novamente
            IF p_retry_count < max_retries THEN
                PERFORM pg_sleep(0.1 * (p_retry_count + 1)); -- Backoff exponencial
                RETURN log_security_event_enhanced(
                    p_event_type, p_severity, p_user_id, p_details, 
                    p_ip_address, p_user_agent, p_retry_count + 1
                );
            ELSE
                -- Log crítico de falha
                RAISE WARNING 'Failed to log security event after % retries: %', max_retries, SQLERRM;
                RETURN NULL;
            END IF;
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. FUNÇÃO DE ROLLBACK PARA MIGRAÇÕES
-- =====================================================

CREATE OR REPLACE FUNCTION rollback_migration(
    migration_version VARCHAR(50)
) RETURNS BOOLEAN AS $$
DECLARE
    migration_record RECORD;
    backup_table_name TEXT;
BEGIN
    -- Verificar se migração existe
    SELECT * INTO migration_record 
    FROM schema_migrations 
    WHERE version = migration_version;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Migration % not found', migration_version;
    END IF;
    
    -- Log da tentativa de rollback
    PERFORM log_security_event_enhanced(
        'migration_rollback_attempt',
        'high',
        NULL,
        jsonb_build_object('version', migration_version, 'description', migration_record.description)
    );
    
    -- Implementar lógica de rollback específica por versão
    CASE migration_version
        WHEN '4.0.0' THEN
            -- Rollback específico para esta migração
            -- Remover funções criadas
            DROP FUNCTION IF EXISTS create_safe_backup(TEXT, TEXT);
            DROP FUNCTION IF EXISTS safe_cleanup_old_data();
            DROP FUNCTION IF EXISTS validate_migration_dependencies();
            DROP FUNCTION IF EXISTS log_security_event_enhanced(VARCHAR, VARCHAR, UUID, JSONB, INET, TEXT, INTEGER);
            DROP FUNCTION IF EXISTS rollback_migration(VARCHAR);
            
            -- Remover tabela de controle se vazia
            IF NOT EXISTS (SELECT 1 FROM schema_migrations WHERE version != migration_version) THEN
                DROP TABLE IF EXISTS schema_migrations;
            END IF;
            
        ELSE
            RAISE EXCEPTION 'Rollback not implemented for version %', migration_version;
    END CASE;
    
    -- Remover registro da migração
    DELETE FROM schema_migrations WHERE version = migration_version;
    
    -- Log de sucesso
    PERFORM log_security_event_enhanced(
        'migration_rollback_success',
        'medium',
        NULL,
        jsonb_build_object('version', migration_version)
    );
    
    RETURN true;
    
EXCEPTION
    WHEN OTHERS THEN
        PERFORM log_security_event_enhanced(
            'migration_rollback_failed',
            'critical',
            NULL,
            jsonb_build_object('version', migration_version, 'error', SQLERRM)
        );
        RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. ÍNDICES OTIMIZADOS PARA PERFORMANCE
-- =====================================================

-- Índices compostos para melhorar performance das políticas RLS
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_permissions_composite 
ON user_permissions(user_id, resource_id, resource_type, permission, is_active, expires_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contracts_user_status 
ON contracts(user_id, status, contract_type);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_logs_composite 
ON security_logs(event_type, severity, created_at, user_id);

-- Índices parciais para dados específicos
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_logs_critical 
ON security_logs(created_at) WHERE severity = 'critical';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_permissions_active 
ON user_permissions(user_id, resource_id) WHERE is_active = true;

-- =====================================================
-- 9. VIEWS PARA MONITORAMENTO DE SEGURANÇA
-- =====================================================

CREATE OR REPLACE VIEW security_metrics AS
SELECT 
    'daily_events' as metric_type,
    DATE_TRUNC('day', created_at) as date,
    COUNT(*) as count,
    COUNT(*) FILTER (WHERE severity = 'critical') as critical_count,
    COUNT(*) FILTER (WHERE severity = 'high') as high_count,
    COUNT(*) FILTER (WHERE severity = 'medium') as medium_count,
    COUNT(*) FILTER (WHERE severity = 'low') as low_count
FROM security_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at)

UNION ALL

SELECT 
    'event_types' as metric_type,
    event_type::DATE as date,
    COUNT(*) as count,
    0 as critical_count,
    0 as high_count,
    0 as medium_count,
    0 as low_count
FROM security_logs
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY event_type;

-- =====================================================
-- 10. PERMISSÕES E COMENTÁRIOS
-- =====================================================

-- Conceder permissões
GRANT EXECUTE ON FUNCTION create_safe_backup TO service_role;
GRANT EXECUTE ON FUNCTION safe_cleanup_old_data TO service_role;
GRANT EXECUTE ON FUNCTION validate_migration_dependencies TO authenticated;
GRANT EXECUTE ON FUNCTION log_security_event_enhanced TO authenticated;
GRANT EXECUTE ON FUNCTION rollback_migration TO service_role;

GRANT SELECT ON security_metrics TO authenticated;
GRANT SELECT ON schema_migrations TO authenticated;

-- Comentários
COMMENT ON FUNCTION create_safe_backup IS 'Creates safe backup of tables before destructive operations';
COMMENT ON FUNCTION safe_cleanup_old_data IS 'Safely cleans up old data with automatic backups';
COMMENT ON FUNCTION validate_migration_dependencies IS 'Validates all required dependencies before migration';
COMMENT ON FUNCTION log_security_event_enhanced IS 'Enhanced security logging with retry mechanism';
COMMENT ON FUNCTION rollback_migration IS 'Rollback mechanism for migrations';
COMMENT ON VIEW security_metrics IS 'Security metrics for monitoring and alerting';

-- =====================================================
-- 11. VERIFICAÇÕES PÓS-MIGRAÇÃO
-- =====================================================

DO $$
DECLARE
    validation_results RECORD;
    error_count INTEGER := 0;
BEGIN
    -- Executar validação de dependências
    FOR validation_results IN 
        SELECT * FROM validate_migration_dependencies()
    LOOP
        IF validation_results.status = 'ERROR' THEN
            error_count := error_count + 1;
            RAISE WARNING 'Dependency check failed: % - %', 
                validation_results.dependency_name, validation_results.details;
        END IF;
    END LOOP;
    
    -- Verificar se todas as funções foram criadas
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_safe_backup') THEN
        RAISE EXCEPTION 'Function create_safe_backup not created';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'safe_cleanup_old_data') THEN
        RAISE EXCEPTION 'Function safe_cleanup_old_data not created';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'validate_migration_dependencies') THEN
        RAISE EXCEPTION 'Function validate_migration_dependencies not created';
    END IF;
    
    -- Verificar se a view foi criada
    IF NOT EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'security_metrics') THEN
        RAISE EXCEPTION 'View security_metrics not created';
    END IF;
    
    -- Se há erros críticos, falhar a migração
    IF error_count > 0 THEN
        RAISE EXCEPTION 'Migration validation failed with % errors', error_count;
    END IF;
    
    RAISE NOTICE 'Security improvements migration completed successfully';
END $$;

-- =====================================================
-- 12. REGISTRAR MIGRAÇÃO
-- =====================================================

INSERT INTO schema_migrations (version, description, applied_at) 
VALUES ('4.0.0', 'Security improvements and safe operations', NOW())
ON CONFLICT (version) DO UPDATE SET
    description = EXCLUDED.description,
    applied_at = EXCLUDED.applied_at;

-- Log da migração bem-sucedida
SELECT log_security_event_enhanced(
    'migration_completed',
    'low',
    NULL,
    jsonb_build_object(
        'version', '4.0.0',
        'description', 'Security improvements and safe operations',
        'functions_created', 5,
        'views_created', 1,
        'indexes_created', 4
    )
);

-- Finalizar transação
COMMIT;
