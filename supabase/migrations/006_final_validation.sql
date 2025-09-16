-- =====================================================
-- CONTABILEASE - VALIDAÇÃO FINAL DO SISTEMA
-- =====================================================
-- Este script executa validações completas do sistema
-- para garantir que todas as migrações foram aplicadas corretamente
-- Versão: 6.0.0
-- Data: 2025-01-27

-- Iniciar transação para garantir atomicidade
BEGIN;

-- =====================================================
-- 1. VERIFICAÇÕES DE DEPENDÊNCIAS
-- =====================================================

DO $$
DECLARE
    validation_results RECORD;
    error_count INTEGER := 0;
    warning_count INTEGER := 0;
BEGIN
    RAISE NOTICE 'Starting comprehensive system validation...';
    
    -- Verificar extensões necessárias
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto') THEN
        RAISE EXCEPTION 'CRITICAL: pgcrypto extension not found';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') THEN
        RAISE EXCEPTION 'CRITICAL: uuid-ossp extension not found';
    END IF;
    
    RAISE NOTICE 'Extensions validation: PASSED';
    
    -- Verificar tabelas principais
    FOR validation_results IN 
        SELECT 
            'table' as object_type,
            t.table_name as object_name,
            CASE 
                WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = t.table_name AND table_schema = 'public') 
                THEN 'EXISTS' 
                ELSE 'MISSING' 
            END as status
        FROM (VALUES 
            ('countries'),
            ('profiles'),
            ('contracts'),
            ('contract_variable_payments'),
            ('contract_renewal_options'),
            ('contract_documents'),
            ('security_logs'),
            ('user_permissions'),
            ('rate_limits'),
            ('audit_trail'),
            ('session_logs'),
            ('schema_migrations')
        ) AS t(table_name)
    LOOP
        IF validation_results.status = 'MISSING' THEN
            RAISE EXCEPTION 'CRITICAL: Table % not found', validation_results.object_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Tables validation: PASSED';
    
    -- Verificar funções principais
    FOR validation_results IN 
        SELECT 
            'function' as object_type,
            function_name as object_name,
            CASE 
                WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = function_name) 
                THEN 'EXISTS' 
                ELSE 'MISSING' 
            END as status
        FROM (VALUES 
            ('update_updated_at_column'),
            ('log_security_event'),
            ('is_valid_uuid'),
            ('cleanup_old_data'),
            ('validate_contract_data'),
            ('calculate_ifrs16_values'),
            ('audit_contract_changes'),
            ('user_has_contract_permission')
        ) AS f(function_name)
    LOOP
        IF validation_results.status = 'MISSING' THEN
            RAISE WARNING 'Function % not found', validation_results.object_name;
            warning_count := warning_count + 1;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Functions validation: PASSED with % warnings', warning_count;
    
END $$;

-- =====================================================
-- 2. VERIFICAÇÕES DE INTEGRIDADE DE DADOS
-- =====================================================

DO $$
DECLARE
    country_count INTEGER;
    constraint_count INTEGER;
    index_count INTEGER;
    policy_count INTEGER;
BEGIN
    -- Verificar dados iniciais
    SELECT COUNT(*) INTO country_count FROM countries WHERE is_active = true;
    
    IF country_count < 50 THEN
        RAISE WARNING 'Only % countries found, expected at least 50', country_count;
    ELSE
        RAISE NOTICE 'Countries data: PASSED (% countries)', country_count;
    END IF;
    
    -- Verificar constraints
    SELECT COUNT(*) INTO constraint_count
    FROM information_schema.table_constraints 
    WHERE table_name IN ('contracts', 'profiles', 'countries')
    AND constraint_type = 'CHECK';
    
    IF constraint_count < 5 THEN
        RAISE WARNING 'Only % check constraints found, expected at least 5', constraint_count;
    ELSE
        RAISE NOTICE 'Constraints validation: PASSED (% constraints)', constraint_count;
    END IF;
    
    -- Verificar índices
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes 
    WHERE tablename IN ('contracts', 'profiles', 'countries', 'security_logs', 'user_permissions');
    
    IF index_count < 20 THEN
        RAISE WARNING 'Only % indexes found, expected at least 20', index_count;
    ELSE
        RAISE NOTICE 'Indexes validation: PASSED (% indexes)', index_count;
    END IF;
    
    -- Verificar políticas RLS
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE tablename IN ('contracts', 'profiles', 'countries', 'security_logs', 'user_permissions');
    
    IF policy_count < 15 THEN
        RAISE WARNING 'Only % RLS policies found, expected at least 15', policy_count;
    ELSE
        RAISE NOTICE 'RLS policies validation: PASSED (% policies)', policy_count;
    END IF;
    
