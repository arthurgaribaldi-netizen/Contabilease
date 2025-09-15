-- =====================================================
-- CONTABILEASE - SCRIPT BASE DE MIGRAÇÃO SUPABASE
-- =====================================================
-- Este script contém as funções base e configurações comuns
-- Execute este script PRIMEIRO antes dos outros
-- Versão: 0.0.0
-- Data: 2025-01-27

-- Iniciar transação para garantir atomicidade
BEGIN;

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

-- Função para log de segurança (versão melhorada com verificação de tabela)
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
    table_exists BOOLEAN;
BEGIN
    -- Validar severidade
    IF p_severity NOT IN ('low', 'medium', 'high', 'critical') THEN
        RAISE EXCEPTION 'Invalid severity level: %', p_severity;
    END IF;
    
    -- Verificar se a tabela security_logs existe
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'security_logs' AND table_schema = 'public'
    ) INTO table_exists;
    
    IF NOT table_exists THEN
        RAISE WARNING 'Security logs table not found, skipping log entry';
        RETURN NULL;
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

-- Função para limpar dados antigos (versão melhorada com verificação de tabelas)
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS TABLE (
    table_name TEXT,
    deleted_count INTEGER,
    cleanup_type TEXT
) AS $$
DECLARE
    deleted_count_var INTEGER;
    table_exists BOOLEAN;
BEGIN
    -- Verificar e limpar logs de segurança antigos (90 dias)
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'security_logs' AND table_schema = 'public'
    ) INTO table_exists;
    
    IF table_exists THEN
        -- Usar LIMIT para evitar queries destrutivas em massa
        DELETE FROM security_logs 
        WHERE created_at < NOW() - INTERVAL '90 days'
        AND id IN (
            SELECT id FROM security_logs 
            WHERE created_at < NOW() - INTERVAL '90 days'
            LIMIT 1000
        );
        
        GET DIAGNOSTICS deleted_count_var = ROW_COUNT;
        table_name := 'security_logs';
        deleted_count := deleted_count_var;
        cleanup_type := 'logs_cleanup';
        RETURN NEXT;
    END IF;
    
    -- Verificar e limpar rate limits antigos (24 horas)
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'rate_limits' AND table_schema = 'public'
    ) INTO table_exists;
    
    IF table_exists THEN
        DELETE FROM rate_limits 
        WHERE window_end < NOW()
        AND id IN (
            SELECT id FROM rate_limits 
            WHERE window_end < NOW()
            LIMIT 1000
        );
        
        GET DIAGNOSTICS deleted_count_var = ROW_COUNT;
        table_name := 'rate_limits';
        deleted_count := deleted_count_var;
        cleanup_type := 'rate_limits_cleanup';
        RETURN NEXT;
    END IF;
    
    -- Verificar e limpar sessões inativas (30 dias)
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'session_logs' AND table_schema = 'public'
    ) INTO table_exists;
    
    IF table_exists THEN
        DELETE FROM session_logs 
        WHERE is_active = false 
        AND logout_at < NOW() - INTERVAL '30 days'
        AND id IN (
            SELECT id FROM session_logs 
            WHERE is_active = false 
            AND logout_at < NOW() - INTERVAL '30 days'
            LIMIT 1000
        );
        
        GET DIAGNOSTICS deleted_count_var = ROW_COUNT;
        table_name := 'session_logs';
        deleted_count := deleted_count_var;
        cleanup_type := 'sessions_cleanup';
        RETURN NEXT;
    END IF;
    
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

-- Configurar timezone padrão (apenas para a sessão atual)
SET timezone = 'America/Sao_Paulo';

-- NOTA: Configurações de sistema (ALTER SYSTEM) devem ser feitas manualmente
-- no servidor PostgreSQL ou através do painel do Supabase, pois não podem
-- ser executadas dentro de blocos de transação (migrations)
-- 
-- Configurações recomendadas para o servidor:
-- ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
-- ALTER SYSTEM SET log_statement = 'mod';
-- ALTER SYSTEM SET log_min_duration_statement = 1000;

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

-- =====================================================
-- REGISTRAR MIGRAÇÃO
-- =====================================================

-- Criar tabela de controle de migrações se não existir
CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(50) PRIMARY KEY,
    description TEXT,
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    checksum VARCHAR(64),
    execution_time INTERVAL
);

-- Registrar esta migração
INSERT INTO schema_migrations (version, description, applied_at) 
VALUES ('0.0.0', 'Base migration - extensions and core functions', NOW())
ON CONFLICT (version) DO UPDATE SET
    description = EXCLUDED.description,
    applied_at = EXCLUDED.applied_at;

-- Finalizar transação
COMMIT;
