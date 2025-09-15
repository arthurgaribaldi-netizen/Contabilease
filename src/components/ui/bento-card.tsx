import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import * as React from 'react';

interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  span?: 1 | 2 | 3 | 4 | 6 | 8 | 12;
  interactive?: boolean;
  animated?: boolean;
  gradient?: boolean;
}

const BentoCard = React.forwardRef<HTMLDivElement, BentoCardProps>(
  (
    {
      className,
      span = 1,
      interactive = true,
      animated = true,
      gradient = false,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = animated ? motion.div : 'div';

    const motionProps = animated
      ? {
          initial: { opacity: 0, scale: 0.95 },
          animate: { opacity: 1, scale: 1 },
          transition: {
            duration: 0.4,
            ease: 'easeOut',
            delay: Math.random() * 0.2, // Stagger animation
          },
          whileHover: interactive
            ? {
                scale: 1.02,
                transition: { duration: 0.2 },
              }
            : undefined,
        }
      : {};

    const spanClasses = {
      1: 'col-span-1',
      2: 'col-span-2',
      3: 'col-span-3',
      4: 'col-span-4',
      6: 'col-span-6',
      8: 'col-span-8',
      12: 'col-span-12',
    };

    return (
      <Comp
        ref={ref}
        className={cn(
          'rounded-xl border border-border bg-card text-card-foreground shadow-sm',
          'p-6 transition-all duration-300',
          interactive && 'hover:shadow-md cursor-pointer',
          gradient && 'bg-gradient-to-br from-card to-accent/5',
          spanClasses[span],
          className
        )}
        {...motionProps}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);
BentoCard.displayName = 'BentoCard';

interface BentoGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: 'sm' | 'md' | 'lg';
}

const BentoGrid = React.forwardRef<HTMLDivElement, BentoGridProps>(
  ({ className, columns = 12, gap = 'md', children, ...props }, ref) => {
    const gridClasses = {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      6: 'grid-cols-6',
      12: 'grid-cols-12',
    };

    const gapClasses = {
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
    };

    return (
      <div
        ref={ref}
        className={cn('grid', gridClasses[columns], gapClasses[gap], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
BentoGrid.displayName = 'BentoGrid';

export { BentoCard, BentoGrid };
