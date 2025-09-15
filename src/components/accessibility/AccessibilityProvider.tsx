'use client';

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AccessibilityConfig {
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  focusVisible: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
}

interface AccessibilityContextType {
  config: AccessibilityConfig;
  updateConfig: (updates: Partial<AccessibilityConfig>) => void;
  resetConfig: () => void;
  announceToScreenReader: (message: string) => void;
}

const defaultConfig: AccessibilityConfig = {
  reducedMotion: false,
  highContrast: false,
  fontSize: 'medium',
  focusVisible: true,
  screenReader: false,
  keyboardNavigation: true,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

interface AccessibilityProviderProps {
  children: ReactNode;
}

/**
 * Provider de acessibilidade que gerencia configurações globais
 * Implementa ARIA, navegação por teclado e outras funcionalidades de acessibilidade
 */
export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const [config, setConfig] = useState<AccessibilityConfig>(() => {
    // Carrega configurações salvas do localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('accessibility-config');
      if (saved) {
        try {
          return { ...defaultConfig, ...JSON.parse(saved) };
        } catch {
          return defaultConfig;
        }
      }
    }
    return defaultConfig;
  });

  // Detecta preferências do sistema
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detecta preferência de movimento reduzido
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => {
      setConfig(prev => ({ ...prev, reducedMotion: e.matches }));
    };

    mediaQuery.addEventListener('change', handleChange);
    setConfig(prev => ({ ...prev, reducedMotion: mediaQuery.matches }));

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Detecta se é um screen reader
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detecta screen readers comuns
    const screenReaderIndicators = [
      'speechSynthesis' in window,
      'speechRecognition' in window,
      navigator.userAgent.includes('NVDA'),
      navigator.userAgent.includes('JAWS'),
      navigator.userAgent.includes('VoiceOver'),
      navigator.userAgent.includes('TalkBack'),
    ];

    const hasScreenReader = screenReaderIndicators.some(indicator => indicator);
    setConfig(prev => ({ ...prev, screenReader: hasScreenReader }));
  }, []);

  // Aplica configurações ao DOM
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;

    // Aplica classe de movimento reduzido
    if (config.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Aplica classe de alto contraste
    if (config.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Aplica tamanho da fonte
    root.classList.remove('font-small', 'font-medium', 'font-large', 'font-extra-large');
    root.classList.add(`font-${config.fontSize}`);

    // Aplica foco visível
    if (config.focusVisible) {
      root.classList.add('focus-visible');
    } else {
      root.classList.remove('focus-visible');
    }

    // Salva configurações no localStorage
    localStorage.setItem('accessibility-config', JSON.stringify(config));
  }, [config]);

  const updateConfig = (updates: Partial<AccessibilityConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const resetConfig = () => {
    setConfig(defaultConfig);
  };

  const announceToScreenReader = (message: string) => {
    if (typeof window === 'undefined') return;

    // Cria elemento para anunciar ao screen reader
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove após um tempo
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  const value: AccessibilityContextType = {
    config,
    updateConfig,
    resetConfig,
    announceToScreenReader,
  };

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}

/**
 * Hook para usar configurações de acessibilidade
 */
export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}

/**
 * Componente para anunciar mudanças ao screen reader
 */
interface ScreenReaderAnnouncementProps {
  message: string;
  priority?: 'polite' | 'assertive';
}

export function ScreenReaderAnnouncement({
  message,
  priority = 'polite',
}: ScreenReaderAnnouncementProps) {
  return (
    <div aria-live={priority} aria-atomic='true' className='sr-only'>
      {message}
    </div>
  );
}

/**
 * Hook para navegação por teclado aprimorada
 */
