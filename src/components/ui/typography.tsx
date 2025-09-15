import { cn } from '@/lib/utils';

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
}

export function Display({ children, className }: TypographyProps) {
  return (
    <h1 className={cn('text-display font-display text-foreground tracking-tight', className)}>
      {children}
    </h1>
  );
}

export function Heading({ children, className }: TypographyProps) {
  return (
    <h2 className={cn('text-heading font-heading text-foreground tracking-tight', className)}>
      {children}
    </h2>
  );
}

export function Subheading({ children, className }: TypographyProps) {
  return (
    <h3 className={cn('text-xl font-semibold text-foreground tracking-tight', className)}>
      {children}
    </h3>
  );
}

export function Body({ children, className }: TypographyProps) {
  return <p className={cn('text-body text-foreground', className)}>{children}</p>;
}

export function Caption({ children, className }: TypographyProps) {
  return <p className={cn('text-sm text-muted-foreground', className)}>{children}</p>;
}

export function Label({ children, className }: TypographyProps) {
  return <span className={cn('text-sm font-medium text-foreground', className)}>{children}</span>;
}

export function Code({ children, className }: TypographyProps) {
  return (
    <code className={cn('px-2 py-1 text-sm font-mono bg-muted text-foreground rounded', className)}>
      {children}
    </code>
  );
}

export function Lead({ children, className }: TypographyProps) {
  return <p className={cn('text-lg text-muted-foreground', className)}>{children}</p>;
}

export function Large({ children, className }: TypographyProps) {
  return <div className={cn('text-lg font-semibold text-foreground', className)}>{children}</div>;
}

export function Small({ children, className }: TypographyProps) {
  return (
    <small className={cn('text-sm font-medium text-muted-foreground', className)}>{children}</small>
  );
}
