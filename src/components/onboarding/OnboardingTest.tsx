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
import { useOnboarding } from '@/hooks/useOnboarding';
import { ArrowPathIcon, CheckCircleIcon, PlayIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import OptimizedOnboarding from './OptimizedOnboarding';

export default function OnboardingTest() {
  const [isTestOpen, setIsTestOpen] = useState(false);
  const { 
    resetOnboarding, 
    shouldShowOptimizedOnboarding, 
    hasAchievedFirstVictory,
    onboardingState 
  } = useOnboarding();

  const handleStartTest = () => {
    setIsTestOpen(true);
  };

  const handleCompleteTest = () => {
    setIsTestOpen(false);
  };

  const handleResetOnboarding = () => {
    resetOnboarding();
    setIsTestOpen(false);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Teste do Onboarding Otimizado</h2>
        <p className="text-gray-600">
          Teste o novo fluxo de onboarding com 3 steps focados em primeira vitória
        </p>
      </div>

      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Step 1: Setup Rápido</h3>
            <p className="text-sm text-blue-700">2 minutos</p>
            <ul className="text-xs text-blue-600 mt-2 space-y-1">
              <li>• Nome da empresa</li>
              <li>• Setor de atuação</li>
              <li>• Volume de contratos</li>
            </ul>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium text-green-900 mb-2">Step 2: Primeira Vitória</h3>
            <p className="text-sm text-green-700">3 minutos</p>
            <ul className="text-xs text-green-600 mt-2 space-y-1">
              <li>• Criar primeiro contrato</li>
              <li>• Cálculo automático IFRS 16</li>
              <li>• Resultados em tempo real</li>
            </ul>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="font-medium text-purple-900 mb-2">Step 3: Exploração</h3>
            <p className="text-sm text-purple-700">Opcional</p>
            <ul className="text-xs text-purple-600 mt-2 space-y-1">
              <li>• Funcionalidades avançadas</li>
              <li>• Próximos passos</li>
              <li>• Recursos premium</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <h3 className="font-medium text-gray-900">Status Atual</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-700">Onboarding Otimizado Concluído:</span>
            <span className={`text-sm font-medium ${onboardingState.hasCompletedOptimizedOnboarding ? 'text-green-600' : 'text-gray-500'}`}>
              {onboardingState.hasCompletedOptimizedOnboarding ? 'Sim' : 'Não'}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-700">Primeira Vitória Alcançada:</span>
            <span className={`text-sm font-medium ${onboardingState.firstVictoryAchieved ? 'text-green-600' : 'text-gray-500'}`}>
              {onboardingState.firstVictoryAchieved ? 'Sim' : 'Não'}
            </span>
          </div>
          
          {onboardingState.companyData && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700">Empresa:</span>
              <span className="text-sm font-medium text-gray-900">
                {onboardingState.companyData.companyName || 'Não informado'}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex space-x-3">
        <Button
          onClick={handleStartTest}
          disabled={!shouldShowOptimizedOnboarding()}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          <PlayIcon className="h-4 w-4 mr-2" />
          {shouldShowOptimizedOnboarding() ? 'Iniciar Teste' : 'Onboarding Já Concluído'}
        </Button>
        
        <Button
          onClick={handleResetOnboarding}
          variant="outline"
          className="flex-1"
        >
          <ArrowPathIcon className="h-4 w-4 mr-2" />
          Resetar Onboarding
        </Button>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
        <div className="flex items-start space-x-3">
          <CheckCircleIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-900">Objetivos do Teste</h4>
            <ul className="text-sm text-yellow-700 mt-1 space-y-1">
              <li>• Validar tempo de primeira vitória (meta: &lt;5 minutos)</li>
              <li>• Verificar fluxo intuitivo e sem fricção</li>
              <li>• Confirmar cálculo automático funcionando</li>
              <li>• Testar navegação entre steps</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Test Modal */}
      {isTestOpen && (
        <OptimizedOnboarding
          isOpen={isTestOpen}
          onClose={handleCompleteTest}
          onComplete={handleCompleteTest}
          onFirstVictory={() => {
            console.log('Primeira vitória alcançada!');
          }}
        />
      )}
    </div>
  );
}
