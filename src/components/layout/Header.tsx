'use client';

import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useTheme } from '@/lib/theme-provider';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Menu, Settings, X } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showNotifications?: boolean;
  showSettings?: boolean;
  className?: string;
}

export function Header({ 
  title = 'Contabilease',
  subtitle,
  showNotifications = true,
  showSettings = true,
  className 
}: HeaderProps) {
  const { resolvedTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isDark = resolvedTheme === 'dark';

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'sticky top-0 z-50 w-full border-b transition-all duration-300',
        'bg-background/80 backdrop-blur-sm',
        isDark 
          ? 'border-slate-800/50 bg-slate-900/80' 
          : 'border-border/50 bg-white/80',
        className
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo/Title */}
        <div className="flex items-center space-x-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            className="flex items-center space-x-2"
          >
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg font-bold text-white',
                'bg-gradient-to-br from-blue-500 to-blue-600',
                isDark && 'from-blue-400 to-blue-500'
              )}
            >
              C
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">{title}</h1>
              {subtitle && (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          {showNotifications && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'relative transition-all duration-300',
                'hover:bg-accent hover:text-accent-foreground',
                isDark && 'hover:bg-slate-800/50'
              )}
              aria-label="Notificações"
            >
              <Bell className="h-4 w-4" />
              {/* Notification badge */}
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 text-xs" />
            </Button>
          )}

          {showSettings && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'transition-all duration-300',
                'hover:bg-accent hover:text-accent-foreground',
                isDark && 'hover:bg-slate-800/50'
              )}
              aria-label="Configurações"
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}

          <ThemeToggle variant="dropdown" />
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center space-x-2">
          <ThemeToggle variant="icon" />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={cn(
              'transition-all duration-300',
              'hover:bg-accent hover:text-accent-foreground',
              isDark && 'hover:bg-slate-800/50'
            )}
            aria-label="Menu"
          >
            <AnimatePresence mode="wait">
              {mobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-4 w-4" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="h-4 w-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={cn(
              'border-t md:hidden',
              isDark ? 'border-slate-800/50 bg-slate-900/95' : 'border-border/50 bg-white/95'
            )}
          >
            <div className="container mx-auto px-4 py-4 space-y-3">
              {showNotifications && (
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start transition-all duration-300',
                    'hover:bg-accent hover:text-accent-foreground',
                    isDark && 'hover:bg-slate-800/50'
                  )}
                >
                  <Bell className="mr-2 h-4 w-4" />
                  Notificações
                </Button>
              )}

              {showSettings && (
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start transition-all duration-300',
                    'hover:bg-accent hover:text-accent-foreground',
                    isDark && 'hover:bg-slate-800/50'
                  )}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