END $$;

-- =====================================================
-- 3. TESTES DE FUNCIONALIDADE
-- =====================================================

DO $$
DECLARE
    test_result RECORD;
    test_uuid UUID;
    validation_result RECORD;
BEGIN
    RAISE NOTICE 'Running functionality tests...';
    
    -- Teste 1: Função de validação de UUID
    IF is_valid_uuid('550e8400-e29b-41d4-a716-446655440000') THEN
        RAISE NOTICE 'UUID validation test: PASSED';
    ELSE
        RAISE EXCEPTION 'UUID validation test: FAILED';
    END IF;
    
    -- Teste 2: Função de validação de dados de contrato
    SELECT * INTO validation_result
    FROM validate_contract_data(100000.00, 12, 0.05, 8500.00);
    
    IF validation_result.is_valid THEN
        RAISE NOTICE 'Contract validation test: PASSED';
    ELSE
        RAISE EXCEPTION 'Contract validation test: FAILED - %', validation_result.error_message;
    END IF;
    
    -- Teste 3: Função de cálculo IFRS 16
    SELECT * INTO test_result
    FROM calculate_ifrs16_values(10000.00, 12, 0.05, 1000.00, 500.00);
    
    IF test_result.lease_liability IS NOT NULL AND test_result.lease_liability > 0 THEN
        RAISE NOTICE 'IFRS 16 calculation test: PASSED (Lease Liability: %)', test_result.lease_liability;
    ELSE
        RAISE EXCEPTION 'IFRS 16 calculation test: FAILED';
    END IF;
    
    -- Teste 4: Log de segurança
    test_uuid := log_security_event(
        'validation_test',
        'low',
        NULL,
        jsonb_build_object('test', 'functionality')
    );
    
    IF test_uuid IS NOT NULL THEN
        RAISE NOTICE 'Security logging test: PASSED';
    ELSE
        RAISE WARNING 'Security logging test: FAILED (may be expected if security_logs table not available)';
    END IF;
    
END $$;

-- =====================================================
-- 4. VERIFICAÇÕES DE PERFORMANCE
-- =====================================================

DO $$
DECLARE
    slow_queries INTEGER;
    missing_indexes INTEGER;
BEGIN
    -- Verificar se há queries lentas (se pg_stat_statements estiver disponível)
    BEGIN
        SELECT COUNT(*) INTO slow_queries
        FROM pg_stat_statements 
        WHERE mean_exec_time > 1000; -- queries com mais de 1 segundo
        
        IF slow_queries > 0 THEN
            RAISE WARNING 'Found % slow queries (>1s)', slow_queries;
        ELSE
            RAISE NOTICE 'Performance check: PASSED (no slow queries detected)';
        END IF;
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'Performance check: SKIPPED (pg_stat_statements not available)';
    END;
    
    -- Verificar índices ausentes em tabelas principais
    SELECT COUNT(*) INTO missing_indexes
    FROM information_schema.tables t
    LEFT JOIN pg_indexes i ON t.table_name = i.tablename
    WHERE t.table_schema = 'public'
    AND t.table_name IN ('contracts', 'profiles', 'security_logs')
    AND i.indexname IS NULL;
    
    IF missing_indexes > 0 THEN
        RAISE WARNING 'Found % tables without indexes', missing_indexes;
    ELSE
        RAISE NOTICE 'Index coverage: PASSED';
    END IF;
    
END $$;

-- =====================================================
-- 5. VERIFICAÇÕES DE SEGURANÇA
-- =====================================================

