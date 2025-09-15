# 🚀 Configuração CI/CD - Contabilease

Este documento descreve a configuração completa do sistema CI/CD para o projeto Contabilease.

## 📋 Visão Geral

O sistema CI/CD implementado inclui:

- **Build automatizado** com verificação de qualidade
- **Testes automatizados** com cobertura de código
- **Análise de segurança** com múltiplas ferramentas
- **Deploy automático** para staging e produção
- **Monitoramento de performance** com Lighthouse
- **Análise de bundle size** para otimização
- **Releases automatizadas** com changelog

## 🔧 Workflows Implementados

### 1. CI/CD Principal (`ci.yml`)
- Executa em push/PR para `main` e `develop`
- Inclui: qualidade, testes, build, segurança, análise de dependências
- Deploy automático para produção (apenas `main`)

### 2. Deploy Staging (`deploy-staging.yml`)
- Executa em push/PR para `develop`
- Deploy automático para ambiente de preview
- Comentários automáticos em PRs com URL de preview

### 3. Deploy Produção (`deploy-production.yml`)
- Executa em push para `main`
- Inclui verificações pré-deploy rigorosas
- Deploy para ambiente de produção
- Health check pós-deploy

### 4. Análise de Segurança (`security-scan.yml`)
- Executa semanalmente e em push/PR
- Inclui: npm audit, Snyk, CodeQL, TruffleHog, verificação de licenças

### 5. Testes de Performance (`performance-test.yml`)
- Executa semanalmente e em push/PR
- Inclui: Lighthouse CI, análise de bundle, load tests

### 6. Releases (`release.yml`)
- Executa em tags ou manualmente
- Cria releases automáticas com changelog
- Deploy automático da release

## 🔐 Configuração de Secrets

### Secrets Obrigatórios

Configure os seguintes secrets no GitHub (Settings > Secrets and variables > Actions):

```bash
VERCEL_TOKEN=your_vercel_api_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
```

### Secrets Opcionais

```bash
SNYK_TOKEN=your_snyk_token  # Para análise de segurança avançada
```

## 📊 Métricas e Thresholds

### Cobertura de Testes
- **Global**: 80% (branches, functions, lines, statements)
- **Lib**: 90%
- **Components**: 85%

### Performance Budget
- **JavaScript bundles**: < 1MB
- **CSS bundles**: < 100KB
- **Main bundle**: < 500KB
- **Framework bundle**: < 200KB

### Lighthouse Scores
- **Performance**: ≥ 80
- **Accessibility**: ≥ 90
- **Best Practices**: ≥ 80
- **SEO**: ≥ 80

## 🚀 Como Usar

### 1. Configuração Inicial

```bash
# Instalar dependências
npm ci

# Executar verificações locais
npm run quality-check

# Testar build
npm run build
```

### 2. Desenvolvimento

```bash
# Branch develop para staging
git checkout develop
git push origin develop

# Branch main para produção
git checkout main
git push origin main
```

### 3. Releases

```bash
# Criar tag para release automática
git tag v1.0.0
git push origin v1.0.0

# Ou usar workflow manual no GitHub
```

### 4. Monitoramento

- **GitHub Actions**: Acompanhe os workflows em Actions
- **Vercel**: Monitore deploys em vercel.com
- **Codecov**: Acompanhe cobertura de testes
- **Snyk**: Monitore vulnerabilidades

## 🔍 Troubleshooting

### Build Falha
1. Verifique logs do GitHub Actions
2. Execute `npm run quality-check` localmente
3. Verifique se todas as dependências estão instaladas

### Deploy Falha
1. Verifique se os secrets estão configurados
2. Confirme se o projeto existe no Vercel
3. Verifique logs do Vercel

### Testes Falham
1. Execute `npm run test:ci` localmente
2. Verifique se a cobertura está acima dos thresholds
3. Atualize testes se necessário

## 📈 Melhorias Futuras

- [ ] Integração com Slack/Discord para notificações
- [ ] Deploy automático para múltiplos ambientes
- [ ] Rollback automático em caso de falha
- [ ] Integração com ferramentas de monitoramento
- [ ] Cache otimizado para builds mais rápidos

## 📚 Recursos Adicionais

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Documentation](https://vercel.com/docs)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Snyk Documentation](https://docs.snyk.io/)

---

**Última atualização**: Janeiro 2025
**Versão**: 1.0.0
