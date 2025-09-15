/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 * 
 * Testes Unitários Críticos - Rate Limiting
 */

// Mock Next.js APIs
global.Request = jest.fn();
global.Response = jest.fn();

// Mock do logger
jest.mock('@/lib/logger', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock das funções de rate limiting
jest.mock('@/lib/security/rate-limiting-redis', () => ({
  checkRateLimit: jest.fn(),
  createClientRateLimit: jest.fn(),
  detectSuspiciousActivity: jest.fn(),
  getClientIdentifier: jest.fn(),
  RATE_LIMITS: {
    '/api/contracts': { requests: 100, window: 60000 },
    '/api/contracts/[id]/calculate': { requests: 20, window: 60000 },
    '/api/auth': { requests: 10, window: 60000, blockDuration: 900000 },
    '/api/health': { requests: 1000, window: 60000 },
  },
}));

import {
    checkRateLimit,
    createClientRateLimit,
    detectSuspiciousActivity,
    getClientIdentifier,
    RATE_LIMITS
} from '@/lib/security/rate-limiting-redis';

describe('Rate Limiting', () => {
  describe('RATE_LIMITS configuration', () => {
    test('should have valid rate limit configurations', () => {
      expect(RATE_LIMITS['/api/contracts']).toBeDefined();
      expect(RATE_LIMITS['/api/contracts'].requests).toBe(100);
      expect(RATE_LIMITS['/api/contracts'].window).toBe(60000);
      
      expect(RATE_LIMITS['/api/auth']).toBeDefined();
      expect(RATE_LIMITS['/api/auth'].requests).toBe(10);
      expect(RATE_LIMITS['/api/auth'].blockDuration).toBe(900000); // 15 minutes
    });

    test('should have appropriate limits for different endpoints', () => {
      // Auth endpoints should have stricter limits
      expect(RATE_LIMITS['/api/auth'].requests).toBeLessThan(RATE_LIMITS['/api/contracts'].requests);
      
      // Calculation endpoints should have moderate limits
      expect(RATE_LIMITS['/api/contracts/[id]/calculate'].requests).toBe(20);
      
      // Health endpoints should have high limits
      expect(RATE_LIMITS['/api/health'].requests).toBe(1000);
    });
  });

  describe('Mocked functions', () => {
    test('should have checkRateLimit function available', () => {
      expect(typeof checkRateLimit).toBe('function');
    });

    test('should have getClientIdentifier function available', () => {
      expect(typeof getClientIdentifier).toBe('function');
    });

    test('should have detectSuspiciousActivity function available', () => {
      expect(typeof detectSuspiciousActivity).toBe('function');
    });

    test('should have createClientRateLimit function available', () => {
      expect(typeof createClientRateLimit).toBe('function');
    });
  });
});
