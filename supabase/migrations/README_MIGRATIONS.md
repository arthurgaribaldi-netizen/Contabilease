# Guia de Migrações do Supabase - Contabilease

## Visão Geral

Este diretório contém os scripts de migração do Supabase para o projeto Contabilease. Os scripts foram auditados e otimizados para garantir segurança, performance e integridade dos dados.

## ⚠️ ORDEM DE EXECUÇÃO CORRIGIDA

**IMPORTANTE**: Execute os scripts na seguinte ordem para evitar erros:

1. **000_base_migration.sql** - Extensões e funções base
2. **001_core_tables_consolidated.sql** - Tabelas principais
3. **005_security_tables_creation.sql** - Tabelas de segurança (MOVIDO)
4. **002_rls_policies_optimized.sql** - Políticas RLS (MOVIDO)
5. **003_initial_data_and_validations.sql** - Dados iniciais e validações (MOVIDO)
6. **004_security_improvements_safe.sql** - Melhorias de segurança
7. **006_final_validation.sql** - Validação final do sistema
8. **007_performance_and_security_optimizations.sql** - Otimizações de performance
9. **008_critical_fixes.sql** - Correções críticas (NOVO)

## 🔧 CORREÇÕES APLICADAS

### Problemas Identificados e Corrigidos:
- ✅ **Dependências circulares**: Reorganizada ordem de execução
- ✅ **Queries destrutivas**: Adicionado LIMIT e verificações de segurança
- ✅ **Erros de sintaxe**: Corrigidos CASTs inválidos e referências
- ✅ **Índices problemáticos**: Adicionadas verificações de existência
- ✅ **Políticas RLS**: Corrigidas referências a tabelas inexistentes

## Melhorias Implementadas

### Segurança
- ✅ Transações para garantir atomicidade
- ✅ Verificações de dependências entre migrações
- ✅ Queries destrutivas com LIMIT para evitar operações em massa
- ✅ Políticas RLS otimizadas com service_role
- ✅ Auditoria automática de mudanças críticas
- ✅ Rate limiting integrado
- ✅ Logs de segurança com retry mechanism

### Performance
- ✅ Índices criados com CONCURRENTLY
- ✅ Índices compostos otimizados
- ✅ Índices parciais para dados específicos
- ✅ Views otimizadas para relatórios
- ✅ Funções de busca otimizadas com paginação

### Integridade
- ✅ Controle de versão de migrações
- ✅ Validações de dados com constraints
- ✅ Verificações pós-migração
- ✅ Rollback mechanism
- ✅ Backup automático antes de operações destrutivas

## Estrutura das Tabelas

### Tabelas Principais
- `countries` - Países suportados
- `profiles` - Perfis de usuários
- `contracts` - Contratos IFRS 16
- `contract_variable_payments` - Pagamentos variáveis
- `contract_renewal_options` - Opções de renovação
- `contract_documents` - Documentos de contratos

### Tabelas de Segurança
- `security_logs` - Logs de eventos de segurança
- `user_permissions` - Permissões granulares
- `rate_limits` - Controle de rate limiting
- `audit_trail` - Trilha de auditoria
- `session_logs` - Logs de sessão
- `schema_migrations` - Controle de migrações

## Funções Principais

### Validação e Cálculos
- `validate_contract_data()` - Valida dados de contrato
- `calculate_ifrs16_values()` - Calcula valores IFRS 16
- `is_valid_uuid()` - Valida formato UUID

### Segurança
- `log_security_event()` - Log de eventos de segurança
- `check_rate_limit()` - Verifica rate limiting
- `audit_critical_changes()` - Auditoria de mudanças críticas

### Performance
- `get_user_contracts()` - Busca contratos do usuário
- `get_contract_statistics()` - Estatísticas de contratos
- `cleanup_old_data()` - Limpeza segura de dados antigos

## Views Disponíveis

- `active_contracts_summary` - Resumo de contratos ativos
- `security_dashboard` - Dashboard de métricas de segurança
- `security_metrics` - Métricas de segurança detalhadas

## Políticas RLS

Todas as tabelas principais têm políticas RLS configuradas:

