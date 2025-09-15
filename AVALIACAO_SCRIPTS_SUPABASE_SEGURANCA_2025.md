# AVALIAÇÃO DE SEGURANÇA DOS SCRIPTS SUPABASE - CONTABILEASE 2025

## RESUMO EXECUTIVO

Após análise detalhada dos scripts de migração do Supabase, identifiquei **várias vulnerabilidades críticas** e oportunidades de melhoria para evitar erros e queries destrutivas. Este relatório apresenta uma avaliação completa e recomendações específicas.

## 🚨 PROBLEMAS CRÍTICOS IDENTIFICADOS

### 1. **QUERIES DESTRUTIVAS SEM PROTEÇÃO**

#### Problema: `cleanup_old_data()` - Função Perigosa
```sql
-- ❌ PERIGOSO: Deleta dados sem confirmação
DELETE FROM security_logs WHERE created_at < NOW() - INTERVAL '90 days';
DELETE FROM rate_limits WHERE window_end < NOW();
DELETE FROM session_logs WHERE is_active = false AND logout_at < NOW() - INTERVAL '30 days';
```

**Riscos:**
- Perda irreversível de dados de auditoria
- Sem backup automático antes da limpeza
- Sem logs de quantos registros foram deletados
- Execução automática pode causar perda de dados críticos

### 2. **FALTA DE VALIDAÇÃO DE DEPENDÊNCIAS**

#### Problema: Referências Circulares
```sql
-- ❌ PROBLEMA: Tabelas referenciam user_permissions antes de criá-la
CREATE POLICY "contracts_select_own" ON contracts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_permissions -- ← Tabela pode não existir ainda
            WHERE user_permissions.user_id = auth.uid()
        )
    );
```

### 3. **POLÍTICAS RLS COMPLEXAS E INEFICIENTES**

#### Problema: Subqueries Aninhadas Excessivas
```sql
-- ❌ INEFICIENTE: Subquery dentro de subquery
CREATE POLICY "contract_variable_payments_access" ON contract_variable_payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM contracts 
            WHERE contracts.id = contract_variable_payments.contract_id 
            AND (
                contracts.user_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM user_permissions 
                    WHERE user_permissions.user_id = auth.uid()
                    -- Mais subqueries aninhadas...
                )
            )
        )
    );
```

### 4. **FUNÇÕES SEM TRATAMENTO DE ERRO ADEQUADO**

#### Problema: `log_security_event()` - Tratamento Inconsistente
```sql
-- ❌ PROBLEMA: Tratamento de erro inconsistente
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Failed to log security event: %', SQLERRM;
        RETURN NULL; -- ← Pode mascarar erros críticos
```

## 🔧 MELHORIAS RECOMENDADAS

### 1. **IMPLEMENTAR BACKUP AUTOMÁTICO ANTES DE OPERAÇÕES DESTRUTIVAS**

```sql
-- ✅ MELHORADO: Função segura de limpeza
CREATE OR REPLACE FUNCTION safe_cleanup_old_data()
RETURNS TABLE (
    table_name TEXT,
    deleted_count INTEGER,
    backup_created BOOLEAN,
    cleanup_type TEXT
) AS $$
DECLARE
    result RECORD;
    backup_table_name TEXT;
BEGIN
    -- Criar backup antes de deletar
    backup_table_name := 'security_logs_backup_' || to_char(NOW(), 'YYYY_MM_DD_HH24_MI');
    
    EXECUTE format('CREATE TABLE %I AS SELECT * FROM security_logs WHERE created_at < NOW() - INTERVAL ''90 days''', 
                   backup_table_name);
    
    -- Deletar apenas após backup bem-sucedido
    DELETE FROM security_logs 
    WHERE created_at < NOW() - INTERVAL '90 days';
    
    GET DIAGNOSTICS result.deleted_count = ROW_COUNT;
    result.table_name := 'security_logs';
    result.backup_created := true;
    result.cleanup_type := 'safe_logs_cleanup';
    RETURN NEXT result;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Log erro e não executar limpeza
        PERFORM log_security_event(
            'cleanup_error',
            'critical',
            NULL,
            jsonb_build_object('error', SQLERRM, 'table', 'security_logs')
        );
        RAISE EXCEPTION 'Cleanup failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2. **VALIDAÇÃO DE DEPENDÊNCIAS ANTES DE EXECUÇÃO**

```sql
-- ✅ MELHORADO: Verificação de dependências
CREATE OR REPLACE FUNCTION validate_migration_dependencies()
RETURNS BOOLEAN AS $$
DECLARE
    missing_tables TEXT[] := ARRAY[]::TEXT[];
    table_name TEXT;
