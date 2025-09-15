'use client';

import { motion } from 'framer-motion';
import * as React from 'react';

interface MicroFeedbackProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'subtle' | 'strong';
  className?: string;
}

export function MicroFeedback({ 
  children, 
  onClick, 
  disabled = false, 
  variant = 'default',
  className = '' 
}: MicroFeedbackProps) {
  const getVariantProps = () => {
    switch (variant) {
      case 'subtle':
        return {
          whileHover: { scale: 1.01 },
          whileTap: { scale: 0.99 },
          transition: { duration: 0.1 }
        };
      case 'strong':
        return {
          whileHover: { 
            scale: 1.05,
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
          },
          whileTap: { 
            scale: 0.95,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          },
          transition: { type: 'spring', stiffness: 400, damping: 17 }
        };
      default:
        return {
          whileHover: { scale: 1.02 },
          whileTap: { scale: 0.98 },
          transition: { type: 'spring', stiffness: 300, damping: 20 }
        };
    }
  };

  return (
    <motion.div
      className={`cursor-pointer ${className}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      {...getVariantProps()}
      style={{ 
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer'
      }}
    >
      {children}
    </motion.div>
  );
}

interface RippleEffectProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function RippleEffect({ children, onClick, className = '' }: RippleEffectProps) {
  const [ripples, setRipples] = React.useState<Array<{ id: number; x: number; y: number }>>([]);

  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = {
      id: Date.now(),
      x,
      y,
    };
    
    setRipples(prev => [...prev, newRipple]);
    
    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
    
    onClick?.();
  };

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onClick={handleClick}
    >
      {children}
      {ripples.map(ripple => (
        <motion.div
          key={ripple.id}
          className="absolute bg-white bg-opacity-30 rounded-full pointer-events-none"
          initial={{ 
            x: ripple.x - 10, 
            y: ripple.y - 10, 
            width: 20, 
            height: 20,
            opacity: 1 
          }}
          animate={{ 
            x: ripple.x - 50, 
            y: ripple.y - 50, 
            width: 100, 
            height: 100,
            opacity: 0 
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

interface PulseEffectProps {
  children: React.ReactNode;
  isActive?: boolean;
  className?: string;
}

export function PulseEffect({ children, isActive = false, className = '' }: PulseEffectProps) {
  return (
    <motion.div
      className={className}
      animate={isActive ? {
        scale: [1, 1.05, 1],
        boxShadow: [
          '0 0 0 0 rgba(59, 130, 246, 0.7)',
          '0 0 0 10px rgba(59, 130, 246, 0)',
          '0 0 0 0 rgba(59, 130, 246, 0)'
        ]
      } : {}}
      transition={{ 
        duration: 1.5, 
        repeat: isActive ? Infinity : 0,
        ease: 'easeInOut'
      }}
    >
      {children}
    </motion.div>
  );
}

interface ShakeEffectProps {
  children: React.ReactNode;
  isShaking?: boolean;
  className?: string;
}

export function ShakeEffect({ children, isShaking = false, className = '' }: ShakeEffectProps) {
  return (
    <motion.div
      className={className}
      animate={isShaking ? {
        x: [0, -10, 10, -10, 10, -5, 5, 0]
      } : {}}
      transition={{ 
        duration: 0.5,
        ease: 'easeInOut'
      }}
    >
      {children}
    </motion.div>
  );
}

interface BounceEffectProps {
  children: React.ReactNode;
  isBouncing?: boolean;
  className?: string;
}

export function BounceEffect({ children, isBouncing = false, className = '' }: BounceEffectProps) {
  return (
    <motion.div
      className={className}
      animate={isBouncing ? {
        y: [0, -20, 0],
        scale: [1, 1.1, 1]
      } : {}}
      transition={{ 
        duration: 0.6,
        ease: 'easeOut'
      }}
    >
      {children}
    </motion.div>
  );
}