export function useKeyboardNavigation() {
  const { config } = useAccessibility();

  useEffect(() => {
    if (!config.keyboardNavigation) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip links para navegação rápida
      if (event.key === 'Tab' && event.shiftKey) {
        // Shift + Tab - navegação reversa
        return;
      }

      // Atalhos de teclado globais
      if (event.altKey) {
        switch (event.key) {
          case '1':
            event.preventDefault();
            document.querySelector('main')?.focus();
            break;
          case '2':
            event.preventDefault();
            document.querySelector('nav')?.focus();
            break;
          case '3':
            event.preventDefault();
            document.querySelector('aside')?.focus();
            break;
          case '0':
            event.preventDefault();
            // Abre menu de acessibilidade
            const accessibilityMenu = document.getElementById('accessibility-menu');
            if (accessibilityMenu) {
              accessibilityMenu.focus();
            }
            break;
        }
      }

      // Escape para fechar modais
      if (event.key === 'Escape') {
        const modal = document.querySelector('[role="dialog"]:not([aria-hidden="true"])');
        if (modal) {
          const closeButton = modal.querySelector('[aria-label*="close"], [aria-label*="fechar"]');
          if (closeButton instanceof HTMLElement) {
            closeButton.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [config.keyboardNavigation]);
}

/**
 * Componente de menu de acessibilidade
 */
export function AccessibilityMenu() {
  const { config, updateConfig, announceToScreenReader } = useAccessibility();

  const handleToggle = (key: keyof AccessibilityConfig, value: boolean) => {
    updateConfig({ [key]: value });
    announceToScreenReader(`${key} ${value ? 'ativado' : 'desativado'}`);
  };

  const handleFontSizeChange = (size: AccessibilityConfig['fontSize']) => {
    updateConfig({ fontSize: size });
    announceToScreenReader(`Tamanho da fonte alterado para ${size}`);
  };

  return (
    <div
      id='accessibility-menu'
      className='fixed top-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 z-50 min-w-64'
      role='dialog'
      aria-labelledby='accessibility-menu-title'
      aria-modal='true'
    >
      <h2 id='accessibility-menu-title' className='text-lg font-semibold mb-4'>
        Configurações de Acessibilidade
      </h2>

      <div className='space-y-4'>
        {/* Movimento Reduzido */}
        <div className='flex items-center justify-between'>
          <label htmlFor='reduced-motion' className='text-sm font-medium'>
            Movimento Reduzido
          </label>
          <input
            id='reduced-motion'
            type='checkbox'
            checked={config.reducedMotion}
            onChange={e => handleToggle('reducedMotion', e.target.checked)}
            className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
          />
        </div>

        {/* Alto Contraste */}
        <div className='flex items-center justify-between'>
          <label htmlFor='high-contrast' className='text-sm font-medium'>
            Alto Contraste
          </label>
          <input
            id='high-contrast'
            type='checkbox'
            checked={config.highContrast}
            onChange={e => handleToggle('highContrast', e.target.checked)}
            className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
          />
        </div>

        {/* Tamanho da Fonte */}
        <div>
          <label htmlFor='font-size' className='block text-sm font-medium mb-2'>
            Tamanho da Fonte
          </label>
          <select
            id='font-size'
            value={config.fontSize}
            onChange={e => handleFontSizeChange(e.target.value as AccessibilityConfig['fontSize'])}
            className='w-full rounded border-gray-300 focus:ring-blue-500 focus:border-blue-500'
          >
            <option value='small'>Pequeno</option>
            <option value='medium'>Médio</option>
            <option value='large'>Grande</option>
            <option value='extra-large'>Extra Grande</option>
          </select>
        </div>

        {/* Foco Visível */}
        <div className='flex items-center justify-between'>
          <label htmlFor='focus-visible' className='text-sm font-medium'>
            Indicador de Foco
          </label>
          <input
            id='focus-visible'
            type='checkbox'
            checked={config.focusVisible}
            onChange={e => handleToggle('focusVisible', e.target.checked)}
            className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
          />
        </div>

        {/* Botão de Reset */}
        <button
          onClick={() => {
            updateConfig(defaultConfig);
            announceToScreenReader('Configurações de acessibilidade resetadas');
          }}
          className='w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500'
        >
          Resetar Configurações
        </button>
      </div>
    </div>
  );
}

/**
 * Componente para skip links
 */
export function SkipLinks() {
  return (
    <div className='sr-only focus-within:not-sr-only'>
      <a
        href='#main-content'
        className='absolute top-0 left-0 bg-blue-600 text-white px-4 py-2 rounded-br focus:z-50 focus:outline-none focus:ring-2 focus:ring-white'
      >
        Pular para conteúdo principal
      </a>
      <a
        href='#navigation'
        className='absolute top-0 left-32 bg-blue-600 text-white px-4 py-2 rounded-br focus:z-50 focus:outline-none focus:ring-2 focus:ring-white'
      >
        Pular para navegação
      </a>
    </div>
  );
}
