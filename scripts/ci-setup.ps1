# Script PowerShell para configurar o ambiente de CI/CD
# Este script pode ser executado localmente para testar os workflows

Write-Host "🚀 Configurando ambiente de CI/CD..." -ForegroundColor Green

# Verificar se estamos no diretório correto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Execute este script na raiz do projeto" -ForegroundColor Red
    exit 1
}

try {
    # Instalar dependências
    Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
    npm ci

    # Executar verificações de qualidade
    Write-Host "🔍 Executando verificações de qualidade..." -ForegroundColor Yellow
    npm run quality-check

    # Executar testes
    Write-Host "🧪 Executando testes..." -ForegroundColor Yellow
    npm run test:ci

    # Verificar build
    Write-Host "🏗️ Testando build..." -ForegroundColor Yellow
    npm run build

    # Verificar se o build foi bem-sucedido
    if (-not (Test-Path ".next")) {
        Write-Host "❌ Build falhou - diretório .next não encontrado" -ForegroundColor Red
        exit 1
    }

    Write-Host "✅ Ambiente de CI/CD configurado com sucesso!" -ForegroundColor Green
    Write-Host "🌐 Para testar localmente, execute: npm start" -ForegroundColor Cyan
}
catch {
    Write-Host "❌ Erro durante a configuração: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
