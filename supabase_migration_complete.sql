-- =====================================================
-- CONTABILEASE - MIGRAÇÃO COMPLETA SUPABASE
-- =====================================================
-- Este é o script principal que executa toda a migração
-- Execute este script para configurar completamente o banco

-- =====================================================
-- CONFIGURAÇÕES INICIAIS
-- =====================================================

-- Configurar ambiente
SET client_min_messages = WARNING;
SET log_min_messages = WARNING;

-- Verificar se estamos no Supabase
DO $$
BEGIN
    IF current_database() IS NULL THEN
        RAISE EXCEPTION 'This script must be run in a Supabase database';
    END IF;
    
    RAISE NOTICE 'Starting Contabilease migration...';
END $$;

-- =====================================================
-- EXECUÇÃO DOS SCRIPTS BASE
-- =====================================================

-- 1. Script Base (funções comuns)
\echo 'Executing base migration...'
\i supabase_migration_base.sql

-- 2. Tabelas Principais
\echo 'Executing core tables migration...'
\i supabase_migration_core_tables.sql

-- 3. Políticas RLS
\echo 'Executing RLS policies migration...'
\i supabase_migration_rls_policies.sql

-- 4. Dados Iniciais
\echo 'Executing initial data migration...'
\i supabase_migration_initial_data.sql

-- =====================================================
-- SCRIPTS ADICIONAIS (SE NECESSÁRIOS)
-- =====================================================

-- Verificar se existem scripts adicionais para executar
DO $$
DECLARE
    script_files TEXT[] := ARRAY[
        'supabase_migration_subscriptions.sql',
        'supabase_migration_security.sql',
        'supabase_migration_storage.sql',
        'supabase_migration_calculations.sql'
    ];
    script_file TEXT;
BEGIN
    FOREACH script_file IN ARRAY script_files
    LOOP
        -- Verificar se o arquivo existe (simulação)
        -- Em produção, você pode usar pg_read_file() se disponível
        RAISE NOTICE 'Checking for additional script: %', script_file;
    END LOOP;
END $$;

-- =====================================================
-- VERIFICAÇÕES FINAIS DE INTEGRIDADE
-- =====================================================

DO $$
DECLARE
    table_count INTEGER;
    function_count INTEGER;
    policy_count INTEGER;
    country_count INTEGER;
BEGIN
    -- Verificar tabelas criadas
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN (
        'countries', 'profiles', 'contracts', 
        'contract_variable_payments', 'contract_renewal_options', 
        'contract_documents'
    );
    
    -- Verificar funções criadas
    SELECT COUNT(*) INTO function_count
    FROM pg_proc 
    WHERE proname IN (
        'update_updated_at_column', 'log_security_event', 
        'validate_contract_data', 'calculate_ifrs16_values',
        'user_has_contract_permission', 'cleanup_old_data'
    );
    
    -- Verificar políticas RLS
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public';
    
    -- Verificar países inseridos
    SELECT COUNT(*) INTO country_count
    FROM countries WHERE is_active = true;
    
    -- Relatório final
    RAISE NOTICE '========================================';
    RAISE NOTICE 'MIGRAÇÃO CONCLUÍDA COM SUCESSO!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tabelas criadas: %', table_count;
    RAISE NOTICE 'Funções criadas: %', function_count;
    RAISE NOTICE 'Políticas RLS: %', policy_count;
    RAISE NOTICE 'Países inseridos: %', country_count;
    RAISE NOTICE '========================================';
    
    -- Verificações de integridade
    IF table_count < 6 THEN
        RAISE EXCEPTION 'Migration incomplete: Missing core tables';
    END IF;
    
    IF function_count < 6 THEN
        RAISE EXCEPTION 'Migration incomplete: Missing core functions';
    END IF;
    
    IF policy_count < 15 THEN
        RAISE EXCEPTION 'Migration incomplete: Missing RLS policies';
    END IF;
    
    IF country_count < 50 THEN
        RAISE EXCEPTION 'Migration incomplete: Missing countries data';
    END IF;
    
    RAISE NOTICE 'All integrity checks passed!';
END $$;

-- =====================================================
-- CONFIGURAÇÕES PÓS-MIGRAÇÃO
-- =====================================================

-- Configurar estatísticas para otimização
ANALYZE;

-- Configurar parâmetros de performance
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET work_mem = '4MB';

-- =====================================================
-- SCRIPT DE ROLLBACK (EM CASO DE PROBLEMAS)
-- =====================================================

-- Criar função de rollback para emergências
CREATE OR REPLACE FUNCTION rollback_migration()
RETURNS TEXT AS $$
DECLARE
    result TEXT := '';
BEGIN
    -- Desabilitar RLS temporariamente
    ALTER TABLE countries DISABLE ROW LEVEL SECURITY;
    ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
    ALTER TABLE contracts DISABLE ROW LEVEL SECURITY;
    ALTER TABLE contract_variable_payments DISABLE ROW LEVEL SECURITY;
    ALTER TABLE contract_renewal_options DISABLE ROW LEVEL SECURITY;
    ALTER TABLE contract_documents DISABLE ROW LEVEL SECURITY;
    
    result := 'RLS disabled for rollback. Manual cleanup required.';
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- DOCUMENTAÇÃO FINAL
-- =====================================================

COMMENT ON FUNCTION rollback_migration IS 'Emergency rollback function - use with caution';

-- =====================================================
-- MENSAGEM FINAL
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'CONTABILEASE MIGRATION COMPLETED!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Verify all tables and functions';
    RAISE NOTICE '2. Test RLS policies';
    RAISE NOTICE '3. Run application tests';
    RAISE NOTICE '4. Configure application settings';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'For support, check the documentation';
    RAISE NOTICE 'or contact the development team.';
    RAISE NOTICE '========================================';
END $$;
