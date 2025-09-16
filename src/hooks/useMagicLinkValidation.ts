/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 *
 * This file contains proprietary Contabilease software components.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';

interface ValidationState {
  isValid: boolean;
  error: string | null;
}

interface UseMagicLinkValidationReturn {
  validateEmail: (email: string) => ValidationState;
  clearError: () => void;
  error: string | null;
}

/**
 * Hook personalizado para validação de email no Magic Link
 * Segue melhores práticas de validação e UX
 */
export function useMagicLinkValidation(): UseMagicLinkValidationReturn {
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('auth.magicLink');

  const validateEmail = useCallback(
    (email: string): ValidationState => {
      const trimmedEmail = email.trim();

      // Limpar erro anterior
      setError(null);

      // Validação de email vazio
      if (!trimmedEmail) {
        const errorMessage = t('invalidEmail');
        setError(errorMessage);
        return { isValid: false, error: errorMessage };
      }

      // Validação de formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        const errorMessage = t('invalidEmail');
        setError(errorMessage);
        return { isValid: false, error: errorMessage };
      }

      // Validação de comprimento máximo
      if (trimmedEmail.length > 254) {
        const errorMessage = t('invalidEmail');
        setError(errorMessage);
        return { isValid: false, error: errorMessage };
      }

      // Validação de domínio
      const domain = trimmedEmail.split('@')[1];
      if (domain && domain.length > 253) {
        const errorMessage = t('invalidEmail');
        setError(errorMessage);
        return { isValid: false, error: errorMessage };
      }

      return { isValid: true, error: null };
    },
    [t]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    validateEmail,
    clearError,
    error,
  };
}
