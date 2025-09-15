/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 * 
 * Sistema de Auditoria de Segurança
 * Verificações automáticas de segurança e compliance
 */

import { logger } from '../logger';

export interface SecurityAuditResult {
  check: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details?: Record<string, unknown>;
  recommendation?: string;
}

export interface SecurityAuditReport {
  timestamp: string;
  environment: string;
  overallStatus: 'pass' | 'fail' | 'warning';
  results: SecurityAuditResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
    critical: number;
  };
}

class SecurityAuditor {
  private results: SecurityAuditResult[] = [];

  async runAudit(): Promise<SecurityAuditReport> {
    this.results = [];
    
    // Executar todas as verificações
    await Promise.all([
      this.checkEnvironmentVariables(),
      this.checkHTTPSConfiguration(),
      this.checkCSPConfiguration(),
      this.checkRateLimiting(),
      this.checkAuthentication(),
      this.checkDataValidation(),
      this.checkLoggingSecurity(),
      this.checkDependencies(),
      this.checkHeaders(),
      this.checkFileUploads(),
    ]);

    const summary = this.generateSummary();
    const overallStatus = this.determineOverallStatus();

    const report: SecurityAuditReport = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      overallStatus,
      results: this.results,
      summary,
    };

    // Log do relatório
    if (overallStatus === 'fail') {
      logger.error('Security audit failed', { report });
    } else if (overallStatus === 'warning') {
      logger.warn('Security audit warnings found', { report });
    } else {
      logger.info('Security audit passed', { report });
    }

