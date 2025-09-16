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
import { logger } from '@/lib/logger';
import { MFAService } from '@/lib/mfa/mfa-service';
import { AlertCircle, CheckCircle, Shield, Smartphone } from 'lucide-react';
import { useEffect, useState } from 'react';

interface MFASetupProps {
  userId: string;
  onComplete: () => void;
  onCancel: () => void;
}

export default function MFASetup({ userId, onComplete, onCancel }: MFASetupProps) {
  const [step, setStep] = useState<'setup' | 'verify' | 'backup'>('setup');
  const [secret, setSecret] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationToken, setVerificationToken] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    initializeMFA().catch(error => {
      logger.error(
        'Error initializing MFA:',
        {
          component: 'mfasetup',
          operation: 'initializeMFA',
        },
        error as Error
      );
    });
  }, []);

  const initializeMFA = async () => {
    try {
      setIsLoading(true);
      const mfaData = await MFAService.generateSecret(userId);
      setSecret(mfaData.secret);
      setQrCodeUrl(mfaData.qrCodeUrl);
      setBackupCodes(mfaData.backupCodes);
    } catch (err) {
      setError('Erro ao inicializar MFA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyToken = async () => {
    if (!verificationToken || verificationToken.length !== 6) {
      setError('Por favor, insira um código de 6 dígitos');
      return;
    }

    try {
      setIsLoading(true);
      const result = await MFAService.verifyToken(userId, verificationToken);

      if (result.success) {
        setStep('backup');
      } else {
        setError('Código de verificação inválido');
      }
    } catch (err) {
      setError('Erro ao verificar código');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    onComplete();
  };

  if (step === 'setup') {
    return (
      <Card className='w-full max-w-md mx-auto'>
        <CardHeader className='text-center'>
          <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100'>
            <Shield className='h-6 w-6 text-blue-600' />
          </div>
          <CardTitle>Configurar Autenticação em Duas Etapas</CardTitle>
          <CardDescription>Escaneie o QR code com seu aplicativo autenticador</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {isLoading ? (
            <div className='text-center py-8'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
              <p className='mt-2 text-sm text-gray-600'>Gerando configuração...</p>
            </div>
          ) : (
            <>
              <div className='text-center'>
                <img src={qrCodeUrl} alt='QR Code para MFA' className='mx-auto' />
              </div>

              <div className='p-3 bg-gray-50 rounded-lg'>
                <p className='text-sm text-gray-600 mb-2'>
                  <strong>Chave secreta:</strong>
                </p>
                <code className='text-xs font-mono bg-white p-2 rounded border block text-center'>
                  {secret}
                </code>
              </div>

              <div className='space-y-2'>
                <h4 className='font-medium text-sm'>Instruções:</h4>
                <ol className='text-sm text-gray-600 space-y-1 list-decimal list-inside'>
                  <li>Abra seu aplicativo autenticador (Google Authenticator, Authy, etc.)</li>
                  <li>Escaneie o QR code acima ou digite a chave secreta manualmente</li>
                  <li>Clique em "Continuar" quando estiver pronto</li>
                </ol>
              </div>

              {error && (
                <div className='flex items-center gap-2 text-red-600 text-sm'>
                  <AlertCircle className='h-4 w-4' />
                  {error}
                </div>
              )}

              <div className='flex gap-2'>
                <Button type='button' variant='outline' onClick={onCancel} className='flex-1'>
                  Cancelar
                </Button>
                <Button onClick={() => setStep('verify')} className='flex-1'>
                  Continuar
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  if (step === 'verify') {
    return (
      <Card className='w-full max-w-md mx-auto'>
        <CardHeader className='text-center'>
          <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100'>
            <Smartphone className='h-6 w-6 text-green-600' />
          </div>
          <CardTitle>Verificar Configuração</CardTitle>
          <CardDescription>
            Insira o código de 6 dígitos do seu aplicativo autenticador
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div>
              <label
                htmlFor='verify-token'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Código de Verificação
              </label>
              <Input
                id='verify-token'
                type='text'
                value={verificationToken}
                onChange={e => setVerificationToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder='000000'
                className='text-center font-mono text-2xl tracking-widest'
                maxLength={6}
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className='flex items-center gap-2 text-red-600 text-sm'>
                <AlertCircle className='h-4 w-4' />
                {error}
              </div>
            )}

            <div className='flex gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setStep('setup')}
                disabled={isLoading}
                className='flex-1'
              >
                Voltar
              </Button>
              <Button
                onClick={handleVerifyToken}
                disabled={isLoading || verificationToken.length !== 6}
                className='flex-1'
              >
                {isLoading ? 'Verificando...' : 'Verificar'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'backup') {
    return (
      <Card className='w-full max-w-md mx-auto'>
        <CardHeader className='text-center'>
          <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100'>
            <CheckCircle className='h-6 w-6 text-green-600' />
          </div>
          <CardTitle>MFA Configurado com Sucesso!</CardTitle>
          <CardDescription>Guarde estes códigos de backup em local seguro</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='p-3 bg-yellow-50 border border-yellow-200 rounded-lg'>
              <p className='text-sm text-yellow-800 font-medium mb-2'>
                ⚠️ Importante: Guarde estes códigos em local seguro
              </p>
              <p className='text-sm text-yellow-700'>
                Estes códigos podem ser usados para acessar sua conta caso você perca acesso ao seu
                aplicativo autenticador.
              </p>
            </div>

            <div className='grid grid-cols-2 gap-2'>
              {backupCodes.map((code, index) => (
                <div
                  key={index}
                  className='p-2 bg-gray-50 border rounded text-center font-mono text-sm'
                >
                  {code}
                </div>
              ))}
            </div>

            <div className='p-3 bg-blue-50 rounded-lg'>
              <p className='text-sm text-blue-800'>
                <strong>Dica:</strong> Cada código só pode ser usado uma vez. Recomendamos imprimir
                ou salvar em um gerenciador de senhas.
              </p>
            </div>

            <Button onClick={handleComplete} className='w-full'>
              Concluir Configuração
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
