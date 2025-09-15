-- =====================================================
-- TESTE DE VALIDAÇÃO DAS MIGRAÇÕES SUPABASE
-- =====================================================
-- Este script testa se todas as migrações estão funcionando corretamente
-- Execute este script após aplicar todas as migrações

-- =====================================================
-- 1. TESTE DE CONEXÃO E EXTENSÕES
-- =====================================================

-- Verificar se as extensões estão disponíveis
SELECT 
    'Extensions Check' as test_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto') 
        THEN 'PASS' 
        ELSE 'FAIL' 
    END as pgcrypto_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') 
        THEN 'PASS' 
        ELSE 'FAIL' 
    END as uuid_status;

-- =====================================================
-- 2. TESTE DE TABELAS PRINCIPAIS
-- =====================================================

-- Verificar se todas as tabelas foram criadas
SELECT 
    'Tables Check' as test_name,
    COUNT(*) as total_tables,
    COUNT(*) FILTER (WHERE table_name IN ('countries', 'profiles', 'contracts')) as core_tables,
    COUNT(*) FILTER (WHERE table_name IN ('security_logs', 'user_permissions', 'audit_trail')) as security_tables
FROM information_schema.tables 
WHERE table_schema = 'public';

-- =====================================================
-- 3. TESTE DE FUNÇÕES PRINCIPAIS
-- =====================================================

-- Verificar se as funções principais foram criadas
SELECT 
    'Functions Check' as test_name,
    COUNT(*) as total_functions,
    COUNT(*) FILTER (WHERE proname IN ('update_updated_at_column', 'log_security_event', 'is_valid_uuid')) as core_functions,
    COUNT(*) FILTER (WHERE proname IN ('validate_contract_data', 'calculate_ifrs16_values')) as business_functions
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public';

-- =====================================================
-- 4. TESTE DE ÍNDICES
-- =====================================================

-- Verificar se os índices foram criados
SELECT 
    'Indexes Check' as test_name,
    COUNT(*) as total_indexes,
    COUNT(*) FILTER (WHERE tablename = 'contracts') as contract_indexes,
    COUNT(*) FILTER (WHERE tablename = 'security_logs') as security_indexes
FROM pg_indexes 
WHERE schemaname = 'public';

-- =====================================================
-- 5. TESTE DE POLÍTICAS RLS
-- =====================================================

-- Verificar se as políticas RLS foram criadas
SELECT 
    'RLS Policies Check' as test_name,
    COUNT(*) as total_policies,
    COUNT(*) FILTER (WHERE tablename = 'contracts') as contract_policies,
    COUNT(*) FILTER (WHERE tablename = 'profiles') as profile_policies
FROM pg_policies 
WHERE schemaname = 'public';

-- =====================================================
-- 6. TESTE DE DADOS INICIAIS
-- =====================================================

-- Verificar se os dados iniciais foram inseridos
SELECT 
    'Initial Data Check' as test_name,
    COUNT(*) as total_countries,
    COUNT(*) FILTER (WHERE iso_code = 'BR') as brazil_exists,
    COUNT(*) FILTER (WHERE iso_code = 'US') as usa_exists
FROM countries 
WHERE is_active = true;

-- =====================================================
-- 7. TESTE DE FUNCIONALIDADE
-- =====================================================

-- Teste da função de validação de UUID
SELECT 
    'UUID Validation Test' as test_name,
    CASE 
        WHEN is_valid_uuid('550e8400-e29b-41d4-a716-446655440000') 
        THEN 'PASS' 
        ELSE 'FAIL' 
    END as uuid_test_result;

-- Teste da função de validação de contrato
SELECT 
    'Contract Validation Test' as test_name,
    CASE 
        WHEN (SELECT is_valid FROM validate_contract_data(100000.00, 12, 0.05, 8500.00)) 
        THEN 'PASS' 
        ELSE 'FAIL' 
    END as contract_test_result;

