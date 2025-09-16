# TEMPLATE DE MIGRAÇÃO SEGURA - SUPABASE CONTABILEASE

## 📋 TEMPLATE REUTILIZÁVEL PARA MIGRAÇÕES SEGURAS

Este template fornece uma estrutura padronizada e segura para criar migrações do Supabase, evitando erros e queries destrutivas.

## 🏗️ ESTRUTURA DO TEMPLATE

```sql
-- =====================================================
-- CONTABILEASE - [NOME DA MIGRAÇÃO]
-- =====================================================
-- Versão: X.X.X
-- Data: YYYY-MM-DD
-- Autor: [Nome do Desenvolvedor]
-- Descrição: [Descrição clara e concisa da migração]
-- Dependências: [Lista de migrações anteriores necessárias]
-- Impacto: [ALTO/MÉDIO/BAIXO] - [Descrição do impacto]

-- =====================================================
-- 1. VERIFICAÇÕES PRÉ-MIGRAÇÃO
-- =====================================================

-- Verificar se migrações anteriores foram executadas
DO $$
DECLARE
    required_migrations TEXT[] := ARRAY['[versão_anterior_1]', '[versão_anterior_2]'];
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
        RAISE EXCEPTION 'Missing required migrations: %', array_to_string(missing_migrations, ', ');
    END IF;
    
    RAISE NOTICE 'Pre-migration dependency checks passed';
END $$;

-- Verificar dependências de tabelas/funções
DO $$
DECLARE
    validation_results RECORD;
    error_count INTEGER := 0;
BEGIN
    FOR validation_results IN 
        SELECT * FROM validate_migration_dependencies()
    LOOP
        IF validation_results.status = 'ERROR' THEN
            error_count := error_count + 1;
            RAISE WARNING 'Dependency check failed: % - %', 
                validation_results.dependency_name, validation_results.details;
        END IF;
    END LOOP;
    
    IF error_count > 0 THEN
        RAISE EXCEPTION 'Migration dependency validation failed with % errors', error_count;
    END IF;
    
    RAISE NOTICE 'Dependency validation completed successfully';
END $$;

-- =====================================================
-- 2. BACKUP DE DADOS CRÍTICOS (SE NECESSÁRIO)
-- =====================================================

-- Backup automático antes de operações destrutivas
DO $$
DECLARE
    tables_to_backup TEXT[] := ARRAY['[tabela_1]', '[tabela_2]'];
    table_name TEXT;
    backup_name TEXT;
BEGIN
    FOREACH table_name IN ARRAY tables_to_backup LOOP
        -- Verificar se tabela existe e tem dados
        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = table_name AND table_schema = 'public'
        ) AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = table_name LIMIT 1) THEN
            
            backup_name := create_safe_backup(
                table_name, 
                '[sufixo_descriptivo]' || to_char(NOW(), 'YYYY_MM_DD_HH24_MI')
            );
            
            RAISE NOTICE 'Backup created for table %: %', table_name, backup_name;
        END IF;
    END LOOP;
END $$;

-- =====================================================
-- 3. CRIAÇÃO DE OBJETOS COM VERIFICAÇÃO
-- =====================================================

-- Criar tabelas com verificação de existência
CREATE TABLE IF NOT EXISTS [nome_tabela] (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- [definir campos aqui]
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verificar se tabela foi criada
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = '[nome_tabela]' AND table_schema = 'public'
    ) THEN
        RAISE EXCEPTION 'Failed to create table [nome_tabela]';
    END IF;
    
    RAISE NOTICE 'Table [nome_tabela] created successfully';
END $$;

-- =====================================================
-- 4. ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices básicos
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_[nome_tabela]_created_at 
ON [nome_tabela](created_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_[nome_tabela]_updated_at 
ON [nome_tabela](updated_at);

-- Índices específicos da aplicação
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_[nome_tabela]_[campo_importante] 
ON [nome_tabela]([campo_importante]);

-- Índices compostos para performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_[nome_tabela]_composite 
ON [nome_tabela]([campo1], [campo2], [campo3]);

-- Índices parciais para dados específicos
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_[nome_tabela]_active 
ON [nome_tabela]([campo]) WHERE [condição];

-- =====================================================
-- 5. CONSTRAINTS E VALIDAÇÕES
-- =====================================================

-- Constraints de validação
ALTER TABLE [nome_tabela] ADD CONSTRAINT chk_[nome_tabela]_[campo]_valid 
CHECK ([condição_de_validação]);

-- Constraints de chave estrangeira
ALTER TABLE [nome_tabela] ADD CONSTRAINT fk_[nome_tabela]_[campo] 
FOREIGN KEY ([campo]) REFERENCES [tabela_referenciada]([campo_referenciado])
ON DELETE [CASCADE|SET NULL|RESTRICT];

-- Constraints únicos
ALTER TABLE [nome_tabela] ADD CONSTRAINT uk_[nome_tabela]_[campo] 
UNIQUE ([campo]);

-- =====================================================
-- 6. POLÍTICAS RLS SEGURAS
-- =====================================================

-- Habilitar RLS
ALTER TABLE [nome_tabela] ENABLE ROW LEVEL SECURITY;

-- Política de acesso básica
CREATE POLICY "[nome_tabela]_access_policy" ON [nome_tabela]
    FOR ALL USING (
        auth.uid() IS NOT NULL AND
        -- [adicionar condições específicas aqui]
        true
    );

-- Política específica para SELECT
CREATE POLICY "[nome_tabela]_select_policy" ON [nome_tabela]
    FOR SELECT USING (
        auth.uid() IS NOT NULL
        -- [condições específicas de leitura]
    );

-- Política específica para INSERT
CREATE POLICY "[nome_tabela]_insert_policy" ON [nome_tabela]
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
        -- [condições específicas de inserção]
    );

-- Política específica para UPDATE
CREATE POLICY "[nome_tabela]_update_policy" ON [nome_tabela]
    FOR UPDATE USING (
        auth.uid() IS NOT NULL
        -- [condições específicas de atualização]
    )
    WITH CHECK (
        auth.uid() IS NOT NULL
        -- [condições específicas de atualização]
    );

-- Política específica para DELETE
CREATE POLICY "[nome_tabela]_delete_policy" ON [nome_tabela]
    FOR DELETE USING (
        auth.uid() IS NOT NULL
        -- [condições específicas de exclusão]
    );

-- =====================================================
-- 7. TRIGGERS E FUNÇÕES
-- =====================================================

-- Trigger para updated_at
CREATE TRIGGER trg_[nome_tabela]_updated_at
    BEFORE UPDATE ON [nome_tabela]
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função de validação específica
CREATE OR REPLACE FUNCTION validate_[nome_tabela]_data()
RETURNS TRIGGER AS $$
BEGIN
    -- [validações específicas da tabela]
    
    -- Exemplo de validação:
    IF NEW.[campo] IS NULL THEN
        RAISE EXCEPTION '[campo] cannot be null';
    END IF;
    
    -- [mais validações...]
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger de validação
CREATE TRIGGER trg_validate_[nome_tabela]_data
    BEFORE INSERT OR UPDATE ON [nome_tabela]
    FOR EACH ROW EXECUTE FUNCTION validate_[nome_tabela]_data();

-- Função de auditoria
CREATE OR REPLACE FUNCTION audit_[nome_tabela]_changes()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_trail (
        user_id,
        table_name,
        record_id,
        action,
        old_values,
        new_values
    ) VALUES (
        auth.uid(),
        '[nome_tabela]',
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger de auditoria
CREATE TRIGGER trg_audit_[nome_tabela]_changes
    AFTER INSERT OR UPDATE OR DELETE ON [nome_tabela]
    FOR EACH ROW EXECUTE FUNCTION audit_[nome_tabela]_changes();

-- =====================================================
-- 8. PERMISSÕES E COMENTÁRIOS
-- =====================================================

-- Conceder permissões básicas
GRANT SELECT, INSERT, UPDATE, DELETE ON [nome_tabela] TO authenticated;
GRANT USAGE ON SEQUENCE [sequencia_se_houver] TO authenticated;

-- Conceder permissões para funções
GRANT EXECUTE ON FUNCTION validate_[nome_tabela]_data TO authenticated;
GRANT EXECUTE ON FUNCTION audit_[nome_tabela]_changes TO authenticated;

-- Comentários para documentação
COMMENT ON TABLE [nome_tabela] IS '[Descrição da tabela]';
COMMENT ON COLUMN [nome_tabela].[campo] IS '[Descrição do campo]';
COMMENT ON FUNCTION validate_[nome_tabela]_data IS '[Descrição da função]';
COMMENT ON FUNCTION audit_[nome_tabela]_changes IS '[Descrição da função]';

-- =====================================================
-- 9. DADOS INICIAIS (SE NECESSÁRIO)
-- =====================================================

-- Inserir dados iniciais com tratamento de conflito
INSERT INTO [nome_tabela] ([campos]) VALUES
    ([valores]),
    ([valores]),
    ([valores])
ON CONFLICT ([campo_único]) DO UPDATE SET
    [campo] = EXCLUDED.[campo],
    updated_at = NOW();

-- =====================================================
-- 10. VERIFICAÇÕES PÓS-MIGRAÇÃO
-- =====================================================

DO $$
DECLARE
    table_exists BOOLEAN;
    index_count INTEGER;
    policy_count INTEGER;
    function_exists BOOLEAN;
BEGIN
    -- Verificar se tabela foi criada
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = '[nome_tabela]' AND table_schema = 'public'
    ) INTO table_exists;
    
    IF NOT table_exists THEN
        RAISE EXCEPTION 'Table [nome_tabela] was not created';
    END IF;
    
    -- Verificar se índices foram criados
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes 
    WHERE tablename = '[nome_tabela]';
    
    IF index_count < [número_mínimo_de_índices] THEN
        RAISE EXCEPTION 'Expected at least [número] indexes, got %', index_count;
    END IF;
    
    -- Verificar se políticas RLS foram criadas
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE tablename = '[nome_tabela]';
    
    IF policy_count < [número_mínimo_de_políticas] THEN
        RAISE EXCEPTION 'Expected at least [número] RLS policies, got %', policy_count;
    END IF;
    
    -- Verificar se funções foram criadas
    SELECT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'validate_[nome_tabela]_data'
    ) INTO function_exists;
    
    IF NOT function_exists THEN
        RAISE EXCEPTION 'Function validate_[nome_tabela]_data was not created';
    END IF;
    
    RAISE NOTICE 'Post-migration validation completed successfully';
END $$;

-- =====================================================
-- 11. REGISTRAR MIGRAÇÃO
-- =====================================================

INSERT INTO schema_migrations (version, description, applied_at) 
VALUES ('[X.X.X]', '[Descrição da migração]', NOW())
ON CONFLICT (version) DO UPDATE SET
    description = EXCLUDED.description,
    applied_at = EXCLUDED.applied_at;

-- Log da migração bem-sucedida
SELECT log_security_event_enhanced(
    'migration_completed',
    'low',
    NULL,
    jsonb_build_object(
        'version', '[X.X.X]',
        'description', '[Descrição da migração]',
        'tables_created', [número],
        'functions_created', [número],
        'indexes_created', [número],
        'policies_created', [número]
    )
);

-- =====================================================
-- 12. FUNÇÃO DE ROLLBACK (OPCIONAL)
-- =====================================================

CREATE OR REPLACE FUNCTION rollback_[nome_migração]()
RETURNS BOOLEAN AS $$
BEGIN
    -- [Implementar lógica de rollback específica]
    
    -- Exemplo:
    -- DROP TABLE IF EXISTS [nome_tabela];
    -- DROP FUNCTION IF EXISTS validate_[nome_tabela]_data();
    -- DROP FUNCTION IF EXISTS audit_[nome_tabela]_changes();
    
    -- Remover registro da migração
    DELETE FROM schema_migrations WHERE version = '[X.X.X]';
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION rollback_[nome_migração] TO service_role;
```

