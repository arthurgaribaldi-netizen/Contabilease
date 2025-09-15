'use client';

import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export function AnimatedCounter({
  value,
  duration = 1,
  className = '',
  prefix = '',
  suffix = '',
  decimals = 0,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);

  const spring = useSpring(0, {
    stiffness: 100,
    damping: 30,
  });

  const display = useTransform(spring, current => {
    return Number(current.toFixed(decimals));
  });

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  useEffect(() => {
    const unsubscribe = display.onChange(latest => {
      setDisplayValue(latest);
    });

    return unsubscribe;
  }, [display]);

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {prefix}
      {displayValue.toLocaleString('pt-BR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </motion.span>
  );
}
