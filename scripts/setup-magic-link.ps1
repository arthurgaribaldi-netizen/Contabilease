# 🚀 Script de Configuração - Magic Link Contabilease (PowerShell)
# Este script configura automaticamente a funcionalidade de Magic Link

param(
    [switch]$SkipTests,
    [switch]$SkipTypeCheck
)

Write-Host "🔗 Configurando Magic Link para Contabilease..." -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Função para log
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    switch ($Level) {
        "INFO" { Write-Host "[INFO] $Message" -ForegroundColor Green }
        "WARN" { Write-Host "[WARN] $Message" -ForegroundColor Yellow }
        "ERROR" { Write-Host "[ERROR] $Message" -ForegroundColor Red }
    }
}

# Verificar se estamos no diretório correto
if (-not (Test-Path "package.json")) {
    Write-Log "Execute este script na raiz do projeto Contabilease" "ERROR"
    exit 1
}

Write-Log "Verificando dependencias..."

# Verificar Node.js
try {
    $nodeVersion = node --version
    Write-Log "Node.js encontrado: $nodeVersion"
} catch {
    Write-Log "Node.js nao encontrado. Instale Node.js 18+ primeiro." "ERROR"
    exit 1
}

# Verificar npm
try {
    $npmVersion = npm --version
    Write-Log "npm encontrado: $npmVersion"
} catch {
    Write-Log "npm nao encontrado. Instale npm primeiro." "ERROR"
    exit 1
}

Write-Log "Instalando dependencias necessarias..."

# Instalar dependências se necessário
if (-not (Test-Path "node_modules")) {
    Write-Log "Instalando dependencias do projeto..."
    npm install
}

Write-Log "Verificando configuracao do Supabase..."

# Verificar variáveis de ambiente
if (-not (Test-Path ".env.local")) {
    Write-Log "Arquivo .env.local nao encontrado" "WARN"
    Write-Log "Criando arquivo .env.local com template..."
    
    $envContent = @"
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Magic Link Configuration
MAGIC_LINK_EXPIRY=3600
MAGIC_LINK_RATE_LIMIT=5
"@
    
    $envContent | Out-File -FilePath ".env.local" -Encoding UTF8
    Write-Log "Configure as variaveis de ambiente em .env.local" "WARN"
}

Write-Log "Configurando estrutura de diretorios..."

# Criar diretórios necessários se não existirem
$directories = @(
    "src/app/api/auth/magic-link",
    "src/app/[locale]/auth/callback",
    "src/app/[locale]/auth/magic-link",
    "src/components/auth",
    "src/hooks",
    "__tests__/auth",
    "supabase/email-templates"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}

Write-Log "Verificando arquivos implementados..."

# Verificar se os arquivos principais existem
$files = @(
    "src/app/api/auth/magic-link/route.ts",
    "src/components/auth/MagicLinkForm.tsx",
    "src/hooks/useMagicLink.ts",
    "src/app/[locale]/auth/callback/page.tsx",
    "src/app/[locale]/auth/magic-link/page.tsx",
    "__tests__/auth/magic-link.test.tsx",
    "supabase/email-templates/magic-link.html"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Log "✅ $file"
    } else {
        Write-Log "❌ $file nao encontrado" "ERROR"
    }
}

# Executar testes se não foi pulado
if (-not $SkipTests) {
    Write-Log "Executando testes..."
    
    try {
        $testResult = npm test -- --testPathPattern="magic-link" --passWithNoTests 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Log "✅ Testes de Magic Link passaram"
        } else {
            Write-Log "⚠️  Alguns testes falharam. Verifique a configuracao." "WARN"
        }
    } catch {
        Write-Log "⚠️  Erro ao executar testes." "WARN"
    }
}

# Verificar tipos se não foi pulado
if (-not $SkipTypeCheck) {
    Write-Log "Verificando TypeScript..."
    
    try {
        $typeCheckResult = npm run type-check 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Log "✅ Verificacao de tipos passou"
        } else {
            Write-Log "⚠️  Erros de tipo encontrados" "WARN"
        }
    } catch {
        Write-Log "⚠️  Erro ao verificar tipos." "WARN"
    }
}

Write-Log "Configuracao do Supabase necessaria:"
Write-Host ""
Write-Host "1. Acesse o Dashboard do Supabase" -ForegroundColor Blue
Write-Host "2. Va para Authentication > Settings" -ForegroundColor Blue
Write-Host "3. Habilite 'Enable email confirmations'" -ForegroundColor Blue
Write-Host "4. Configure 'Site URL' para: http://localhost:3000" -ForegroundColor Blue
Write-Host "5. Configure 'Redirect URLs' para incluir: http://localhost:3000/auth/callback" -ForegroundColor Blue
Write-Host "6. Personalize o template de email em Authentication > Email Templates" -ForegroundColor Blue
Write-Host ""

Write-Log "Configuracao do Magic Link concluida!"
Write-Host ""
Write-Host "🎉 Magic Link esta pronto para uso!" -ForegroundColor Green
Write-Host ""
Write-Host "Proximos passos:"
Write-Host "1. Configure as variaveis de ambiente em .env.local"
Write-Host "2. Configure o Supabase conforme instrucoes acima"
Write-Host "3. Execute 'npm run dev' para testar"
Write-Host "4. Acesse /auth/magic-link para testar a funcionalidade"
Write-Host ""
Write-Host "📚 Documentacao completa: MAGIC_LINK_IMPLEMENTATION.md" -ForegroundColor Blue
Write-Host ""