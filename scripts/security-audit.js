#!/usr/bin/env node

/**
 * Security Audit Script for Contabilease
 * Checks compliance with IP protection measures
 * Run with: node scripts/security-audit.js
 */

const fs = require('fs');
const path = require('path');

// Security audit configuration
const AUDIT_CONFIG = {
  requiredFiles: [
    'LICENSE.txt',
    'TERMS_OF_SERVICE.md',
    'PRIVACY_POLICY.md',
    'PROTECAO_PROPRIEDADE_INTELECTUAL.md'
  ],
  
  criticalDirectories: [
    'src/lib/calculations/',
    'src/lib/schemas/',
    'src/lib/analysis/',
    'src/lib/security/',
    'src/components/contracts/',
    'src/app/api/'
  ],
  
  requiredExtensions: ['.ts', '.tsx'],
  
  copyrightPattern: /@copyright 2025 Contabilease/,
  
  securityHeaders: [
    'obfuscation',
    'rate-limiting',
    'copyright-monitoring'
  ]
};

class SecurityAuditor {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      errors: []
    };
  }

  /**
   * Run complete security audit
   */
  async runAudit() {
    console.log('🛡️  Contabilease Security Audit\n');
    console.log('=' .repeat(50));
    
    await this.checkRequiredFiles();
    await this.checkCopyrightHeaders();
    await this.checkSecurityImplementation();
    await this.checkConfiguration();
    
    this.generateReport();
  }

  /**
   * Check if all required files exist
   */
  async checkRequiredFiles() {
    console.log('\n📋 Checking Required Files...');
    
    for (const file of AUDIT_CONFIG.requiredFiles) {
      if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
        this.results.passed++;
      } else {
        console.log(`❌ ${file} - MISSING`);
        this.results.failed++;
        this.results.errors.push(`Missing required file: ${file}`);
      }
    }
  }

  /**
   * Check copyright headers in critical files
   */
  async checkCopyrightHeaders() {
    console.log('\n©️  Checking Copyright Headers...');
    
    for (const dir of AUDIT_CONFIG.criticalDirectories) {
      if (!fs.existsSync(dir)) {
        console.log(`⚠️  Directory not found: ${dir}`);
        this.results.warnings++;
        continue;
      }
      
      const files = this.getFilesInDirectory(dir);
      
      for (const file of files) {
        if (AUDIT_CONFIG.requiredExtensions.includes(path.extname(file))) {
          const content = fs.readFileSync(file, 'utf8');
          
          if (AUDIT_CONFIG.copyrightPattern.test(content)) {
            console.log(`✅ ${file}`);
            this.results.passed++;
          } else {
            console.log(`❌ ${file} - Missing copyright header`);
            this.results.failed++;
            this.results.errors.push(`Missing copyright header: ${file}`);
          }
        }
      }
    }
  }

  /**
   * Check security implementation
   */
  async checkSecurityImplementation() {
    console.log('\n🔒 Checking Security Implementation...');
    
    // Check security modules
    for (const module of AUDIT_CONFIG.securityHeaders) {
      const filePath = `src/lib/security/${module}.ts`;
      
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        if (AUDIT_CONFIG.copyrightPattern.test(content)) {
          console.log(`✅ ${module}.ts`);
          this.results.passed++;
        } else {
          console.log(`❌ ${module}.ts - Missing copyright`);
          this.results.failed++;
          this.results.errors.push(`Missing copyright in security module: ${module}.ts`);
        }
      } else {
        console.log(`❌ ${module}.ts - File not found`);
        this.results.failed++;
        this.results.errors.push(`Missing security module: ${module}.ts`);
      }
    }
    
    // Check middleware
    const middlewarePath = 'src/middleware/security.ts';
    if (fs.existsSync(middlewarePath)) {
      console.log('✅ Security middleware');
      this.results.passed++;
    } else {
      console.log('❌ Security middleware - Missing');
      this.results.failed++;
      this.results.errors.push('Missing security middleware');
    }
  }

  /**
   * Check configuration files
   */
  async checkConfiguration() {
    console.log('\n⚙️  Checking Configuration...');
    
    // Check package.json for security scripts
    if (fs.existsSync('package.json')) {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      if (packageJson.scripts && packageJson.scripts['security-audit']) {
        console.log('✅ Security audit script configured');
        this.results.passed++;
      } else {
        console.log('⚠️  Security audit script not configured');
        this.results.warnings++;
      }
    }
    
    // Check for security-related dependencies
    if (fs.existsSync('package.json')) {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const securityDeps = ['helmet', 'express-rate-limit', 'cors'];
      
      let foundDeps = 0;
      for (const dep of securityDeps) {
        if (packageJson.dependencies && packageJson.dependencies[dep]) {
          foundDeps++;
        }
      }
      
      if (foundDeps > 0) {
        console.log(`✅ Found ${foundDeps} security dependencies`);
        this.results.passed++;
      } else {
        console.log('⚠️  No security dependencies found');
        this.results.warnings++;
      }
    }
  }

  /**
   * Get all files in directory recursively
   */
  getFilesInDirectory(dir) {
    const files = [];
    
    function traverse(currentDir) {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          traverse(fullPath);
        } else if (stat.isFile()) {
          files.push(fullPath);
        }
      }
    }
    
    traverse(dir);
    return files;
  }

  /**
   * Generate audit report
   */
  generateReport() {
    console.log('\n' + '=' .repeat(50));
    console.log('📊 SECURITY AUDIT REPORT');
    console.log('=' .repeat(50));
    
    const total = this.results.passed + this.results.failed + this.results.warnings;
    const passRate = ((this.results.passed / total) * 100).toFixed(1);
    
    console.log(`\n✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⚠️  Warnings: ${this.results.warnings}`);
    console.log(`📈 Pass Rate: ${passRate}%`);
    
    if (this.results.errors.length > 0) {
      console.log('\n🚨 CRITICAL ISSUES:');
      this.results.errors.forEach(error => {
        console.log(`   • ${error}`);
      });
    }
    
    // Generate recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    
    if (this.results.failed > 0) {
      console.log('   • Fix all failed checks immediately');
      console.log('   • Add missing copyright headers');
      console.log('   • Implement missing security measures');
    }
    
    if (this.results.warnings > 0) {
      console.log('   • Address warnings to improve security posture');
      console.log('   • Consider adding security dependencies');
      console.log('   • Configure security audit scripts');
    }
    
    if (this.results.failed === 0 && this.results.warnings === 0) {
      console.log('   • Excellent! All security measures are in place');
      console.log('   • Continue regular audits and monitoring');
    }
    
    console.log('\n🔄 Next Steps:');
    console.log('   • Run this audit monthly');
    console.log('   • Update security measures as needed');
    console.log('   • Monitor for new threats and vulnerabilities');
    
    console.log('\n📞 Contact: arthurgaribaldi@gmail.com');
    console.log('📅 Audit Date:', new Date().toISOString());
    
    // Save report to file
    this.saveReport();
  }

  /**
   * Save audit report to file
   */
  saveReport() {
    const report = {
      timestamp: new Date().toISOString(),
      results: this.results,
      recommendations: this.getRecommendations(),
      nextAuditDate: this.getNextAuditDate()
    };
    
    fs.writeFileSync(
      'security-audit-report.json',
      JSON.stringify(report, null, 2)
    );
    
    console.log('\n💾 Report saved to: security-audit-report.json');
  }

  /**
   * Get security recommendations
   */
  getRecommendations() {
    const recommendations = [];
    
    if (this.results.failed > 0) {
      recommendations.push('Address all failed security checks immediately');
      recommendations.push('Add missing copyright headers to all critical files');
      recommendations.push('Implement missing security modules');
    }
    
    if (this.results.warnings > 0) {
      recommendations.push('Add security dependencies to package.json');
      recommendations.push('Configure automated security testing');
      recommendations.push('Implement additional monitoring');
    }
    
    recommendations.push('Schedule monthly security audits');
    recommendations.push('Keep security documentation updated');
    recommendations.push('Monitor for new threats and vulnerabilities');
    
    return recommendations;
  }

  /**
   * Get next audit date (30 days from now)
   */
  getNextAuditDate() {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 30);
    return nextDate.toISOString();
  }
}

// Run the audit
if (require.main === module) {
  const auditor = new SecurityAuditor();
  auditor.runAudit().catch(console.error);
}

module.exports = SecurityAuditor;
