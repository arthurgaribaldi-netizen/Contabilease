#!/usr/bin/env node

/**
 * Script to add copyright headers to all critical files
 * Run with: node scripts/add-copyright-headers.js
 */

const fs = require('fs');
const path = require('path');

// Copyright header template
const COPYRIGHT_HEADER = `/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 * 
 * This file contains proprietary Contabilease software components.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

`;

// Files and directories to process
const CRITICAL_PATHS = [
  'src/lib/calculations/',
  'src/lib/schemas/',
  'src/lib/analysis/',
  'src/components/contracts/',
  'src/components/auth/',
  'src/app/api/',
  'src/middleware/',
];

// File extensions to process
const FILE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

// Files to skip
const SKIP_FILES = [
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  'coverage',
];

function shouldSkipFile(filePath) {
  return SKIP_FILES.some(skip => filePath.includes(skip));
}

function hasExistingCopyright(content) {
  return content.includes('@copyright 2025 Contabilease') || 
         content.includes('Copyright 2025');
}

function addCopyrightToFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    if (hasExistingCopyright(content)) {
      console.log(`✓ Already has copyright: ${filePath}`);
      return;
    }

    // Add copyright header at the beginning
    const newContent = COPYRIGHT_HEADER + content;
    
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✓ Added copyright to: ${filePath}`);
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
  }
}

function processDirectory(dirPath) {
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (shouldSkipFile(fullPath)) {
        continue;
      }
      
      if (stat.isDirectory()) {
        processDirectory(fullPath);
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (FILE_EXTENSIONS.includes(ext)) {
          addCopyrightToFile(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`✗ Error processing directory ${dirPath}:`, error.message);
  }
}

function main() {
  console.log('🔒 Adding copyright headers to critical files...\n');
  
  // Process each critical path
  for (const criticalPath of CRITICAL_PATHS) {
    if (fs.existsSync(criticalPath)) {
      console.log(`📁 Processing: ${criticalPath}`);
      processDirectory(criticalPath);
      console.log('');
    } else {
      console.log(`⚠️  Path not found: ${criticalPath}`);
    }
  }
  
  console.log('✅ Copyright headers added successfully!');
  console.log('\n📋 Summary:');
  console.log('- All critical files now have copyright protection');
  console.log('- Headers include proprietary license notice');
  console.log('- Contact information: arthurgaribaldi@gmail.com');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { addCopyrightToFile, processDirectory };
