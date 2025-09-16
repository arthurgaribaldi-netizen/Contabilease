import { MFAService } from '@/lib/mfa/mfa-service';
import speakeasy from 'speakeasy';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      upsert: jest.fn(() => Promise.resolve({ error: null })),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() =>
            Promise.resolve({
              data: { totp_secret: 'test-secret', backup_codes: ['ABC123'] },
              error: null,
            })
          ),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  },
}));

// Mock speakeasy
jest.mock('speakeasy', () => ({
  generateSecret: jest.fn(() => ({
    base32: 'test-secret-base32',
    otpauth_url: 'otpauth://totp/Test?secret=test-secret-base32',
  })),
  totp: {
    verify: jest.fn(() => true),
  },
}));

describe('MFAService', () => {
  let mfaService: MFAService;
  const mockUserId = 'test-user-id';

  beforeEach(() => {
    mfaService = MFAService.getInstance();
    jest.clearAllMocks();
  });

  describe('setupMFA', () => {
    it('should setup MFA successfully', async () => {
      // Mock QRCode.toDataURL
      const mockQRCode = require('qrcode');
      mockQRCode.toDataURL = jest.fn(() => Promise.resolve('data:image/png;base64,mock-qr-code'));

      const result = await mfaService.setupMFA(mockUserId);

      expect(result).toHaveProperty('secret');
      expect(result).toHaveProperty('qrCodeUrl');
      expect(result).toHaveProperty('backupCodes');
      expect(result.backupCodes).toHaveLength(10);
      expect(speakeasy.generateSecret).toHaveBeenCalled();
    });

    it('should throw error on database failure', async () => {
      const mockSupabase = require('@/lib/supabase').supabase;
      mockSupabase.from.mockReturnValue({
        upsert: jest.fn(() => Promise.resolve({ error: { message: 'Database error' } })),
      });

      await expect(mfaService.setupMFA(mockUserId)).rejects.toThrow('Failed to store MFA secret');
    });
  });

  describe('verifyAndEnableMFA', () => {
    it('should verify and enable MFA successfully', async () => {
      const mockToken = '123456';

      // Mock the from method to return MFA data
      const mockSupabase = require('@/lib/supabase').supabase;
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() =>
              Promise.resolve({
                data: { secret: 'test-secret', backup_codes: ['ABC123'] },
                error: null,
              })
            ),
          })),
        })),
      });

      const result = await mfaService.verifyAndEnableMFA(mockUserId, mockToken);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(speakeasy.totp.verify).toHaveBeenCalledWith({
        secret: 'test-secret',
        encoding: 'base32',
        token: mockToken,
        window: 2,
      });
    });

    it('should fail verification with invalid token', async () => {
      // Mock speakeasy to return false for invalid token
      (speakeasy.totp.verify as jest.Mock).mockReturnValue(false);

      // Mock the from method to return MFA data
      const mockSupabase = require('@/lib/supabase').supabase;
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() =>
              Promise.resolve({
                data: { secret: 'test-secret', backup_codes: ['ABC123'] },
                error: null,
              })
            ),
          })),
        })),
      });

      const result = await mfaService.verifyAndEnableMFA(mockUserId, 'invalid');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid verification code');
    });

    it('should handle missing MFA settings', async () => {
      const mockSupabase = require('@/lib/supabase').supabase;
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() =>
              Promise.resolve({
                data: null,
                error: { message: 'No rows found' },
              })
            ),
          })),
        })),
      });

      const result = await mfaService.verifyAndEnableMFA(mockUserId, '123456');

      expect(result.success).toBe(false);
      expect(result.error).toBe('MFA not configured');
    });
  });

  describe('verifyTOTP', () => {
    it('should verify TOTP successfully', async () => {
      const mockToken = '123456';

      // Mock the from method to return MFA data
      const mockSupabase = require('@/lib/supabase').supabase;
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() =>
              Promise.resolve({
                data: { secret: 'test-secret', backup_codes: ['ABC123'] },
                error: null,
              })
            ),
          })),
        })),
      });

      const result = await mfaService.verifyTOTP(mockUserId, mockToken);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should fail verification when MFA is disabled', async () => {
      const mockSupabase = require('@/lib/supabase').supabase;
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() =>
              Promise.resolve({
                data: { totp_secret: 'test-secret', enabled: false },
                error: null,
              })
            ),
          })),
        })),
      });

      const result = await mfaService.verifyTOTP(mockUserId, '123456');

      expect(result.success).toBe(false);
      expect(result.error).toBe('MFA not enabled');
    });
  });

  describe('verifyBackupCode', () => {
    it('should verify backup code successfully', async () => {
      const mockCode = 'ABC-DEF-GHI';

      // Mock the from method to return MFA data
      const mockSupabase = require('@/lib/supabase').supabase;
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() =>
              Promise.resolve({
                data: { secret: 'test-secret', backup_codes: ['ABC-DEF-GHI'] },
                error: null,
              })
            ),
          })),
        })),
      });

      const result = await mfaService.verifyBackupCode(mockUserId, mockCode);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should fail verification with invalid backup code', async () => {
      const mockSupabase = require('@/lib/supabase').supabase;
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() =>
              Promise.resolve({
                data: { backup_codes: ['ABC123'] },
                error: null,
              })
            ),
          })),
        })),
      });

      const result = await mfaService.verifyBackupCode(mockUserId, 'invalid');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid backup code');
    });
  });

  describe('isMFAEnabled', () => {
    it('should return true when MFA is enabled', async () => {
      // Mock the from method to return MFA data
      const mockSupabase = require('@/lib/supabase').supabase;
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() =>
              Promise.resolve({
                data: { totp_secret: 'test-secret', enabled: true },
                error: null,
              })
            ),
          })),
        })),
      });

      const result = await mfaService.isMFAEnabled(mockUserId);

      expect(result).toBe(true);
    });

    it('should return false when MFA is disabled', async () => {
      // Mock the from method to return no MFA data
      const mockSupabase = require('@/lib/supabase').supabase;
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() =>
              Promise.resolve({
                data: null,
                error: { code: 'PGRST116' },
              })
            ),
          })),
        })),
      });

      const result = await mfaService.isMFAEnabled(mockUserId);

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      // Mock the from method to return error
      const mockSupabase = require('@/lib/supabase').supabase;
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() =>
              Promise.resolve({
                data: null,
                error: { message: 'Database error' },
              })
            ),
          })),
        })),
      });

      const result = await mfaService.isMFAEnabled(mockUserId);

      expect(result).toBe(false);
    });
  });

  describe('getMFAStatus', () => {
    it('should return MFA status successfully', async () => {
      const mockData = {
        enabled: true,
        created_at: '2023-01-01T00:00:00Z',
        last_used_at: '2023-01-02T00:00:00Z',
      };

      const mockSupabase = require('@/lib/supabase').supabase;
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() =>
              Promise.resolve({
                data: mockData,
                error: null,
              })
            ),
          })),
        })),
      });

      const result = await mfaService.getMFAStatus(mockUserId);

      expect(result.enabled).toBe(true);
      expect(result.setupAt).toBe(mockData.created_at);
      expect(result.lastUsedAt).toBe(mockData.last_used_at);
    });

    it('should return default values when no MFA settings found', async () => {
      const mockSupabase = require('@/lib/supabase').supabase;
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() =>
              Promise.resolve({
                data: null,
                error: { code: 'PGRST116' }, // No rows returned
              })
            ),
          })),
        })),
      });

      const result = await mfaService.getMFAStatus(mockUserId);

      expect(result.enabled).toBe(false);
      expect(result.setupAt).toBeNull();
      expect(result.lastUsedAt).toBeNull();
    });
  });

  describe('disableMFA', () => {
    it('should disable MFA successfully', async () => {
      const result = await mfaService.disableMFA(mockUserId);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should handle database error when disabling MFA', async () => {
      const mockSupabase = require('@/lib/supabase').supabase;
      mockSupabase.from.mockReturnValue({
        update: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ error: { message: 'Database error' } })),
        })),
      });

      const result = await mfaService.disableMFA(mockUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to disable MFA');
    });
  });

  describe('regenerateBackupCodes', () => {
    it('should regenerate backup codes successfully', async () => {
      const result = await mfaService.regenerateBackupCodes(mockUserId);

      expect(result).toHaveLength(10);
      expect(result.every(code => /^[A-Z0-9]{3}-[A-Z0-9]{3}$/.test(code))).toBe(true);
    });

    it('should throw error on database failure', async () => {
      const mockSupabase = require('@/lib/supabase').supabase;
      mockSupabase.from.mockReturnValue({
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => Promise.resolve({ error: { message: 'Database error' } })),
          })),
        })),
      });

      await expect(mfaService.regenerateBackupCodes(mockUserId)).rejects.toThrow(
        'Failed to regenerate backup codes'
      );
    });
  });

  describe('getRecentAttempts', () => {
    it('should return recent verification attempts', async () => {
      const mockAttempts = [
        {
          id: '1',
          user_id: mockUserId,
          attempt_type: 'totp',
          success: true,
          created_at: '2023-01-01T00:00:00Z',
        },
      ];

      const mockSupabase = require('@/lib/supabase').supabase;
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              limit: jest.fn(() => Promise.resolve({ data: mockAttempts, error: null })),
            })),
          })),
        })),
      });

      const result = await mfaService.getRecentAttempts(mockUserId, 10);

      expect(result).toEqual(mockAttempts);
    });

    it('should return empty array on error', async () => {
      const mockSupabase = require('@/lib/supabase').supabase;
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              limit: jest.fn(() => Promise.resolve({ data: null, error: { message: 'Error' } })),
            })),
          })),
        })),
      });

      const result = await mfaService.getRecentAttempts(mockUserId, 10);

      expect(result).toEqual([]);
    });
  });
});
