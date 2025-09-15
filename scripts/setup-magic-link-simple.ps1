# Magic Link Setup Script for Contabilease

Write-Host "Configurando Magic Link para Contabilease..." -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "Execute este script na raiz do projeto Contabilease" -ForegroundColor Red
    exit 1
}

Write-Host "Verificando dependencias..." -ForegroundColor Yellow

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js nao encontrado. Instale Node.js 18+ primeiro." -ForegroundColor Red
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Host "npm encontrado: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "npm nao encontrado. Instale npm primeiro." -ForegroundColor Red
    exit 1
}

Write-Host "Verificando arquivos implementados..." -ForegroundColor Yellow

# Check if main files exist
$files = @(
    "src/app/api/auth/magic-link/route.ts",
    "src/components/auth/MagicLinkForm.tsx",
    "src/hooks/useMagicLink.ts",
    "src/app/[locale]/auth/callback/page.tsx",
    "src/app/[locale]/auth/magic-link/page.tsx",
    "__tests__/auth/magic-link.test.tsx",
    "supabase/email-templates/magic-link.html"
)

$allFilesExist = $true
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "OK: $file" -ForegroundColor Green
    } else {
        Write-Host "ERRO: $file nao encontrado" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if ($allFilesExist) {
    Write-Host ""
    Write-Host "Configuracao do Supabase necessaria:" -ForegroundColor Cyan
    Write-Host "1. Acesse o Dashboard do Supabase" -ForegroundColor White
    Write-Host "2. Va para Authentication > Settings" -ForegroundColor White
    Write-Host "3. Habilite 'Enable email confirmations'" -ForegroundColor White
    Write-Host "4. Configure 'Site URL' para: http://localhost:3000" -ForegroundColor White
    Write-Host "5. Configure 'Redirect URLs' para incluir: http://localhost:3000/auth/callback" -ForegroundColor White
    Write-Host "6. Personalize o template de email em Authentication > Email Templates" -ForegroundColor White
    Write-Host ""
    Write-Host "Magic Link esta pronto para uso!" -ForegroundColor Green
    Write-Host "Acesse /auth/magic-link para testar a funcionalidade" -ForegroundColor Yellow
} else {
    Write-Host "Alguns arquivos estao faltando. Verifique a implementacao." -ForegroundColor Red
}