BEGIN
    -- Lista de tabelas obrigatórias
    FOR table_name IN SELECT unnest(ARRAY['user_permissions', 'contracts', 'profiles', 'countries']) LOOP
        IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = table_name) THEN
            missing_tables := array_append(missing_tables, table_name);
        END IF;
    END LOOP;
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE EXCEPTION 'Missing required tables: %', array_to_string(missing_tables, ', ');
    END IF;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;
```

### 3. **POLÍTICAS RLS OTIMIZADAS COM ÍNDICES**

```sql
-- ✅ MELHORADO: Política RLS otimizada
CREATE POLICY "contracts_optimized_access" ON contracts
    FOR ALL USING (
        user_id = auth.uid() OR
        user_has_contract_permission(id, 'read')
    );

-- Função auxiliar otimizada com cache
CREATE OR REPLACE FUNCTION user_has_contract_permission(
    contract_uuid UUID,
    permission_type VARCHAR(20)
) RETURNS BOOLEAN AS $$
BEGIN
    -- Usar índice composto para performance
    RETURN EXISTS (
        SELECT 1 FROM user_permissions up
        JOIN contracts c ON c.id = contract_uuid
        WHERE up.user_id = auth.uid()
        AND up.resource_id = contract_uuid
        AND up.resource_type = 'contract'
        AND up.permission = permission_type
        AND up.is_active = true
        AND (up.expires_at IS NULL OR up.expires_at > NOW())
        AND c.user_id = auth.uid() -- Índice composto
    );
END;
$$ LANGUAGE plpgsql STABLE; -- STABLE para cache
```

### 4. **TRANSACTIONS COM ROLLBACK AUTOMÁTICO**

```sql
-- ✅ MELHORADO: Migração com transação segura
BEGIN;

-- Verificar dependências
SELECT validate_migration_dependencies();

-- Criar tabelas com verificação
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'new_table') THEN
        CREATE TABLE new_table (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            -- campos...
        );
        RAISE NOTICE 'Table new_table created successfully';
    ELSE
        RAISE NOTICE 'Table new_table already exists, skipping creation';
    END IF;
END $$;

-- Verificar integridade antes de commit
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count FROM information_schema.tables WHERE table_name = 'new_table';
    IF table_count = 0 THEN
        RAISE EXCEPTION 'Table creation failed';
    END IF;
END $$;

COMMIT;
```

## 🛡️ TEMPLATE DE MIGRAÇÃO SEGURA

### Estrutura Recomendada:

```sql
-- =====================================================
-- MIGRAÇÃO SEGURA - TEMPLATE
-- =====================================================
-- Data: YYYY-MM-DD
-- Versão: X.X.X
-- Descrição: Descrição clara da migração

-- 1. VERIFICAÇÕES PRÉ-MIGRAÇÃO
DO $$
BEGIN
    -- Verificar versão atual
    IF NOT EXISTS (SELECT 1 FROM schema_migrations WHERE version = 'X.X.X-1') THEN
        RAISE EXCEPTION 'Previous migration required: X.X.X-1';
    END IF;
    
    -- Verificar dependências
    PERFORM validate_migration_dependencies();
    
    RAISE NOTICE 'Pre-migration checks passed';
END $$;

-- 2. BACKUP DE DADOS CRÍTICOS (se necessário)
DO $$
BEGIN
    -- Criar backup apenas se tabela existir e tiver dados
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'critical_table') THEN
        EXECUTE format('CREATE TABLE IF NOT EXISTS %I AS SELECT * FROM critical_table', 
                       'critical_table_backup_' || to_char(NOW(), 'YYYY_MM_DD_HH24_MI'));
    END IF;
END $$;

