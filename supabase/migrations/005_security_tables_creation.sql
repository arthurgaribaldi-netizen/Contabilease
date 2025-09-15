-- =====================================================
-- CONTABILEASE - CRIAÇÃO DE TABELAS DE SEGURANÇA
-- =====================================================
-- Este script cria as tabelas de segurança necessárias
-- para o funcionamento completo do sistema
-- Versão: 5.0.0
-- Data: 2025-01-27

-- Iniciar transação para garantir atomicidade
BEGIN;

-- =====================================================
-- 1. VERIFICAÇÕES PRÉ-MIGRAÇÃO
-- =====================================================

-- Verificar se migrações anteriores foram executadas
DO $$
DECLARE
    required_migrations TEXT[] := ARRAY['0.0.0', '1.0.0', '2.0.0', '3.0.0', '4.0.0'];
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
-- 2. TABELA DE LOGS DE SEGURANÇA
-- =====================================================

CREATE TABLE IF NOT EXISTS security_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para security_logs (usando CONCURRENTLY)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_logs_user_id ON security_logs(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_logs_event_type ON security_logs(event_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_logs_severity ON security_logs(severity);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_logs_created_at ON security_logs(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_logs_ip_address ON security_logs(ip_address);

-- Trigger para updated_at
CREATE TRIGGER trg_security_logs_updated_at
    BEFORE UPDATE ON security_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 3. TABELA DE PERMISSÕES DE USUÁRIO
-- =====================================================

CREATE TABLE IF NOT EXISTS user_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    permission VARCHAR(50) NOT NULL,
    granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, resource_id, resource_type, permission)
);

-- Índices para user_permissions (usando CONCURRENTLY)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_permissions_resource ON user_permissions(resource_id, resource_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_permissions_active ON user_permissions(is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_permissions_expires ON user_permissions(expires_at) WHERE expires_at IS NOT NULL;

-- Trigger para updated_at
CREATE TRIGGER trg_user_permissions_updated_at
    BEFORE UPDATE ON user_permissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. TABELA DE RATE LIMITS
-- =====================================================

CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    identifier VARCHAR(255) NOT NULL,
    ip_address INET,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint VARCHAR(255) NOT NULL,
    request_count INTEGER DEFAULT 1,
    window_start TIMESTAMPTZ DEFAULT NOW(),
    window_end TIMESTAMPTZ DEFAULT NOW() + INTERVAL '1 hour',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(identifier, endpoint, window_start)
);

-- Índices para rate_limits (usando CONCURRENTLY)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rate_limits_identifier ON rate_limits(identifier);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rate_limits_ip ON rate_limits(ip_address);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rate_limits_endpoint ON rate_limits(endpoint);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rate_limits_window ON rate_limits(window_start, window_end);

-- Trigger para updated_at
CREATE TRIGGER trg_rate_limits_updated_at
    BEFORE UPDATE ON rate_limits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. TABELA DE AUDITORIA
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_trail (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para audit_trail (usando CONCURRENTLY)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_trail_user_id ON audit_trail(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_trail_table_record ON audit_trail(table_name, record_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_trail_action ON audit_trail(action);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_trail_created_at ON audit_trail(created_at);

-- =====================================================
-- 6. TABELA DE LOGS DE SESSÃO
-- =====================================================

CREATE TABLE IF NOT EXISTS session_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID NOT NULL,
    ip_address INET,
    user_agent TEXT,
    login_at TIMESTAMPTZ DEFAULT NOW(),
    logout_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para session_logs (usando CONCURRENTLY)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_session_logs_user_id ON session_logs(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_session_logs_session_id ON session_logs(session_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_session_logs_active ON session_logs(is_active);

-- Trigger para updated_at
CREATE TRIGGER trg_session_logs_updated_at
    BEFORE UPDATE ON session_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. HABILITAR RLS EM TODAS AS TABELAS DE SEGURANÇA
-- =====================================================

ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 8. POLÍTICAS RLS PARA TABELAS DE SEGURANÇA
-- =====================================================

-- Políticas para security_logs
CREATE POLICY "security_logs_user_access" ON security_logs
    FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "security_logs_service_access" ON security_logs
    FOR ALL USING (auth.role() = 'service_role');

-- Políticas para user_permissions
CREATE POLICY "user_permissions_own_access" ON user_permissions
    FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "user_permissions_service_access" ON user_permissions
    FOR ALL USING (auth.role() = 'service_role');

-- Políticas para rate_limits
CREATE POLICY "rate_limits_service_access" ON rate_limits
    FOR ALL USING (auth.role() = 'service_role');

-- Políticas para audit_trail
CREATE POLICY "audit_trail_user_access" ON audit_trail
    FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "audit_trail_service_access" ON audit_trail
    FOR ALL USING (auth.role() = 'service_role');

-- Políticas para session_logs
CREATE POLICY "session_logs_user_access" ON session_logs
    FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "session_logs_service_access" ON session_logs
    FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 9. FUNÇÕES AUXILIARES DE SEGURANÇA
-- =====================================================

-- Função para limpar logs antigos de forma segura
CREATE OR REPLACE FUNCTION cleanup_security_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM security_logs 
    WHERE created_at < NOW() - INTERVAL '90 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log da operação de limpeza
    PERFORM log_security_event(
        'security_logs_cleanup',
        'low',
        NULL,
        jsonb_build_object('deleted_count', deleted_count)
    );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para limpar rate limits antigos
CREATE OR REPLACE FUNCTION cleanup_rate_limits()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM rate_limits 
    WHERE window_end < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para limpar sessões inativas
CREATE OR REPLACE FUNCTION cleanup_inactive_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM session_logs 
    WHERE is_active = false AND logout_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 10. PERMISSÕES E COMENTÁRIOS
-- =====================================================

-- Conceder permissões
GRANT SELECT ON security_logs TO authenticated;
GRANT SELECT ON user_permissions TO authenticated;
GRANT SELECT ON audit_trail TO authenticated;
GRANT SELECT ON session_logs TO authenticated;

GRANT EXECUTE ON FUNCTION cleanup_security_logs TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_rate_limits TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_inactive_sessions TO service_role;

-- Comentários
COMMENT ON TABLE security_logs IS 'Logs de eventos de segurança para auditoria e monitoramento';
COMMENT ON TABLE user_permissions IS 'Permissões granulares de usuários em recursos específicos';
COMMENT ON TABLE rate_limits IS 'Dados de rate limiting para endpoints da API';
COMMENT ON TABLE audit_trail IS 'Trilha de auditoria para mudanças de dados no sistema';
COMMENT ON TABLE session_logs IS 'Logs de sessão de usuários para monitoramento de segurança';

COMMENT ON FUNCTION cleanup_security_logs IS 'Limpa logs de segurança antigos de forma segura';
COMMENT ON FUNCTION cleanup_rate_limits IS 'Limpa rate limits antigos';
COMMENT ON FUNCTION cleanup_inactive_sessions IS 'Limpa sessões inativas antigas';

-- =====================================================
-- 11. VERIFICAÇÕES PÓS-MIGRAÇÃO
-- =====================================================

DO $$
DECLARE
    table_count INTEGER;
    index_count INTEGER;
    policy_count INTEGER;
BEGIN
    -- Verificar se todas as tabelas foram criadas
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_name IN ('security_logs', 'user_permissions', 'rate_limits', 'audit_trail', 'session_logs')
    AND table_schema = 'public';
    
    IF table_count < 5 THEN
        RAISE EXCEPTION 'Not all security tables were created. Expected 5, got %', table_count;
    END IF;
    
    -- Verificar se os índices foram criados
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes 
    WHERE tablename IN ('security_logs', 'user_permissions', 'rate_limits', 'audit_trail', 'session_logs');
    
    IF index_count < 15 THEN
        RAISE EXCEPTION 'Not enough indexes created. Expected at least 15, got %', index_count;
    END IF;
    
    -- Verificar se as políticas RLS foram criadas
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE tablename IN ('security_logs', 'user_permissions', 'rate_limits', 'audit_trail', 'session_logs');
    
    IF policy_count < 10 THEN
        RAISE EXCEPTION 'Not enough RLS policies created. Expected at least 10, got %', policy_count;
    END IF;
    
    RAISE NOTICE 'Security tables migration completed successfully. Created % tables, % indexes, % policies.', 
        table_count, index_count, policy_count;
END $$;

-- =====================================================
-- 12. REGISTRAR MIGRAÇÃO
-- =====================================================

INSERT INTO schema_migrations (version, description, applied_at) 
VALUES ('5.0.0', 'Security tables creation', NOW())
ON CONFLICT (version) DO UPDATE SET
    description = EXCLUDED.description,
    applied_at = EXCLUDED.applied_at;

-- Log da migração bem-sucedida
SELECT log_security_event(
    'migration_completed',
    'low',
    NULL,
    jsonb_build_object(
        'version', '5.0.0',
        'description', 'Security tables creation',
        'tables_created', 5,
        'functions_created', 3
    )
);

-- Finalizar transação
COMMIT;
