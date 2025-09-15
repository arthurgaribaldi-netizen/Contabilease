/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 * 
 * Testes Unitários Críticos - Logger
 */

import { LogContext, LogLevel, StructuredLogger } from '@/lib/logger';

// Mock console methods
const mockConsole = {
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  trace: jest.fn(),
};

// Mock fetch
global.fetch = jest.fn();

// Mock fs/promises
jest.mock('fs/promises', () => ({
  mkdir: jest.fn(),
  appendFile: jest.fn(),
  stat: jest.fn(),
  rename: jest.fn(),
}));

// Mock path
jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/')),
}));

describe('StructuredLogger', () => {
  let logger: StructuredLogger;
  let originalConsole: any;

  beforeEach(() => {
    originalConsole = { ...console };
    Object.assign(console, mockConsole);
    
    logger = new StructuredLogger({
      level: LogLevel.DEBUG,
      enableConsole: true,
      enableFile: false,
      enableRemote: false,
      enableStructured: true,
      component: 'test',
    });
    
    jest.clearAllMocks();
  });

  afterEach(() => {
    Object.assign(console, originalConsole);
    logger.destroy();
  });

  describe('Log Levels', () => {
    test('should log at correct levels', async () => {
      await logger.error('Test error message');
      await logger.warn('Test warning message');
      await logger.info('Test info message');
      await logger.debug('Test debug message');

      expect(mockConsole.error).toHaveBeenCalled();
      expect(mockConsole.warn).toHaveBeenCalled();
      expect(mockConsole.info).toHaveBeenCalled();
      expect(mockConsole.debug).toHaveBeenCalled();
    });

    test('should respect log level configuration', async () => {
      const infoLogger = new StructuredLogger({
        level: LogLevel.INFO,
        enableConsole: true,
        enableFile: false,
        enableRemote: false,
        component: 'test',
      });

      await infoLogger.debug('This should not be logged');
      await infoLogger.info('This should be logged');
      await infoLogger.error('This should be logged');

      expect(mockConsole.debug).not.toHaveBeenCalled();
      expect(mockConsole.info).toHaveBeenCalled();
      expect(mockConsole.error).toHaveBeenCalled();

      infoLogger.destroy();
    });
  });

  describe('Structured Logging', () => {
    test('should include context in logs', async () => {
      const context: LogContext = {
        userId: 'user-123',
        sessionId: 'session-456',
        operation: 'test_operation',
      };

      await logger.info('Test message', context);

      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('"userId":"user-123"')
      );
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('"sessionId":"session-456"')
      );
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('"operation":"test_operation"')
      );
    });

    test('should include error details', async () => {
      const error = new Error('Test error');
      error.stack = 'Error stack trace';

      await logger.error('Test error message', undefined, error);

      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('"error":{"name":"Error"')
      );
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('"message":"Test error"')
      );
    });

    test('should include metadata', async () => {
      const metadata = {
        requestId: 'req-123',
        duration: 150,
        statusCode: 200,
      };

      await logger.info('Test message', undefined, undefined, metadata);

      expect(mockConsole.info).toHaveBeenCalled();
    });
  });

  describe('Convenience Methods', () => {
    test('should log HTTP requests', async () => {
      const context: LogContext = {
        requestId: 'req-123',
        userId: 'user-456',
      };

      await logger.logRequest('GET', '/api/test', 200, 150, context);

      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('"method":"GET"')
      );
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('"url":"/api/test"')
      );
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('"statusCode":200')
      );
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('"duration":150')
      );
    });

    test('should log auth events', async () => {
      await logger.logAuth('login', 'user-123', true);

      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('"operation":"auth"')
      );
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('"action":"login"')
      );
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('"userId":"user-123"')
      );
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('"success":true')
      );
    });

    test('should log business operations', async () => {
      const context: LogContext = {
        userId: 'user-123',
      };

      await logger.logBusiness('create', 'contract', 'contract-456', context);

      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('"operation":"create"')
      );
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('"entityType":"contract"')
      );
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('"entityId":"contract-456"')
      );
    });

    test('should log performance metrics', async () => {
      const context: LogContext = {
        operation: 'database_query',
      };

      await logger.logPerformance('database_query', 500, context);

      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('"operation":"database_query"')
      );
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('"duration":500')
      );
    });

    test('should log performance warnings for slow operations', async () => {
      await logger.logPerformance('slow_operation', 2000);

      expect(mockConsole.warn).toHaveBeenCalledWith(
        expect.stringContaining('"duration":2000')
      );
    });
  });

  describe('Configuration', () => {
    test('should update configuration', () => {
      const newConfig = {
        level: LogLevel.ERROR,
        enableConsole: false,
      };

      logger.updateConfig(newConfig);

      // Should not log debug messages after config update
      logger.debug('This should not be logged');
      expect(mockConsole.debug).not.toHaveBeenCalled();
    });

    test('should handle different environments', () => {
      const prodLogger = new StructuredLogger({
        level: LogLevel.INFO,
        enableConsole: false,
        enableFile: true,
        enableRemote: true,
        component: 'production',
      });

      expect(prodLogger).toBeDefined();
      prodLogger.destroy();
    });
  });

  describe('Error Handling', () => {
    test('should handle remote logging failures', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const remoteLogger = new StructuredLogger({
        level: LogLevel.INFO,
        enableConsole: false,
        enableFile: false,
        enableRemote: true,
        remoteEndpoint: 'https://api.example.com/logs',
        remoteApiKey: 'test-key',
        component: 'test',
      });

      // Should not throw
      await expect(remoteLogger.info('Test message')).resolves.not.toThrow();

      remoteLogger.destroy();
    });
  });

  describe('File Logging', () => {
    test('should handle file logging configuration', () => {
      const fileLogger = new StructuredLogger({
        level: LogLevel.INFO,
        enableConsole: false,
        enableFile: true,
        enableRemote: false,
        component: 'test',
      });

      expect(fileLogger).toBeDefined();
      fileLogger.destroy();
    });
  });

  describe('Cleanup', () => {
    test('should destroy logger properly', async () => {
      await logger.destroy();
      
      // Should not throw when destroyed
      await expect(logger.info('Test message')).resolves.not.toThrow();
    });
  });
});
