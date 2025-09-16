/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 *
 * Sistema de Logging Estruturado e Robusto
 * Suporte a múltiplos destinos, níveis e formatação estruturada
 */

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  TRACE = 'trace',
}

export type CommonOperations =
  | 'fetchContract'
  | 'createContract'
  | 'updateContract'
  | 'deleteContract'
  | 'submitForm'
  | 'calculateValues'
  | 'analyzeExceptions'
  | 'analyzeSensitivity'
  | 'analyzeImpairment'
  | 'generateReport'
  | 'generatePDF'
  | 'generateExcel'
  | 'fetchPlans'
  | 'createCheckoutSession'
  | 'completeOnboarding'
  | 'saveContract'
  | 'loadContract'
  | 'fetchSummary'
  | 'fetchAmortizationData'
  | 'fetchLazyData'
  | 'fetchLazySummary'
  | 'clearCache'
  | 'clearAllCache'
  | 'cleanupCache'
  | 'calculateImpact'
  | 'initializeMFA'
  | 'handleRequest'
  | 'handleGETRequest'
  | 'handlePOSTRequest'
  | 'handlePUTRequest'
  | 'handleDELETERequest'
  | 'signUp'
  | 'signIn'
  | 'signInWithMagicLink'
  | 'signInWithGoogle'
  | 'signOut'
  | 'resetPassword'
  | 'updatePassword'
  | 'updateProfile'
  | 'getCurrentUser'
  | 'getCurrentSession'
  | 'verifyEmail'
  | 'refreshSession'
  | 'observePerformance'
  | 'recordMetric'
  | 'observeResources'
  | 'observeNavigation'
  | 'recordCustomMetric'
  | 'sendMetrics'
  | 'calculateIFRS16Values'
  | 'calculateIFRS16ValuesDebounced'
  | 'loadOnboardingState'
  | 'measureRenderTime'
  | 'auto-compliance-check'
  | 'expiration-alert'
  | 'esg-assessment'
  | 'cost-optimization'
  | 'executeAutomationRules'
  | 'loadUserBehavior'
  | 'calculateDiscountRate'
  | 'obfuscateFunction'
  | 'getSecureEnv'
  | 'canAccessResource'
  | 'logSecurityEvent'
  | 'supabaseSecurity'
  | 'getUserSubscription'
  | 'canCreateContract'
  | 'validateUserPayment'
  | 'test_operation'
  | 'database_query'
  | 'submitContract'
  | 'operation'
  | 'POST'
  | 'sendToGoogleAnalytics'
  | 'sendToWebhook'
  | 'storeCriticalMetrics'
  | 'GET'
  | 'checkMFAStatus'
  | 'addModification'
  | 'generateAdvancedDisclosures'
  | 'loadDashboardData'
  | 'handleSignOut'
  | 'onFirstVictory'
  | 'calculateContract'
  | 'http_request'
  | 'auth'
  | 'initializeWebVitals'
  | 'ab_test_assignment'
  | 'mfa-integration'
  | 'onboarding';

export type CommonComponents =
  | 'contractform'
  | 'contractwizard'
  | 'contractdetails'
  | 'contractspageclient'
  | 'contractdetailspageclient'
  | 'newcontractpageclient'
  | 'ifrs16contractform'
  | 'ifrs16exceptions'
  | 'ifrs16sensitivity'
  | 'ifrs16impairment'
  | 'ifrs16reportgenerator'
  | 'ifrs16advanceddisclosures'
  | 'virtualamortizationtable'
  | 'amortizationscheduletable'
  | 'contractmodificationexample'
  | 'optimizedonboarding'
  | 'pricingplans'
  | 'mfasetup'
  | 'useifrs16calculations'
  | 'auth'
  | 'security'
  | 'payment'
  | 'performance-monitor'
  | 'web-vitals'
  | 'ifrs16-discount-rate-calculator'
  | 'mfa-integration'
  | 'onboarding'
  | 'route'
  | 'page'
  | 'middleware'
  | 'performance-hook'
  | 'performance-monitor'
  | 'web-vitals'
  | 'telemetry'
  | 'conversion-tracking'
  | 'security-obfuscation'
  | 'payment'
  | 'cache-manager'
  | 'retry-manager'
  | 'rate-limiting'
  | 'input-sanitizer'
  | 'schema-validator'
  | 'security-audit'
  | 'bundle-optimization'
  | 'lazy-loading'
  | 'bundle-analyzer'
  | 'ai-automation'
  | 'ai-personalization'
  | 'css-specificity'
  | 'onboarding-hook'
  | 'dashboard-layout'
  | 'lightweight-dashboard'
  | 'performance-api'
  | 'telemetry-traces-api'
  | 'telemetry-metrics-api';

export interface LogContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  correlationId?: string;
  component?: CommonComponents;
  operation?: CommonOperations;
  duration?: number;
  [key: string]: unknown;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
  metadata?: Record<string, unknown>;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  enableRemote: boolean;
  enableStructured: boolean;
  maxFileSize: number;
  maxFiles: number;
  remoteEndpoint?: string;
  remoteApiKey?: string;
  component: string;
}

