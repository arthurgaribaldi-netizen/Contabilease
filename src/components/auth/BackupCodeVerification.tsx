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
import { AlertCircle, Shield } from 'lucide-react';
import { useState } from 'react';

interface BackupCodeVerificationProps {
  onVerify: (code: string) => Promise<boolean>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function BackupCodeVerification({
  onVerify,
  onCancel,
  isLoading = false,
}: BackupCodeVerificationProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!code.trim()) {
      setError('Por favor, insira um código de backup');
      return;
    }

    try {
      const success = await onVerify(code);
      if (!success) {
        setError('Código de backup inválido');
      }
    } catch (err) {
      setError('Erro ao verificar código de backup');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
          <Shield className="h-6 w-6 text-orange-600" />
        </div>
        <CardTitle>Verificação de Código de Backup</CardTitle>
        <CardDescription>
          Insira um dos seus códigos de backup para continuar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="backup-code" className="block text-sm font-medium text-gray-700 mb-2">
              Código de Backup
            </label>
            <Input
              id="backup-code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Digite o código de backup"
              className="text-center font-mono tracking-wider"
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
              disabled={isLoading || !code.trim()}
              className="flex-1"
            >
              {isLoading ? 'Verificando...' : 'Verificar'}
            </Button>
          </div>
        </form>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Dica:</strong> Os códigos de backup são únicos e só podem ser usados uma vez.
            Certifique-se de guardá-los em local seguro.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
