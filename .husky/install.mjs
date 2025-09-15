#!/usr/bin/env node
import { chmodSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const huskyDir = join(__dirname, '..', '.husky');
const gitDir = join(__dirname, '..', '.git');

function install() {
  if (!existsSync(gitDir)) {
    console.log('Git repository not found');
    return;
  }

  if (!existsSync(huskyDir)) {
    mkdirSync(huskyDir, { recursive: true });
  }

  const huskySh = join(huskyDir, '_', 'husky.sh');
  if (!existsSync(huskySh)) {
    mkdirSync(dirname(huskySh), { recursive: true });
    writeFileSync(
      huskySh,
      `#!/usr/bin/env sh
if [ -z "$husky_skip_init" ]; then
  debug () {
    if [ "$HUSKY_DEBUG" = "1" ]; then
      echo "husky (debug) - $1"
    fi
  }

  readonly hook_name="$(basename -- "$0")"
  debug "starting $hook_name..."

  if [ "$HUSKY" = "0" ]; then
    debug "HUSKY env variable is set to 0, skipping hook"
    exit 0
  fi

  if [ -f ~/.huskyrc ]; then
    debug "sourcing ~/.huskyrc"
    . ~/.huskyrc
  fi

  readonly husky_skip_init=1
  export husky_skip_init
  sh -e "$0" "$@"
  exitCode="$?"

  if [ $exitCode != 0 ]; then
    echo "husky - $hook_name hook exited with code $exitCode (error)"
  fi

  if [ $exitCode = 127 ]; then
    echo "husky - command not found in PATH=$PATH"
  fi

  exit $exitCode
fi`
    );
    chmodSync(huskySh, '755');
  }

  // Install pre-commit hook
  const preCommitHook = join(gitDir, 'hooks', 'pre-commit');
  const preCommitContent = `#!/usr/bin/env sh
. "$(dirname -- "$0")/../.husky/_/husky.sh"

# Executa verificações de qualidade antes do commit
echo "🔍 Executando verificações de qualidade de código..."

# Verifica se há arquivos staged
if [ -z "$(git diff --cached --name-only)" ]; then
  echo "❌ Nenhum arquivo staged para commit"
  exit 1
fi

# Executa lint-staged
npx lint-staged

# Verifica se lint-staged passou
if [ $? -ne 0 ]; then
  echo "❌ Verificações de qualidade falharam"
  exit 1
fi

echo "✅ Todas as verificações de qualidade passaram!"`;

  writeFileSync(preCommitHook, preCommitContent);
  chmodSync(preCommitHook, '755');

  // Install commit-msg hook
  const commitMsgHook = join(gitDir, 'hooks', 'commit-msg');
  const commitMsgContent = `#!/usr/bin/env sh
. "$(dirname -- "$0")/../.husky/_/husky.sh"

# Verifica se a mensagem de commit segue o padrão
commit_regex='^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\\(.+\\))?: .{1,50}'

if ! grep -qE "$commit_regex" "$1"; then
    echo "❌ Formato de commit inválido!"
    echo ""
    echo "📝 Formato esperado:"
    echo "  <tipo>(<escopo>): <descrição>"
    echo ""
    echo "🔧 Tipos válidos:"
    echo "  feat:     Nova funcionalidade"
    echo "  fix:      Correção de bug"
    echo "  docs:     Documentação"
    echo "  style:    Formatação, sem mudança de código"
    echo "  refactor: Refatoração de código"
    echo "  test:     Adição ou correção de testes"
    echo "  chore:    Mudanças em ferramentas, configurações"
    echo "  perf:     Melhoria de performance"
    echo "  ci:       Mudanças em CI/CD"
    echo "  build:    Mudanças no sistema de build"
    echo "  revert:   Reversão de commit"
    echo ""
    echo "📋 Exemplos:"
    echo "  feat(auth): adicionar login com Google"
    echo "  fix(ui): corrigir layout responsivo"
    echo "  docs: atualizar README"
    echo "  chore: atualizar dependências"
    echo ""
    exit 1
fi

echo "✅ Formato de commit válido!"`;

  writeFileSync(commitMsgHook, commitMsgContent);
  chmodSync(commitMsgHook, '755');

  console.log('✅ Husky installed successfully');
}

install();