class StructuredLogger {
  private config: LoggerConfig;
  private logBuffer: LogEntry[] = [];
  private bufferSize = 100;
  private flushInterval: NodeJS.Timeout | null = null;

  constructor(config?: Partial<LoggerConfig>) {
    this.config = {
      level: this.getLogLevelFromEnv(),
      enableConsole: process.env.NODE_ENV !== 'production',
      enableFile: process.env.NODE_ENV === 'production',
      enableRemote: process.env.NODE_ENV === 'production',
      enableStructured: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      remoteEndpoint: process.env.LOG_ENDPOINT,
      remoteApiKey: process.env.LOG_API_KEY,
      component: 'contabilease',
      ...config,
    };

    // Iniciar flush periódico se habilitado
    if (this.config.enableRemote && typeof window === 'undefined') {
      this.startPeriodicFlush();
    }
  }

  private getLogLevelFromEnv(): LogLevel {
    const level = process.env.LOG_LEVEL?.toLowerCase();
    switch (level) {
      case 'error':
        return LogLevel.ERROR;
      case 'warn':
        return LogLevel.WARN;
      case 'info':
        return LogLevel.INFO;
      case 'debug':
        return LogLevel.DEBUG;
      case 'trace':
        return LogLevel.TRACE;
      default:
        return process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG, LogLevel.TRACE];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex <= currentLevelIndex;
  }

  private formatLogEntry(entry: LogEntry): string {
    if (!this.config.enableStructured) {
      return `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}`;
    }

    const logData = {
      timestamp: entry.timestamp,
      level: entry.level,
      message: entry.message,
      component: this.config.component,
      ...entry.context,
      ...(entry.error && { error: entry.error }),
      ...(entry.metadata && { metadata: entry.metadata }),
    };

    return JSON.stringify(logData);
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error,
    metadata?: Record<string, unknown>
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };

