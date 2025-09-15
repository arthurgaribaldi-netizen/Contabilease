-- =====================================================
-- CONTABILEASE - POLÍTICAS RLS OTIMIZADAS
-- =====================================================
-- Este script cria todas as políticas RLS com otimizações de performance
-- Execute APÓS as tabelas principais

-- =====================================================
-- HABILITAR RLS EM TODAS AS TABELAS
-- =====================================================

ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_variable_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_renewal_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_documents ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS PARA COUNTRIES (PÚBLICO)
-- =====================================================

-- Countries: Leitura pública, modificações apenas para service_role
CREATE POLICY "countries_public_read" ON countries
    FOR SELECT USING (is_active = true);

CREATE POLICY "countries_service_modify" ON countries
    FOR ALL USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- =====================================================
-- POLÍTICAS PARA PROFILES (PROPRIEDADE)
-- =====================================================

-- Profiles: Usuários podem gerenciar apenas seu próprio perfil
CREATE POLICY "profiles_select_own" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_delete_own" ON profiles
    FOR DELETE USING (auth.uid() = id);

-- =====================================================
-- POLÍTICAS PARA CONTRACTS (PROPRIEDADE + PERMISSÕES)
-- =====================================================

-- Contracts: Usuários podem gerenciar seus próprios contratos
CREATE POLICY "contracts_select_own" ON contracts
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM user_permissions 
            WHERE user_permissions.user_id = auth.uid()
            AND user_permissions.resource_id = contracts.id
            AND user_permissions.resource_type = 'contract'
            AND user_permissions.permission = 'read'
            AND user_permissions.is_active = true
            AND (user_permissions.expires_at IS NULL OR user_permissions.expires_at > NOW())
        )
    );

CREATE POLICY "contracts_insert_own" ON contracts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "contracts_update_own" ON contracts
    FOR UPDATE USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM user_permissions 
            WHERE user_permissions.user_id = auth.uid()
            AND user_permissions.resource_id = contracts.id
            AND user_permissions.resource_type = 'contract'
            AND user_permissions.permission = 'write'
            AND user_permissions.is_active = true
            AND (user_permissions.expires_at IS NULL OR user_permissions.expires_at > NOW())
        )
    )
    WITH CHECK (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM user_permissions 
            WHERE user_permissions.user_id = auth.uid()
            AND user_permissions.resource_id = contracts.id
            AND user_permissions.resource_type = 'contract'
            AND user_permissions.permission = 'write'
            AND user_permissions.is_active = true
            AND (user_permissions.expires_at IS NULL OR user_permissions.expires_at > NOW())
        )
    );

CREATE POLICY "contracts_delete_own" ON contracts
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- POLÍTICAS PARA TABELAS RELACIONADAS A CONTRATOS
-- =====================================================

-- Contract Variable Payments: Acesso baseado na propriedade do contrato
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
                    AND user_permissions.resource_id = contracts.id
                    AND user_permissions.resource_type = 'contract'
                    AND user_permissions.permission IN ('read', 'write')
                    AND user_permissions.is_active = true
                    AND (user_permissions.expires_at IS NULL OR user_permissions.expires_at > NOW())
                )
            )
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM contracts 
            WHERE contracts.id = contract_variable_payments.contract_id 
            AND (
                contracts.user_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM user_permissions 
                    WHERE user_permissions.user_id = auth.uid()
                    AND user_permissions.resource_id = contracts.id
                    AND user_permissions.resource_type = 'contract'
                    AND user_permissions.permission = 'write'
                    AND user_permissions.is_active = true
                    AND (user_permissions.expires_at IS NULL OR user_permissions.expires_at > NOW())
                )
            )
        )
    );

