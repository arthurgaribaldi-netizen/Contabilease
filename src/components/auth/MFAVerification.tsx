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
import { AlertCircle, Smartphone } from 'lucide-react';
import { useState } from 'react';

interface MFAVerificationProps {
  onVerify: (token: string) => Promise<boolean>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function MFAVerification({
  onVerify,
  onCancel,
  isLoading = false,
}: MFAVerificationProps) {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token.trim()) {
      setError('Por favor, insira o código de verificação');
      return;
    }

    if (token.length !== 6) {
      setError('O código deve ter 6 dígitos');
      return;
    }

    try {
      const success = await onVerify(token);
      if (!success) {
        setError('Código de verificação inválido');
      }
    } catch (err) {
      setError('Erro ao verificar código');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <Smartphone className="h-6 w-6 text-blue-600" />
        </div>
        <CardTitle>Verificação em Duas Etapas</CardTitle>
        <CardDescription>
          Insira o código de 6 dígitos do seu aplicativo autenticador
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="mfa-token" className="block text-sm font-medium text-gray-700 mb-2">
              Código de Verificação
            </label>
            <Input
              id="mfa-token"
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="text-center font-mono text-2xl tracking-widest"
              maxLength={6}
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || token.length !== 6}
              className="flex-1"
            >
              {isLoading ? 'Verificando...' : 'Verificar'}
            </Button>
          </div>
        </form>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Problemas?</strong> Se você não conseguir acessar seu aplicativo autenticador,
            use um código de backup ou entre em contato com o suporte.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
