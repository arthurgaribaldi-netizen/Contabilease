/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 *
 * This file contains proprietary Contabilease software components.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

import { RateLimiter } from '@/lib/security/rate-limiting';

// Mock Redis for testing
const mockRedis = {
  get: jest.fn(),
  setex: jest.fn(),
  incr: jest.fn(),
  expire: jest.fn(),
};

jest.mock('redis', () => ({
  createClient: jest.fn(() => mockRedis),
}));

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    jest.clearAllMocks();
    rateLimiter = new RateLimiter();
  });

  describe('isAllowed', () => {
    it('should allow request when under limit', async () => {
      const identifier = 'user-123';
      const limit = 10;
      const windowMs = 60000; // 1 minute

      mockRedis.get.mockResolvedValue('5'); // Current count is 5

      const result = await rateLimiter.isAllowed(identifier, limit, windowMs);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(5);
      expect(result.resetTime).toBeDefined();
    });

    it('should deny request when over limit', async () => {
      const identifier = 'user-123';
      const limit = 10;
      const windowMs = 60000;

      mockRedis.get.mockResolvedValue('15'); // Current count is 15, over limit

      const result = await rateLimiter.isAllowed(identifier, limit, windowMs);

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.resetTime).toBeDefined();
    });

    it('should create new counter for new identifier', async () => {
      const identifier = 'new-user-456';
      const limit = 10;
      const windowMs = 60000;

      mockRedis.get.mockResolvedValue(null); // No existing counter
      mockRedis.setex.mockResolvedValue('OK');

      const result = await rateLimiter.isAllowed(identifier, limit, windowMs);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9); // limit - 1
      expect(mockRedis.setex).toHaveBeenCalledWith(
        expect.stringContaining(identifier),
        60, // windowMs / 1000
        '1'
      );
    });

    it('should increment existing counter', async () => {
      const identifier = 'user-123';
      const limit = 10;
      const windowMs = 60000;

      mockRedis.get.mockResolvedValue('3'); // Current count is 3
      mockRedis.incr.mockResolvedValue(4); // Increment to 4

      const result = await rateLimiter.isAllowed(identifier, limit, windowMs);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(6); // limit - 4
      expect(mockRedis.incr).toHaveBeenCalled();
    });

    it('should handle Redis errors gracefully', async () => {
      const identifier = 'user-123';
      const limit = 10;
      const windowMs = 60000;

      mockRedis.get.mockRejectedValue(new Error('Redis connection failed'));

      const result = await rateLimiter.isAllowed(identifier, limit, windowMs);

      // Should default to allowing the request when Redis fails
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9);
    });

    it('should handle different time windows', async () => {
      const identifier = 'user-123';
      const limit = 5;
      const windowMs = 300000; // 5 minutes

      mockRedis.get.mockResolvedValue('2');
      mockRedis.setex.mockResolvedValue('OK');

      await rateLimiter.isAllowed(identifier, limit, windowMs);

      expect(mockRedis.setex).toHaveBeenCalledWith(
        expect.stringContaining(identifier),
        300, // windowMs / 1000
        '1'
      );
    });

    it('should handle edge case at exact limit', async () => {
      const identifier = 'user-123';
      const limit = 10;
      const windowMs = 60000;

      mockRedis.get.mockResolvedValue('10'); // Exactly at limit

      const result = await rateLimiter.isAllowed(identifier, limit, windowMs);

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });
  });

  describe('reset', () => {
    it('should reset counter for identifier', async () => {
      const identifier = 'user-123';

      mockRedis.del = jest.fn().mockResolvedValue(1);

      await rateLimiter.reset(identifier);

      expect(mockRedis.del).toHaveBeenCalledWith(expect.stringContaining(identifier));
    });

    it('should handle Redis error during reset', async () => {
      const identifier = 'user-123';

      mockRedis.del = jest.fn().mockRejectedValue(new Error('Redis error'));

      // Should not throw error
      await expect(rateLimiter.reset(identifier)).resolves.not.toThrow();
    });
  });

  describe('getRemaining', () => {
    it('should return remaining requests', async () => {
      const identifier = 'user-123';
      const limit = 10;

      mockRedis.get.mockResolvedValue('3');

      const remaining = await rateLimiter.getRemaining(identifier, limit);

      expect(remaining).toBe(7); // limit - current
    });

    it('should return limit for new identifier', async () => {
      const identifier = 'new-user-456';
      const limit = 10;

      mockRedis.get.mockResolvedValue(null);

      const remaining = await rateLimiter.getRemaining(identifier, limit);

      expect(remaining).toBe(10); // Full limit for new identifier
    });

    it('should handle Redis errors in getRemaining', async () => {
      const identifier = 'user-123';
      const limit = 10;

      mockRedis.get.mockRejectedValue(new Error('Redis error'));

      const remaining = await rateLimiter.getRemaining(identifier, limit);

      expect(remaining).toBe(10); // Default to full limit on error
    });
  });

  describe('key generation', () => {
    it('should generate consistent keys for same identifier', async () => {
      const identifier = 'user-123';
      const limit = 10;
      const windowMs = 60000;

      mockRedis.get.mockResolvedValue('5');

      await rateLimiter.isAllowed(identifier, limit, windowMs);
      const firstKey = mockRedis.get.mock.calls[0][0];

      await rateLimiter.isAllowed(identifier, limit, windowMs);
      const secondKey = mockRedis.get.mock.calls[1][0];

      expect(firstKey).toBe(secondKey);
    });

    it('should generate different keys for different identifiers', async () => {
      const identifier1 = 'user-123';
      const identifier2 = 'user-456';
      const limit = 10;
      const windowMs = 60000;

      mockRedis.get.mockResolvedValue('5');

      await rateLimiter.isAllowed(identifier1, limit, windowMs);
      const key1 = mockRedis.get.mock.calls[0][0];

      await rateLimiter.isAllowed(identifier2, limit, windowMs);
      const key2 = mockRedis.get.mock.calls[1][0];

      expect(key1).not.toBe(key2);
    });
  });

  describe('concurrent requests', () => {
    it('should handle concurrent requests correctly', async () => {
      const identifier = 'user-123';
      const limit = 5;
      const windowMs = 60000;

      mockRedis.get.mockResolvedValue('0');
      mockRedis.incr.mockResolvedValue(1);

      // Simulate concurrent requests
      const promises = Array.from({ length: 3 }, () =>
        rateLimiter.isAllowed(identifier, limit, windowMs)
      );

      const results = await Promise.all(promises);

      // All should be allowed since we're under limit
      results.forEach(result => {
        expect(result.allowed).toBe(true);
      });

      expect(mockRedis.incr).toHaveBeenCalledTimes(3);
    });
  });
});