-- Contract Renewal Options: Mesma lógica dos pagamentos variáveis
CREATE POLICY "contract_renewal_options_access" ON contract_renewal_options
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM contracts 
            WHERE contracts.id = contract_renewal_options.contract_id 
            AND (
                contracts.user_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM user_permissions 
                    WHERE user_permissions.user_id = auth.uid()
                    AND user_permissions.resource_id = contracts.id
                    AND user_permissions.resource_type = 'contract'
                    AND user_permissions.permission IN ('read', 'write')
                    AND user_permissions.is_active = true
                    AND (user_permissions.expires_at IS NULL OR user_permissions.expires_at > NOW())
                )
            )
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM contracts 
            WHERE contracts.id = contract_renewal_options.contract_id 
            AND (
                contracts.user_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM user_permissions 
                    WHERE user_permissions.user_id = auth.uid()
                    AND user_permissions.resource_id = contracts.id
                    AND user_permissions.resource_type = 'contract'
                    AND user_permissions.permission = 'write'
                    AND user_permissions.is_active = true
                    AND (user_permissions.expires_at IS NULL OR user_permissions.expires_at > NOW())
                )
            )
        )
    );

-- Contract Documents: Mesma lógica dos outros relacionamentos
CREATE POLICY "contract_documents_access" ON contract_documents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM contracts 
            WHERE contracts.id = contract_documents.contract_id 
            AND (
                contracts.user_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM user_permissions 
                    WHERE user_permissions.user_id = auth.uid()
                    AND user_permissions.resource_id = contracts.id
                    AND user_permissions.resource_type = 'contract'
                    AND user_permissions.permission IN ('read', 'write')
                    AND user_permissions.is_active = true
                    AND (user_permissions.expires_at IS NULL OR user_permissions.expires_at > NOW())
                )
            )
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM contracts 
            WHERE contracts.id = contract_documents.contract_id 
            AND (
                contracts.user_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM user_permissions 
                    WHERE user_permissions.user_id = auth.uid()
                    AND user_permissions.resource_id = contracts.id
                    AND user_permissions.resource_type = 'contract'
                    AND user_permissions.permission = 'write'
                    AND user_permissions.is_active = true
                    AND (user_permissions.expires_at IS NULL OR user_permissions.expires_at > NOW())
                )
            )
        )
    );

-- =====================================================
-- FUNÇÃO AUXILIAR PARA VERIFICAR PERMISSÕES
-- =====================================================

CREATE OR REPLACE FUNCTION user_has_contract_permission(
    contract_uuid UUID,
    permission_type VARCHAR(20)
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM contracts 
        WHERE contracts.id = contract_uuid 
        AND (
            contracts.user_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM user_permissions 
                WHERE user_permissions.user_id = auth.uid()
                AND user_permissions.resource_id = contract_uuid
                AND user_permissions.resource_type = 'contract'
                AND user_permissions.permission = permission_type
                AND user_permissions.is_active = true
                AND (user_permissions.expires_at IS NULL OR user_permissions.expires_at > NOW())
            )
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ÍNDICES PARA OTIMIZAÇÃO DE PERFORMANCE
-- =====================================================

-- Índices para melhorar performance das políticas RLS
CREATE INDEX IF NOT EXISTS idx_user_permissions_lookup ON user_permissions(user_id, resource_id, resource_type, permission, is_active);
CREATE INDEX IF NOT EXISTS idx_user_permissions_expires ON user_permissions(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contracts_user_id_status ON contracts(user_id, status);
CREATE INDEX IF NOT EXISTS idx_contracts_user_id_type ON contracts(user_id, contract_type);

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON FUNCTION user_has_contract_permission IS 'Verifica se usuário tem permissão específica em um contrato';

-- =====================================================
-- VERIFICAÇÕES DE INTEGRIDADE
-- =====================================================

DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    -- Verificar se as políticas foram criadas
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename IN ('countries', 'profiles', 'contracts', 'contract_variable_payments', 'contract_renewal_options', 'contract_documents');
    
    IF policy_count < 15 THEN
        RAISE EXCEPTION 'Not all RLS policies were created. Expected at least 15, got %', policy_count;
    END IF;
    
    RAISE NOTICE 'RLS policies migration completed successfully. Created % policies.', policy_count;
END $$;
