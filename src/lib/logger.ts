/**
 * Sistema de logging para substituir console statements
 * Permite diferentes níveis de log e pode ser configurado para diferentes ambientes
 */

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private log(level: LogLevel, message: string, ...args: unknown[]): void {
    if (!this.isDevelopment && level === LogLevel.DEBUG) {
      return; // Não logar debug em produção
    }

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    switch (level) {
      case LogLevel.ERROR:
        // eslint-disable-next-line no-console
        console.error(prefix, message, ...args);
        break;
      case LogLevel.WARN:
        // eslint-disable-next-line no-console
        console.warn(prefix, message, ...args);
        break;
      case LogLevel.INFO:
        // eslint-disable-next-line no-console
        console.info(prefix, message, ...args);
        break;
      case LogLevel.DEBUG:
        // eslint-disable-next-line no-console
        console.debug(prefix, message, ...args);
        break;
    }
  }

  error(message: string, ...args: unknown[]): void {
    this.log(LogLevel.ERROR, message, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    this.log(LogLevel.WARN, message, ...args);
  }

  info(message: string, ...args: unknown[]): void {
    this.log(LogLevel.INFO, message, ...args);
  }

  debug(message: string, ...args: unknown[]): void {
    this.log(LogLevel.DEBUG, message, ...args);
  }
}

export const logger = new Logger();