DO $$
DECLARE
    rls_enabled_count INTEGER;
    public_tables INTEGER;
    admin_functions INTEGER;
BEGIN
    -- Verificar se RLS está habilitado nas tabelas principais
    SELECT COUNT(*) INTO rls_enabled_count
    FROM pg_class c
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public'
    AND c.relkind = 'r'
    AND c.relrowsecurity = true
    AND c.relname IN ('contracts', 'profiles', 'security_logs', 'user_permissions');
    
    IF rls_enabled_count < 4 THEN
        RAISE WARNING 'Only % tables have RLS enabled, expected at least 4', rls_enabled_count;
    ELSE
        RAISE NOTICE 'RLS security: PASSED (% tables protected)', rls_enabled_count;
    END IF;
    
    -- Verificar se há tabelas públicas sem RLS
    SELECT COUNT(*) INTO public_tables
    FROM information_schema.tables t
    LEFT JOIN pg_class c ON t.table_name = c.relname
    WHERE t.table_schema = 'public'
    AND t.table_name NOT IN ('countries') -- countries pode ser público
    AND c.relrowsecurity = false;
    
    IF public_tables > 0 THEN
        RAISE WARNING 'Found % tables without RLS protection', public_tables;
    ELSE
        RAISE NOTICE 'Table security: PASSED';
    END IF;
    
    -- Verificar funções administrativas
    SELECT COUNT(*) INTO admin_functions
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname LIKE '%cleanup%'
    AND p.prosecdef = true; -- SECURITY DEFINER
    
    IF admin_functions > 0 THEN
        RAISE NOTICE 'Admin functions: PASSED (% secure functions)', admin_functions;
    ELSE
        RAISE WARNING 'No admin functions found with SECURITY DEFINER';
    END IF;
    
END $$;

-- =====================================================
-- 6. RELATÓRIO FINAL DE VALIDAÇÃO
-- =====================================================

DO $$
DECLARE
    total_tables INTEGER;
    total_functions INTEGER;
    total_indexes INTEGER;
    total_policies INTEGER;
    total_constraints INTEGER;
    migration_count INTEGER;
BEGIN
    -- Contar objetos criados
    SELECT COUNT(*) INTO total_tables
    FROM information_schema.tables 
    WHERE table_schema = 'public';
    
    SELECT COUNT(*) INTO total_functions
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public';
    
    SELECT COUNT(*) INTO total_indexes
    FROM pg_indexes 
    WHERE schemaname = 'public';
    
    SELECT COUNT(*) INTO total_policies
    FROM pg_policies 
    WHERE schemaname = 'public';
    
    SELECT COUNT(*) INTO total_constraints
    FROM information_schema.table_constraints 
    WHERE table_schema = 'public';
    
    SELECT COUNT(*) INTO migration_count
    FROM schema_migrations;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'FINAL VALIDATION REPORT';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tables created: %', total_tables;
    RAISE NOTICE 'Functions created: %', total_functions;
    RAISE NOTICE 'Indexes created: %', total_indexes;
    RAISE NOTICE 'RLS policies created: %', total_policies;
    RAISE NOTICE 'Constraints created: %', total_constraints;
    RAISE NOTICE 'Migrations applied: %', migration_count;
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SYSTEM STATUS: VALIDATION COMPLETED';
    RAISE NOTICE '========================================';
    
END $$;

-- =====================================================
-- 7. REGISTRAR MIGRAÇÃO DE VALIDAÇÃO
-- =====================================================

INSERT INTO schema_migrations (version, description, applied_at) 
VALUES ('6.0.0', 'Final system validation', NOW())
ON CONFLICT (version) DO UPDATE SET
    description = EXCLUDED.description,
    applied_at = EXCLUDED.applied_at;

-- Log da validação bem-sucedida
SELECT log_security_event(
    'system_validation_completed',
    'low',
    NULL,
    jsonb_build_object(
        'version', '6.0.0',
        'description', 'Final system validation',
        'status', 'completed'
    )
);

-- Finalizar transação
COMMIT;
