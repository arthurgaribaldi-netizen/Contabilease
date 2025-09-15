'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeConfig {
  mode: Theme;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  isDark: boolean;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  config: ThemeConfig;
  resolvedTheme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  const stored = localStorage.getItem('theme') as Theme;
  return stored ?? 'system';
}

function getResolvedTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    return getSystemTheme();
  }
  return theme;
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const resolvedTheme = getResolvedTheme(theme);
  
  // Remove existing theme classes
  root.classList.remove('light', 'dark');
  
  // Add the resolved theme class
  root.classList.add(resolvedTheme);
  
  // Set data attribute for CSS targeting
  root.setAttribute('data-theme', resolvedTheme);
  
  // Update meta theme-color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', resolvedTheme === 'dark' ? '#0f172a' : '#ffffff');
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);

  const resolvedTheme = getResolvedTheme(theme);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    setTheme(newTheme);
  }, [theme]);

  const handleSetTheme = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  }, []);

  useEffect(() => {
    const storedTheme = getStoredTheme();
    setTheme(storedTheme);
    applyTheme(storedTheme);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Apply theme changes immediately
    applyTheme(theme);
    
    // Store theme preference
    localStorage.setItem('theme', theme);
    
    // Dispatch custom event for other components to listen
    window.dispatchEvent(new CustomEvent('theme-change', { 
      detail: { theme, resolvedTheme: getResolvedTheme(theme) } 
    }));
  }, [theme, mounted]);

  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
        window.dispatchEvent(new CustomEvent('theme-change', { 
          detail: { theme: 'system', resolvedTheme: getSystemTheme() } 
        }));
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, mounted]);

  const config: ThemeConfig = {
    mode: theme,
    primary: resolvedTheme === 'dark' ? '#60a5fa' : '#3b82f6',
    secondary: resolvedTheme === 'dark' ? '#64748b' : '#64748b',
    accent: resolvedTheme === 'dark' ? '#8b5cf6' : '#8b5cf6',
    background: resolvedTheme === 'dark' ? '#0f172a' : '#ffffff',
    surface: resolvedTheme === 'dark' ? '#1e293b' : '#f8fafc',
    text: resolvedTheme === 'dark' ? '#f8fafc' : '#0f172a',
    isDark: resolvedTheme === 'dark',
  };

  if (!mounted) {
    return (
      <div 
        className='min-h-screen bg-background text-foreground' 
        style={{ 
          background: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))'
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme: handleSetTheme, 
      config, 
      resolvedTheme,
      toggleTheme 
    }}>
      <div 
        className='min-h-screen bg-background text-foreground transition-colors duration-300 ease-in-out'
        data-theme={resolvedTheme}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
