'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface FloatingElementProps {
  children: React.ReactNode;
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
  duration?: number;
}

export function FloatingElement({
  children,
  className,
  intensity = 'medium',
  duration = 3,
}: FloatingElementProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const intensityValues = {
    low: { y: 5, rotate: 2 },
    medium: { y: 10, rotate: 5 },
    high: { y: 20, rotate: 10 },
  };

  const values = intensityValues[intensity];

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={
        isVisible
          ? {
              opacity: 1,
              y: [0, -values.y, 0],
              rotate: [0, values.rotate, -values.rotate, 0],
            }
          : { opacity: 0, y: 20 }
      }
      transition={{
        opacity: { duration: 0.5 },
        y: {
          duration,
          repeat: Infinity,
          ease: 'easeInOut',
        },
        rotate: {
          duration: duration * 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      }}
    >
      {children}
    </motion.div>
  );
}

interface ParticleProps {
  count?: number;
  className?: string;
  color?: string;
  size?: number;
}

export function ParticleField({
  count = 20,
  className,
  color = '#3b82f6',
  size = 2,
}: ParticleProps) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 3,
  }));

  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className='absolute rounded-full opacity-60'
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: size,
            height: size,
            backgroundColor: color,
          }}
          animate={{
            y: [-20, 20, -20],
            opacity: [0.2, 0.8, 0.2],
            scale: [0.5, 1.5, 0.5],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

interface GlowEffectProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  color?: string;
}

export function GlowEffect({
  children,
  className,
  intensity = 0.5,
  color = '#3b82f6',
}: GlowEffectProps) {
  return (
    <div
      className={className}
      style={{
        filter: `drop-shadow(0 0 ${intensity * 20}px ${color}${Math.floor(intensity * 255)
          .toString(16)
          .padStart(2, '0')})`,
      }}
    >
      {children}
    </div>
  );
}
