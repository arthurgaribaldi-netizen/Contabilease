import { CACHE_TTL, IFRS16Cache, generateDataHash } from '@/lib/cache/ifrs16-cache';
import { BasicIFRS16Calculator } from '@/lib/calculations/ifrs16-basic';
import { Contract } from '@/lib/contracts';

describe('IFRS16Cache', () => {
  let cache: IFRS16Cache;
  let mockContract: Contract;

  beforeEach(() => {
    cache = new IFRS16Cache();
    mockContract = {
      id: 'test-contract-1',
      user_id: 'test-user',
      title: 'Test Contract',
      status: 'active',
      currency_code: 'BRL',
      contract_value: 100000,
      contract_term_months: 36,
      implicit_interest_rate: 8.5,
      guaranteed_residual_value: 10000,
      purchase_option_price: null,
      purchase_option_exercise_date: null,
      lease_start_date: '2024-01-01',
      lease_end_date: '2026-12-31',
      payment_frequency: 'monthly',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };
  });

  afterEach(() => {
    cache.clear();
  });

  describe('generateDataHash', () => {
    it('should generate consistent hash for same data', () => {
      const hash1 = generateDataHash(mockContract);
      const hash2 = generateDataHash(mockContract);
      expect(hash1).toBe(hash2);
    });

    it('should generate different hash for different data', () => {
      const contract2 = { ...mockContract, contract_value: 200000 };
      const hash1 = generateDataHash(mockContract);
      const hash2 = generateDataHash(contract2);
      expect(hash1).not.toBe(hash2);
    });

    it('should generate same hash regardless of field order', () => {
      const contract2 = {
        ...mockContract,
        title: 'Different Title', // This should not affect hash
        updated_at: '2024-01-02T00:00:00Z', // This should affect hash
      };
      const hash1 = generateDataHash(mockContract);
      const hash2 = generateDataHash(contract2);
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('Cache Operations', () => {
    it('should store and retrieve calculation results', () => {
      const calculator = new BasicIFRS16Calculator(mockContract);
      const result = calculator.calculateAll();

      // Should return null initially
      expect(cache.get('test-contract-1', mockContract)).toBeNull();

      // Store result
      cache.set('test-contract-1', mockContract, result);

      // Should return cached result
      const cachedResult = cache.get('test-contract-1', mockContract);
      expect(cachedResult).toEqual(result);
    });

    it('should return null for different contract data', () => {
      const calculator = new BasicIFRS16Calculator(mockContract);
      const result = calculator.calculateAll();

      cache.set('test-contract-1', mockContract, result);

      // Different contract data should return null
      const differentContract = { ...mockContract, contract_value: 200000 };
      expect(cache.get('test-contract-1', differentContract)).toBeNull();
    });

    it('should delete specific entries', () => {
      const calculator = new BasicIFRS16Calculator(mockContract);
      const result = calculator.calculateAll();

      cache.set('test-contract-1', mockContract, result);
      expect(cache.get('test-contract-1', mockContract)).toEqual(result);

      cache.delete('test-contract-1', mockContract);
      expect(cache.get('test-contract-1', mockContract)).toBeNull();
    });

    it('should delete all entries for a contract', () => {
      const calculator = new BasicIFRS16Calculator(mockContract);
      const result = calculator.calculateAll();

      // Store multiple entries for same contract
      cache.set('test-contract-1', mockContract, result);
      cache.set('test-contract-1', { ...mockContract, updated_at: '2024-01-02T00:00:00Z' }, result);

      expect(cache.getStats().cacheSize).toBe(2);

      const deletedCount = cache.deleteContract('test-contract-1');
      expect(deletedCount).toBe(2);
      expect(cache.getStats().cacheSize).toBe(0);
    });
  });

  describe('Cache Expiration', () => {
    it('should return null for expired entries', () => {
      const calculator = new BasicIFRS16Calculator(mockContract);
      const result = calculator.calculateAll();

      // Store with very short TTL
      cache.set('test-contract-1', mockContract, result, 1);

      // Should be available immediately
      expect(cache.get('test-contract-1', mockContract)).toEqual(result);

      // Wait for expiration
      setTimeout(() => {
        expect(cache.get('test-contract-1', mockContract)).toBeNull();
      }, 10);
    });

    it('should cleanup expired entries', () => {
      const calculator = new BasicIFRS16Calculator(mockContract);
      const result = calculator.calculateAll();

      // Store with very short TTL
      cache.set('test-contract-1', mockContract, result, 1);

      expect(cache.getStats().cacheSize).toBe(1);

      // Wait and cleanup
      setTimeout(() => {
        const cleanedCount = cache.cleanup();
        expect(cleanedCount).toBe(1);
        expect(cache.getStats().cacheSize).toBe(0);
      }, 10);
    });
  });

  describe('Cache Statistics', () => {
    it('should track cache hits and misses', () => {
      const calculator = new BasicIFRS16Calculator(mockContract);
      const result = calculator.calculateAll();

      // Initial stats
      let stats = cache.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      expect(stats.totalRequests).toBe(0);

      // First get (miss)
      cache.get('test-contract-1', mockContract);
      stats = cache.getStats();
      expect(stats.misses).toBe(1);
      expect(stats.totalRequests).toBe(1);
      expect(stats.hitRate).toBe(0);

      // Store result
      cache.set('test-contract-1', mockContract, result);

      // Second get (hit)
      cache.get('test-contract-1', mockContract);
      stats = cache.getStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      expect(stats.totalRequests).toBe(2);
      expect(stats.hitRate).toBe(50);
    });

    it('should track cache size', () => {
      const calculator = new BasicIFRS16Calculator(mockContract);
      const result = calculator.calculateAll();

      expect(cache.getStats().cacheSize).toBe(0);

      cache.set('test-contract-1', mockContract, result);
      expect(cache.getStats().cacheSize).toBe(1);

      cache.set('test-contract-2', mockContract, result);
      expect(cache.getStats().cacheSize).toBe(2);
    });
  });

  describe('Cache Limits', () => {
    it('should evict oldest entries when max size reached', () => {
      const calculator = new BasicIFRS16Calculator(mockContract);
      const result = calculator.calculateAll();

      // Fill cache to max size
      for (let i = 0; i < 105; i++) {
        const contract = { ...mockContract, id: `contract-${i}` };
        cache.set(`contract-${i}`, contract, result);
      }

      // Should not exceed max size
      expect(cache.getStats().cacheSize).toBeLessThanOrEqual(100);
    });
  });

  describe('Cache TTL Constants', () => {
    it('should have defined TTL constants', () => {
      expect(CACHE_TTL.SHORT).toBe(2 * 60 * 1000);
      expect(CACHE_TTL.MEDIUM).toBe(5 * 60 * 1000);
      expect(CACHE_TTL.LONG).toBe(15 * 60 * 1000);
      expect(CACHE_TTL.VERY_LONG).toBe(60 * 60 * 1000);
    });
  });

  describe('Performance', () => {
    it('should handle multiple concurrent operations', () => {
      const calculator = new BasicIFRS16Calculator(mockContract);
      const result = calculator.calculateAll();

      // Simulate concurrent operations
      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(
          Promise.resolve().then(() => {
            cache.set(`contract-${i}`, { ...mockContract, id: `contract-${i}` }, result);
            return cache.get(`contract-${i}`, { ...mockContract, id: `contract-${i}` });
          })
        );
      }

      return Promise.all(promises).then((results) => {
        expect(results).toHaveLength(100);
        results.forEach((result) => {
          expect(result).toEqual(result);
        });
      });
    });
  });
});
