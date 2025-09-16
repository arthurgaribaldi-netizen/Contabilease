'use client';

import { useTheme } from '@/lib/theme-provider';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface DarkModeCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'glass' | 'glow';
  hover?: boolean;
  animated?: boolean;
}

export function DarkModeCard({
  children,
  className,
  variant = 'default',
  hover = true,
  animated = true,
}: DarkModeCardProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const variants = {
    default: cn(
      'bg-card border border-border text-card-foreground shadow-sm',
      'hover:shadow-md transition-all duration-300',
      isDark && 'hover:shadow-lg hover:shadow-blue-500/10'
    ),
    elevated: cn(
      'bg-card border border-border text-card-foreground shadow-elevated',
      'hover:shadow-floating transition-all duration-300',
      isDark && 'hover:shadow-lg hover:shadow-blue-500/20'
    ),
    glass: cn(
      'backdrop-blur-sm border border-border/50 text-card-foreground',
      isDark
        ? 'bg-slate-900/80 border-slate-700/20 hover:bg-slate-800/80'
        : 'bg-white/80 border-white/20 hover:bg-white/90',
      'transition-all duration-300'
    ),
    glow: cn(
      'bg-card border border-border text-card-foreground',
      isDark
        ? 'border-blue-500/30 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20'
        : 'shadow-lg hover:shadow-xl',
      'transition-all duration-300'
    ),
  };

  const MotionCard = animated ? motion.div : 'div';
  const motionProps = animated
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3, ease: 'easeOut' as const },
      }
    : {};

  const hoverProps =
    hover && animated
      ? {
          whileHover: {
            scale: 1.02,
            transition: { duration: 0.2 },
          },
          whileTap: {
            scale: 0.98,
            transition: { duration: 0.1 },
          },
        }
      : {};

  return (
    <MotionCard
      className={cn('rounded-lg p-6', variants[variant], hover && 'cursor-pointer', className)}
      {...motionProps}
      {...hoverProps}
    >
      {children}
    </MotionCard>
  );
}

// Componente de card com gradiente específico para modo escuro
export function GradientCard({
  children,
  className,
  direction = 'to-br',
}: {
  children: ReactNode;
  className?: string;
  direction?: string;
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div
      className={cn(
        'rounded-lg border p-6 transition-all duration-300',
        'bg-gradient-to-br from-card to-card/50',
        isDark
          ? 'border-slate-700/50 from-slate-900/80 to-slate-800/40 hover:border-blue-500/30'
          : 'border-border/50 hover:border-primary/30',
        'hover:shadow-lg',
        className
      )}
    >
      {children}
    </div>
  );
}

// Componente de card com efeito de brilho
export function ShimmerCard({
  children,
  className,
  shimmer = true,
}: {
  children: ReactNode;
  className?: string;
  shimmer?: boolean;
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border p-6',
        'bg-card text-card-foreground',
        isDark ? 'border-slate-700/50 bg-slate-900/80' : 'border-border/50 bg-white/80',
        'transition-all duration-300',
        className
      )}
    >
      {shimmer && (
        <div
          className={cn(
            'absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent',
            isDark && 'via-blue-500/20',
            'animate-pulse'
          )}
        />
      )}
      <div className='relative z-10'>{children}</div>
    </div>
  );
}

// Componente de card com animação de entrada
export function AnimatedCard({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: delay * 0.1,
        ease: 'easeOut' as const,
      }}
      className={cn(
        'rounded-lg border bg-card p-6 text-card-foreground shadow-sm',
        'transition-all duration-300 hover:shadow-md',
        className
      )}
    >
      {children}
    </motion.div>
  );
}
