/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 * 
 * This file contains proprietary Contabilease software components.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useMagicLink } from '@/hooks/useMagicLink';
import { CheckCircle, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

interface MagicLinkFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

export default function MagicLinkForm({
  onSuccess,
  onError,
  className,
}: MagicLinkFormProps) {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { sendMagicLink, isLoading } = useMagicLink();
  const t = useTranslations('auth.magicLink');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      onError?.(t('invalidEmail'));
      return;
    }

    try {
      const result = await sendMagicLink(email);
      
      if (result.success) {
        setIsSubmitted(true);
        onSuccess?.();
      } else {
        onError?.(result.error || t('sendError'));
      }
    } catch (err) {
      onError?.(t('unexpectedError'));
    }
  };

  if (isSubmitted) {
    return (
      <Card className={`w-full max-w-md mx-auto ${className || ''}`}>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle>{t('successTitle')}</CardTitle>
          <CardDescription>
            {t('successMessage')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                {t('emailSentTo')} <strong>{email}</strong>
              </p>
            </div>
            
            <div className="text-sm text-gray-600">
              <p className="mb-2"><strong>{t('nextSteps')}</strong></p>
              <ol className="list-decimal list-inside space-y-1">
                <li>{t('step1')}</li>
                <li>{t('step2')}</li>
                <li>{t('step3')}</li>
              </ol>
            </div>

            <Button
              variant="outline"
              onClick={() => {
                setIsSubmitted(false);
                setEmail('');
              }}
              className="w-full"
            >
              {t('tryAnotherEmail')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full max-w-md mx-auto ${className || ''}`}>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <Mail className="h-6 w-6 text-blue-600" />
        </div>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>
          {t('subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('emailPlaceholder')}
              disabled={isLoading}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading || !email.trim()}
            className="w-full"
          >
            {isLoading ? t('sending') : t('sendButton')}
          </Button>
        </form>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>{t('howItWorks')}</strong> {t('howItWorksDescription')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
