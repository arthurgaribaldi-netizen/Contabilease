# Exemplo de configuração de variáveis de ambiente para GitHub Actions
# Este arquivo serve como referência para configurar os secrets necessários
#
# Secrets obrigatórios para deploy no Vercel:
# VERCEL_TOKEN - Token de API do Vercel
# VERCEL_ORG_ID - ID da organização no Vercel
# VERCEL_PROJECT_ID - ID do projeto no Vercel
#
# Secrets opcionais para funcionalidades avançadas:
# SNYK_TOKEN - Token do Snyk para análise de segurança
# GITHUB_TOKEN - Token do GitHub (gerado automaticamente)
#
# Como configurar os secrets:
# 1. Vá para Settings > Secrets and variables > Actions
# 2. Clique em "New repository secret"
# 3. Adicione cada secret com o nome e valor correspondente
#
# Para obter os tokens do Vercel:
# 1. Acesse https://vercel.com/account/tokens
# 2. Crie um novo token
# 3. Use o token como VERCEL_TOKEN
# 4. Para ORG_ID e PROJECT_ID, consulte a documentação do Vercel

# Este arquivo é apenas para documentação
# Não é executado como workflow do GitHub Actions