## 📝 INSTRUÇÕES DE USO

### 1. **Substituir Placeholders**
- `[nome_tabela]` → Nome da tabela sendo criada
- `[X.X.X]` → Versão da migração
- `[YYYY-MM-DD]` → Data da migração
- `[campo]` → Nome dos campos
- `[condição]` → Condições específicas

### 2. **Personalizar por Tipo de Migração**

#### **Migração de Nova Tabela:**
- Manter seções 1-11
- Remover seção 12 (rollback)
- Adicionar campos específicos na seção 3

#### **Migração de Alteração de Tabela:**
- Manter seções 1-2 (verificações e backup)
- Modificar seção 3 para usar `ALTER TABLE`
- Manter seções 4-11
- Implementar rollback na seção 12

#### **Migração de Dados:**
- Manter seções 1-2
- Remover seções 3-7 (criação de objetos)
- Focar na seção 9 (dados iniciais)
- Manter seções 10-11

### 3. **Checklist de Validação**

Antes de executar a migração:

- [ ] ✅ Todos os placeholders foram substituídos
- [ ] ✅ Dependências estão corretas
- [ ] ✅ Backup está configurado para dados críticos
- [ ] ✅ Validações pós-migração estão implementadas
- [ ] ✅ Permissões estão configuradas corretamente
- [ ] ✅ Comentários estão documentados
- [ ] ✅ Função de rollback foi implementada (se necessário)

### 4. **Exemplo de Uso Prático**

```sql
-- Substituir [nome_tabela] por "user_preferences"
-- Substituir [X.X.X] por "5.1.0"
-- Substituir campos específicos
-- etc.
```

## 🚨 AVISOS IMPORTANTES

1. **SEMPRE** teste em ambiente de desenvolvimento primeiro
2. **SEMPRE** faça backup antes de executar em produção
3. **NUNCA** execute migrações sem verificar dependências
4. **SEMPRE** valide os resultados após a execução
5. **CONSIDERE** o impacto na performance das queries existentes

## 📊 MÉTRICAS DE QUALIDADE

Uma migração bem-sucedida deve:
- ✅ Passar em todas as verificações pré-migração
- ✅ Criar todos os objetos esperados
- ✅ Manter a integridade dos dados existentes
- ✅ Passar em todas as verificações pós-migração
- ✅ Ser registrada no `schema_migrations`
- ✅ Ser logada no sistema de segurança

---

**Template criado em:** 2025-01-27  
**Versão do template:** 1.0.0  
**Compatibilidade:** Supabase PostgreSQL 15+