-- Teste da função de cálculo IFRS 16
SELECT 
    'IFRS 16 Calculation Test' as test_name,
    CASE 
        WHEN (SELECT lease_liability FROM calculate_ifrs16_values(10000.00, 12, 0.05, 1000.00, 500.00)) > 0 
        THEN 'PASS' 
        ELSE 'FAIL' 
    END as ifrs_test_result;

-- =====================================================
-- 8. TESTE DE SEGURANÇA
-- =====================================================

-- Verificar se RLS está habilitado nas tabelas principais
SELECT 
    'RLS Security Check' as test_name,
    COUNT(*) as tables_with_rls,
    COUNT(*) FILTER (WHERE relrowsecurity = true) as rls_enabled,
    COUNT(*) FILTER (WHERE relrowsecurity = false) as rls_disabled
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
AND c.relkind = 'r'
AND c.relname IN ('contracts', 'profiles', 'security_logs');

-- =====================================================
-- 9. TESTE DE PERFORMANCE
-- =====================================================

-- Verificar se há índices nas colunas mais importantes
SELECT 
    'Performance Check' as test_name,
    COUNT(*) as performance_indexes,
    COUNT(*) FILTER (WHERE indexname LIKE '%user_id%') as user_id_indexes,
    COUNT(*) FILTER (WHERE indexname LIKE '%created_at%') as timestamp_indexes
FROM pg_indexes 
WHERE schemaname = 'public'
AND tablename IN ('contracts', 'profiles', 'security_logs');

-- =====================================================
-- 10. RELATÓRIO FINAL
-- =====================================================

-- Resumo final dos testes
WITH test_results AS (
    SELECT 'Extensions' as test_category, 
           CASE WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname IN ('pgcrypto', 'uuid-ossp')) 
                THEN 'PASS' ELSE 'FAIL' END as status
    UNION ALL
    SELECT 'Tables' as test_category,
           CASE WHEN (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') >= 10 
                THEN 'PASS' ELSE 'FAIL' END as status
    UNION ALL
    SELECT 'Functions' as test_category,
           CASE WHEN (SELECT COUNT(*) FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public') >= 8 
                THEN 'PASS' ELSE 'FAIL' END as status
    UNION ALL
    SELECT 'Indexes' as test_category,
           CASE WHEN (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public') >= 20 
                THEN 'PASS' ELSE 'FAIL' END as status
    UNION ALL
    SELECT 'RLS Policies' as test_category,
           CASE WHEN (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') >= 15 
                THEN 'PASS' ELSE 'FAIL' END as status
    UNION ALL
    SELECT 'Initial Data' as test_category,
           CASE WHEN (SELECT COUNT(*) FROM countries WHERE is_active = true) >= 50 
                THEN 'PASS' ELSE 'FAIL' END as status
)
SELECT 
    'FINAL TEST REPORT' as report_title,
    COUNT(*) as total_tests,
    COUNT(*) FILTER (WHERE status = 'PASS') as passed_tests,
    COUNT(*) FILTER (WHERE status = 'FAIL') as failed_tests,
    CASE 
        WHEN COUNT(*) FILTER (WHERE status = 'FAIL') = 0 
        THEN 'ALL TESTS PASSED - SYSTEM READY' 
        ELSE 'SOME TESTS FAILED - CHECK ISSUES' 
    END as overall_status
FROM test_results;

-- =====================================================
-- 11. INSTRUÇÕES DE USO
-- =====================================================

-- Para executar este teste:
-- 1. Conecte-se ao banco de dados Supabase
-- 2. Execute este script completo
-- 3. Verifique se todos os testes retornam 'PASS'
-- 4. Se algum teste falhar, verifique os logs de erro
-- 5. Execute as migrações na ordem correta se necessário

-- Ordem de execução das migrações:
-- 1. 000_base_migration.sql
-- 2. 001_core_tables_consolidated.sql  
-- 3. 002_rls_policies_optimized.sql
-- 4. 003_initial_data_and_validations.sql
-- 5. 004_security_improvements_safe.sql
-- 6. 005_security_tables_creation.sql
-- 7. 006_final_validation.sql
