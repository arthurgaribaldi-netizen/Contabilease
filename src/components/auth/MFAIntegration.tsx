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
import { useMFA } from '@/hooks/useMFA';
import { logger } from '@/lib/logger';
import { Key, Shield, Smartphone } from 'lucide-react';
import { useEffect, useState } from 'react';
import BackupCodeVerification from './BackupCodeVerification';
import MFASetup from './MFASetup';
import MFAVerification from './MFAVerification';

interface MFAIntegrationProps {
  userId: string;
  onMFAComplete: () => void;
  onMFACancel: () => void;
  mode: 'setup' | 'verify' | 'login';
}

export default function MFAIntegration({
  userId,
  onMFAComplete,
  onMFACancel,
  mode,
}: MFAIntegrationProps) {
  const [currentStep, setCurrentStep] = useState<'main' | 'setup' | 'verify' | 'backup'>('main');
  const [showBackupOption, setShowBackupOption] = useState(false);

  const {
    isEnabled,
    isLoading,
    error,
    setupMFA,
    verifyToken,
    verifyBackupCode,
    checkMFAStatus,
    clearError,
  } = useMFA(userId);

  useEffect(() => {
    if (mode === 'verify' || mode === 'login') {
      checkMFAStatus().catch(error => {
        logger.error(
          'Error checking MFA status',
          {
            component: 'mfa-integration',
            operation: 'checkMFAStatus',
            userId,
            mode,
          },
          error as Error
        );
      });
    }
  }, [mode, checkMFAStatus]);

  const handleSetupComplete = () => {
    onMFAComplete();
  };

  const handleSetupCancel = () => {
    onMFACancel();
  };

  const handleVerifySuccess = () => {
    onMFAComplete();
  };

  const handleVerifyCancel = () => {
    onMFACancel();
  };

  const handleTokenVerify = async (token: string): Promise<boolean> => {
    const result = await verifyToken(token);
    return result.success;
  };

  const handleBackupVerify = async (code: string): Promise<boolean> => {
    return await verifyBackupCode(code);
  };

  const handleBackupCancel = () => {
    setShowBackupOption(false);
    setCurrentStep('verify');
  };

  // Setup mode
  if (mode === 'setup') {
    if (currentStep === 'main') {
      return (
        <Card className='w-full max-w-md mx-auto'>
          <CardHeader className='text-center'>
            <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100'>
              <Shield className='h-6 w-6 text-blue-600' />
            </div>
            <CardTitle>Configurar Autenticação em Duas Etapas</CardTitle>
            <CardDescription>Adicione uma camada extra de segurança à sua conta</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-3'>
              <div className='flex items-center gap-3 p-3 bg-green-50 rounded-lg'>
                <Smartphone className='h-5 w-5 text-green-600' />
                <div>
                  <p className='font-medium text-sm'>Códigos de verificação</p>
                  <p className='text-xs text-gray-600'>Receba códigos no seu celular</p>
                </div>
              </div>

              <div className='flex items-center gap-3 p-3 bg-blue-50 rounded-lg'>
                <Key className='h-5 w-5 text-blue-600' />
                <div>
                  <p className='font-medium text-sm'>Códigos de backup</p>
                  <p className='text-xs text-gray-600'>Use quando não tiver o celular</p>
                </div>
              </div>
            </div>

            {error && (
              <div className='p-3 bg-red-50 border border-red-200 rounded-lg'>
                <p className='text-sm text-red-600'>{error}</p>
              </div>
            )}

            <div className='flex gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={handleSetupCancel}
                className='flex-1'
              >
                Cancelar
              </Button>
              <Button
                onClick={() => setCurrentStep('setup')}
                className='flex-1'
                disabled={isLoading}
              >
                {isLoading ? 'Carregando...' : 'Começar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (currentStep === 'setup') {
      return (
        <MFASetup
          userId={userId}
          onComplete={handleSetupComplete}
          onCancel={() => setCurrentStep('main')}
        />
      );
    }
  }

  // Verify mode
  if (mode === 'verify' || mode === 'login') {
    if (!isEnabled && mode === 'login') {
      // If MFA is not enabled during login, proceed
      onMFAComplete();
      return null;
    }

    if (currentStep === 'verify') {
      return (
        <MFAVerification
          onVerify={handleTokenVerify}
          onCancel={showBackupOption ? handleVerifyCancel : () => setShowBackupOption(true)}
          isLoading={isLoading}
        />
      );
    }

    if (currentStep === 'backup') {
      return (
        <BackupCodeVerification
          onVerify={handleBackupVerify}
          onCancel={handleBackupCancel}
          isLoading={isLoading}
        />
      );
    }

    // Main verification screen
    return (
      <Card className='w-full max-w-md mx-auto'>
        <CardHeader className='text-center'>
          <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100'>
            <Shield className='h-6 w-6 text-blue-600' />
          </div>
          <CardTitle>Verificação em Duas Etapas</CardTitle>
          <CardDescription>Complete a verificação para continuar</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {error && (
            <div className='p-3 bg-red-50 border border-red-200 rounded-lg'>
              <p className='text-sm text-red-600'>{error}</p>
            </div>
          )}

          <div className='space-y-2'>
            <Button
              onClick={() => setCurrentStep('verify')}
              className='w-full'
              disabled={isLoading}
            >
              <Smartphone className='h-4 w-4 mr-2' />
              Usar Código do Aplicativo
            </Button>

            <Button
              onClick={() => setCurrentStep('backup')}
              variant='outline'
              className='w-full'
              disabled={isLoading}
            >
              <Key className='h-4 w-4 mr-2' />
              Usar Código de Backup
            </Button>
          </div>

          <div className='text-center'>
            <Button
              type='button'
              variant='ghost'
              onClick={handleVerifyCancel}
              className='text-sm text-gray-600'
            >
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
