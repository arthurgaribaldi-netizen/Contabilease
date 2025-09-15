'use client';

import {
  AdjustmentsHorizontalIcon,
  EyeIcon,
  SpeakerWaveIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useAccessibility } from './AccessibilityProvider';

interface AccessibilitySettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AccessibilitySettings({ isOpen, onClose }: AccessibilitySettingsProps) {
  const {
    reducedMotion,
    highContrast,
    fontSize,
    setReducedMotion,
    setHighContrast,
    setFontSize,
    announceToScreenReader,
  } = useAccessibility();

  const [tempSettings, setTempSettings] = useState({
    reducedMotion,
    highContrast,
    fontSize,
  });

  const handleSave = () => {
    setReducedMotion(tempSettings.reducedMotion);
    setHighContrast(tempSettings.highContrast);
    setFontSize(tempSettings.fontSize);
    announceToScreenReader('Configurações de acessibilidade salvas');
    onClose();
  };

  const handleReset = () => {
    setTempSettings({
      reducedMotion: false,
      highContrast: false,
      fontSize: 'medium',
    });
    announceToScreenReader('Configurações resetadas');
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 overflow-hidden'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black bg-opacity-50'
        onClick={onClose}
        aria-hidden='true'
      />

      {/* Modal */}
      <div className='relative flex items-center justify-center min-h-screen p-4'>
        <div
          className='bg-white rounded-lg shadow-xl max-w-md w-full mx-4'
          role='dialog'
          aria-labelledby='accessibility-title'
          aria-describedby='accessibility-description'
        >
          {/* Header */}
          <div className='flex items-center justify-between p-6 border-b border-gray-200'>
            <div className='flex items-center'>
              <AdjustmentsHorizontalIcon className='h-6 w-6 text-blue-600 mr-3' />
              <h2 id='accessibility-title' className='text-lg font-medium text-gray-900'>
                Configurações de Acessibilidade
              </h2>
            </div>
            <button
              onClick={onClose}
              className='text-gray-400 hover:text-gray-600 transition-colors'
              aria-label='Fechar configurações'
            >
              <XMarkIcon className='h-6 w-6' />
            </button>
          </div>

          {/* Content */}
          <div className='p-6'>
            <p id='accessibility-description' className='text-sm text-gray-600 mb-6'>
              Personalize a experiência de acordo com suas necessidades de acessibilidade.
            </p>

            <div className='space-y-6'>
              {/* Reduced Motion */}
              <div className='flex items-center justify-between'>
                <div className='flex items-center'>
                  <SpeakerWaveIcon className='h-5 w-5 text-gray-400 mr-3' />
                  <div>
                    <label htmlFor='reduced-motion' className='text-sm font-medium text-gray-700'>
                      Reduzir Animação
                    </label>
                    <p className='text-xs text-gray-500'>
                      Desativa animações para melhorar a performance
                    </p>
                  </div>
                </div>
                <button
                  id='reduced-motion'
                  onClick={() =>
                    setTempSettings(prev => ({ ...prev, reducedMotion: !prev.reducedMotion }))
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    tempSettings.reducedMotion ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  role='switch'
                  aria-checked={tempSettings.reducedMotion}
                  aria-labelledby='reduced-motion-label'
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      tempSettings.reducedMotion ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* High Contrast */}
              <div className='flex items-center justify-between'>
                <div className='flex items-center'>
                  <EyeIcon className='h-5 w-5 text-gray-400 mr-3' />
                  <div>
                    <label htmlFor='high-contrast' className='text-sm font-medium text-gray-700'>
                      Alto Contraste
                    </label>
                    <p className='text-xs text-gray-500'>
                      Aumenta o contraste das cores para melhor visibilidade
                    </p>
                  </div>
                </div>
                <button
                  id='high-contrast'
                  onClick={() =>
                    setTempSettings(prev => ({ ...prev, highContrast: !prev.highContrast }))
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    tempSettings.highContrast ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  role='switch'
                  aria-checked={tempSettings.highContrast}
                  aria-labelledby='high-contrast-label'
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      tempSettings.highContrast ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Font Size */}
              <div>
                <label htmlFor='font-size' className='block text-sm font-medium text-gray-700 mb-3'>
                  Tamanho da Fonte
                </label>
                <div className='flex space-x-2'>
                  {(['small', 'medium', 'large'] as const).map(size => (
                    <button
                      key={size}
                      onClick={() => setTempSettings(prev => ({ ...prev, fontSize: size }))}
                      className={`flex-1 py-2 px-3 text-sm font-medium rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        tempSettings.fontSize === size
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                      aria-pressed={tempSettings.fontSize === size}
                    >
                      {size === 'small' ? 'Pequeno' : size === 'medium' ? 'Médio' : 'Grande'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className='flex items-center justify-between p-6 border-t border-gray-200'>
            <button
              onClick={handleReset}
              className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            >
              Resetar
            </button>
            <div className='flex space-x-3'>
              <button
                onClick={onClose}
                className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className='px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