- **Countries**: Leitura pública, modificações apenas para service_role
- **Profiles**: Usuários podem gerenciar apenas seu próprio perfil
- **Contracts**: Propriedade + permissões granulares
- **Tabelas relacionadas**: Acesso baseado na propriedade do contrato
- **Tabelas de segurança**: Acesso restrito por role

## Monitoramento e Manutenção

### Limpeza Automática
- Logs de segurança: 90 dias
- Rate limits: 24 horas
- Sessões inativas: 30 dias

### Verificações Recomendadas
```sql
-- Verificar status das migrações
SELECT * FROM schema_migrations ORDER BY applied_at;

-- Verificar métricas de segurança
SELECT * FROM security_dashboard LIMIT 7;

-- Verificar performance dos índices
SELECT * FROM pg_stat_user_indexes WHERE schemaname = 'public';
```

## 🚨 TROUBLESHOOTING

### Problemas Comuns e Soluções

1. **Migração falha por dependência**
   ```sql
   -- Execute primeiro o validador
   \i supabase/migrations/validate_migrations.sql
   
   -- Se houver erros, execute as correções
   \i supabase/migrations/008_critical_fixes.sql
   ```

2. **Performance lenta**
   ```sql
   -- Verificar índices
   SELECT * FROM pg_stat_user_indexes WHERE schemaname = 'public';
   
   -- Executar ANALYZE
   ANALYZE contracts, profiles, security_logs;
   ```

3. **Erro de permissão**
   ```sql
   -- Verificar role atual
   SELECT current_role;
   
   -- Verificar políticas RLS
   SELECT * FROM pg_policies WHERE schemaname = 'public';
   ```

4. **Queries destrutivas bloqueadas**
   ```sql
   -- Usar função segura de limpeza
   SELECT safe_cleanup_security_logs();
   ```

### ⚡ SOLUÇÃO RÁPIDA PARA ERROS

Se você está enfrentando erros ao executar as migrações:

1. **Execute o validador primeiro**:
   ```bash
   psql -h your-host -U your-user -d your-db -f supabase/migrations/validate_migrations.sql
   ```

2. **Se houver erros críticos, execute as correções**:
   ```bash
   psql -h your-host -U your-user -d your-db -f supabase/migrations/008_critical_fixes.sql
   ```

3. **Execute as migrações na ordem correta**:
   ```bash
   # Ordem corrigida
   psql -f 000_base_migration.sql
   psql -f 001_core_tables_consolidated.sql
   psql -f 005_security_tables_creation.sql
   psql -f 002_rls_policies_optimized.sql
   psql -f 003_initial_data_and_validations.sql
   psql -f 004_security_improvements_safe.sql
   psql -f 006_final_validation.sql
   psql -f 007_performance_and_security_optimizations.sql
   psql -f 008_critical_fixes.sql
   ```

### Logs de Debug
```sql
-- Verificar logs de segurança recentes
SELECT * FROM security_logs 
WHERE created_at >= NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

-- Verificar auditoria de mudanças
SELECT * FROM audit_trail 
WHERE created_at >= NOW() - INTERVAL '1 day'
ORDER BY created_at DESC;
```

## Backup e Restore

### Backup Automático
As funções de limpeza criam backups automáticos antes de operações destrutivas.

### Backup Manual
```sql
-- Backup de tabela específica
SELECT create_safe_backup('contracts', 'manual_backup');

-- Backup completo (usar pg_dump)
-- pg_dump -h host -U user -d database > backup.sql
```

## Considerações de Produção

1. **Executar em horário de baixo tráfego**
2. **Monitorar logs durante a execução**
3. **Ter backup completo antes de migrações**
4. **Testar em ambiente de staging primeiro**
5. **Verificar performance após migrações**

## Suporte

Para problemas ou dúvidas sobre as migrações:
1. Verifique os logs de segurança
2. Consulte a documentação do Supabase
3. Execute as verificações de integridade
4. Contate a equipe de desenvolvimento

---

**Última atualização**: 2025-01-27  
**Versão das migrações**: 7.0.0  
**Status**: ✅ Auditado e Otimizado
