/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 * 
 * This file contains proprietary Contabilease software components.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

import { supabase } from '@/lib/supabase';
import speakeasy from 'speakeasy';

export interface MFASecret {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface MFAVerificationResult {
  success: boolean;
  backupCodeUsed?: boolean;
}

export class MFAService {
  /**
   * Generate MFA secret and QR code for user setup
   */
  static async generateSecret(userId: string): Promise<MFASecret> {
    const secret = speakeasy.generateSecret({
      name: `Contabilease (${userId})`,
      issuer: 'Contabilease',
      length: 32,
    });

    const backupCodes = this.generateBackupCodes();

    // Store the secret and backup codes in the database
    const { error } = await supabase
      .from('user_mfa')
      .upsert({
        user_id: userId,
        secret: secret.base32,
        backup_codes: backupCodes,
        created_at: new Date().toISOString(),
      });

    if (error) {
      throw new Error(`Failed to store MFA secret: ${error.message}`);
    }

    return {
      secret: secret.base32,
      qrCodeUrl: secret.otpauth_url!,
      backupCodes,
    };
  }

  /**
   * Verify TOTP token
   */
  static async verifyToken(userId: string, token: string): Promise<MFAVerificationResult> {
    // Get user's MFA secret
    const { data: mfaData, error } = await supabase
      .from('user_mfa')
      .select('secret, backup_codes')
      .eq('user_id', userId)
      .single();

    if (error || !mfaData) {
      throw new Error('MFA not configured for this user');
    }

    // Verify TOTP token
    const verified = speakeasy.totp.verify({
      secret: mfaData.secret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 time steps before/after current
    });

    if (verified) {
      return { success: true };
    }

    // Check if it's a backup code
    const backupCodeUsed = await this.verifyBackupCode(userId, token);
    if (backupCodeUsed) {
      return { success: true, backupCodeUsed: true };
    }

    return { success: false };
  }

  /**
   * Verify backup code
   */
  static async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    const { data: mfaData, error } = await supabase
      .from('user_mfa')
      .select('backup_codes')
      .eq('user_id', userId)
      .single();

    if (error || !mfaData) {
      return false;
    }

    const backupCodes = mfaData.backup_codes as string[];
    const codeIndex = backupCodes.indexOf(code);

    if (codeIndex === -1) {
      return false;
    }

    // Remove used backup code
    backupCodes.splice(codeIndex, 1);
    
    const { error: updateError } = await supabase
      .from('user_mfa')
      .update({ backup_codes: backupCodes })
      .eq('user_id', userId);

    if (updateError) {
      throw new Error(`Failed to update backup codes: ${updateError.message}`);
    }

    return true;
  }

  /**
   * Generate backup codes
   */
  private static generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      codes.push(Math.random().toString(36).substring(2, 8).toUpperCase());
    }
    return codes;
  }

  /**
   * Check if user has MFA enabled
   */
  static async isMFAEnabled(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('user_mfa')
      .select('id')
      .eq('user_id', userId)
      .single();

    return !error && !!data;
  }

  /**
   * Disable MFA for user
   */
  static async disableMFA(userId: string): Promise<void> {
    const { error } = await supabase
      .from('user_mfa')
      .delete()
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to disable MFA: ${error.message}`);
    }
  }
}
