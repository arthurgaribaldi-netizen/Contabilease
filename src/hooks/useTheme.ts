'use client';

import { useTheme as useThemeContext } from '@/lib/theme-provider';
import { useEffect, useState } from 'react';

export function useTheme() {
  const themeContext = useThemeContext();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return {
    ...themeContext,
    isClient,
    // Helper methods
    isDark: themeContext.resolvedTheme === 'dark',
    isLight: themeContext.resolvedTheme === 'light',
    isSystem: themeContext.theme === 'system',
    
    // Theme-aware class utilities
    themeClasses: {
      background: 'bg-background text-foreground',
      card: 'bg-card text-card-foreground border border-border',
      muted: 'bg-muted text-muted-foreground',
      accent: 'bg-accent text-accent-foreground',
      primary: 'bg-primary text-primary-foreground',
      secondary: 'bg-secondary text-secondary-foreground',
    },
    
    // Theme-aware color utilities
    colors: {
      primary: themeContext.config.primary,
      secondary: themeContext.config.secondary,
      accent: themeContext.config.accent,
      background: themeContext.config.background,
      surface: themeContext.config.surface,
      text: themeContext.config.text,
    }
  };
}

// Hook for listening to theme changes
export function useThemeChange(callback: (theme: string, resolvedTheme: string) => void) {
  useEffect(() => {
    const handleThemeChange = (event: CustomEvent) => {
      callback(event.detail.theme, event.detail.resolvedTheme);
    };

    window.addEventListener('theme-change', handleThemeChange as EventListener);
    
    return () => {
      window.removeEventListener('theme-change', handleThemeChange as EventListener);
    };
  }, [callback]);
}

// Hook for theme-aware animations
export function useThemeAnimation() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return {
    isDark,
    animationVariants: {
      initial: { opacity: 0, y: 20 },
      animate: { 
        opacity: 1, 
        y: 0,
        transition: { 
          duration: 0.3, 
          ease: 'easeOut' 
        }
      },
      exit: { 
        opacity: 0, 
        y: -20,
        transition: { 
          duration: 0.2, 
          ease: 'easeIn' 
        }
      }
    },
    hoverVariants: {
      hover: { 
        scale: 1.02,
        transition: { duration: 0.2 }
      },
      tap: { 
        scale: 0.98,
        transition: { duration: 0.1 }
      }
    },
    glowEffect: isDark ? {
      boxShadow: '0 0 20px rgba(96, 165, 250, 0.3)',
      border: '1px solid rgba(96, 165, 250, 0.3)'
    } : {
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(0, 0, 0, 0.1)'
    }
  };
}
