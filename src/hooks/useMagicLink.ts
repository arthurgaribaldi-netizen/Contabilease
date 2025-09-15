/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 * 
 * This file contains proprietary Contabilease software components.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

'use client';

import { supabase } from '@/lib/supabase';
import { useCallback, useState } from 'react';

interface UseMagicLinkReturn {
  sendMagicLink: (email: string) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
}

export function useMagicLink(): UseMagicLinkReturn {
  const [isLoading, setIsLoading] = useState(false);

  const sendMagicLink = useCallback(async (email: string) => {
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Email inválido' };
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify`,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Erro desconhecido' 
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    sendMagicLink,
    isLoading,
  };
}