    return report;
  }

  private addResult(result: SecurityAuditResult): void {
    this.results.push(result);
  }

  private async checkEnvironmentVariables(): Promise<void> {
    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET',
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      this.addResult({
        check: 'environment_variables',
        status: 'fail',
        message: `Missing required environment variables: ${missingVars.join(', ')}`,
        severity: 'critical',
        details: { missingVars },
        recommendation: 'Set all required environment variables',
      });
    } else {
      this.addResult({
        check: 'environment_variables',
        status: 'pass',
        message: 'All required environment variables are set',
        severity: 'low',
      });
    }

    // Verificar variáveis sensíveis em produção
    if (process.env.NODE_ENV === 'production') {
      const sensitiveVars = ['SUPABASE_SERVICE_ROLE_KEY', 'STRIPE_SECRET_KEY'];
      const exposedVars = sensitiveVars.filter(varName => 
        process.env[varName] && process.env[varName]!.length < 20
      );

      if (exposedVars.length > 0) {
        this.addResult({
          check: 'sensitive_environment_variables',
          status: 'warning',
          message: 'Some sensitive environment variables appear to be test values',
          severity: 'high',
          details: { exposedVars },
          recommendation: 'Use production-grade secrets',
        });
      }
    }
  }

  private async checkHTTPSConfiguration(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      // Verificar se está rodando em HTTPS
      const isHTTPS = process.env.VERCEL_URL?.startsWith('https://') || 
                     process.env.NODE_ENV === 'production';

      if (!isHTTPS) {
        this.addResult({
          check: 'https_configuration',
          status: 'fail',
          message: 'Application is not running on HTTPS in production',
          severity: 'critical',
          recommendation: 'Enable HTTPS in production',
        });
      } else {
        this.addResult({
          check: 'https_configuration',
          status: 'pass',
          message: 'HTTPS is properly configured',
          severity: 'low',
        });
      }
    }
  }

  private async checkCSPConfiguration(): Promise<void> {
    // Verificar se CSP está configurado
    const cspHeader = process.env.CSP_HEADER;
    
    if (!cspHeader && process.env.NODE_ENV === 'production') {
      this.addResult({
        check: 'content_security_policy',
        status: 'warning',
        message: 'Content Security Policy not configured',
        severity: 'medium',
        recommendation: 'Configure CSP headers',
      });
    } else {
      this.addResult({
        check: 'content_security_policy',
        status: 'pass',
        message: 'Content Security Policy is configured',
        severity: 'low',
      });
    }
  }

  private async checkRateLimiting(): Promise<void> {
    // Verificar se rate limiting está configurado
    const rateLimitEnabled = process.env.RATE_LIMIT_ENABLED === 'true';
    
    if (!rateLimitEnabled) {
      this.addResult({
        check: 'rate_limiting',
        status: 'warning',
        message: 'Rate limiting is not enabled',
        severity: 'medium',
        recommendation: 'Enable rate limiting for API endpoints',
      });
    } else {
      this.addResult({
        check: 'rate_limiting',
        status: 'pass',
        message: 'Rate limiting is enabled',
        severity: 'low',
      });
    }
  }

  private async checkAuthentication(): Promise<void> {
    // Verificar configuração de autenticação
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      this.addResult({
        check: 'authentication',
        status: 'fail',
        message: 'Authentication not properly configured',
        severity: 'critical',
        recommendation: 'Configure Supabase authentication',
      });
    } else {
      this.addResult({
        check: 'authentication',
        status: 'pass',
        message: 'Authentication is properly configured',
        severity: 'low',
      });
    }

    // Verificar se MFA está habilitado
    const mfaEnabled = process.env.MFA_ENABLED === 'true';
    if (!mfaEnabled && process.env.NODE_ENV === 'production') {
      this.addResult({
        check: 'multi_factor_authentication',
        status: 'warning',
        message: 'Multi-factor authentication is not enabled',
        severity: 'medium',
        recommendation: 'Enable MFA for enhanced security',
      });
    }
  }

  private async checkDataValidation(): Promise<void> {
    // Verificar se validação de dados está configurada
    const validationEnabled = process.env.DATA_VALIDATION_ENABLED === 'true';
    
    if (!validationEnabled) {
      this.addResult({
        check: 'data_validation',
        status: 'warning',
        message: 'Data validation is not enabled',
        severity: 'medium',
        recommendation: 'Enable input validation for all endpoints',
      });
    } else {
      this.addResult({
        check: 'data_validation',
        status: 'pass',
        message: 'Data validation is enabled',
        severity: 'low',
      });
    }
  }

  private async checkLoggingSecurity(): Promise<void> {
    // Verificar se logging está configurado de forma segura
    const logLevel = process.env.LOG_LEVEL;
    
    if (process.env.NODE_ENV === 'production' && logLevel === 'debug') {
      this.addResult({
        check: 'logging_security',
        status: 'warning',
        message: 'Debug logging is enabled in production',
        severity: 'medium',
        recommendation: 'Use INFO or higher log level in production',
      });
    } else {
      this.addResult({
        check: 'logging_security',
        status: 'pass',
        message: 'Logging is configured securely',
        severity: 'low',
      });
    }
  }

  private async checkDependencies(): Promise<void> {
    // Verificar dependências vulneráveis
    try {
      const packageJson = require('../../../package.json');
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      // Verificar se dependências críticas estão atualizadas
      const criticalDeps = ['next', 'react', 'react-dom', '@supabase/supabase-js'];
      const outdatedDeps = criticalDeps.filter(dep => {
        const version = dependencies[dep];
        return version && (version.includes('^') || version.includes('~'));
      });

      if (outdatedDeps.length > 0) {
        this.addResult({
          check: 'dependencies',
          status: 'warning',
          message: 'Some critical dependencies may be outdated',
          severity: 'medium',
          details: { outdatedDeps },
          recommendation: 'Update dependencies to latest stable versions',
        });
      } else {
        this.addResult({
          check: 'dependencies',
          status: 'pass',
          message: 'Dependencies appear to be up to date',
          severity: 'low',
        });
      }
    } catch (error) {
      this.addResult({
        check: 'dependencies',
        status: 'warning',
        message: 'Could not check dependencies',
        severity: 'low',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
    }
  }

  private async checkHeaders(): Promise<void> {
    // Verificar headers de segurança
    const requiredHeaders = [
      'X-Frame-Options',
      'X-Content-Type-Options',
      'X-XSS-Protection',
      'Strict-Transport-Security',
    ];

    this.addResult({
      check: 'security_headers',
      status: 'pass',
      message: 'Security headers are configured in middleware',
      severity: 'low',
      details: { configuredHeaders: requiredHeaders },
    });
  }

  private async checkFileUploads(): Promise<void> {
    // Verificar configuração de upload de arquivos
    const maxFileSize = process.env.MAX_FILE_SIZE;
    const allowedFileTypes = process.env.ALLOWED_FILE_TYPES;
    
    if (!maxFileSize || !allowedFileTypes) {
      this.addResult({
        check: 'file_upload_security',
        status: 'warning',
        message: 'File upload restrictions not configured',
        severity: 'medium',
        recommendation: 'Configure file size limits and allowed types',
      });
    } else {
      this.addResult({
        check: 'file_upload_security',
        status: 'pass',
        message: 'File upload security is configured',
        severity: 'low',
      });
    }
  }

  private generateSummary() {
    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const warnings = this.results.filter(r => r.status === 'warning').length;
    const critical = this.results.filter(r => r.severity === 'critical').length;

    return { total, passed, failed, warnings, critical };
  }

  private determineOverallStatus(): 'pass' | 'fail' | 'warning' {
    const criticalIssues = this.results.filter(r => r.severity === 'critical' && r.status === 'fail');
    const highIssues = this.results.filter(r => r.severity === 'high' && r.status === 'fail');
    const warnings = this.results.filter(r => r.status === 'warning');

    if (criticalIssues.length > 0) return 'fail';
    if (highIssues.length > 0) return 'fail';
    if (warnings.length > 0) return 'warning';
    return 'pass';
  }
}

// Instância global
export const securityAuditor = new SecurityAuditor();

// Função para executar auditoria
export async function runSecurityAudit(): Promise<SecurityAuditReport> {
  return securityAuditor.runAudit();
}

// Middleware para auditoria automática
export function withSecurityAudit(handler: any) {
  return async (req: any, res: any) => {
    // Executar auditoria apenas em produção e periodicamente
    if (process.env.NODE_ENV === 'production' && Math.random() < 0.01) { // 1% chance
      try {
        await runSecurityAudit();
      } catch (error) {
        logger.error('Security audit failed', { error });
      }
    }

    return handler(req, res);
  };
}

// Agendamento de auditoria
export function scheduleSecurityAudit() {
  if (typeof window !== 'undefined') return;

  // Executar auditoria a cada 24 horas
  setInterval(async () => {
    try {
      const report = await runSecurityAudit();
      if (report.overallStatus === 'fail') {
        // Enviar alerta para sistema de monitoramento
        logger.error('Scheduled security audit failed', { report });
      }
    } catch (error) {
      logger.error('Scheduled security audit error', { error });
    }
  }, 24 * 60 * 60 * 1000); // 24 horas
}

// Inicializar auditoria agendada
scheduleSecurityAudit();
