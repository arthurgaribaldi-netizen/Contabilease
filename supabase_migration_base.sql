-- =====================================================
-- CONTABILEASE - SCRIPT BASE DE MIGRAÇÃO SUPABASE
-- =====================================================
-- Este script contém as funções base e configurações comuns
-- Execute este script PRIMEIRO antes dos outros

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- FUNÇÕES BASE COMUNS
-- =====================================================

-- Função para atualizar timestamp updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para log de segurança (versão melhorada)
CREATE OR REPLACE FUNCTION log_security_event(
    p_event_type VARCHAR(100),
    p_severity VARCHAR(20) DEFAULT 'medium',
    p_user_id UUID DEFAULT NULL,
    p_details JSONB DEFAULT '{}',
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    -- Validar severidade
    IF p_severity NOT IN ('low', 'medium', 'high', 'critical') THEN
        RAISE EXCEPTION 'Invalid severity level: %', p_severity;
    END IF;
    
    -- Inserir log
    INSERT INTO security_logs (
        user_id, event_type, severity, details, ip_address, user_agent
    ) VALUES (
        p_user_id, p_event_type, p_severity, p_details, p_ip_address, p_user_agent
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
EXCEPTION
    WHEN OTHERS THEN
        -- Log de erro sem causar falha na aplicação
        RAISE WARNING 'Failed to log security event: %', SQLERRM;
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para validar UUID
CREATE OR REPLACE FUNCTION is_valid_uuid(uuid_string TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN uuid_string ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Função para limpar dados antigos (versão melhorada)
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS TABLE (
    table_name TEXT,
    deleted_count INTEGER,
    cleanup_type TEXT
) AS $$
DECLARE
    result RECORD;
BEGIN
    -- Limpar logs de segurança antigos (90 dias)
    DELETE FROM security_logs 
    WHERE created_at < NOW() - INTERVAL '90 days';
    
    GET DIAGNOSTICS result.deleted_count = ROW_COUNT;
    result.table_name := 'security_logs';
    result.cleanup_type := 'logs_cleanup';
    RETURN NEXT result;
    
    -- Limpar rate limits antigos (24 horas)
    DELETE FROM rate_limits 
    WHERE window_end < NOW();
    
    GET DIAGNOSTICS result.deleted_count = ROW_COUNT;
    result.table_name := 'rate_limits';
    result.cleanup_type := 'rate_limits_cleanup';
    RETURN NEXT result;
    
    -- Limpar sessões inativas (30 dias)
    DELETE FROM session_logs 
    WHERE is_active = false AND logout_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS result.deleted_count = ROW_COUNT;
    result.table_name := 'session_logs';
    result.cleanup_type := 'sessions_cleanup';
    RETURN NEXT result;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Log erro mas não falhar
        PERFORM log_security_event(
            'cleanup_error',
            'high',
            NULL,
            jsonb_build_object('error', SQLERRM)
        );
        RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- CONFIGURAÇÕES DE SEGURANÇA
-- =====================================================

-- Configurar timezone padrão
SET timezone = 'America/Sao_Paulo';

-- Configurar parâmetros de performance
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET log_statement = 'mod';
ALTER SYSTEM SET log_min_duration_statement = 1000;

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON FUNCTION update_updated_at_column() IS 'Trigger function to automatically update updated_at timestamp';
COMMENT ON FUNCTION log_security_event IS 'Logs security events with validation and error handling';
COMMENT ON FUNCTION is_valid_uuid IS 'Validates UUID format';
COMMENT ON FUNCTION cleanup_old_data IS 'Cleans up old data from security tables';

-- =====================================================
-- PERMISSÕES BASE
-- =====================================================

-- Conceder permissões para funções base
GRANT EXECUTE ON FUNCTION update_updated_at_column() TO authenticated;
GRANT EXECUTE ON FUNCTION log_security_event TO authenticated;
GRANT EXECUTE ON FUNCTION is_valid_uuid TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_data TO service_role;

-- =====================================================
-- VERIFICAÇÕES DE INTEGRIDADE
-- =====================================================

-- Verificar se as extensões foram criadas corretamente
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto') THEN
        RAISE EXCEPTION 'pgcrypto extension not found';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') THEN
        RAISE EXCEPTION 'uuid-ossp extension not found';
    END IF;
    
    RAISE NOTICE 'Base migration script completed successfully';
END $$;
