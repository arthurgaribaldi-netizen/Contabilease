import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import * as React from 'react';

const Card = React.forwardRef<
  HTMLDivElement,
  Omit<React.HTMLAttributes<HTMLDivElement>, 'onDrag' | 'onDragStart' | 'onDragEnd'> & {
    interactive?: boolean;
    animated?: boolean;
  }
>(({ className, interactive = false, animated = true, ...props }, ref) => {
  const Comp = animated ? motion.div : 'div';

  const motionProps = animated
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3, ease: 'easeOut' as const },
        whileHover: interactive ? { y: -2, transition: { duration: 0.2 } } : undefined,
      }
    : {};

  // Separate HTML props from motion props to avoid conflicts
  const { onDrag, onDragStart, onDragEnd, ...htmlProps } = props as any;

  return (
    <Comp
      ref={ref}
      className={cn(
        'contabilease-card rounded-lg border bg-card text-card-foreground shadow-sm',
        interactive && 'cursor-pointer hover:shadow-md transition-shadow duration-200',
        className
      )}
      {...motionProps}
      {...htmlProps}
    />
  );
});
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('contabilease-card-header flex flex-col space-y-1.5 p-6', className)}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        'contabilease-card-title contabilease-heading text-2xl font-semibold leading-none tracking-tight',
        className
      )}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      'contabilease-card-description contabilease-paragraph text-sm text-muted-foreground',
      className
    )}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('contabilease-card-content p-6 pt-0', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('contabilease-card-footer flex items-center p-6 pt-0', className)}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
