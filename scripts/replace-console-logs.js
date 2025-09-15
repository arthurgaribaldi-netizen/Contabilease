#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Script para substituir console.log por logger.debug em arquivos TypeScript/JavaScript
 * Remove logs de debug em produção conforme relatório de auditoria
 */

const SRC_DIR = path.join(__dirname, '..', 'src');
const LOGGER_IMPORT = "import { logger } from '@/lib/logger';";

function getAllFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  let files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files = files.concat(getAllFiles(fullPath, extensions));
    } else if (extensions.some(ext => item.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function replaceConsoleLogs(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Padrões de console.log para substituir
  const patterns = [
    // console.log simples
    { 
      regex: /console\.log\(([^)]+)\)/g, 
      replacement: 'logger.debug($1)' 
    },
    // console.warn
    { 
      regex: /console\.warn\(([^)]+)\)/g, 
      replacement: 'logger.warn($1)' 
    },
    // console.error
    { 
      regex: /console\.error\(([^)]+)\)/g, 
      replacement: 'logger.error($1)' 
    },
    // console.info
    { 
      regex: /console\.info\(([^)]+)\)/g, 
      replacement: 'logger.info($1)' 
    },
    // console.debug
    { 
      regex: /console\.debug\(([^)]+)\)/g, 
      replacement: 'logger.debug($1)' 
    }
  ];
  
  // Aplicar substituições
  patterns.forEach(pattern => {
    if (pattern.regex.test(content)) {
      content = content.replace(pattern.regex, pattern.replacement);
      modified = true;
    }
  });
  
  // Adicionar import do logger se necessário
  if (modified && !content.includes("import { logger }")) {
    // Encontrar a primeira linha de import
    const lines = content.split('\n');
    let insertIndex = 0;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ') || lines[i].startsWith('import{')) {
        insertIndex = i + 1;
      } else if (lines[i].trim() === '' && insertIndex > 0) {
        break;
      }
    }
    
    lines.splice(insertIndex, 0, LOGGER_IMPORT);
    content = lines.join('\n');
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${path.relative(process.cwd(), filePath)}`);
    return true;
  }
  
  return false;
}

function main() {
  console.log('🔍 Searching for console.log statements...');
  
  const files = getAllFiles(SRC_DIR);
  let updatedCount = 0;
  
  files.forEach(file => {
    if (replaceConsoleLogs(file)) {
      updatedCount++;
    }
  });
  
  console.log(`\n📊 Summary:`);
  console.log(`   Files processed: ${files.length}`);
  console.log(`   Files updated: ${updatedCount}`);
  console.log(`   Console.log statements replaced with logger.debug`);
  
  if (updatedCount > 0) {
    console.log('\n✨ All console.log statements have been replaced with logger.debug');
    console.log('   Debug logs will be automatically filtered in production');
  } else {
    console.log('\n✅ No console.log statements found to replace');
  }
}

if (require.main === module) {
  main();
}

module.exports = { replaceConsoleLogs, getAllFiles };
