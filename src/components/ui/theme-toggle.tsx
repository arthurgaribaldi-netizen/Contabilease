'use client';

import { useTheme } from '@/lib/theme-provider';
import { cn } from '@/lib/utils';
import { Monitor, Moon, Sun } from 'lucide-react';
import { Button } from './button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from './dropdown-menu';

interface ThemeToggleProps {
  variant?: 'default' | 'icon' | 'dropdown';
  className?: string;
}

export function ThemeToggle({ variant = 'dropdown', className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: 'light' as const, label: 'Claro', icon: Sun },
    { value: 'dark' as const, label: 'Escuro', icon: Moon },
    { value: 'system' as const, label: 'Sistema', icon: Monitor },
  ];

  const currentTheme = themes.find((t) => t.value === theme);
  const Icon = currentTheme?.icon || Sun;

  if (variant === 'icon') {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          const nextTheme = theme === 'light' ? 'dark' : 'light';
          setTheme(nextTheme);
        }}
        className={cn(
          'relative h-9 w-9 transition-all duration-300 hover:scale-105',
          'hover:bg-accent hover:text-accent-foreground',
          'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          className
        )}
        aria-label={`Alternar para modo ${theme === 'light' ? 'escuro' : 'claro'}`}
      >
        <Icon className="h-4 w-4 transition-transform duration-300" />
        <span className="sr-only">
          Alternar para modo {theme === 'light' ? 'escuro' : 'claro'}
        </span>
      </Button>
    );
  }

  if (variant === 'default') {
    return (
      <Button
        variant="outline"
        onClick={() => {
          const nextTheme = theme === 'light' ? 'dark' : 'light';
          setTheme(nextTheme);
        }}
        className={cn(
          'relative transition-all duration-300 hover:scale-105',
          'hover:bg-accent hover:text-accent-foreground',
          'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          className
        )}
        aria-label={`Alternar para modo ${theme === 'light' ? 'escuro' : 'claro'}`}
      >
        <Icon className="mr-2 h-4 w-4 transition-transform duration-300" />
        {currentTheme?.label}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'relative h-9 w-9 transition-all duration-300 hover:scale-105',
            'hover:bg-accent hover:text-accent-foreground',
            'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            className
          )}
          aria-label="Selecionar tema"
        >
          <Icon className="h-4 w-4 transition-transform duration-300" />
          <span className="sr-only">Selecionar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={cn(
          'w-48 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2',
          'border-border bg-popover text-popover-foreground',
          'shadow-lg backdrop-blur-sm'
        )}
      >
        {themes.map((themeOption) => {
          const ThemeIcon = themeOption.icon;
          const isSelected = theme === themeOption.value;
          
          return (
            <DropdownMenuItem
              key={themeOption.value}
              onClick={() => setTheme(themeOption.value)}
              className={cn(
                'flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-all duration-200',
                'hover:bg-accent hover:text-accent-foreground',
                'focus:bg-accent focus:text-accent-foreground',
                'data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground',
                isSelected && 'bg-accent text-accent-foreground font-medium'
              )}
            >
              <ThemeIcon className="h-4 w-4 transition-transform duration-200" />
              <span className="flex-1">{themeOption.label}</span>
              {isSelected && (
                <div className="h-2 w-2 rounded-full bg-primary transition-all duration-200" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Componente de toggle simples com animação suave
export function SimpleThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => {
        const nextTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(nextTheme);
      }}
      className={cn(
        'group relative flex h-10 w-20 items-center rounded-full border-2 border-border',
        'bg-background transition-all duration-300 ease-in-out',
        'hover:border-ring hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        'dark:border-slate-600 dark:hover:border-slate-500',
        className
      )}
      aria-label={`Alternar para modo ${theme === 'light' ? 'escuro' : 'claro'}`}
    >
      {/* Track */}
      <div
        className={cn(
          'absolute left-1 top-1 h-6 w-6 rounded-full transition-all duration-300 ease-in-out',
          'bg-primary shadow-lg',
          theme === 'dark' ? 'translate-x-10' : 'translate-x-0'
        )}
      />
      
      {/* Icons */}
      <div className="relative flex w-full items-center justify-between px-2">
        <Sun
          className={cn(
            'h-4 w-4 transition-all duration-300',
            theme === 'light' 
              ? 'text-primary-foreground opacity-100' 
              : 'text-muted-foreground opacity-50'
          )}
        />
        <Moon
          className={cn(
            'h-4 w-4 transition-all duration-300',
            theme === 'dark' 
              ? 'text-primary-foreground opacity-100' 
              : 'text-muted-foreground opacity-50'
          )}
        />
      </div>
    </button>
  );
}

// Componente de indicador de tema para debug
export function ThemeIndicator({ className }: { className?: string }) {
  const { theme } = useTheme();

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50 rounded-lg border bg-card p-3 text-sm shadow-lg',
        'transition-all duration-300',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'h-3 w-3 rounded-full',
            theme === 'light' ? 'bg-yellow-400' : theme === 'dark' ? 'bg-blue-600' : 'bg-green-500'
          )}
        />
        <span className="font-medium">Tema: {theme}</span>
      </div>
    </div>
  );
}