-- 3. CRIAÇÃO DE OBJETOS COM VERIFICAÇÃO
CREATE TABLE IF NOT EXISTS new_table (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ÍNDICES PARA PERFORMANCE
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_new_table_created_at 
ON new_table(created_at);

-- 5. POLÍTICAS RLS SEGURAS
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "new_table_access_policy" ON new_table
    FOR ALL USING (auth.uid() IS NOT NULL);

-- 6. TRIGGERS COM VALIDAÇÃO
CREATE OR REPLACE FUNCTION validate_new_table_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Validações específicas
    IF NEW.id IS NULL THEN
        RAISE EXCEPTION 'ID cannot be null';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_new_table_data
    BEFORE INSERT OR UPDATE ON new_table
    FOR EACH ROW EXECUTE FUNCTION validate_new_table_data();

-- 7. VERIFICAÇÕES PÓS-MIGRAÇÃO
DO $$
DECLARE
    table_exists BOOLEAN;
    index_exists BOOLEAN;
    policy_exists BOOLEAN;
BEGIN
    -- Verificar tabela
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'new_table'
    ) INTO table_exists;
    
    -- Verificar índice
    SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_new_table_created_at'
    ) INTO index_exists;
    
    -- Verificar política
    SELECT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'new_table' AND policyname = 'new_table_access_policy'
    ) INTO policy_exists;
    
    IF NOT (table_exists AND index_exists AND policy_exists) THEN
        RAISE EXCEPTION 'Migration validation failed';
    END IF;
    
    RAISE NOTICE 'Migration completed successfully';
END $$;

-- 8. REGISTRAR MIGRAÇÃO
INSERT INTO schema_migrations (version, applied_at) 
VALUES ('X.X.X', NOW())
ON CONFLICT (version) DO NOTHING;
```

## 📊 MÉTRICAS DE QUALIDADE DOS SCRIPTS ATUAIS

| Aspecto | Nota | Problemas Identificados |
|---------|------|------------------------|
| **Segurança** | 6/10 | Queries destrutivas sem backup |
| **Performance** | 5/10 | Políticas RLS ineficientes |
| **Manutenibilidade** | 7/10 | Código bem documentado |
| **Robustez** | 4/10 | Falta tratamento de erros |
| **Testabilidade** | 6/10 | Algumas verificações presentes |

## 🎯 PRIORIDADES DE IMPLEMENTAÇÃO

### **ALTA PRIORIDADE (Crítico)**
1. ✅ Implementar backup automático antes de operações destrutivas
2. ✅ Adicionar validação de dependências
3. ✅ Melhorar tratamento de erros em funções críticas
4. ✅ Otimizar políticas RLS com índices apropriados

### **MÉDIA PRIORIDADE (Importante)**
1. ✅ Implementar template de migração segura
2. ✅ Adicionar logs detalhados de operações
3. ✅ Criar funções de rollback para migrações
4. ✅ Implementar validação de integridade pós-migração

### **BAIXA PRIORIDADE (Melhoria)**
1. ✅ Adicionar métricas de performance
2. ✅ Implementar cache para funções frequentes
3. ✅ Criar documentação automatizada
4. ✅ Implementar testes automatizados para migrações

## 🔍 CHECKLIST DE SEGURANÇA

### Antes de Executar Qualquer Script:
- [ ] ✅ Backup completo do banco de dados
- [ ] ✅ Verificar dependências de tabelas
- [ ] ✅ Testar em ambiente de desenvolvimento
- [ ] ✅ Validar permissões de usuário
- [ ] ✅ Verificar espaço em disco disponível

### Durante a Execução:
- [ ] ✅ Monitorar logs de erro
- [ ] ✅ Verificar performance das queries
- [ ] ✅ Validar criação de objetos
- [ ] ✅ Confirmar políticas RLS

### Após a Execução:
- [ ] ✅ Verificar integridade dos dados
- [ ] ✅ Testar funcionalidades críticas
- [ ] ✅ Validar performance geral
- [ ] ✅ Documentar mudanças realizadas

## 📝 CONCLUSÕES E RECOMENDAÇÕES

### **Pontos Positivos dos Scripts Atuais:**
- ✅ Boa documentação e comentários
- ✅ Uso adequado de UUIDs
- ✅ Implementação de RLS
- ✅ Triggers para updated_at
- ✅ Validações básicas de dados

### **Principais Melhorias Necessárias:**
1. **Implementar sistema de backup automático** antes de operações destrutivas
2. **Otimizar políticas RLS** para melhor performance
3. **Adicionar validação robusta de dependências**
4. **Melhorar tratamento de erros** em funções críticas
5. **Implementar template de migração segura**

### **Próximos Passos Recomendados:**
1. Implementar as melhorias de alta prioridade
2. Criar testes automatizados para migrações
3. Estabelecer processo de revisão de código para scripts SQL
4. Implementar monitoramento de performance pós-migração
5. Criar documentação de troubleshooting para problemas comuns

---

**Data da Análise:** 2025-01-27  
**Analista:** Sistema de Análise de Segurança  
**Status:** Análise Completa - Aguardando Implementação das Melhorias
