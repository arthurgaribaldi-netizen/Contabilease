#!/bin/bash

# Script para configurar o ambiente de CI/CD
# Este script pode ser executado localmente para testar os workflows

set -e

echo "🚀 Configurando ambiente de CI/CD..."

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Execute este script na raiz do projeto"
    exit 1
fi

# Instalar dependências
echo "📦 Instalando dependências..."
npm ci

# Executar verificações de qualidade
echo "🔍 Executando verificações de qualidade..."
npm run quality-check

# Executar testes
echo "🧪 Executando testes..."
npm run test:ci

# Verificar build
echo "🏗️ Testando build..."
npm run build

# Verificar se o build foi bem-sucedido
if [ ! -d ".next" ]; then
    echo "❌ Build falhou - diretório .next não encontrado"
    exit 1
fi

echo "✅ Ambiente de CI/CD configurado com sucesso!"
echo "🌐 Para testar localmente, execute: npm start"
