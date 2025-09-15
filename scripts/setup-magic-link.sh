#!/bin/bash

# 🚀 Script de Configuração - Magic Link Contabilease
# Este script configura automaticamente a funcionalidade de Magic Link

set -e

echo "🔗 Configurando Magic Link para Contabilease..."
echo "=================================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    error "Execute este script na raiz do projeto Contabilease"
    exit 1
fi

log "Verificando dependências..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    error "Node.js não encontrado. Instale Node.js 18+ primeiro."
    exit 1
fi

# Verificar npm
if ! command -v npm &> /dev/null; then
    error "npm não encontrado. Instale npm primeiro."
    exit 1
fi

log "Instalando dependências necessárias..."

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    log "Instalando dependências do projeto..."
    npm install
fi

log "Verificando configuração do Supabase..."

# Verificar variáveis de ambiente
if [ ! -f ".env.local" ]; then
    warn "Arquivo .env.local não encontrado"
    echo "Criando arquivo .env.local com template..."
    cat > .env.local << EOF
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Magic Link Configuration
MAGIC_LINK_EXPIRY=3600
MAGIC_LINK_RATE_LIMIT=5
EOF
    warn "Configure as variáveis de ambiente em .env.local"
fi

log "Configurando estrutura de diretórios..."

# Criar diretórios necessários se não existirem
mkdir -p src/app/api/auth/magic-link
mkdir -p src/app/[locale]/auth/callback
mkdir -p src/app/[locale]/auth/magic-link
mkdir -p src/components/auth
mkdir -p src/hooks
mkdir -p __tests__/auth
mkdir -p supabase/email-templates

log "Verificando arquivos implementados..."

# Verificar se os arquivos principais existem
files=(
    "src/app/api/auth/magic-link/route.ts"
    "src/components/auth/MagicLinkForm.tsx"
    "src/hooks/useMagicLink.ts"
    "src/app/[locale]/auth/callback/page.tsx"
    "src/app/[locale]/auth/magic-link/page.tsx"
    "__tests__/auth/magic-link.test.tsx"
    "supabase/email-templates/magic-link.html"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        log "✅ $file"
    else
        error "❌ $file não encontrado"
    fi
done

log "Executando testes..."

# Executar testes
if npm test -- --testPathPattern="magic-link" --passWithNoTests; then
    log "✅ Testes de Magic Link passaram"
else
    warn "⚠️  Alguns testes falharam. Verifique a configuração."
fi

log "Verificando TypeScript..."

# Verificar tipos
if npm run type-check; then
    log "✅ Verificação de tipos passou"
else
    warn "⚠️  Erros de tipo encontrados"
fi

log "Configuração do Supabase necessária:"
echo ""
echo -e "${BLUE}1. Acesse o Dashboard do Supabase${NC}"
echo -e "${BLUE}2. Vá para Authentication > Settings${NC}"
echo -e "${BLUE}3. Habilite 'Enable email confirmations'${NC}"
echo -e "${BLUE}4. Configure 'Site URL' para: ${NEXT_PUBLIC_SITE_URL:-http://localhost:3000}${NC}"
echo -e "${BLUE}5. Configure 'Redirect URLs' para incluir: ${NEXT_PUBLIC_SITE_URL:-http://localhost:3000}/auth/callback${NC}"
echo -e "${BLUE}6. Personalize o template de email em Authentication > Email Templates${NC}"
echo ""

log "Configuração do Magic Link concluída!"
echo ""
echo -e "${GREEN}🎉 Magic Link está pronto para uso!${NC}"
echo ""
echo "Próximos passos:"
echo "1. Configure as variáveis de ambiente em .env.local"
echo "2. Configure o Supabase conforme instruções acima"
echo "3. Execute 'npm run dev' para testar"
echo "4. Acesse /auth/magic-link para testar a funcionalidade"
echo ""
echo -e "${BLUE}📚 Documentação completa: MAGIC_LINK_IMPLEMENTATION.md${NC}"
echo ""
