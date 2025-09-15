/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 * 
 * This file contains proprietary Contabilease software components.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

'use client';

import { useState, useCallback } from 'react';
import { MFAService, MFASecret, MFAVerificationResult } from '@/lib/mfa/mfa-service';

export interface UseMFAReturn {
  // State
  isEnabled: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Setup
  setupMFA: () => Promise<MFASecret | null>;
  verifySetup: (token: string) => Promise<boolean>;
  
  // Verification
  verifyToken: (token: string) => Promise<MFAVerificationResult>;
  verifyBackupCode: (code: string) => Promise<boolean>;
  
  // Management
  disableMFA: () => Promise<boolean>;
  checkMFAStatus: () => Promise<void>;
  
  // Utility
  clearError: () => void;
}

export function useMFA(userId: string): UseMFAReturn {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const setupMFA = useCallback(async (): Promise<MFASecret | null> => {
    if (!userId) {
      setError('User ID is required');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const secret = await MFAService.generateSecret(userId);
      setIsEnabled(true);
      
      return secret;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to setup MFA';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const verifySetup = useCallback(async (token: string): Promise<boolean> => {
    if (!userId) {
      setError('User ID is required');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const result = await MFAService.verifyToken(userId, token);
      
      if (result.success) {
        setIsEnabled(true);
        return true;
      } else {
        setError('Invalid verification token');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify setup';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const verifyToken = useCallback(async (token: string): Promise<MFAVerificationResult> => {
    if (!userId) {
      setError('User ID is required');
      return { success: false };
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const result = await MFAService.verifyToken(userId, token);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify token';
      setError(errorMessage);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const verifyBackupCode = useCallback(async (code: string): Promise<boolean> => {
    if (!userId) {
      setError('User ID is required');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const result = await MFAService.verifyToken(userId, code);
      return result.success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify backup code';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const disableMFA = useCallback(async (): Promise<boolean> => {
    if (!userId) {
      setError('User ID is required');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      await MFAService.disableMFA(userId);
      setIsEnabled(false);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to disable MFA';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const checkMFAStatus = useCallback(async (): Promise<void> => {
    if (!userId) {
      setError('User ID is required');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const enabled = await MFAService.isMFAEnabled(userId);
      setIsEnabled(enabled);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check MFA status';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  return {
    // State
    isEnabled,
    isLoading,
    error,
    
    // Setup
    setupMFA,
    verifySetup,
    
    // Verification
    verifyToken,
    verifyBackupCode,
    
    // Management
    disableMFA,
    checkMFAStatus,
    
    // Utility
    clearError,
  };
}
