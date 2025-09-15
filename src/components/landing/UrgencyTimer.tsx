'use client';

import { ClockIcon } from '@heroicons/react/24/outline';

interface UrgencyTimerProps {
  className?: string;
  showSeconds?: boolean;
  variant?: 'banner' | 'inline' | 'floating';
}

export default function UrgencyTimer({ 
  className = '', 
  showSeconds = true,
  variant = 'banner' 
}: UrgencyTimerProps) {
  // Removido timer fictício - usar apenas elementos visuais de urgência sem números inventados

  if (variant === 'banner') {
    return (
      <div className={`bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg p-4 text-center ${className}`}>
        <div className="flex items-center justify-center space-x-2 mb-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span className="font-semibold">⚡ Oferta Especial de Lançamento</span>
        </div>
        <p className="text-sm mb-2">
          <strong>Teste grátis de 30 dias</strong> disponível
        </p>
        <div className="flex justify-center space-x-2">
          <div className="bg-white/20 rounded-lg p-2 min-w-[50px]">
            <div className="text-xl font-bold">30</div>
            <div className="text-xs">dias</div>
          </div>
          <div className="bg-white/20 rounded-lg p-2 min-w-[50px]">
            <div className="text-xl font-bold">0</div>
            <div className="text-xs">R$</div>
          </div>
        </div>
        <div className="mt-2 text-xs opacity-90">
          🔥 Contadores profissionais já economizam tempo com o Contabilease
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <ClockIcon className="h-5 w-5 text-red-500" />
        <span className="text-sm font-medium text-gray-700">
          Teste grátis: <span className="text-red-600 font-bold">30 dias</span>
        </span>
      </div>
    );
  }

  if (variant === 'floating') {
    return (
      <div className={`bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg p-3 text-center ${className}`}>
        <div className="text-xs font-semibold mb-1">Teste grátis:</div>
        <div className="flex justify-center space-x-1">
          <div className="bg-white/20 rounded px-2 py-1">
            <div className="text-lg font-bold">30</div>
            <div className="text-xs">dias</div>
          </div>
          <div className="bg-white/20 rounded px-2 py-1">
            <div className="text-lg font-bold">0</div>
            <div className="text-xs">R$</div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
