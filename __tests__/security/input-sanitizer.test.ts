/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 *
 * This file contains proprietary Contabilease software components.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

import { InputSanitizer } from '@/lib/security/input-sanitizer';

describe('InputSanitizer', () => {
  let sanitizer: InputSanitizer;

  beforeEach(() => {
    sanitizer = new InputSanitizer();
  });

  describe('sanitizeString', () => {
    it('should remove HTML tags', () => {
      const input = '<script>alert("xss")</script>Hello World';
      const result = sanitizer.sanitizeString(input);
      expect(result).toBe('Hello World');
    });

    it('should remove dangerous HTML attributes', () => {
      const input = '<img src="x" onerror="alert(1)">Safe content';
      const result = sanitizer.sanitizeString(input);
      expect(result).toBe('Safe content');
    });

    it('should preserve safe HTML tags', () => {
      const input = '<p>This is <strong>bold</strong> text</p>';
      const result = sanitizer.sanitizeString(input, { allowedTags: ['p', 'strong'] });
      expect(result).toBe('<p>This is <strong>bold</strong> text</p>');
    });

    it('should handle empty string', () => {
      const result = sanitizer.sanitizeString('');
      expect(result).toBe('');
    });

    it('should handle null input', () => {
      const result = sanitizer.sanitizeString(null as any);
      expect(result).toBe('');
    });

    it('should handle undefined input', () => {
      const result = sanitizer.sanitizeString(undefined as any);
      expect(result).toBe('');
    });

    it('should remove SQL injection attempts', () => {
      const input = "'; DROP TABLE users; --";
      const result = sanitizer.sanitizeString(input);
      expect(result).toBe('DROP TABLE users');
    });

    it('should remove JavaScript injection attempts', () => {
      const input = 'javascript:alert("xss")';
      const result = sanitizer.sanitizeString(input);
      expect(result).toBe('alert("xss")');
    });

    it('should preserve normal text', () => {
      const input = 'This is normal text with numbers 123 and symbols !@#$%';
      const result = sanitizer.sanitizeString(input);
      expect(result).toBe(input);
    });
  });

  describe('sanitizeEmail', () => {
    it('should validate and sanitize valid email', () => {
      const email = 'user@example.com';
      const result = sanitizer.sanitizeEmail(email);
      expect(result).toBe(email);
    });

    it('should reject invalid email format', () => {
      const email = 'invalid-email';
      const result = sanitizer.sanitizeEmail(email);
      expect(result).toBe('');
    });

    it('should reject email with dangerous characters', () => {
      const email = 'user<script>@example.com';
      const result = sanitizer.sanitizeEmail(email);
      expect(result).toBe('');
    });

    it('should handle empty email', () => {
      const result = sanitizer.sanitizeEmail('');
      expect(result).toBe('');
    });

    it('should normalize email case', () => {
      const email = 'USER@EXAMPLE.COM';
      const result = sanitizer.sanitizeEmail(email);
      expect(result).toBe('user@example.com');
    });

    it('should reject email that is too long', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      const result = sanitizer.sanitizeEmail(longEmail);
      expect(result).toBe('');
    });
  });

  describe('sanitizeNumber', () => {
    it('should sanitize valid positive number', () => {
      const number = '123.45';
      const result = sanitizer.sanitizeNumber(number);
      expect(result).toBe(123.45);
    });

    it('should sanitize valid negative number', () => {
      const number = '-123.45';
      const result = sanitizer.sanitizeNumber(number);
      expect(result).toBe(-123.45);
    });

    it('should handle integer', () => {
      const number = '123';
      const result = sanitizer.sanitizeNumber(number);
      expect(result).toBe(123);
    });

    it('should reject non-numeric string', () => {
      const number = 'abc123';
      const result = sanitizer.sanitizeNumber(number);
      expect(result).toBeNull();
    });

    it('should reject empty string', () => {
      const result = sanitizer.sanitizeNumber('');
      expect(result).toBeNull();
    });

    it('should reject null input', () => {
      const result = sanitizer.sanitizeNumber(null as any);
      expect(result).toBeNull();
    });

    it('should handle scientific notation', () => {
      const number = '1.23e+2';
      const result = sanitizer.sanitizeNumber(number);
      expect(result).toBe(123);
    });

    it('should reject numbers outside safe range', () => {
      const largeNumber = '1e+100';
      const result = sanitizer.sanitizeNumber(largeNumber);
      expect(result).toBeNull();
    });
  });

  describe('sanitizeObject', () => {
    it('should sanitize all string properties in object', () => {
      const obj = {
        name: '<script>alert("xss")</script>John',
        email: 'john@example.com',
        age: 25,
        description: '<p>Safe <strong>content</strong></p>',
      };

      const result = sanitizer.sanitizeObject(obj);

      expect(result.name).toBe('John');
      expect(result.email).toBe('john@example.com');
      expect(result.age).toBe(25);
      expect(result.description).toBe('<p>Safe <strong>content</strong></p>');
    });

    it('should handle nested objects', () => {
      const obj = {
        user: {
          name: '<script>alert("xss")</script>John',
          profile: {
            bio: '<p>User bio</p>',
          },
        },
      };

      const result = sanitizer.sanitizeObject(obj);

      expect(result.user.name).toBe('John');
      expect(result.user.profile.bio).toBe('<p>User bio</p>');
    });

    it('should handle arrays', () => {
      const obj = {
        tags: ['<script>alert("xss")</script>tag1', 'tag2'],
        items: [{ name: '<script>alert("xss")</script>item1' }, { name: 'item2' }],
      };

      const result = sanitizer.sanitizeObject(obj);

      expect(result.tags[0]).toBe('tag1');
      expect(result.tags[1]).toBe('tag2');
      expect(result.items[0].name).toBe('item1');
      expect(result.items[1].name).toBe('item2');
    });

    it('should handle null and undefined values', () => {
      const obj = {
        name: null,
        email: undefined,
        age: 25,
      };

      const result = sanitizer.sanitizeObject(obj);

      expect(result.name).toBe('');
      expect(result.email).toBe('');
      expect(result.age).toBe(25);
    });

    it('should preserve non-string values', () => {
      const obj = {
        id: 123,
        active: true,
        data: { key: 'value' },
        date: new Date('2023-01-01'),
      };

      const result = sanitizer.sanitizeObject(obj);

      expect(result.id).toBe(123);
      expect(result.active).toBe(true);
      expect(result.data).toEqual({ key: 'value' });
      expect(result.date).toBeInstanceOf(Date);
    });
  });

  describe('validateInput', () => {
    it('should validate required string field', () => {
      const result = sanitizer.validateInput('John Doe', {
        type: 'string',
        required: true,
        minLength: 2,
        maxLength: 50,
      });

      expect(result.isValid).toBe(true);
      expect(result.value).toBe('John Doe');
    });

    it('should reject empty required field', () => {
      const result = sanitizer.validateInput('', {
        type: 'string',
        required: true,
      });

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('required');
    });

    it('should validate email field', () => {
      const result = sanitizer.validateInput('user@example.com', {
        type: 'email',
        required: true,
      });

      expect(result.isValid).toBe(true);
      expect(result.value).toBe('user@example.com');
    });

    it('should reject invalid email', () => {
      const result = sanitizer.validateInput('invalid-email', {
        type: 'email',
        required: true,
      });

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('email');
    });

    it('should validate number field', () => {
      const result = sanitizer.validateInput('123.45', {
        type: 'number',
        required: true,
        min: 0,
        max: 1000,
      });

      expect(result.isValid).toBe(true);
      expect(result.value).toBe(123.45);
    });

    it('should reject number outside range', () => {
      const result = sanitizer.validateInput('1500', {
        type: 'number',
        required: true,
        min: 0,
        max: 1000,
      });

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('range');
    });

    it('should validate array field', () => {
      const result = sanitizer.validateInput(['item1', 'item2'], {
        type: 'array',
        required: true,
        minLength: 1,
        maxLength: 10,
      });

      expect(result.isValid).toBe(true);
      expect(result.value).toEqual(['item1', 'item2']);
    });

    it('should reject array with too many items', () => {
      const result = sanitizer.validateInput(['item1', 'item2', 'item3'], {
        type: 'array',
        required: true,
        maxLength: 2,
      });

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('length');
    });
  });

  describe('security edge cases', () => {
    it('should handle XSS attempts in various formats', () => {
      const xssAttempts = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src=x onerror=alert("xss")>',
        '<svg onload=alert("xss")>',
        '<iframe src="javascript:alert(\'xss\')"></iframe>',
        '<object data="javascript:alert(\'xss\')"></object>',
        '<embed src="javascript:alert(\'xss\')">',
        '<link rel="stylesheet" href="javascript:alert(\'xss\')">',
        '<meta http-equiv="refresh" content="0;url=javascript:alert(\'xss\')">',
        '<form action="javascript:alert(\'xss\')">',
      ];

      xssAttempts.forEach(attempt => {
        const result = sanitizer.sanitizeString(attempt);
        expect(result).not.toContain('<script');
        expect(result).not.toContain('javascript:');
        expect(result).not.toContain('onerror');
        expect(result).not.toContain('onload');
      });
    });

    it('should handle SQL injection attempts', () => {
      const sqlAttempts = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "'; INSERT INTO users VALUES ('hacker', 'password'); --",
        "' UNION SELECT * FROM users --",
        "'; UPDATE users SET password='hacked' WHERE id=1; --",
      ];

      sqlAttempts.forEach(attempt => {
        const result = sanitizer.sanitizeString(attempt);
        expect(result).not.toContain('DROP');
        expect(result).not.toContain('INSERT');
        expect(result).not.toContain('UPDATE');
        expect(result).not.toContain('UNION');
        expect(result).not.toContain('--');
      });
    });

    it('should handle path traversal attempts', () => {
      const pathAttempts = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32\\config\\sam',
        '/etc/passwd',
        'C:\\Windows\\System32\\config\\SAM',
        '....//....//....//etc//passwd',
      ];

      pathAttempts.forEach(attempt => {
        const result = sanitizer.sanitizeString(attempt);
        expect(result).not.toContain('..');
        expect(result).not.toContain('\\');
        expect(result).not.toContain('/etc/');
        expect(result).not.toContain('C:');
      });
    });
  });
});