    if (context) {
      entry.context = context;
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: (error as any).code,
      };
    }

    if (metadata) {
      entry.metadata = metadata;
    }

    return entry;
  }

  private async logToConsole(entry: LogEntry): Promise<void> {
    if (!this.config.enableConsole) return;

    const formatted = this.formatLogEntry(entry);

    switch (entry.level) {
      case LogLevel.ERROR:
        // eslint-disable-next-line no-console
        console.error(formatted);
        break;
      case LogLevel.WARN:
        // eslint-disable-next-line no-console
        console.warn(formatted);
        break;
      case LogLevel.INFO:
        // eslint-disable-next-line no-console
        console.info(formatted);
        break;
      case LogLevel.DEBUG:
        // eslint-disable-next-line no-console
        console.debug(formatted);
        break;
      case LogLevel.TRACE:
        // eslint-disable-next-line no-console
        console.trace(formatted);
        break;
    }
  }

  private async logToFile(entry: LogEntry): Promise<void> {
    if (!this.config.enableFile || typeof window !== 'undefined') return;

    try {
      // Only run on server side
      if (typeof window !== 'undefined' || typeof process === 'undefined') return;

      const fs = require('fs').promises;
      const path = require('path');

      const logDir = path.join(process.cwd(), 'logs');
      const logFile = path.join(logDir, `${entry.level}.log`);

      // Criar diretório se não existir
      await fs.mkdir(logDir, { recursive: true });

      // Verificar tamanho do arquivo e rotacionar se necessário
      await this.rotateLogFile(logFile);

      const logLine = this.formatLogEntry(entry) + '\n';
      await fs.appendFile(logFile, logLine);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to write to log file:', error);
    }
  }

  private async rotateLogFile(logFile: string): Promise<void> {
    try {
      // Only run on server side
      if (typeof window !== 'undefined' || typeof process === 'undefined') return;

      const fs = require('fs').promises;
      const path = require('path');

      const stats = await fs.stat(logFile).catch(() => null);
      if (!stats || stats.size < this.config.maxFileSize) return;

      // Rotacionar arquivos
      for (let i = this.config.maxFiles - 1; i > 0; i--) {
        const oldFile = `${logFile}.${i}`;
        const newFile = `${logFile}.${i + 1}`;

        try {
          await fs.rename(oldFile, newFile);
        } catch {
          // Arquivo não existe, continuar
        }
      }

      // Mover arquivo atual
      await fs.rename(logFile, `${logFile}.1`);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to rotate log file:', error);
    }
  }

  private async logToRemote(entry: LogEntry): Promise<void> {
    if (!this.config.enableRemote || !this.config.remoteEndpoint) return;

    try {
      const response = await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.remoteApiKey}`,
          'X-Component': this.config.component,
        },
        body: JSON.stringify(entry),
      });

      if (!response.ok) {
        throw new Error(`Remote logging failed: ${response.status}`);
      }
    } catch (error) {
      // Falha silenciosa para não quebrar a aplicação
      // eslint-disable-next-line no-console
      console.error('Remote logging failed:', error);
    }
  }

  private async flushLogs(): Promise<void> {
    if (this.logBuffer.length === 0) return;

    const logsToFlush = [...this.logBuffer];
    this.logBuffer = [];

    try {
      await Promise.all([
        ...logsToFlush.map(log => this.logToConsole(log)),
        ...logsToFlush.map(log => this.logToFile(log)),
        ...logsToFlush.map(log => this.logToRemote(log)),
      ]);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to flush logs:', error);
    }
  }

  private startPeriodicFlush(): void {
    this.flushInterval = setInterval(() => {
      this.flushLogs();
    }, 5000); // Flush a cada 5 segundos
  }

  private async log(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    if (!this.shouldLog(level)) return;

    const entry = this.createLogEntry(level, message, context, error, metadata);

    // Log imediato para console
    await this.logToConsole(entry);

    // Buffer para outros destinos
    this.logBuffer.push(entry);

    // Flush se buffer estiver cheio
    if (this.logBuffer.length >= this.bufferSize) {
      await this.flushLogs();
    }
  }

  // Métodos públicos
  async error(
    message: string,
    context?: LogContext,
    error?: Error,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await this.log(LogLevel.ERROR, message, context, error, metadata);
  }

  async warn(
    message: string,
    context?: LogContext,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await this.log(LogLevel.WARN, message, context, undefined, metadata);
  }

  async info(
    message: string,
    context?: LogContext,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await this.log(LogLevel.INFO, message, context, undefined, metadata);
  }

  async debug(
    message: string,
    context?: LogContext,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await this.log(LogLevel.DEBUG, message, context, undefined, metadata);
  }

  async trace(
    message: string,
    context?: LogContext,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await this.log(LogLevel.TRACE, message, context, undefined, metadata);
  }

  // Métodos de conveniência
  async logRequest(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    context?: LogContext
  ): Promise<void> {
    const level = statusCode >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    const message = `${method} ${url} - ${statusCode} (${duration}ms)`;

    await this.log(level, message, {
      ...context,
      method,
      url,
      statusCode,
      duration,
      operation: 'http_request',
    });
  }

  async logAuth(
    action: string,
    userId?: string,
    success: boolean = true,
    context?: LogContext
  ): Promise<void> {
    const level = success ? LogLevel.INFO : LogLevel.WARN;
    const message = `Auth ${action} ${success ? 'successful' : 'failed'}`;

    await this.log(level, message, {
      ...context,
      userId,
      success,
      operation: 'auth',
      action,
    });
  }

  async logBusiness(
    operation: string,
    entityType: string,
    entityId: string,
    context?: LogContext
  ): Promise<void> {
    const message = `Business operation: ${operation} on ${entityType}:${entityId}`;

    await this.log(LogLevel.INFO, message, {
      ...context,
      operation,
      entityType,
      entityId,
    });
  }

  async logPerformance(operation: string, duration: number, context?: LogContext): Promise<void> {
    const level = duration > 1000 ? LogLevel.WARN : LogLevel.INFO;
    const message = `Performance: ${operation} took ${duration}ms`;

    await this.log(level, message, {
      ...context,
      operation,
      duration,
    });
  }

  // Métodos específicos para operações comuns
  async logContractOperation(
    operation: CommonOperations,
    contractId: string,
    success = true,
    context?: LogContext
  ): Promise<void> {
    const level = success ? LogLevel.INFO : LogLevel.ERROR;
    const message = `Contract ${operation} ${success ? 'successful' : 'failed'}`;

    await this.log(level, message, {
      ...context,
      component: 'contractform',
      operation,
      contractId,
      success,
    });
  }

  async logFormSubmission(
    component: CommonComponents,
    success = true,
    context?: LogContext
  ): Promise<void> {
    const level = success ? LogLevel.INFO : LogLevel.ERROR;
    const message = `Form submission ${success ? 'successful' : 'failed'}`;

    await this.log(level, message, {
      ...context,
      component,
      operation: 'submitForm',
      success,
    });
  }

  async logDataFetch(
    component: CommonComponents,
    operation: CommonOperations,
    success = true,
    context?: LogContext
  ): Promise<void> {
    const level = success ? LogLevel.INFO : LogLevel.ERROR;
    const message = `Data fetch ${success ? 'successful' : 'failed'}`;

    await this.log(level, message, {
      ...context,
      component,
      operation,
      success,
    });
  }

  async logCalculation(
    component: CommonComponents,
    operation: CommonOperations,
    success = true,
    context?: LogContext
  ): Promise<void> {
    const level = success ? LogLevel.INFO : LogLevel.ERROR;
    const message = `Calculation ${success ? 'successful' : 'failed'}`;

    await this.log(level, message, {
      ...context,
      component,
      operation,
      success,
    });
  }

  // Configuração dinâmica
  updateConfig(updates: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  // Limpeza
  async destroy(): Promise<void> {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    await this.flushLogs();
  }
}

// Instância global
export const logger = new StructuredLogger();

// Exportar tipos e classe para uso avançado
export { StructuredLogger };
